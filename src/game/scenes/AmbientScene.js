import Phaser from 'phaser';
import { UPGRADES, RAINBOW } from '../../data/constants';
import { useGameStore } from '../../store/useGameStore';

export class AmbientScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AmbientScene' });
  }

  preload() {
    const assets = [
      ['icons', 'assets/icons/IconsEssential.png', 16, 16],
      ['orc-walk', 'assets/characters/Orc/Orc-Walk.png', 100, 100],
    ];
    assets.forEach(([key, path, fw, fh]) => {
      if (!this.textures.exists(key)) {
        this.load.spritesheet(key, path, { frameWidth: fw, frameHeight: fh });
      }
    });
  }

  create() {
    if (!this.textures.exists('sparkle')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('sparkle', 8, 8);
      g.destroy();
    }

    if (!this.anims.exists('ambient-orc-walk')) {
      this.anims.create({
        key: 'ambient-orc-walk',
        frames: this.anims.generateFrameNumbers('orc-walk', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1,
      });
    }

    this.groundY = this.scale.height - 30;
    this.turrets = {};
    this.foes = [];
    this.shots = [];
    this.foeTimer = 0;
    this.starOffset = 0;
    this.w = this.scale.width;
    this.h = this.scale.height;

    this.bgLayer = this.add.container().setDepth(0);
    this.shotGfx = this.add.graphics().setDepth(4);
    this.turretLayer = this.add.container().setDepth(3);
    this.foeLayer = this.add.container().setDepth(2);
    this.starLayer = this.add.container().setDepth(1);

    this.drawBackground();
    this.startStarField();

    window.addEventListener('arena:celebrate', this._onCelebrate);
    this.scale.on('resize', this._onResize, this);
  }

  update(_time, delta) {
    delta = Math.min(delta, 50);
    this.tickTurrets(delta);
    this.tickFoes(delta);
    this.tickShots();
    this.tickStars();
    this.drawShots();
  }

  // ── background ──

  drawBackground() {
    this.bgLayer.removeAll(true);
    const g = this.make.graphics({ add: false });
    g.fillGradientStyle(0x1a1230, 0x1a1230, 0x0a0818, 0x0a0818, 1);
    g.fillRect(0, 0, this.w, this.h);
    g.fillStyle(0x221838, 1);
    g.fillRect(0, this.groundY, this.w, this.h - this.groundY);
    g.fillStyle(0x2a1f42, 1);
    for (let i = 0; i < 14; i++) {
      g.fillRect((i * 40) % (this.w + 12) - 6, this.groundY + 6, 6, 2);
    }
    this.bgLayer.add(g);
  }

  // ── stars ──

  startStarField() {
    this.starLayer.removeAll(true);
    this.stars = [];
    for (let i = 0; i < 30; i++) {
      const s = this.add.image(
        Math.random() * this.w,
        Math.random() * (this.groundY * 0.7),
        'sparkle'
      ).setAlpha(0.12 + Math.random() * 0.15)
       .setScale(0.25 + Math.random() * 0.35)
       .setDepth(1);
      this.starLayer.add(s);
      this.stars.push(s);
    }
  }

  tickStars() {
    this.starOffset -= 0.15;
    this.stars.forEach((s) => {
      s.x = (s.x + this.w - 0.15) % (this.w + 20) - 10;
    });
  }

  // ── turrets ──

  tickTurrets(delta) {
    const owned = useGameStore.getState().owned;
    const ownedUpgrades = UPGRADES.filter(u => owned[u.id]);
    const ownedIds = new Set(ownedUpgrades.map(u => u.id));

    Object.keys(this.turrets).forEach(id => {
      if (!ownedIds.has(id)) {
        this.turrets[id].sprite.destroy();
        delete this.turrets[id];
      }
    });

    ownedUpgrades.forEach((u, i) => {
      let turret = this.turrets[u.id];
      if (!turret) {
        const color = Phaser.Display.Color.HexStringToColor(u.color.replace('#', '')).color;
        const frame = (i * 7 + 24) % 357;
        const sprite = this.add.sprite(20 + i * 26, this.groundY - 2, 'icons', frame)
          .setScale(1.2).setTint(color).setDepth(3);
        this.turretLayer.add(sprite);
        turret = { id: u.id, sprite, cd: 0, rate: 1000 + i * 200, bob: Math.random() * 6 };
        this.turrets[u.id] = turret;
      }
      turret.bob += 0.08;
      turret.sprite.y = this.groundY - 2 + Math.sin(turret.bob) * 1.5;
      turret.cd -= delta;
      if (turret.cd <= 0 && this.foes.some(f => f.active && !f.dead)) {
        turret.cd = turret.rate;
        const target = this.foes.find(f => f.active && !f.dead);
        if (target) {
          this.shots.push({
            x: turret.sprite.x + 10,
            y: turret.sprite.y - 6,
            color: u.color,
            target,
            alive: true,
          });
        }
      }
    });
  }

  // ── decorative foes ──

  tickFoes(delta) {
    this.foeTimer -= delta;
    if (this.foeTimer <= 0 && Object.keys(this.turrets).length > 0) {
      this.foeTimer = 1200 + Math.random() * 1000;
      const sprite = this.add.sprite(this.w + 10, this.groundY - 2, 'orc-walk', 2)
        .setScale(0.25).setDepth(2).setFlipX(true).play('ambient-orc-walk');
      this.foeLayer.add(sprite);
      this.foes.push({ sprite, hp: 1, dead: false, hitTimer: 0 });
    }

    for (let i = this.foes.length - 1; i >= 0; i--) {
      const f = this.foes[i];
      if (f.dead || !f.sprite.active) {
        if (f.sprite.active) f.sprite.destroy();
        this.foes.splice(i, 1);
        continue;
      }
      f.sprite.x -= 0.8;
      if (f.hitTimer > 0) {
        f.hitTimer -= delta;
        f.sprite.setTint(0xffffff);
      } else {
        f.sprite.clearTint();
      }
      if (f.sprite.x < -20) {
        f.sprite.destroy();
        this.foes.splice(i, 1);
      }
    }
  }

  // ── shots ──

  tickShots() {
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const sh = this.shots[i];
      if (!sh.alive) { this.shots.splice(i, 1); continue; }
      if (!sh.target.active || sh.target.dead) {
        sh.alive = false;
        this.shots.splice(i, 1);
        continue;
      }
      const dx = sh.target.sprite.x - sh.x;
      const dy = (sh.target.sprite.y - 6) - sh.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 12) {
        sh.target.hitTimer = 100;
        sh.target.hp--;
        if (sh.target.hp <= 0) {
          sh.target.dead = true;
          this._burst(sh.target.sprite.x, sh.target.sprite.y);
        }
        this.shots.splice(i, 1);
        continue;
      }
      const speed = 4;
      sh.x += (dx / dist) * speed;
      sh.y += (dy / dist) * speed;
    }
  }

  drawShots() {
    this.shotGfx.clear();
    this.shots.forEach(sh => {
      this.shotGfx.fillStyle(0xffffff, 0.9);
      this.shotGfx.fillRect(sh.x - 2, sh.y - 1, 5, 3);
      const c = Phaser.Display.Color.HexStringToColor(sh.color.replace('#', '')).color;
      this.shotGfx.fillStyle(c, 0.7);
      this.shotGfx.fillRect(sh.x - 1, sh.y, 3, 1);
    });
  }

  // ── particles ──

  _burst(x, y) {
    for (let k = 0; k < 6; k++) {
      this.add.particles(x, y, 'sparkle', {
        speed: { min: 15, max: 40 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 500,
        quantity: 1,
        tint: RAINBOW[Math.floor(Math.random() * 7)],
        emitting: false,
      }).explode(1);
    }
  }

  _onCelebrate = () => {
    this.foes.forEach(f => {
      if (!f.dead) {
        this._burst(f.sprite.x, f.sprite.y);
      }
    });
  };

  _onResize = (gameSize) => {
    this.w = gameSize.width;
    this.h = gameSize.height;
    this.groundY = this.h - 30;
    this.drawBackground();
    this.startStarField();
  };
}
