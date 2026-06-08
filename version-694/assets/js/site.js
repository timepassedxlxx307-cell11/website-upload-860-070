(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var nextButton = hero.querySelector('[data-hero-next]');
        var prevButton = hero.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === index);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(index + 1);
                schedule();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                show(index - 1);
                schedule();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                schedule();
            });
        });

        show(0);
        schedule();
    }

    function setupFilters() {
        var toolbars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-toolbar]'));

        toolbars.forEach(function (toolbar) {
            var scope = toolbar.parentElement || document;
            var input = toolbar.querySelector('[data-filter-input]');
            var yearSelect = toolbar.querySelector('[data-filter-year]');
            var typeSelect = toolbar.querySelector('[data-filter-type]');
            var categorySelect = toolbar.querySelector('[data-filter-category]');
            var items = Array.prototype.slice.call(scope.querySelectorAll('.filter-list .movie-card, .filter-list .ranking-item'));
            var empty = scope.querySelector('[data-empty-result]');
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';

            function uniqueValues(attribute) {
                var values = [];
                items.forEach(function (item) {
                    var value = item.getAttribute(attribute) || '';
                    if (value && values.indexOf(value) === -1) {
                        values.push(value);
                    }
                });
                return values.sort(function (a, b) {
                    return String(b).localeCompare(String(a), 'zh-Hans-CN');
                });
            }

            function fillSelect(select, values) {
                if (!select) {
                    return;
                }
                values.forEach(function (value) {
                    var option = document.createElement('option');
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });
            }

            fillSelect(yearSelect, uniqueValues('data-year'));
            fillSelect(typeSelect, uniqueValues('data-type'));

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var year = yearSelect ? yearSelect.value : '';
                var type = typeSelect ? typeSelect.value : '';
                var category = categorySelect ? categorySelect.value : '';
                var visibleCount = 0;

                items.forEach(function (item) {
                    var text = (item.getAttribute('data-search') || '').toLowerCase();
                    var itemYear = item.getAttribute('data-year') || '';
                    var itemType = item.getAttribute('data-type') || '';
                    var itemCategory = item.getAttribute('data-category') || '';
                    var matched = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (year && itemYear !== year) {
                        matched = false;
                    }
                    if (type && itemType !== type) {
                        matched = false;
                    }
                    if (category && itemCategory !== category) {
                        matched = false;
                    }

                    item.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visibleCount === 0);
                }
            }

            [input, yearSelect, typeSelect, categorySelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));

        shells.forEach(function (shell) {
            var video = shell.querySelector('video[data-src]');
            var button = shell.querySelector('[data-player-button]');
            var status = shell.querySelector('[data-player-status]');
            var hls = null;
            var loaded = false;

            if (!video) {
                return;
            }

            function setStatus(text) {
                if (status) {
                    status.textContent = text;
                }
            }

            function attachSource() {
                if (loaded) {
                    return Promise.resolve();
                }

                var source = video.getAttribute('data-src');
                if (!source) {
                    setStatus('播放源暂不可用');
                    return Promise.reject(new Error('Missing source'));
                }

                loaded = true;
                setStatus('正在加载播放源...');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return Promise.resolve();
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('播放源已就绪');
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus('播放加载异常，请稍后重试');
                        }
                    });
                    return Promise.resolve();
                }

                video.src = source;
                setStatus('已尝试使用浏览器原生播放');
                return Promise.resolve();
            }

            function playVideo() {
                attachSource().then(function () {
                    if (button) {
                        button.classList.add('is-hidden');
                    }
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(function () {
                            setStatus('请再次点击视频开始播放');
                        });
                    }
                }).catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });

            video.addEventListener('play', function () {
                setStatus('正在播放');
                if (button) {
                    button.classList.add('is-hidden');
                }
            });

            video.addEventListener('pause', function () {
                setStatus('已暂停');
            });

            video.addEventListener('ended', function () {
                setStatus('播放结束');
            });
        });
    }

    setupHero();
    setupFilters();
    setupPlayers();
})();
