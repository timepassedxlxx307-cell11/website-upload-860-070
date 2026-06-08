(function () {
  function initMoviePlayer(id, url) {
    var shell = document.getElementById(id);
    if (!shell) {
      return;
    }

    var video = shell.querySelector("video");
    var start = shell.querySelector(".player-start");
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (prepared || !video) {
        return;
      }

      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else {
        video.src = url;
      }

      shell.classList.add("is-ready");
    }

    function playVideo() {
      prepare();
      var action = video.play();
      if (action && typeof action.then === "function") {
        action.catch(function () {});
      }
    }

    if (start) {
      start.addEventListener("click", function () {
        start.classList.add("is-hidden");
        playVideo();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
      if (start) {
        start.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      shell.classList.remove("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
