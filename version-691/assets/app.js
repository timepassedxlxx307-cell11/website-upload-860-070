(function () {
  function getAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", function () {
      var opened = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHero() {
    getAll("[data-hero-slider]").forEach(function (slider) {
      var slides = getAll("[data-hero-slide]", slider);
      var dots = getAll("[data-hero-dot]", slider);
      var index = 0;

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
    });
  }

  function cardMatches(card, keyword, year, type) {
    var haystack = [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-tags") || "",
      card.getAttribute("data-genre") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-type") || ""
    ].join(" ").toLowerCase();

    var cardYear = card.getAttribute("data-year") || "";
    var cardType = card.getAttribute("data-type") || "";
    var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
    var yearOk = !year || cardYear.indexOf(year) !== -1;
    var typeOk = !type || cardType.indexOf(type) !== -1;
    return keywordOk && yearOk && typeOk;
  }

  function initFilters() {
    getAll("[data-filter-panel]").forEach(function (panel) {
      var section = panel.parentElement;
      var cards = getAll(".searchable-card", section);
      var keywordInput = panel.querySelector("[data-filter-keyword]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var empty = panel.querySelector("[data-filter-empty]");

      function apply() {
        var keyword = (keywordInput && keywordInput.value || "").trim().toLowerCase();
        var year = yearSelect && yearSelect.value || "";
        var type = typeSelect && typeSelect.value || "";
        var visible = 0;

        cards.forEach(function (card) {
          var matched = cardMatches(card, keyword, year, type);
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [keywordInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function createResultCard(item) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      "<a class=\"movie-cover\" href=\"" + item.href + "\" aria-label=\"" + escapeHtml(item.title) + " 在线观看\">",
      "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"card-year\">" + escapeHtml(item.year) + "</span>",
      "<span class=\"card-category\">" + escapeHtml(item.category) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<h3><a href=\"" + item.href + "\">" + escapeHtml(item.title) + "</a></h3>",
      "<p>" + escapeHtml(item.line) + "</p>",
      "<div class=\"movie-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.genre) + "</span></div>",
      "</div>"
    ].join("");
    return article;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !input || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    input.value = query;

    function render(searchText) {
      var keyword = searchText.trim().toLowerCase();
      results.innerHTML = "";

      if (!keyword) {
        var empty = document.createElement("p");
        empty.className = "search-result-empty";
        empty.textContent = "请输入关键词开始搜索。";
        results.appendChild(empty);
        return;
      }

      var matches = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        return item.searchText.indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (!matches.length) {
        var none = document.createElement("p");
        none.className = "search-result-empty";
        none.textContent = "没有匹配的影片。";
        results.appendChild(none);
        return;
      }

      matches.forEach(function (item) {
        results.appendChild(createResultCard(item));
      });
    }

    render(query);

    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
