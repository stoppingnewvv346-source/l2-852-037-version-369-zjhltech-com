(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                restart();
            });
        });
        restart();
    }

    function setupFilters() {
        var input = document.querySelector(".js-filter-input");
        var select = document.querySelector(".js-filter-select");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-target .movie-card, .filter-target .ranking-item"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        if (input && initialQuery) {
            input.value = initialQuery;
        }
        if (!input && !select) {
            return;
        }

        function filterCards() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var type = select ? select.value : "all";
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var cardType = card.getAttribute("data-type") || "";
                var matchedText = !query || text.indexOf(query) !== -1;
                var matchedType = type === "all" || cardType === type;
                var matched = matchedText && matchedType;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            var empty = document.querySelector(".filter-empty");
            var target = document.querySelector(".filter-target");
            if (!empty && target) {
                empty = document.createElement("div");
                empty.className = "filter-empty";
                empty.textContent = "没有找到匹配的影片";
                target.appendChild(empty);
            }
            if (empty) {
                empty.style.display = visible === 0 ? "block" : "none";
            }
        }

        if (input) {
            input.addEventListener("input", filterCards);
        }
        if (select) {
            select.addEventListener("change", filterCards);
        }
        filterCards();
    }

    function setupSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll(".global-search-form")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || input.value.trim()) {
                    return;
                }
                event.preventDefault();
                window.location.href = form.getAttribute("action") || "search.html";
            });
        });
    }

    window.initMoviePlayer = function (source, videoId, buttonId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var hlsInstance = null;
        var started = false;

        if (!video || !source) {
            return;
        }

        function hideButton() {
            if (button) {
                button.classList.add("is-hidden");
            }
        }

        function showButton() {
            if (button) {
                button.classList.remove("is-hidden");
            }
        }

        function attemptPlayback() {
            hideButton();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(showButton);
            }
        }

        function attachSource(onReady) {
            if (started) {
                onReady();
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", onReady, { once: true });
                window.setTimeout(onReady, 120);
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, onReady);
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = source;
            video.addEventListener("loadedmetadata", onReady, { once: true });
            window.setTimeout(onReady, 120);
        }

        function play() {
            attachSource(attemptPlayback);
        }

        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", hideButton);
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchForms();
    });
})();
