import Phaser from 'phaser';
import { RAINBOW } from '../../data/constants';

export class BackgroundScene extends Phaser.Scene {
  constructor() {
    super('BackgroundScene');
  }

  create() {
    if (!this.textures.exists('bg-sparkle')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('bg-sparkle', 8, 8);
      g.destroy();
    }

    const tintColors = RAINBOW.map(hex =>
      Phaser.Display.Color.HexStringToColor(hex.replace('#', '')).color
    );

    this.add.particles(0, 0, 'bg-sparkle', {
      x: { min: 0, max: this.scale.width || 800 },
      y: this.scale.height || 600,
      speed: { min: 8, max: 35 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: { min: 4000, max: 8000 },
      frequency: 150,
      quantity: 1,
      tint: tintColors,
    });
  }
}
