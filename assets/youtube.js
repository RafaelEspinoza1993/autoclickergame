(function () {
  var player = null,
      ready  = false,
      input  = document.getElementById('yt-input'),
      btn    = document.getElementById('yt-btn'),
      now    = document.getElementById('now-playing');

  function extractId(str) {
    str = str.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
    var m = str.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('youtube-player', {
      height: '200', width: '200',
      playerVars: { controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0 },
      events: {
        onReady: function (e) {
          ready = true;
          // patch the iframe so autoplay is permitted
          var iframe = e.target.getIframe();
          if (iframe) iframe.setAttribute('allow', 'autoplay; encrypted-media');
          // sync mute state
          if (window.Audio8 && Audio8.isMuted()) e.target.mute();
        },
        onStateChange: function (e) {
          if (e.data === YT.PlayerState.PLAYING) {
            try {
              var d = player.getVideoData();
              if (d && d.title) now.textContent = d.title;
            } catch (_) {}
            // unmute now that playback started (unless game is muted)
            if (!window.Audio8 || !Audio8.isMuted()) player.unMute();
            // pause chiptune while YouTube plays
            if (window.Audio8) Audio8.stopMusic();
          } else if (e.data === YT.PlayerState.ENDED) {
            now.textContent = 'Sin canción';
            if (window.Audio8 && window.State) Audio8.syncMusic(function () { return State.owned; });
          } else if (e.data === YT.PlayerState.PAUSED) {
            if (window.Audio8 && window.State) Audio8.syncMusic(function () { return State.owned; });
          }
        },
        onError: function (e) {
          var msgs = { 2: 'ID inválido', 5: 'Error del reproductor', 100: 'Video no encontrado', 101: 'No permite embed', 150: 'No permite embed' };
          now.textContent = msgs[e.data] || ('Error ' + e.data);
        },
      },
    });
  };

  // exposed for the mute button in core.js
  window.YTPlayer = {
    mute:     function () { if (ready) player.mute(); },
    unMute:   function () { if (ready) player.unMute(); },
    isActive: function () {
      if (!ready) return false;
      var s = player.getPlayerState();
      return s === YT.PlayerState.PLAYING || s === YT.PlayerState.BUFFERING;
    },
  };

  function playSong() {
    var id = extractId(input.value);
    if (!id) { now.textContent = 'URL inválida'; return; }
    if (!ready) { now.textContent = 'YouTube no disponible'; return; }
    // muted start — browsers always allow muted autoplay in iframes
    player.mute();
    player.loadVideoById(id);
    now.textContent = 'Cargando…';
  }

  btn.addEventListener('click', playSong);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') playSong();
  });

  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.body.appendChild(tag);
})();
