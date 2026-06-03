import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { AmbientScene as AmbientSceneClass } from '../game/scenes/AmbientScene';
import { useGameStore } from '../store/useGameStore';

export function AmbientPhaser() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const challengeActive = useGameStore(s => s.challengeActive);
  const nowPlaying = useGameStore(s => s.nowPlaying);
  const lang = useGameStore(s => s.lang);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: '#1a1230',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [AmbientSceneClass],
    });
    gameRef.current = game;
    return () => { game.destroy(true); gameRef.current = null; };
  }, []);

  return (
    <div className={`ambient${challengeActive ? ' hidden' : ''}`} id="ambient">
      <div className="ambient-tag">FÁBRICA · LIVE</div>
      <div className="ambient-song">
        <span>🎵</span>
        <span>{nowPlaying || (lang === 'es' ? 'Sin canción' : 'No song')}</span>
      </div>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
