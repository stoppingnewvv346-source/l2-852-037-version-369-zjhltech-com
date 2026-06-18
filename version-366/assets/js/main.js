(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupHeader() {
        var header = document.getElementById("siteHeader");
        if (!header) {
            return;
        }
        var update = function () {
            if (window.scrollY > 18) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var index = 0;
        var timer = null;
        var show = function (next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        };
        var play = function () {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                play();
            });
        });
        if (slides.length > 1) {
            play();
        }
    }

    function textOf(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        if (!cards.length) {
            return;
        }
        var input = document.querySelector("[data-search-input]");
        var region = document.querySelector("[data-region-filter]");
        var type = document.querySelector("[data-type-filter]");
        var year = document.querySelector("[data-year-filter]");
        var empty = document.querySelector("[data-empty-state]");
        var controls = [input, region, type, year].filter(Boolean);
        var apply = function () {
            var q = textOf(input && input.value);
            var r = textOf(region && region.value);
            var t = textOf(type && type.value);
            var y = textOf(year && year.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = textOf([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (r && textOf(card.getAttribute("data-region")) !== r) {
                    ok = false;
                }
                if (t && textOf(card.getAttribute("data-type")) !== t) {
                    ok = false;
                }
                if (y && textOf(card.getAttribute("data-year")) !== y) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        };
        controls.forEach(function (control) {
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });
        apply();
    }

    function attachHls(video, source, onReady) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (!video.src) {
                video.src = source;
            }
            onReady();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video._movieHls) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._movieHls = hls;
                hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
            } else {
                onReady();
            }
            return;
        }
        if (!video.src) {
            video.src = source;
        }
        onReady();
    }

    window.initMoviePlayer = function (source) {
        var video = document.getElementById("movieVideo");
        var cover = document.getElementById("playerCover");
        if (!video || !cover || !source) {
            return;
        }
        var start = function () {
            cover.classList.add("is-hidden");
            attachHls(video, source, function () {
                var attempt = video.play();
                if (attempt && attempt.catch) {
                    attempt.catch(function () {});
                }
            });
        };
        cover.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };

    ready(function () {
        setupHeader();
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
