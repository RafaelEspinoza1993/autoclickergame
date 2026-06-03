import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ArenaScene } from './scenes/ArenaScene';

export function ArenaGame() {
  const containerRef = useRef(null);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: '#0a0818',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 280,
      },
      scene: [ArenaScene],
    });
    return () => game.destroy(true);
  }, []);

  return <div ref={containerRef} className="arena-phaser" />;
}
