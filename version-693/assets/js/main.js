(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    carousel.addEventListener("mouseenter", function () {
      clearInterval(timer);
    });

    carousel.addEventListener("mouseleave", play);
    play();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function initFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
    roots.forEach(function (root) {
      var input = root.querySelector("[data-filter-input]");
      var selects = Array.prototype.slice.call(root.querySelectorAll("[data-filter-select]"));
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
      if (!input && selects.length === 0) {
        return;
      }

      function selectValue(name) {
        var select = root.querySelector('[data-filter-select="' + name + '"]');
        return select ? normalize(select.value) : "";
      }

      function apply() {
        var query = input ? normalize(input.value) : "";
        var year = selectValue("year");
        var region = selectValue("region");
        var type = selectValue("type");
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-category")
          ].join(" "));
          var matched = true;
          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (year && normalize(card.getAttribute("data-year")) !== year) {
            matched = false;
          }
          if (region && normalize(card.getAttribute("data-region")) !== region) {
            matched = false;
          }
          if (type && normalize(card.getAttribute("data-type")) !== type) {
            matched = false;
          }
          card.classList.toggle("is-filter-hidden", !matched);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
