import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';
import { CoreScene } from './scenes/CoreScene';

const PhaserGame = forwardRef(function PhaserGame(_, ref) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useImperativeHandle(ref, () => ({
    emitAt(x, y) {
      const scene = gameRef.current?.scene.getScene('CoreScene');
      scene?.emitAt(x, y);
    },
  }));

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      transparent: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [CoreScene],
    });
    gameRef.current = game;
    return () => { game.destroy(true); gameRef.current = null; };
  }, []);

  return <div ref={containerRef} className="phaser-particles" />;
});

export { PhaserGame };
