(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.getElementById('mobilePanel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var heroIndex = 0;

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === heroIndex);
    });
    heroDots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === heroIndex);
    });
  }

  heroDots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
    });
  });

  if (heroSlides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards(scope) {
    var input = scope.querySelector('[data-filter-keyword]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var regionSelect = scope.querySelector('[data-filter-region]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && card.dataset.year !== year) {
          matched = false;
        }
        if (region && card.dataset.region !== region) {
          matched = false;
        }
        if (type && card.dataset.type !== type) {
          matched = false;
        }
        card.classList.toggle('is-hidden', !matched);
      });
    }

    [input, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(filterCards);

  var searchForm = document.querySelector('[data-search-form]');
  var resultsGrid = document.querySelector('[data-search-results]');
  var resultNote = document.querySelector('[data-search-note]');

  function buildCard(item) {
    return [
      '<article class="movie-card">',
      '<a class="card-poster" href="./' + item.filename + '" aria-label="' + escapeHtml(item.title) + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async">',
      '<span class="card-glow"></span>',
      '<span class="card-play">▶</span>',
      '<span class="card-score">' + item.score + '</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="./' + item.filename + '">' + escapeHtml(item.title) + '</a>',
      '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p>',
      '<div class="card-tags"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function applySearch() {
    if (!resultsGrid || !window.SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var queryInput = searchForm ? searchForm.querySelector('[name="q"]') : null;
    var regionInput = searchForm ? searchForm.querySelector('[name="region"]') : null;
    var typeInput = searchForm ? searchForm.querySelector('[name="type"]') : null;
    var query = queryInput ? queryInput.value : params.get('q') || '';
    var region = regionInput ? regionInput.value : params.get('region') || '';
    var type = typeInput ? typeInput.value : params.get('type') || '';
    var keyword = normalize(query);

    var results = window.SEARCH_DATA.filter(function (item) {
      var text = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine, item.category].join(' '));
      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }
      if (region && item.region !== region) {
        return false;
      }
      if (type && item.type !== type) {
        return false;
      }
      return true;
    }).sort(function (a, b) {
      return b.heat - a.heat;
    }).slice(0, 120);

    if (resultNote) {
      resultNote.textContent = keyword || region || type ? '为你匹配到以下影片' : '热门影片推荐';
    }
    resultsGrid.innerHTML = results.map(buildCard).join('');
  }

  if (searchForm && resultsGrid) {
    var params = new URLSearchParams(window.location.search);
    var queryInput = searchForm.querySelector('[name="q"]');
    var regionInput = searchForm.querySelector('[name="region"]');
    var typeInput = searchForm.querySelector('[name="type"]');

    if (queryInput && params.get('q')) {
      queryInput.value = params.get('q');
    }
    if (regionInput && params.get('region')) {
      regionInput.value = params.get('region');
    }
    if (typeInput && params.get('type')) {
      typeInput.value = params.get('type');
    }

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applySearch();
    });
    [queryInput, regionInput, typeInput].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
      }
    });
    applySearch();
  }
})();
