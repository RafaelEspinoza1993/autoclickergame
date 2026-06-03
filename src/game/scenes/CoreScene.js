import Phaser from 'phaser';
import { VFXManager } from '../fx/VFXManager';

export class CoreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CoreScene' });
  }

  create() {
    if (!this.textures.exists('sparkle')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(8, 8, 8);
      g.generateTexture('sparkle', 16, 16);
      g.destroy();
    }

    this.vfx = new VFXManager(this);

    window.addEventListener('arena:celebrate', () => {
      const w = this.scale.width || 400;
      const h = this.scale.height || 400;
      this.vfx.magicBurst(w / 2, h / 2);
    });
  }

  destroy() {
    window.removeEventListener('arena:celebrate', this._celebrateHandler);
    super.destroy();
  }

  emitAt(screenX, screenY) {
    const canvas = this.sys.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (screenX - rect.left) * scaleX;
    const y = (screenY - rect.top) * scaleY;

    this.vfx.clickSparkle(x, y);
  }
}
