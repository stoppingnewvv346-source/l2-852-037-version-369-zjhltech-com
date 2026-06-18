document.addEventListener("DOMContentLoaded", function () {
  setupMobileNavigation();
  setupHeroCarousel();
  setupImageFallbacks();
  setupFilters();
  setupQueryPrefill();
  setupPlayers();
});

function setupMobileNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", function () {
    menu.classList.toggle("is-open");
  });
}

function setupHeroCarousel() {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let active = 0;
  let timer = null;

  function render(nextIndex) {
    active = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, index) {
      slide.classList.toggle("is-active", index === active);
    });

    dots.forEach(function (dot, index) {
      dot.classList.toggle("is-active", index === active);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      render(active + 1);
    }, 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (prev) {
    prev.addEventListener("click", function () {
      render(active - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      render(active + 1);
      start();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      render(index);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  render(0);
  start();
}

function setupImageFallbacks() {
  const images = document.querySelectorAll("img[data-fallback]");

  images.forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("is-missing");
      const frame = image.closest(".poster-frame, .hero-slide, .category-collage, .compact-cover, .ranking-thumb");

      if (frame) {
        frame.classList.add("image-missing");
      }
    }, { once: true });
  });
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function setupFilters() {
  const scopes = document.querySelectorAll("[data-filter-scope]");

  scopes.forEach(function (scope) {
    const input = scope.querySelector("[data-filter-input]");
    const type = scope.querySelector("[data-filter-type]");
    const region = scope.querySelector("[data-filter-region]");
    const year = scope.querySelector("[data-filter-year]");
    const count = scope.querySelector("[data-filter-count]");
    const empty = scope.querySelector("[data-filter-empty]");
    const cards = Array.from(scope.querySelectorAll("[data-filter-card]"));

    function applyFilters() {
      const query = normalizeText(input ? input.value : "");
      const typeValue = normalizeText(type ? type.value : "");
      const regionValue = normalizeText(region ? region.value : "");
      const yearValue = normalizeText(year ? year.value : "");
      let visible = 0;

      cards.forEach(function (card) {
        const search = normalizeText(card.dataset.search || card.textContent);
        const cardType = normalizeText(card.dataset.type);
        const cardRegion = normalizeText(card.dataset.region);
        const cardYear = normalizeText(card.dataset.year);
        const matched =
          (!query || search.includes(query)) &&
          (!typeValue || cardType === typeValue) &&
          (!regionValue || cardRegion === regionValue) &&
          (!yearValue || cardYear === yearValue);

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });
}

function setupQueryPrefill() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");

  if (!query) {
    return;
  }

  document.querySelectorAll("[data-filter-input]").forEach(function (input) {
    input.value = query;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function setupPlayers() {
  const shells = document.querySelectorAll("[data-player-shell]");

  shells.forEach(function (shell) {
    const video = shell.querySelector("video[data-src]");
    const start = shell.querySelector("[data-player-start]");
    const message = shell.querySelector("[data-player-message]");
    let hlsInstance = null;
    let loaded = false;

    if (!video || !start) {
      return;
    }

    function showMessage(text) {
      if (!message) {
        return;
      }

      message.hidden = false;
      message.textContent = text;
    }

    function playVideo() {
      const result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          showMessage("浏览器阻止了自动播放，请再次点击播放器开始观看。");
        });
      }
    }

    function initializeHls() {
      const source = video.dataset.src;

      if (!source) {
        showMessage("当前影片暂未绑定播放源。");
        return;
      }

      start.classList.add("is-hidden");

      if (loaded) {
        playVideo();
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showMessage("网络加载异常，正在重试播放源。");
            hlsInstance.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            showMessage("媒体解码异常，正在尝试恢复。");
            hlsInstance.recoverMediaError();
            return;
          }

          showMessage("播放器初始化失败，请刷新页面后重试。");
          hlsInstance.destroy();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
      } else {
        showMessage("当前浏览器不支持 HLS 播放，请使用现代浏览器访问。");
      }
    }

    start.addEventListener("click", initializeHls);
    video.addEventListener("play", function () {
      start.classList.add("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
}
