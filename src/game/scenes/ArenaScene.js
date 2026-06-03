import Phaser from 'phaser';
import { UPGRADES, RAINBOW } from '../../data/constants';
import { Audio8 } from '../../audio/Audio8';
import { useGameStore } from '../../store/useGameStore';
import { createAnimations } from '../animations';
import { Enemy } from '../entities/Enemy';
import { Turret } from '../entities/Turret';
import { Projectile } from '../entities/Projectile';
import { VFXManager } from '../fx/VFXManager';

export class ArenaScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ArenaScene' });
  }

  preload() {
    const assets = [
      ['soldier-idle', 'characters/Soldier/Soldier-Idle.png', 100, 100],
      ['soldier-walk', 'characters/Soldier/Soldier-Walk.png', 100, 100],
      ['soldier-attack01', 'characters/Soldier/Soldier-Attack01.png', 100, 100],
      ['soldier-attack02', 'characters/Soldier/Soldier-Attack02.png', 100, 100],
      ['soldier-attack03', 'characters/Soldier/Soldier-Attack03.png', 100, 100],
      ['soldier-death', 'characters/Soldier/Soldier-Death.png', 100, 100],
      ['soldier-hurt', 'characters/Soldier/Soldier-Hurt.png', 100, 100],
      ['orc-idle', 'characters/Orc/Orc-Idle.png', 100, 100],
      ['orc-walk', 'characters/Orc/Orc-Walk.png', 100, 100],
      ['orc-attack01', 'characters/Orc/Orc-Attack01.png', 100, 100],
      ['orc-death', 'characters/Orc/Orc-Death.png', 100, 100],
      ['orc-hurt', 'characters/Orc/Orc-Hurt.png', 100, 100],
      ['icons', 'icons/IconsEssential.png', 16, 16],
    ];

    assets.forEach(([key, path, fw, fh]) => {
      if (!this.textures.exists(key)) {
        this.load.spritesheet(key, `assets/${path}`, { frameWidth: fw, frameHeight: fh });
      }
    });

    this.load.atlas('explosion',
      'assets/explosions/explosion-animation.png',
      'assets/explosions/explosion-animation.json');
  }

  init() {
    this._over = false;
    this.enemies = [];
    this.turrets = [];
    this.projectiles = [];
    this.parts = [];
  }

  create() {
    createAnimations(this);

    const { width: cw, height: ch } = this.scale;
    this.cw = cw;
    this.ch = ch;
    this.gy = ch - 34;

    this.bgGraphics = this.add.graphics();
    this.fxGraphics = this.add.graphics();

    if (!this.textures.exists('sparkle')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(8, 8, 8);
      g.generateTexture('sparkle', 16, 16);
      g.destroy();
    }

    this.vfx = new VFXManager(this);

    const store = useGameStore.getState();
    const ownedUpgrades = UPGRADES.filter(u => (store.owned[u.id] || 0) >= 1);
    const wave = store.challengeWave;
    const dur = Math.min(26, 16 + wave);

    this.gameState = {
      wave, t: dur, dur,
      hp: 100, maxHp: 100, kills: 0,
      spawnT: 30, over: false,
      clickDmg: 2 + Math.floor(wave / 3),
    };

    const baseEdge = 44;
    ownedUpgrades.forEach((u, i) => {
      const tx = baseEdge + 8 + (i % 3) * 16;
      const ty = this.gy - 2 - Math.floor(i / 3) * 18;
      const turret = new Turret(this, tx, ty, u.color, i);
      this.turrets.push(turret);
    });

    this.input.on('pointerdown', this._onPointer, this);
  }

  update(_time, delta) {
    if (this._over) return;
    const dt = Math.min(50, delta) / 1000;
    const gs = this.gameState;

    if (!gs.over) this._updateTick(dt, gs);
    this._draw(gs);

    window.dispatchEvent(new CustomEvent('arena:tick', {
      detail: {
        hpPct: gs.hp / gs.maxHp * 100,
        timePct: Math.max(0, gs.t / gs.dur * 100),
        kills: gs.kills,
      },
    }));
  }

  _updateTick(dt, gs) {
    gs.t -= dt;

    gs.spawnT -= dt * 60;
    if (gs.spawnT <= 0) {
      this._spawnEnemy();
      gs.spawnT = Math.max(22, 60 - gs.wave * 4) + Math.random() * 20;
    }

    const baseEdge = 44;

    this.enemies = this.enemies.filter(e => e.active && !e.isDead);
    this.enemies.forEach(e => {
      e.update(this.time.now, dt * 1000);

      if (e.x <= baseEdge && !e.isDead) {
        gs.hp -= e.dmg;
        this._burst(baseEdge, e.y, 8);
        Audio8.bossHit();
        this.cameras.main.shake(200, 0.012);
        e.die();
        if (gs.hp <= 0) { gs.hp = 0; this._endChallenge(false); }
      }
    });
    this.enemies = this.enemies.filter(e => e.active && !e.isDead);

    this.turrets.forEach(turret => {
      if (turret.active && turret.update(this.time.now, dt * 1000, this.enemies)) {
        this._fireProjectile(turret);
      }
    });

    this.projectiles = this.projectiles.filter(p => p.active && !p.isDead);
    this.projectiles.forEach(p => {
      p.update(this.time.now, dt * 1000);
      this.enemies.forEach(e => {
        if (e.active && !e.isDead && p.active && !p.isDead) {
          const dist = Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y);
          if (dist < e.radius + 10) {
            if (this.vfx) this.vfx.splatter(p.x, p.y);
            const killed = e.takeDamage(p.projDamage);
            p.hit();
            if (killed) gs.kills++;
          }
        }
      });
    });
    this.projectiles = this.projectiles.filter(p => p.active && !p.isDead);

    this.parts.forEach(p => { p.x += p.dx; p.y += p.dy; p.dy += 0.18; p.life--; });
    this.parts = this.parts.filter(p => p.life > 0);

    if (gs.t <= 0 && !gs.over) { gs.t = 0; this._endChallenge(true); }
  }

  _draw(gs) {
    const { bgGraphics: bg, fxGraphics: fx, cw, ch, gy } = this;
    bg.clear(); fx.clear();

    bg.fillGradientStyle(0x170f2e, 0x170f2e, 0x0a0818, 0x0a0818, 1);
    bg.fillRect(-10, -10, cw + 20, ch + 20);

    bg.fillStyle(0xffffff, 0.18);
    for (let i = 0; i < 40; i++) bg.fillRect((i * 53) % cw, (i * 29) % (ch * 0.7), 2, 2);

    bg.fillStyle(0x241a3a, 1);
    bg.fillRect(0, gy + 18, cw, 16);
    bg.fillStyle(0xffffff, 0.06);
    for (let i = 0; i < cw / 26; i++) bg.fillRect(i * 26, gy + 22, 8, 3);

    const baseEdge = 44;
    const colors = [0xff2d6f, 0xff8a3d, 0xffe24d, 0x4dff9e];
    bg.fillGradientStyle(colors[0], colors[1], colors[2], colors[3], 1);
    bg.fillRect(0, 18, baseEdge - 6, gy - 18);

    this.parts.forEach(p => {
      const col = Phaser.Display.Color.HexStringToColor(p.c.replace('#', '')).color;
      fx.fillStyle(col, Math.max(0, p.life / (p.maxLife || 30)));
      fx.fillRect(p.x, p.y, p.s, p.s);
    });
  }

  _spawnEnemy() {
    const roll = Math.random();
    let type = 'basic';
    if (this.gameState.wave >= 3 && roll < 0.18) type = 'tough';
    else if (roll < 0.30) type = 'fast';

    const enemy = new Enemy(this, this.cw + 24, this.gy - 16, type, this.gameState.wave);
    this.enemies.push(enemy);
  }

  _fireProjectile(turret) {
    const fp = turret.getFirePoint();
    const projectile = new Projectile(this, fp.x, fp.y, turret.turretColor, 2);
    this.projectiles.push(projectile);
  }

  _onPointer(pointer) {
    const gs = this.gameState;
    if (!gs || gs.over) return;

    let best = null, bd = 1e9;
    this.enemies.forEach(e => {
      if (!e.active || e.isDead) return;
      const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, e.x, e.y);
      if (dist < e.radius + 12 && dist < bd) { bd = dist; best = e; }
    });

    if (best) {
      const killed = best.takeDamage(gs.clickDmg);
      Audio8.hit();
      if (killed) gs.kills++;
    } else {
      Audio8.click();
    }
  }

  _burst(x, y, n) {
    for (let i = 0; i < n; i++) {
      this.parts.push({
        x, y,
        dx: (Math.random() - 0.5) * 6,
        dy: (Math.random() - 0.5) * 6,
        life: 20 + Math.random() * 12,
        maxLife: 32,
        c: RAINBOW[(Math.random() * RAINBOW.length) | 0],
        s: 2 + Math.random() * 2,
      });
    }
  }

  _endChallenge(survived) {
    if (this._over || this.gameState.over) return;
    this.gameState.over = true;
    this._over = true;
    useGameStore.getState().endChallenge(survived);
  }

  shutdown() {
    this.enemies.forEach(e => { if (e.active) e.destroy(); });
    this.turrets.forEach(t => { if (t.active) t.destroy(); });
    this.projectiles.forEach(p => { if (p.active) p.destroy(); });
    this.enemies = [];
    this.turrets = [];
    this.projectiles = [];
    this.parts = [];
  }
}
