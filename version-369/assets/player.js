(function () {
  function initPlayer(url) {
    var video = document.getElementById("videoPlayer");
    var cover = document.getElementById("playerCover");
    var attached = false;
    var hls = null;

    function attach() {
      if (!video || attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      attached = true;
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.initPlayer = initPlayer;
})();
