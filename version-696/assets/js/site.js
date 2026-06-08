(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");

        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        initHero();
        initFilters();
        initPlayers();
    });

    function initHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var type = panel.querySelector("[data-filter-type]");
            var year = panel.querySelector("[data-filter-year]");
            var list = panel.parentElement.querySelector("[data-card-list]");
            var empty = panel.parentElement.querySelector("[data-empty-state]");

            if (!list) {
                return;
            }

            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var ok = true;

                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }

                    if (typeValue && card.getAttribute("data-type") !== typeValue) {
                        ok = false;
                    }

                    if (yearValue && card.getAttribute("data-year") !== yearValue) {
                        ok = false;
                    }

                    card.style.display = ok ? "" : "none";

                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var trigger = player.querySelector("[data-play-trigger]");

            if (!video || !trigger) {
                return;
            }

            function startPlayback() {
                var stream = video.getAttribute("data-stream");

                if (!stream) {
                    return;
                }

                trigger.classList.add("is-hidden");

                if (!video.dataset.ready) {
                    video.dataset.ready = "1";

                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = stream;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                    } else {
                        video.src = stream;
                    }
                }

                var promise = video.play();

                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        trigger.classList.remove("is-hidden");
                    });
                }
            }

            trigger.addEventListener("click", startPlayback);
            video.addEventListener("click", function () {
                if (!video.dataset.ready) {
                    startPlayback();
                }
            });
        });
    }
})();
