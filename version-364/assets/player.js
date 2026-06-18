(function () {
  var video = document.querySelector('.js-player');
  var trigger = document.querySelector('.js-play-trigger');
  var overlay = document.querySelector('.player-overlay');
  var sourceMeta = document.querySelector('meta[name="video-url"]');
  var source = sourceMeta ? sourceMeta.getAttribute('content') : '';
  var hlsInstance = null;
  var loaded = false;

  function loadScript() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function attachNative() {
    video.src = source;
    loaded = true;
    return Promise.resolve();
  }

  function attachWithHls(Hls) {
    return new Promise(function (resolve) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        loaded = true;
        resolve();
      });
      window.setTimeout(function () {
        loaded = true;
        resolve();
      }, 1600);
    });
  }

  function prepare() {
    if (!video || !source) {
      return Promise.resolve();
    }
    if (loaded) {
      return Promise.resolve();
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      return attachNative();
    }
    return loadScript().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        return attachWithHls(Hls);
      }
      return attachNative();
    }).catch(function () {
      return attachNative();
    });
  }

  function start() {
    if (!video || !source) {
      return;
    }
    prepare().then(function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      video.play().catch(function () {});
    });
  }

  if (trigger) {
    trigger.addEventListener('click', start);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        start();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
