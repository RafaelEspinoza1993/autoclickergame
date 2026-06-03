import Phaser from 'phaser';
import { RAINBOW } from '../../data/constants';

const TINT_COLORS = RAINBOW.map(hex =>
  Phaser.Display.Color.HexStringToColor(hex.replace('#', '')).color
);

export class CoreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CoreScene' });
    this._emitCallback = null;
  }

  create() {
    if (!this.textures.exists('sparkle')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(8, 8, 8);
      g.generateTexture('sparkle', 16, 16);
      g.destroy();
    }

    this.emitter = this.add.particles(0, 0, 'sparkle', {
      tint: TINT_COLORS,
      speed: { min: 100, max: 320 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 },
      lifespan: { min: 500, max: 900 },
      gravityY: 600,
      emitting: false,
      quantity: 14,
    });
  }

  emitAt(screenX, screenY) {
    const canvas = this.sys.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (screenX - rect.left) * scaleX;
    const y = (screenY - rect.top) * scaleY;
    this.emitter.emitParticleAt(x, y, 16);
  }
}
