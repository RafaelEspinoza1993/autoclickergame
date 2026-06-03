import Phaser from 'phaser';

export class Turret extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, color, upgradeIndex) {
    const iconsKey = 'icons';
    const frame = (upgradeIndex * 7 + 24) % 357;
    super(scene, x, y, iconsKey, frame);

    this.turretColor = Phaser.Display.Color.HexStringToColor(color.replace('#', '')).color;
    this.rate = Math.max(12, 40 - upgradeIndex * 4);
    this.cooldown = 30 + upgradeIndex * 5;

    scene.add.existing(this);
    this.setScale(1.5 + upgradeIndex * 0.08);
    this.setTint(this.turretColor);
    this.setDepth(3);
  }

  update(_time, delta, _enemies) {
    this.cooldown -= delta;
    if (this.cooldown <= 0) {
      this.cooldown = this.rate;
      return true;
    }
    return false;
  }

  getFirePoint() {
    return { x: this.x + 15, y: this.y };
  }
}
