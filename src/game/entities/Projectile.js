import Phaser from 'phaser';

export class Projectile extends Phaser.GameObjects.Graphics {
  constructor(scene, x, y, color, damage) {
    super(scene);

    this.projColor = Phaser.Display.Color.HexStringToColor(color.replace('#', '')).color;
    this.projDamage = damage;
    this.speed = 360;
    this.isDead = false;

    scene.add.existing(this);
    this.setPosition(x, y);
    this.setDepth(4);
    this._draw();
  }

  _draw() {
    this.clear();
    this.lineStyle(5, this.projColor, 0.3);
    this.lineBetween(-1, -1, 10, -1);
    this.lineStyle(3, 0xffffff, 1);
    this.lineBetween(0, 0, 8, 0);
    this.lineStyle(2, this.projColor, 1);
    this.lineBetween(0, -1, 8, -1);
    this.lineBetween(0, 1, 8, 1);
  }

  update(_time, delta) {
    if (this.isDead) return;
    this.x += this.speed * (delta / 1000);

    if (this.x > this.scene.scale.width + 20) {
      this.isDead = true;
      this.destroy();
    }
  }

  hit() {
    if (this.isDead) return;
    this.isDead = true;
    this.destroy();
  }
}
