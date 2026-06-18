(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "×";
      } else {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      }
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    function show(next) {
      slides[index].classList.remove("active");
      dots[index].classList.remove("active");
      index = next;
      slides[index].classList.add("active");
      dots[index].classList.add("active");
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show((index + 1) % slides.length);
    }, 5000);
  }

  function movieCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"movie-poster\" href=\"" + item.url + "\" aria-label=\"观看 " + escapeHtml(item.title) + "\">" +
      "<img src=\"" + item.image + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-score\">" + escapeHtml(item.score) + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<h3><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h3>" +
      "<p class=\"movie-meta\">" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</p>" +
      "<p class=\"movie-line\">" + escapeHtml(item.line || "") + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearch() {
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var heading = document.getElementById("search-heading");
    var subtitle = document.getElementById("search-subtitle");
    if (!input || !results || !window.SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function render(query) {
      var key = query.trim().toLowerCase();
      if (!key) {
        heading.textContent = "精选结果";
        subtitle.textContent = "输入关键词后显示匹配影片。";
        return;
      }
      var matched = window.SEARCH_DATA.filter(function (item) {
        var haystack = [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.line,
          (item.tags || []).join(" ")
        ].join(" ").toLowerCase();
        return haystack.indexOf(key) !== -1;
      }).slice(0, 120);
      heading.textContent = "搜索结果";
      subtitle.textContent = key ? "关键词：“" + query.trim() + "”" : "输入关键词后显示匹配影片。";
      results.innerHTML = matched.length ? matched.map(movieCard).join("") : "<p class=\"empty-result\">没有找到匹配影片。</p>";
    }
    input.addEventListener("input", function () {
      render(input.value);
    });
    render(initial);
  }

  window.setupMoviePlayer = function (videoId, source, buttonId, overlayId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    if (!video || !source) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;
    function start() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (!loaded) {
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          var nativePlay = video.play();
          if (nativePlay && nativePlay.catch) {
            nativePlay.catch(function () {});
          }
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
            hlsInstance.loadSource(source);
          });
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            var hlsPlay = video.play();
            if (hlsPlay && hlsPlay.catch) {
              hlsPlay.catch(function () {});
            }
          });
          return;
        }
        video.src = source;
      }
      var playCall = video.play();
      if (playCall && playCall.catch) {
        playCall.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener("click", start);
    }
    if (overlay && overlay !== button) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
