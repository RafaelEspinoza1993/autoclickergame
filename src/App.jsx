import { useEffect, useRef } from 'react';
import { useGameStore } from './store/useGameStore';
import { Audio8 } from './audio/Audio8';
import { Topbar } from './components/Topbar';
import { Counter } from './components/Counter';
import { CoreButton } from './components/CoreButton';
import { Shop } from './components/Shop';
import { ChallengeModal } from './components/ChallengeModal';
import { WinScreen } from './components/WinScreen';
import { Announcer } from './components/Announcer';
import { AmbientScene } from './components/AmbientScene';
import { PhaserGame } from './game/PhaserGame';

// Animated sparkle background canvas (vanilla, same as before)
function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const x = cv.getContext('2d');
    const COLORS = ['#ff2d6f','#ff8a3d','#ffe24d','#4dff9e','#3dd6ff','#9a6bff','#ff5ed6'];
    let W, H, ps = [];

    function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }

    function P() { this.reset(true); }
    P.prototype.reset = function (init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.r = Math.random() * 2.4 + 0.6;
      this.c = COLORS[(Math.random() * COLORS.length) | 0];
      this.s = Math.random() * 0.5 + 0.15;
      this.dx = (Math.random() - 0.5) * 0.3;
      this.a = Math.random() * 0.5 + 0.15;
    };
    P.prototype.step = function () {
      this.y -= this.s; this.x += this.dx;
      if (this.y < -10) this.reset();
    };

    function init() { ps = Array.from({ length: 70 }, () => new P()); }

    let raf;
    function loop() {
      x.clearRect(0, 0, W, H);
      ps.forEach(p => {
        p.step();
        x.save(); x.globalAlpha = p.a; x.fillStyle = p.c;
        x.shadowBlur = 6; x.shadowColor = p.c;
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill();
        x.restore();
      });
      raf = requestAnimationFrame(loop);
    }

    resize(); init(); loop();
    const onResize = () => { resize(); init(); };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas ref={canvasRef} id="bg" />;
}

// YouTube IFrame API setup
function useYouTube() {
  const setNowPlaying = useGameStore(s => s.setNowPlaying);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      window.YTPlayer = new window.YT.Player('youtube-player', {
        height: '200', width: '200',
        playerVars: { autoplay: 0, controls: 0 },
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT?.PlayerState?.PLAYING) {
              const data = window.YTPlayer.getVideoData?.();
              setNowPlaying(data?.title || '');
            }
          },
        },
      });
      if (Audio8.isMuted() && window.YTPlayer) window.YTPlayer.mute();
    };

    return () => { window.YTPlayer?.destroy(); };
  }, []);
}

export function App() {
  const load = useGameStore(s => s.load);
  const owned = useGameStore(s => s.owned);
  const won = useGameStore(s => s.won);
  const phaserRef = useRef(null);

  useYouTube();

  useEffect(() => {
    load();
    Audio8.syncMusic(() => useGameStore.getState().owned);
  }, []);

  return (
    <>
      <BackgroundCanvas />
      <div className="aurora" />

      <div className="shell">
        <Topbar />

        <main className="stage">
          <section className="hero" style={{ position: 'relative' }}>
            <Counter />
            <CoreButton phaserRef={phaserRef} />
            {/* Phaser particles overlay — pointer-events: none in CSS */}
            <PhaserGame ref={phaserRef} />
          </section>

          <Shop />
        </main>
      </div>

      <AmbientScene />
      <Announcer />
      <ChallengeModal />
      <WinScreen />
    </>
  );
}
