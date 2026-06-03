import { useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { I18N } from '../data/i18n';

export function Topbar() {
  const lang = useGameStore(s => s.lang);
  const muted = useGameStore(s => s.muted);
  const nowPlaying = useGameStore(s => s.nowPlaying);
  const setLang = useGameStore(s => s.setLang);
  const toggleMute = useGameStore(s => s.toggleMute);
  const setNowPlaying = useGameStore(s => s.setNowPlaying);
  const tx = I18N[lang];

  const ytInputRef = useRef(null);

  function handleYT() {
    const raw = ytInputRef.current?.value?.trim() || '';
    const match = raw.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : (raw.length === 11 ? raw : null);
    if (!videoId || !window.YTPlayer) return;
    window.YTPlayer.loadVideoById(videoId);
    window.YTPlayer.playVideo();
  }

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" />
        <div>
          <div className="brand-name">ARCOÍRIS <b>INC.</b></div>
          <div className="brand-sub">{tx.brandSub}</div>
        </div>
      </div>

      <div className="controls">
        <div className="lang-toggle">
          <button
            data-lang="es"
            className={lang === 'es' ? 'active' : ''}
            onClick={() => setLang('es')}
          >ES</button>
          <button
            data-lang="en"
            className={lang === 'en' ? 'active' : ''}
            onClick={() => setLang('en')}
          >EN</button>
        </div>

        <button
          className={`icon-btn${muted ? ' muted' : ''}`}
          onClick={toggleMute}
          title={muted ? tx.muteOff : tx.muteOn}
        >
          {muted ? '🔇' : '🔊'}
        </button>

        <div className="yt-control">
          <input
            ref={ytInputRef}
            type="text"
            placeholder="YouTube URL / ID"
          />
          <button className="icon-btn yt-btn" onClick={handleYT} title="Reproducir">▶</button>
        </div>
      </div>

      {/* Hidden YouTube IFrame container */}
      <div id="youtube-player" style={{ position: 'fixed', left: -9999, top: -9999, width: 200, height: 200, pointerEvents: 'none' }} />
    </header>
  );
}
