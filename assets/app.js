(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bindMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function bindLocalFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var section = input.closest("section") || document;
      var scopes = Array.prototype.slice.call(section.querySelectorAll("[data-filter-scope]"));
      if (!scopes.length) {
        scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
      }
      var cards = [];
      scopes.forEach(function (scope) {
        cards = cards.concat(Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-row")));
      });
      var clear = section.querySelector("[data-filter-clear]");

      function apply() {
        var q = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type")
          ].join(" "));
          card.hidden = q ? haystack.indexOf(q) === -1 : false;
        });
      }

      input.addEventListener("input", apply);
      if (clear) {
        clear.addEventListener("click", function () {
          input.value = "";
          apply();
          input.focus();
        });
      }
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\" data-title=\"" + escapeHtml(item.title) + "\" data-genre=\"" + escapeHtml(item.genre) + "\" data-region=\"" + escapeHtml(item.region) + "\" data-year=\"" + escapeHtml(item.year) + "\" data-type=\"" + escapeHtml(item.type) + "\">",
      "<a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"" + escapeHtml(item.title) + "\">",
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-year\">" + escapeHtml(item.year) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-meta-line\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>",
      "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>",
      "<p>" + escapeHtml(item.line) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function bindSearchPage() {
    var input = document.getElementById("siteSearchInput");
    var button = document.getElementById("siteSearchButton");
    var results = document.getElementById("searchResults");
    if (!input || !button || !results || !window.SITE_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;

    function render() {
      var q = normalize(input.value);
      var matched = window.SITE_MOVIES.filter(function (item) {
        if (!q) {
          return true;
        }
        var haystack = normalize([item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(" ")].join(" "));
        return haystack.indexOf(q) !== -1;
      }).slice(0, 120);

      if (!matched.length) {
        results.innerHTML = "<div class=\"search-empty\">没有找到匹配内容</div>";
        return;
      }
      results.innerHTML = matched.map(cardTemplate).join("");
    }

    button.addEventListener("click", render);
    input.addEventListener("input", render);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        render();
      }
    });
    render();
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindLocalFilters();
    bindSearchPage();
  });
})();
