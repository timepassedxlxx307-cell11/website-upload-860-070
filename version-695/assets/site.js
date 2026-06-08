(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupFilters() {
        var grid = document.querySelector("[data-filter-grid]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-search-text]"));
        var empty = document.querySelector("[data-empty-result]");
        var searchInput = document.querySelector("[data-page-search]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        var activeType = "all";

        if (searchInput) {
            searchInput.value = initialQuery;
        }

        function apply() {
            var q = normalize(searchInput ? searchInput.value : initialQuery);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search-text"));
                var type = normalize(card.getAttribute("data-filter-type"));
                var matchText = !q || text.indexOf(q) !== -1;
                var matchType = activeType === "all" || type.indexOf(activeType) !== -1;
                var show = matchText && matchType;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", apply);
        }
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]")).forEach(function (button) {
            button.addEventListener("click", function () {
                activeType = normalize(button.getAttribute("data-filter-value"));
                document.querySelectorAll("[data-filter-value]").forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                apply();
            });
        });
        apply();
    }

    function attachPlayer(source) {
        var video = document.querySelector("[data-player-video]");
        var button = document.querySelector("[data-player-button]");
        if (!video || !source) {
            return;
        }
        var started = false;
        var hls = null;

        function load() {
            if (started) {
                return;
            }
            started = true;
            if (button) {
                button.classList.add("is-hidden");
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            load();
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("play", load);
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.MovieSite = {
        initPlayer: function (source) {
            ready(function () {
                attachPlayer(source);
            });
        }
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
