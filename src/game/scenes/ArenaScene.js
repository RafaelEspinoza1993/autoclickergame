import Phaser from 'phaser';
import { UPGRADES, RAINBOW, ENEMY_EMOJI } from '../../data/constants';
import { Audio8 } from '../../audio/Audio8';
import { useGameStore } from '../../store/useGameStore';

let _nextEnemyId = 0;

export class ArenaScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ArenaScene' });
  }

  init() {
    this.gameState = null;
    this.enemyTexts = new Map(); // id → Phaser.Text
    this.bgGraphics = null;
    this.fxGraphics = null;
    this.baseTxt = null;
    this.turretTexts = [];
    this._over = false;
  }

  create() {
    const { width: cw, height: ch } = this.scale;
    this.cw = cw;
    this.ch = ch;
    this.gy = ch - 34;

    this.bgGraphics = this.add.graphics();
    this.fxGraphics = this.add.graphics();

    // Static base tower emoji
    this.baseTxt = this.add.text(22, this.gy - 6, '🏭', {
      fontSize: Math.floor(ch * 0.1) + 'px',
    }).setOrigin(0.5, 1).setDepth(2);

    // Init game state from store
    const store = useGameStore.getState();
    const owned = UPGRADES.filter(u => (store.owned[u.id] || 0) >= 1);
    const wave = store.challengeWave;
    const dur = Math.min(26, 16 + wave);

    this.gameState = {
      wave, t: dur, dur,
      hp: 100, maxHp: 100, kills: 0,
      enemies: [], shots: [], parts: [],
      turrets: owned.map((u, i) => ({
        emoji: u.emoji, color: u.color,
        cd: 30 + i * 5, rate: 28 + i * 3,
      })),
      spawnT: 30, over: false,
      clickDmg: 2 + Math.floor(wave / 3),
    };

    this._createTurretTexts();

    this.input.on('pointerdown', this._onPointer, this);
  }

  _createTurretTexts() {
    this.turretTexts.forEach(t => t.destroy());
    const baseEdge = 44;
    this.turretTexts = this.gameState.turrets.map((tr, i) => {
      const x = baseEdge + 8 + (i % 3) * 16;
      const y = this.gy - Math.floor(i / 3) * 18;
      return this.add.text(x, y, tr.emoji, {
        fontSize: '16px',
      }).setOrigin(0.5, 1).setDepth(3);
    });
  }

  update(_, delta) {
    if (this._over) return;
    const dt = Math.min(50, delta) / 1000;
    const g = this.gameState;

    if (!g.over) this._update(dt, g);
    this._draw(g);

    // Push live stats to React HUD via custom event
    window.dispatchEvent(new CustomEvent('arena:tick', {
      detail: {
        hpPct: g.hp / g.maxHp * 100,
        timePct: Math.max(0, g.t / g.dur * 100),
        kills: g.kills,
      },
    }));
  }

  _onPointer(pointer) {
    const g = this.gameState;
    if (!g || g.over) return;
    let best = null, bd = 1e9;
    g.enemies.forEach(e => {
      const dx = e.x - pointer.x, dy = e.y - pointer.y;
      const dist = dx * dx + dy * dy;
      const reach = (e.r + 12) * (e.r + 12);
      if (dist < reach && dist < bd) { bd = dist; best = e; }
    });
    if (best) this._damageEnemy(best, g.clickDmg, true);
    else Audio8.click();
  }

  _spawnEnemy() {
    const { cw, gy, gameState: g } = this;
    const roll = Math.random();
    let type = 'basic';
    if (g.wave >= 3 && roll < 0.18) type = 'tough';
    else if (roll < 0.30) type = 'fast';

    const e = { id: _nextEnemyId++, type, x: cw + 24, r: 16, hit: 0, dead: false };
    if (type === 'fast')       { e.hp = 1;                          e.speed = 70 + g.wave * 6;  e.dmg = 7;  e.r = 13; }
    else if (type === 'tough') { e.hp = 4 + Math.floor(g.wave / 2); e.speed = 28 + g.wave * 2;  e.dmg = 16; e.r = 19; }
    else                       { e.hp = 2;                          e.speed = 42 + g.wave * 4;  e.dmg = 9;  e.r = 16; }
    e.maxHp = e.hp;
    e.y = gy - e.r;

    // Create Phaser text for emoji
    const txt = this.add.text(e.x, e.y, ENEMY_EMOJI[type] || '👾', {
      fontSize: Math.floor(e.r * 1.5) + 'px',
    }).setOrigin(0.5).setDepth(4);
    this.enemyTexts.set(e.id, txt);
    g.enemies.push(e);
  }

  _damageEnemy(e, dmg, byClick) {
    e.hp -= dmg; e.hit = 6;
    if (byClick) Audio8.hit();
    if (e.hp <= 0 && !e.dead) {
      e.dead = true;
      this.gameState.kills++;
      this._burst(e.x, e.y, e.type === 'tough' ? 20 : 10);
      Audio8.hit();
      const txt = this.enemyTexts.get(e.id);
      if (txt) { txt.destroy(); this.enemyTexts.delete(e.id); }
    }
  }

  _burst(x, y, n) {
    for (let i = 0; i < n; i++) {
      this.gameState.parts.push({
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

  _update(dt, g) {
    g.t -= dt;

    // Spawn enemies
    g.spawnT -= dt * 60;
    if (g.spawnT <= 0) {
      this._spawnEnemy();
      g.spawnT = Math.max(22, 60 - g.wave * 4) + Math.random() * 20;
    }

    const baseEdge = 44;

    // Move enemies
    const dead = [];
    g.enemies.forEach(e => {
      e.x -= e.speed * dt;
      if (e.hit > 0) e.hit--;
      if (e.x <= baseEdge && !e.dead) {
        e.dead = true;
        g.hp -= e.dmg;
        this._burst(baseEdge, e.y, 8);
        Audio8.bossHit();
        this.cameras.main.shake(200, 0.012);
        if (g.hp <= 0) { g.hp = 0; this._endChallenge(false); }
        dead.push(e);
      }
    });
    // Clean up dead enemy texts for enemies that reached the base
    dead.forEach(e => {
      const txt = this.enemyTexts.get(e.id);
      if (txt) { txt.destroy(); this.enemyTexts.delete(e.id); }
    });
    g.enemies = g.enemies.filter(e => !e.dead);

    // Update enemy text positions
    g.enemies.forEach(e => {
      const txt = this.enemyTexts.get(e.id);
      if (txt) {
        txt.setPosition(e.x, e.y);
        txt.setAlpha(e.hit > 0 ? 0.4 : 1);
      }
    });

    // Turrets auto-fire
    g.turrets.forEach((tr, i) => {
      tr.cd -= dt * 60;
      if (tr.cd <= 0) {
        tr.cd = tr.rate;
        g.shots.push({ x: 34, y: this.gy - 10 - i * 4, color: tr.color, dmg: 2, dead: false });
      }
    });

    // Move shots & check collisions
    g.shots.forEach(sh => {
      sh.x += 360 * dt;
      g.enemies.forEach(e => {
        if (!e.dead && !sh.dead && Math.abs(sh.x - e.x) < e.r && Math.abs(sh.y - e.y) < e.r) {
          sh.dead = true; this._damageEnemy(e, sh.dmg, false);
        }
      });
    });
    g.shots = g.shots.filter(sh => !sh.dead && sh.x < this.cw + 20);

    // Particles
    g.parts.forEach(p => { p.x += p.dx; p.y += p.dy; p.dy += 0.18; p.life--; });
    g.parts = g.parts.filter(p => p.life > 0);

    if (g.t <= 0 && !g.over) { g.t = 0; this._endChallenge(true); }
  }

  _draw(g) {
    const { bgGraphics: bg, fxGraphics: fx, cw, ch, gy } = this;
    bg.clear(); fx.clear();

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

    // Base tower (gradient bar)
    const baseEdge = 44;
    const colors = [0xff2d6f, 0xff8a3d, 0xffe24d, 0x4dff9e];
    bg.fillGradientStyle(colors[0], colors[1], colors[2], colors[3], 1);
    bg.fillRect(0, 18, baseEdge - 6, gy - 18);

    // Shots
    g.shots.forEach(sh => {
      fx.fillStyle(0xffffff, 1);
      fx.fillRect(sh.x, sh.y, 8, 3);
      const col = Phaser.Display.Color.HexStringToColor(sh.color.replace('#', '')).color;
      fx.fillStyle(col, 1);
      fx.fillRect(sh.x - 1, sh.y - 1, 10, 5);
    });

    // Enemy HP bars
    g.enemies.forEach(e => {
      if (e.maxHp > 1) {
        const bw = e.r * 2;
        fx.fillStyle(0x000000, 0.5);
        fx.fillRect(e.x - bw / 2, e.y - e.r - 8, bw, 4);
        const barColor = e.type === 'tough' ? 0xff5ed6 : 0xffe24d;
        fx.fillStyle(barColor, 1);
        fx.fillRect(e.x - bw / 2, e.y - e.r - 8, bw * (e.hp / e.maxHp), 4);
      }
    });

    // Particles
    g.parts.forEach(p => {
      const col = Phaser.Display.Color.HexStringToColor(p.c.replace('#', '')).color;
      fx.fillStyle(col, Math.max(0, p.life / (p.maxLife || 30)));
      fx.fillRect(p.x, p.y, p.s, p.s);
    });
  }

  _endChallenge(survived) {
    if (this._over || this.gameState.over) return;
    this.gameState.over = true;
    this._over = true;
    useGameStore.getState().endChallenge(survived);
  }

  // Clean up enemy text objects when scene stops
  shutdown() {
    this.enemyTexts.forEach(txt => txt.destroy());
    this.enemyTexts.clear();
    this.turretTexts.forEach(t => t.destroy());
    this.turretTexts = [];
  }
}
