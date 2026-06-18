
(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    document.addEventListener('DOMContentLoaded', function () {
        var mobileToggle = document.querySelector('[data-mobile-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');

        if (mobileToggle && mobileNav) {
            mobileToggle.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        var slides = selectAll('[data-hero-slide]');
        var dots = selectAll('[data-hero-dot]');
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var filterRoots = selectAll('[data-filter-root]');

        filterRoots.forEach(function (root) {
            var parent = root.parentElement || document;
            var input = root.querySelector('[data-search-input]');
            var typeFilter = root.querySelector('[data-type-filter]');
            var yearFilter = root.querySelector('[data-year-filter]');
            var cards = selectAll('[data-card]', parent);
            var noResults = parent.querySelector('[data-no-results]');

            if (typeFilter) {
                var types = cards.map(function (card) {
                    return card.getAttribute('data-type') || '';
                }).filter(Boolean).filter(function (value, index, array) {
                    return array.indexOf(value) === index;
                }).sort();

                types.forEach(function (type) {
                    var option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    typeFilter.appendChild(option);
                });
            }

            if (yearFilter) {
                var years = cards.map(function (card) {
                    return card.getAttribute('data-year') || '';
                }).filter(Boolean).filter(function (value, index, array) {
                    return array.indexOf(value) === index;
                }).sort(function (a, b) {
                    return Number(b) - Number(a);
                });

                years.forEach(function (year) {
                    var option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    yearFilter.appendChild(option);
                });
            }

            function applyFilters() {
                var query = normalize(input ? input.value : '');
                var type = typeFilter ? typeFilter.value : '';
                var year = yearFilter ? yearFilter.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var matchedQuery = !query || text.indexOf(query) !== -1;
                    var matchedType = !type || card.getAttribute('data-type') === type;
                    var matchedYear = !year || card.getAttribute('data-year') === year;
                    var matched = matchedQuery && matchedType && matchedYear;

                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (noResults) {
                    noResults.classList.toggle('is-visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', applyFilters);
            }
            if (typeFilter) {
                typeFilter.addEventListener('change', applyFilters);
            }
            if (yearFilter) {
                yearFilter.addEventListener('change', applyFilters);
            }
        });
    });
})();
