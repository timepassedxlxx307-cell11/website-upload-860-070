(function () {
  function setupMoviePlayer(streamUrl) {
    var video = document.getElementById("movieVideo");
    var startButton = document.querySelector("[data-player-start]");
    if (!video || !streamUrl) {
      return;
    }

    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = streamUrl;
      }
    }

    function begin(event) {
      if (event) {
        event.preventDefault();
      }
      attach();
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (startButton) {
            startButton.classList.remove("is-hidden");
          }
        });
      }
    }

    if (startButton) {
      startButton.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
