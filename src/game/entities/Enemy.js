import Phaser from 'phaser';

const ENEMY_CONFIG = {
  basic: {
    spriteKey: 'orc-walk',
    walkAnim: 'orc-walk',
    deathAnim: 'orc-death',
    hurtAnim: 'orc-hurt',
    scale: 0.5,
    hp: 2,
    speed: 0,
    dmg: 9,
    radius: 16,
    hpColor: 0xffe24d,
    tint: null,
  },
  fast: {
    spriteKey: 'soldier-walk',
    walkAnim: 'soldier-walk',
    deathAnim: 'soldier-death',
    hurtAnim: 'soldier-hurt',
    scale: 0.4,
    hp: 1,
    speed: 0,
    dmg: 7,
    radius: 13,
    hpColor: 0xffe24d,
    tint: 0xaaaaff,
  },
  tough: {
    spriteKey: 'orc-walk',
    walkAnim: 'orc-walk',
    deathAnim: 'orc-death',
    hurtAnim: 'orc-hurt',
    scale: 0.65,
    hp: 4,
    speed: 0,
    dmg: 16,
    radius: 19,
    hpColor: 0xff5ed6,
    tint: 0xff8888,
  },
};

export class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, type, wave) {
    const config = ENEMY_CONFIG[type] || ENEMY_CONFIG.basic;
    const frame = 0;
    super(scene, x, y, config.spriteKey, frame);

    this.enemyType = type;
    this.config = config;
    this.hp = config.hp + (type === 'tough' ? Math.floor(wave / 2) : 0);
    this.maxHp = this.hp;
    this.speed = this._calcSpeed(type, wave);
    this.dmg = config.dmg + Math.floor(wave / 3);
    this.radius = config.radius;
    this.isDead = false;
    this.hitTimer = 0;

    scene.add.existing(this);
    this.setScale(config.scale);
    if (config.tint) this.setTint(config.tint);
    this.setDepth(4);

    this.hpBarBg = scene.add.graphics().setDepth(5);
    this.hpBarFill = scene.add.graphics().setDepth(5);
    if (this.maxHp <= 1) {
      this.hpBarBg.setVisible(false);
      this.hpBarFill.setVisible(false);
    }

    if (this.scene.anims.exists(config.walkAnim)) {
      this.play(config.walkAnim);
    }
  }

  _calcSpeed(type, wave) {
    if (type === 'basic') return 42 + wave * 4;
    if (type === 'fast') return 70 + wave * 6;
    if (type === 'tough') return 28 + wave * 2;
    return 42 + wave * 4;
  }

  update(_time, delta) {
    if (this.isDead) return;

    this.x -= this.speed * (delta / 1000);

    if (this.hitTimer > 0) {
      this.hitTimer -= delta;
      if (this.hitTimer <= 0) {
        this.clearTint();
        if (this.config.tint) this.setTint(this.config.tint);
      }
    }

    this._drawHPBar();
  }

  takeDamage(dmg) {
    if (this.isDead) return false;

    this.hp -= dmg;
    this.hitTimer = 100;
    this.setTintFill(0xffffff);

    if (this.config.hurtAnim && this.scene.anims.exists(this.config.hurtAnim)) {
      this.play(this.config.hurtAnim);
      this.once('animationcomplete', () => {
        if (!this.isDead && this.scene.anims.exists(this.config.walkAnim)) {
          this.play(this.config.walkAnim);
        }
      });
    }

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;

    if (this.scene.vfx) {
      this.scene.vfx.explosion(this.x, this.y);
    }

    if (this.config.deathAnim && this.scene.anims.exists(this.config.deathAnim)) {
      this.play(this.config.deathAnim);
      this.once('animationcomplete', () => {
        this._destroyHPBar();
        this.destroy();
      });
    } else {
      this._destroyHPBar();
      this.destroy();
    }

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      delay: 300,
    });
  }

  _drawHPBar() {
    const bw = this.radius * 2;
    const bh = 4;
    const bx = this.x - bw / 2;
    const by = this.y - this.radius - 10;

    this.hpBarBg.clear();
    this.hpBarBg.fillStyle(0x000000, 0.5);
    this.hpBarBg.fillRect(bx, by, bw, bh);

    this.hpBarFill.clear();
    const pct = Math.max(0, this.hp / this.maxHp);
    this.hpBarFill.fillStyle(this.config.hpColor, 1);
    this.hpBarFill.fillRect(bx, by, bw * pct, bh);
  }

  _destroyHPBar() {
    if (this.hpBarBg) { this.hpBarBg.destroy(); this.hpBarBg = null; }
    if (this.hpBarFill) { this.hpBarFill.destroy(); this.hpBarFill = null; }
  }

  destroy(fromScene) {
    this._destroyHPBar();
    super.destroy(fromScene);
  }
}
