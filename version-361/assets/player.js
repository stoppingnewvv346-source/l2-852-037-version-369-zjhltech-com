
(function () {
    window.attachMoviePlayer = function (videoId, buttonId, coverId, sourceUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var cover = document.getElementById(coverId);
        var loaded = false;
        var hlsInstance = null;

        if (!video || !sourceUrl) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                loaded = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                loaded = true;
                return;
            }

            video.src = sourceUrl;
            loaded = true;
        }

        function startPlayback() {
            loadSource();

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        if (cover && cover !== button) {
            cover.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
