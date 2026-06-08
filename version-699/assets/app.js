(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initFilters() {
        var forms = document.querySelectorAll('[data-filter-form]');
        forms.forEach(function (form) {
            var keyword = form.querySelector('[data-filter-keyword]');
            var genre = form.querySelector('[data-filter-genre]');
            var scope = form.closest('main') || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var empty = scope.querySelector('[data-empty-message]');

            function apply() {
                var word = keyword ? keyword.value.trim().toLowerCase() : '';
                var selected = genre ? genre.value.trim().toLowerCase() : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = card.getAttribute('data-search') || '';
                    var type = (card.getAttribute('data-type') || '').toLowerCase();
                    var genres = (card.getAttribute('data-genre') || '').toLowerCase();
                    var tags = (card.getAttribute('data-tags') || '').toLowerCase();
                    var textMatched = !word || text.indexOf(word) !== -1;
                    var typeMatched = !selected || type.indexOf(selected) !== -1 || genres.indexOf(selected) !== -1 || tags.indexOf(selected) !== -1;
                    var matched = textMatched && typeMatched;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            if (keyword) {
                keyword.addEventListener('input', apply);
            }
            if (genre) {
                genre.addEventListener('change', apply);
            }
            form.addEventListener('reset', function () {
                window.setTimeout(apply, 0);
            });
            apply();
        });
    }

    function initPlayers() {
        var players = document.querySelectorAll('[data-player]');
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('[data-play-overlay]');
            var button = player.querySelector('[data-play-button]');
            if (!video) {
                return;
            }

            var stream = video.getAttribute('data-stream');
            var attached = false;
            var hlsInstance = null;

            function attach() {
                if (attached || !stream) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
                attached = true;
            }

            function start() {
                attach();
                player.classList.add('is-playing');
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener('click', start);
            }
            if (button) {
                button.addEventListener('click', function (event) {
                    event.stopPropagation();
                    start();
                });
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initFilters();
        initPlayers();
    });
})();
