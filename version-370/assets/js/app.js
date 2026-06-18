(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var toggle = qs('.mobile-toggle');
  var panel = qs('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = qsa('.hero-slide');
  var dots = qsa('.hero-dot');
  if (slides.length > 1) {
    var current = 0;
    var activate = function (index) {
      current = index % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
      });
    });
    window.setInterval(function () {
      activate(current + 1);
    }, 5600);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function filterCards() {
    var input = qs('[data-card-search]');
    var activeChip = qs('.filter-chip.active');
    var term = normalize(input ? input.value : '');
    var kind = activeChip ? activeChip.getAttribute('data-filter') : 'all';
    var cards = qsa('.movie-card');
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year')
      ].join(' '));
      var typeText = normalize(card.getAttribute('data-type') + ' ' + card.getAttribute('data-tags'));
      var matchesTerm = !term || haystack.indexOf(term) !== -1;
      var matchesKind = kind === 'all' || typeText.indexOf(kind) !== -1 || haystack.indexOf(kind) !== -1;
      var show = matchesTerm && matchesKind;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });
    var empty = qs('.empty-state');
    if (empty) {
      empty.style.display = visible ? 'none' : '';
    }
  }

  var cardSearch = qs('[data-card-search]');
  if (cardSearch) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      cardSearch.value = q;
    }
    cardSearch.addEventListener('input', filterCards);
    filterCards();
  }

  qsa('.filter-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      qsa('.filter-chip').forEach(function (item) {
        item.classList.remove('active');
      });
      chip.classList.add('active');
      filterCards();
    });
  });

  function startVideo(video, url, button) {
    if (!video || !url) {
      return;
    }
    if (window.__activeHls) {
      window.__activeHls.destroy();
      window.__activeHls = null;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      window.__activeHls = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
    } else {
      video.src = url;
      video.play().catch(function () {});
    }
    if (button) {
      button.textContent = '继续观看';
    }
  }

  var playButton = qs('.play-button[data-url]');
  var video = qs('#movie-video');
  if (playButton && video) {
    playButton.addEventListener('click', function () {
      startVideo(video, playButton.getAttribute('data-url'), playButton);
    });
    var playerFrame = qs('.player-frame');
    if (playerFrame) {
      playerFrame.addEventListener('click', function () {
        if (!video.src) {
          startVideo(video, playButton.getAttribute('data-url'), playButton);
        }
      });
    }
  }
})();
