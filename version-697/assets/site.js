document.addEventListener("DOMContentLoaded", function () {
  setupMobileNavigation();
  setupHeroCarousel();
  setupSearchBoxes();
  setupListFilters();
  setupVideoPlayer();
});

function setupMobileNavigation() {
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-mobile-nav]");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function setupHeroCarousel() {
  var hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
  var activeIndex = 0;

  if (slides.length <= 1) {
    return;
  }

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = Number(dot.getAttribute("data-hero-dot"));
      showSlide(index);
    });
  });

  window.setInterval(function () {
    showSlide(activeIndex + 1);
  }, 5200);
}

function setupSearchBoxes() {
  var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-search-box]"));
  var data = Array.isArray(window.MovieSearchData) ? window.MovieSearchData : [];

  boxes.forEach(function (box) {
    var input = box.querySelector("[data-search-input]");
    var results = box.querySelector("[data-search-results]");

    if (!input || !results) {
      return;
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();

      if (!query) {
        results.classList.remove("is-open");
        results.innerHTML = "";
        return;
      }

      var matches = data.filter(function (movie) {
        return [movie.title, movie.year, movie.type, movie.region, movie.genre, movie.category, movie.tags]
          .join(" ")
          .toLowerCase()
          .indexOf(query) !== -1;
      }).slice(0, 8);

      if (!matches.length) {
        results.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
        results.classList.add("is-open");
        return;
      }

      results.innerHTML = matches.map(function (movie) {
        return '<a class="search-result-item" href="' + movie.url + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
          '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
          '<span>' + escapeHtml(movie.year + ' · ' + movie.type + ' · ' + movie.category) + '</span></span>' +
          '</a>';
      }).join("");

      results.classList.add("is-open");
    });

    document.addEventListener("click", function (event) {
      if (!box.contains(event.target)) {
        results.classList.remove("is-open");
      }
    });
  });
}

function setupListFilters() {
  var list = document.querySelector("[data-card-list]");

  if (!list) {
    return;
  }

  var search = document.querySelector("[data-list-search]");
  var year = document.querySelector("[data-filter-year]");
  var type = document.querySelector("[data-filter-type]");
  var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

  function applyFilters() {
    var query = search ? search.value.trim().toLowerCase() : "";
    var selectedYear = year ? year.value : "";
    var selectedType = type ? type.value : "";

    cards.forEach(function (card) {
      var text = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-type") || "",
        card.getAttribute("data-year") || ""
      ].join(" ").toLowerCase();
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
      var matchesType = !selectedType || card.getAttribute("data-type") === selectedType;

      card.classList.toggle("is-hidden", !(matchesQuery && matchesYear && matchesType));
    });
  }

  [search, year, type].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });
}

function setupVideoPlayer() {
  var player = document.querySelector("[data-player]");

  if (!player) {
    return;
  }

  var video = player.querySelector("[data-video]");
  var startButton = player.querySelector("[data-start]");

  if (!video) {
    return;
  }

  var source = video.getAttribute("data-video-src");
  var hlsInstance = null;

  function loadSource() {
    if (!source || video.getAttribute("data-ready") === "true") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }

    video.setAttribute("data-ready", "true");
  }

  function playVideo() {
    loadSource();

    if (startButton) {
      startButton.classList.add("is-hidden");
    }

    var playRequest = video.play();

    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(function () {});
    }
  }

  if (startButton) {
    startButton.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", function () {
    if (startButton) {
      startButton.classList.add("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character];
  });
}
