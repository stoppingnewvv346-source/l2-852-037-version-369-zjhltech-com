(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
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

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    start();
  }

  function initVideo(video) {
    var source = video.getAttribute('data-video-src');
    var shell = video.closest('.player-shell');
    var button = shell ? shell.querySelector('[data-play-button]') : null;
    var ready = false;

    function attach() {
      if (ready || !source) {
        return;
      }

      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playOrPause() {
      attach();

      if (video.paused) {
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener('click', playOrPause);
    }

    video.addEventListener('click', playOrPause);

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });

    attach();
  }

  Array.prototype.slice.call(document.querySelectorAll('video[data-video-src]')).forEach(initVideo);

  function buildCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card movie-card--medium">' +
        '<a class="movie-card__cover" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
          '<span class="cover-bg" style="background-image: linear-gradient(135deg, rgba(8, 145, 178, 0.84), rgba(15, 23, 42, 0.9)), url(\'' + movie.cover + '\');"></span>' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\';">' +
          '<span class="movie-card__play">▶</span>' +
          '<span class="movie-card__category">' + escapeHtml(movie.category) + '</span>' +
          '<span class="movie-card__duration">' + escapeHtml(movie.duration) + '</span>' +
        '</a>' +
        '<div class="movie-card__body">' +
          '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="movie-card__meta">' +
            '<span>' + escapeHtml(movie.year) + '</span>' +
            '<span>' + escapeHtml(movie.region) + '</span>' +
            '<span>★ ' + escapeHtml(movie.rating) + '</span>' +
          '</div>' +
          '<div class="movie-card__tags">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  var searchResults = document.getElementById('search-results');
  var searchInput = document.getElementById('search-input');
  var searchTitle = document.getElementById('search-title');

  if (searchResults && searchInput && window.SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    searchInput.value = query;

    if (query.trim()) {
      var normalized = query.trim().toLowerCase();
      var results = window.SEARCH_DATA.filter(function (movie) {
        return [movie.title, movie.region, movie.category, movie.genre, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase().indexOf(normalized) !== -1;
      }).slice(0, 80);

      searchTitle.textContent = '搜索：' + query;
      searchResults.innerHTML = results.length ? results.map(buildCard).join('') : '<div class="text-panel"><h2>没有找到匹配影片</h2><p>可以尝试更换片名、地区、年份或标签关键词。</p></div>';
    }
  }
})();
