(function () {
  function attachPlayer(mediaUrl) {
    var video = document.getElementById('movieVideo');
    var cover = document.querySelector('.player-cover');
    var trigger = document.querySelector('[data-player-trigger]');
    var hls = null;

    if (!video || !mediaUrl) {
      return;
    }

    function bind() {
      if (video.getAttribute('data-bound') === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }

      video.setAttribute('data-bound', 'true');
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function showCover() {
      if (cover) {
        cover.classList.remove('is-hidden');
      }
    }

    function start() {
      bind();
      hideCover();
      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          showCover();
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (trigger && trigger !== cover) {
      trigger.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', hideCover);
    video.addEventListener('pause', function () {
      if (!video.currentTime) {
        showCover();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof currentMediaSource === 'string') {
      attachPlayer(currentMediaSource);
    }
  });
})();
