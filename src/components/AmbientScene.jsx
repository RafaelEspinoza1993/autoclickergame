import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { UPGRADES, RAINBOW } from '../data/constants';

export function AmbientScene() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);

  const nowPlaying = useGameStore(s => s.nowPlaying);
  const lang = useGameStore(s => s.lang);
  const challengeActive = useGameStore(s => s.challengeActive);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const wrap = cv.parentElement;

    function resize() {
      const r = wrap.getBoundingClientRect();
      cv.width = Math.max(2, Math.floor(r.width * 2));
      cv.height = Math.max(2, Math.floor(r.height * 2));
    }
    resize();
    window.addEventListener('resize', resize);

    stateRef.current = { players: [], shots: [], foes: [], parts: [], scroll: 0, frame: 0, foeT: 0 };
    let raf = null;

    function loop() {
      const s = stateRef.current;
      const aw = cv.width, ah = cv.height;
      s.frame++; s.scroll -= 1;

      const g = ctx.createLinearGradient(0, 0, 0, ah);
      g.addColorStop(0, '#1a1230'); g.addColorStop(1, '#0a0818');
      ctx.fillStyle = g; ctx.fillRect(0, 0, aw, ah);

      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      for (let i = 0; i < 18; i++) ctx.fillRect((i * 61 + s.scroll * 0.4) % aw, (i * 37) % (ah * 0.6), 2, 2);

      const gy = ah - 22;
      ctx.fillStyle = '#241a3a'; ctx.fillRect(0, gy, aw, 22);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let i = 0; i < 14; i++) ctx.fillRect((i * 40 + s.scroll) % (aw + 12) - 6, gy + 6, 6, 2);

      const gameOwned = useGameStore.getState().owned;
      const ownedUpgrades = UPGRADES.filter(u => gameOwned[u.id]);
      s.players = s.players.filter(p => ownedUpgrades.some(u => u.id === p.id));
      ownedUpgrades.forEach(u => {
        if (!s.players.some(p => p.id === u.id))
          s.players.push({ id: u.id, emoji: u.emoji, color: u.color, bob: Math.random() * 6, cd: 20 });
      });

      if (ownedUpgrades.length) {
        s.foeT--;
        if (s.foeT <= 0) { s.foeT = 70 + Math.random() * 60; s.foes.push({ x: aw + 10, hp: 1, hit: 0 }); }
      }

      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      s.players.forEach((p, i) => {
        p.bob += 0.1; p.cd--;
        const px = 20 + i * 26, py = gy + 2 + Math.sin(p.bob) * 2;
        if (p.cd <= 0) { p.cd = 35 + i * 4; s.shots.push({ x: px + 10, y: gy - 8, color: p.color }); }
        ctx.font = '22px serif'; ctx.shadowBlur = 10; ctx.shadowColor = p.color;
        ctx.fillText(p.emoji, px, py); ctx.shadowBlur = 0;
      });

      s.shots.forEach(sh => {
        sh.x += 5;
        ctx.fillStyle = '#fff'; ctx.fillRect(sh.x, sh.y, 7, 3);
        ctx.fillStyle = sh.color; ctx.fillRect(sh.x - 1, sh.y - 1, 9, 5);
        s.foes.forEach(f => {
          if (f.hp > 0 && Math.abs(sh.x - f.x) < 14) {
            f.hp--; f.hit = 5; sh.dead = true;
            if (f.hp <= 0) {
              for (let k = 0; k < 8; k++)
                s.parts.push({ x: f.x, y: gy - 8, dx: (Math.random() - .5) * 5, dy: (Math.random() - .5) * 5, life: 18, c: RAINBOW[(Math.random() * 7) | 0] });
            }
          }
        });
      });
      s.shots = s.shots.filter(sh => !sh.dead && sh.x < aw + 10);

      s.foes.forEach(f => {
        f.x -= 1.1; if (f.hit > 0) f.hit--;
        ctx.font = '20px serif'; ctx.fillStyle = f.hit > 0 ? '#fff' : '#ddd';
        ctx.fillText('👾', f.x, gy + 2);
      });
      s.foes = s.foes.filter(f => f.hp > 0 && f.x > -20);

      s.parts.forEach(p => {
        p.x += p.dx; p.y += p.dy; p.dy += 0.2; p.life--;
        ctx.globalAlpha = p.life / 18; ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, 3, 3); ctx.globalAlpha = 1;
      });
      s.parts = s.parts.filter(p => p.life > 0);

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    // Listen for celebrate events
    function celebrate() {
      if (!stateRef.current) return;
      const s = stateRef.current;
      const gy = cv.height - 22;
      for (let k = 0; k < 22; k++)
        s.parts.push({ x: Math.random() * cv.width, y: gy - 10, dx: (Math.random() - .5) * 6, dy: -Math.random() * 5 - 1, life: 24, c: RAINBOW[(Math.random() * 7) | 0] });
    }
    window.addEventListener('arena:celebrate', celebrate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('arena:celebrate', celebrate);
    };
  }, []);

  return (
    <div className={`ambient${challengeActive ? ' hidden' : ''}`} id="ambient">
      <div className="ambient-tag">FÁBRICA · LIVE</div>
      <div className="ambient-song">
        <span>🎵</span>
        <span>{nowPlaying || (lang === 'es' ? 'Sin canción' : 'No song')}</span>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
}
