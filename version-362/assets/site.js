(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(text) {
    return (text || '').toString().toLowerCase();
  }

  function initMenu() {
    const btn = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-site-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  function applyFilter(root, input, select, status) {
    const cards = Array.from(root.querySelectorAll('[data-card]'));
    const query = normalize(input ? input.value : '');
    const type = normalize(select ? select.value : '');
    let shown = 0;
    cards.forEach((card) => {
      const hay = normalize(card.dataset.search || card.textContent);
      const cardType = normalize(card.dataset.type || '');
      const matchQuery = !query || hay.includes(query);
      const matchType = !type || cardType === type;
      const visible = matchQuery && matchType;
      card.classList.toggle('hidden', !visible);
      if (visible) shown += 1;
    });
    if (status) {
      status.textContent = `已显示 ${shown} / ${cards.length} 部影片`;
    }
  }

  function initFilters() {
    const root = document.querySelector('[data-filter-root]');
    if (!root) return;
    const input = document.querySelector('[data-filter-input]');
    const select = document.querySelector('[data-filter-select]');
    const status = document.querySelector('[data-filter-status]');
    const run = () => applyFilter(root, input, select, status);
    if (input) input.addEventListener('input', run);
    if (select) select.addEventListener('change', run);

    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q && input) input.value = q;
    run();
  }

  function initPlayers() {
    document.querySelectorAll('.video-shell').forEach((shell) => {
      const video = shell.querySelector('video');
      const playBtn = shell.querySelector('[data-play-toggle]');
      const sourceButtons = Array.from(shell.parentElement.querySelectorAll('[data-source]'));
      if (!video) return;

      function setActive(kind) {
        sourceButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.source === kind));
      }

      function loadMp4() {
        const src = video.dataset.mp4 || video.querySelector('source[type="video/mp4"]')?.src || '';
        if (src) {
          video.src = src;
          video.load();
        }
        setActive('mp4');
      }

      function loadHls() {
        const src = video.dataset.hls || '';
        if (!src) return;
        setActive('hls');
        if (window.Hls && Hls.isSupported()) {
          if (video._hls) {
            try { video._hls.destroy(); } catch (e) {}
          }
          const hls = new Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          video._hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.load();
        } else {
          loadMp4();
        }
      }

      if (!video.currentSrc) loadMp4();

      if (playBtn) {
        playBtn.addEventListener('click', async () => {
          try {
            await video.play();
            playBtn.style.display = 'none';
          } catch (e) {
            // ignore autoplay restrictions
          }
        });
        video.addEventListener('play', () => { playBtn.style.display = 'none'; });
        video.addEventListener('pause', () => { playBtn.style.display = ''; });
      }

      sourceButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          if (btn.dataset.source === 'hls') {
            loadHls();
          } else {
            loadMp4();
          }
          video.play().catch(() => {});
        });
      });
    });
  }

  ready(() => {
    initMenu();
    initFilters();
    initPlayers();
  });
})();
