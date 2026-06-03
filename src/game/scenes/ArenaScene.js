import Phaser from 'phaser';
import { UPGRADES, RAINBOW } from '../../data/constants';
import { Audio8 } from '../../audio/Audio8';
import { useGameStore } from '../../store/useGameStore';
import { createAnimations } from '../animations';
import { Enemy } from '../entities/Enemy';
import { Turret } from '../entities/Turret';
import { Projectile } from '../entities/Projectile';
import { VFXManager } from '../fx/VFXManager';

const BASE_W = 800;
const BASE_H = 280;

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
    const storageLevel = store.storageLevel;

    // Tower defense: difficulty scales with storage level
    const diffMult = 1 + storageLevel * 0.3;
    const duration = Math.min(30, 12 + wave * 2) * diffMult;
    const totalWaves = Math.ceil(duration / 4);
    const baseHp = 80 + storageLevel * 20;

    this.gameState = {
      wave, t: duration, dur: duration,
      hp: baseHp, maxHp: baseHp, kills: 0,
      spawnT: 30, over: false,
      clickDmg: 3 + Math.floor(wave / 2) + storageLevel,
      enemyHpBonus: Math.floor(storageLevel * 1.5),
      diffMult,
      spawnRate: Math.max(12, 40 - wave * 2 - storageLevel * 2),
      totalWaves,
      currentWave: 0,
      waveEnemiesLeft: 0,
      wavePause: false,
      wavePauseTimer: 0,
    };

    // Place turrets from owned upgrades
    const baseEdge = 44;
    ownedUpgrades.forEach((u, i) => {
      const ui = UPGRADES.indexOf(u);
      const tx = baseEdge + 8 + (i % 3) * 16;
      const ty = this.gy - 2 - Math.floor(i / 3) * 18;
      const turret = new Turret(this, tx, ty, u.color, ui >= 0 ? ui : i);
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
        hpPct: (gs.hp / gs.maxHp) * 100,
        timePct: Math.max(0, (gs.t / gs.dur) * 100),
        kills: gs.kills,
      },
    }));
  }

  _updateTick(dt, gs) {
    gs.t -= dt;

    // Wave pause between waves
    if (gs.wavePause) {
      gs.wavePauseTimer -= dt * 1000;
      if (gs.wavePauseTimer <= 0) {
        gs.wavePause = false;
        gs.currentWave++;
        gs.waveEnemiesLeft = 2 + gs.currentWave + Math.floor(gs.diffMult);
      }
      return;
    }

    // Start new wave if no enemies left
    if (gs.waveEnemiesLeft <= 0 && this.enemies.length === 0
        && gs.currentWave < gs.totalWaves && !gs.wavePause) {
      gs.wavePause = true;
      gs.wavePauseTimer = 600;
      return;
    }

    // Spawn enemies
    gs.spawnT -= dt * 60;
    if (gs.spawnT <= 0 && gs.waveEnemiesLeft > 0) {
      this._spawnEnemy(gs);
      gs.waveEnemiesLeft--;
      gs.spawnT = gs.spawnRate + Math.random() * 15;
    }

    // Update enemies
    this.enemies = this.enemies.filter(e => e.active && !e.isDead);
    this.enemies.forEach(e => {
      e.update(this.time.now, dt * 1000);

      if (e.x <= 44 && !e.isDead) {
        gs.hp -= e.dmg;
        this._burst(44, e.y, 8);
        Audio8.bossHit();
        this.cameras.main.shake(200, 0.012);
        e.die();
        if (gs.hp <= 0) { gs.hp = 0; this._endChallenge(false); }
      }
    });
    this.enemies = this.enemies.filter(e => e.active && !e.isDead);

    // Update turrets
    this.turrets.forEach(turret => {
      if (turret.active && turret.update(this.time.now, dt * 1000, this.enemies)) {
        this._fireProjectile(turret);
      }
    });

    // Update projectiles
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

    // Update particles
    this.parts.forEach(p => { p.x += p.dx; p.y += p.dy; p.dy += 0.18; p.life--; });
    this.parts = this.parts.filter(p => p.life > 0);

    // Check win
    if (gs.t <= 0 && !gs.over) {
      gs.t = 0;
      this._endChallenge(true);
    }
  }

  _draw(gs) {
    const { bgGraphics: bg, fxGraphics: fx, cw, ch, gy } = this;
    bg.clear();
    fx.clear();

    // Sky gradient
    bg.fillGradientStyle(0x170f2e, 0x170f2e, 0x0a0818, 0x0a0818, 1);
    bg.fillRect(-10, -10, cw + 20, ch + 20);

    // Stars
    bg.fillStyle(0xffffff, 0.18);
    for (let i = 0; i < 40; i++) bg.fillRect((i * 53) % cw, (i * 29) % (ch * 0.7), 2, 2);

    // Ground
    bg.fillStyle(0x241a3a, 1);
    bg.fillRect(0, gy + 18, cw, 16);
    bg.fillStyle(0xffffff, 0.06);
    for (let i = 0; i < cw / 26; i++) bg.fillRect(i * 26, gy + 22, 8, 3);

    // Rainbow base wall
    const colors = [0xff2d6f, 0xff8a3d, 0xffe24d, 0x4dff9e];
    bg.fillGradientStyle(colors[0], colors[1], colors[2], colors[3], 1);
    bg.fillRect(0, 18, 38, gy - 18);

    // Wave info
    if (gs.wavePause) {
      bg.fillStyle(0xffffff, Math.min(1, gs.wavePauseTimer / 600));
      const txt = `Wave ${gs.currentWave + 1}/${gs.totalWaves}`;
      bg.fillStyle(0x000000, 0.4);
      bg.fillRect(cw / 2 - 60, ch / 2 - 16, 120, 32);
    }

    // Ground particles
    this.parts.forEach(p => {
      const col = Phaser.Display.Color.HexStringToColor(p.c.replace('#', '')).color;
      fx.fillStyle(col, Math.max(0, p.life / (p.maxLife || 30)));
      fx.fillRect(p.x, p.y, p.s, p.s);
    });
  }

  _spawnEnemy(gs) {
    const roll = Math.random();
    let type = 'basic';
    if (gs.currentWave >= 2 && roll < 0.15) type = 'tough';
    else if (roll < 0.25) type = 'fast';

    const enemy = new Enemy(this, this.cw + 24, this.gy - 16, type, gs.currentWave);
    enemy.hp += gs.enemyHpBonus;
    enemy.maxHp = enemy.hp;
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

    let best = null;
    let bd = 1e9;
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
