import Phaser from 'phaser';
import { UPGRADES, RAINBOW } from '../../data/constants';
import { useGameStore } from '../../store/useGameStore';

const WORK_STATIONS = [
  { x: 0.18, iconFrame: 48 },
  { x: 0.38, iconFrame: 72 },
  { x: 0.58, iconFrame: 96 },
  { x: 0.78, iconFrame: 120 },
];

export class AmbientScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AmbientScene' });
  }

  preload() {
    const sheets = [
      ['icons', 'assets/icons/IconsEssential.png', 16, 16],
      ['soldier-idle', 'assets/characters/Soldier/Soldier-Idle.png', 100, 100],
      ['soldier-walk', 'assets/characters/Soldier/Soldier-Walk.png', 100, 100],
      ['soldier-work', 'assets/characters/Soldier/Soldier-Attack01.png', 100, 100],
      ['orc-walk', 'assets/characters/Orc/Orc-Walk.png', 100, 100],
    ];
    sheets.forEach(([key, path, fw, fh]) => {
      if (!this.textures.exists(key)) {
        this.load.spritesheet(key, path, { frameWidth: fw, frameHeight: fh });
      }
    });
  }

  create() {
    this.w = this.scale.width;
    this.h = this.scale.height;
    this.groundY = this.h - 40;
    this.workers = [];
    this.workTimer = 0;
    this.maxWorkers = 4;

    if (!this.textures.exists('sparkle')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('sparkle', 8, 8);
      g.destroy();
    }

    this._registerAnimations();

    this.bgLayer = this.add.container().setDepth(0);
    this.stationLayer = this.add.container().setDepth(1);
    this.workerLayer = this.add.container().setDepth(3);
    this.fxLayer = this.add.container().setDepth(4);

    this.drawBackground();
    this.createWorkstations();

    window.addEventListener('arena:celebrate', this._onCelebrate);
    this.scale.on('resize', this._onResize, this);
  }

  update(_time, delta) {
    delta = Math.min(delta, 50);
    this.tickWorkers(delta);
    this.tickWorkstations(delta);
  }

  // ── animations ──

  _registerAnimations() {
    if (!this.anims.exists('worker-walk')) {
      this.anims.create({
        key: 'worker-walk',
        frames: this.anims.generateFrameNumbers('soldier-walk', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({
        key: 'worker-idle',
        frames: this.anims.generateFrameNumbers('soldier-idle', { start: 0, end: 5 }),
        frameRate: 5,
        repeat: -1,
      });
      this.anims.create({
        key: 'worker-work',
        frames: this.anims.generateFrameNumbers('soldier-work', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1,
      });
      this.anims.create({
        key: 'ambient-orc-walk',
        frames: this.anims.generateFrameNumbers('orc-walk', { start: 0, end: 7 }),
        frameRate: 6,
        repeat: -1,
      });
    }
  }

  // ── background ──

  drawBackground() {
    this.bgLayer.removeAll(true);
    const g = this.make.graphics({ add: false });
    const gy = this.groundY;

    g.fillGradientStyle(0x15102a, 0x15102a, 0x0d0a1c, 0x0d0a1c, 1);
    g.fillRect(0, 0, this.w, gy);

    const skyColor = Phaser.Display.Color.IntegerToColor(0x15102a);
    for (let i = 0; i < 6; i++) {
      const bx = this.w * 0.12 + i * this.w * 0.14;
      const bw = this.w * 0.10;
      const bh = gy * (0.3 + Math.random() * 0.3);
      const by = gy - bh;
      g.fillStyle(0x1e1840, 0.3);
      g.fillRect(bx, by, bw, bh);

      for (let wy = by + 12; wy < gy - 8; wy += 18) {
        g.fillStyle(0xffdd88, 0.08 + Math.random() * 0.07);
        g.fillRect(bx + 8, wy, bw - 16, 8);
      }
    }

    g.fillStyle(0x1e1838, 1);
    g.fillRect(0, gy, this.w, this.h - gy);
    g.fillStyle(0x2a1f42, 1);
    g.fillRect(0, gy, this.w, 3);

    for (let i = 0; i < 12; i++) {
      const lx = (i * 31 + 7) % this.w;
      g.fillStyle(0x362750, 0.5);
      g.fillRect(lx, gy + 8, 3, 6);
    }

    g.fillStyle(0x1a1428, 0.6);
    g.fillRect(0, gy - 2, this.w, 2);

    this.bgLayer.add(g);
  }

  // ── workstations ──

  createWorkstations() {
    this.stationLayer.removeAll(true);
    this.stations = WORK_STATIONS.map(s => {
      const sx = this.w * s.x;
      const sy = this.groundY - 4;
      const icon = this.add.sprite(sx, sy, 'icons', s.iconFrame)
        .setScale(1.4).setTint(0x88ddff).setAlpha(0.7);
      this.stationLayer.add(icon);

      const glow = this.add.circle(sx, sy, 14, 0x88ddff, 0.08).setDepth(1.5);
      this.stationLayer.add(glow);

      return {
        x: sx,
        y: sy,
        icon,
        glow,
        worker: null,
        tween: this.tweens.add({
          targets: glow,
          alpha: 0.03,
          duration: 1200 + Math.random() * 800,
          yoyo: true,
          repeat: -1,
        }),
      };
    });
  }

  tickWorkstations(delta) {
    const gs = useGameStore.getState();
    const ownedCount = UPGRADES.filter(u => gs.owned[u.id]).length;
    this.stations.forEach((st, i) => {
      const active = i < ownedCount;
      st.icon.setAlpha(active ? 0.85 : 0.15);
      st.glow.setAlpha(active ? 0.1 : 0.02);
    });
  }

  // ── workers (citizens) ──

  spawnWorker() {
    const gs = useGameStore.getState();
    const ownedCount = UPGRADES.filter(u => gs.owned[u.id]).length;
    if (ownedCount === 0) return;
    if (this.workers.length >= this.maxWorkers) return;

    const stationIdx = Math.floor(Math.random() * Math.min(ownedCount, WORK_STATIONS.length));
    const station = this.stations[stationIdx];
    if (station.worker) return;

    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -30 : this.w + 30;
    const endX = fromLeft ? this.w + 30 : -30;
    const sprite = this.add.sprite(startX, this.groundY - 2, 'soldier-walk', 0)
      .setScale(0.35).setDepth(3).setFlipX(!fromLeft);

    this.workerLayer.add(sprite);

    const walkSpeed = 25 + Math.random() * 15;
    const workTime = 3000 + Math.random() * 4000;

    const worker = {
      sprite,
      station,
      phase: 'walkIn',
      fromLeft,
      walkSpeed,
      workTime,
      workElapsed: 0,
      flipX: fromLeft,
    };
    station.worker = worker;
    this.workers.push(worker);

    sprite.play('worker-walk');
    this._tweenWalk(worker, station.x, () => {
      worker.phase = 'working';
      sprite.play('worker-work');
      this._emitWorkParticles(station.x, station.y - 10);
      this.time.delayedCall(workTime, () => {
        if (!sprite.active) return;
        worker.phase = 'walkOut';
        sprite.play('worker-walk').setFlipX(fromLeft);
        this._tweenWalk(worker, endX, () => {
          sprite.destroy();
          station.worker = null;
          this.workers = this.workers.filter(w => w !== worker);
        });
      });
    });
  }

  _tweenWalk(worker, targetX, onComplete) {
    const sprite = worker.sprite;
    const dist = Math.abs(targetX - sprite.x);
    const duration = (dist / worker.walkSpeed) * 1000;

    if (targetX > sprite.x) sprite.setFlipX(false);
    else sprite.setFlipX(true);

    this.tweens.add({
      targets: sprite,
      x: targetX,
      duration,
      ease: 'Linear',
      onComplete,
    });
  }

  _emitWorkParticles(x, y) {
    this.time.addEvent({
      delay: 400,
      repeat: 6,
      callback: () => {
        if (!this.scene.isActive()) return;
        this.add.particles(x + (Math.random() - 0.5) * 8, y, 'sparkle', {
          speed: { min: 5, max: 15 },
          scale: { start: 0.3, end: 0 },
          alpha: { start: 0.8, end: 0 },
          lifespan: 600,
          quantity: 1,
          tint: [0x88ddff, 0xaaffaa, 0xffdd88],
          emitting: false,
        }).explode(1);
      },
    });
  }

  tickWorkers(delta) {
    this.workTimer -= delta;
    if (this.workTimer <= 0) {
      this.workTimer = 2000 + Math.random() * 3000;
      this.spawnWorker();
    }

    this.workers.forEach(w => {
      if (w.phase === 'working' && w.sprite.active) {
        w.sprite.y = this.groundY - 2 + Math.sin(this.time.now * 0.004) * 1.5;
      }
    });
  }

  // ── celebration ──

  _burst(x, y) {
    for (let k = 0; k < 8; k++) {
      this.add.particles(x, y, 'sparkle', {
        speed: { min: 15, max: 50 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 600,
        quantity: 1,
        tint: RAINBOW[Math.floor(Math.random() * 7)],
        emitting: false,
      }).explode(1);
    }
  }

  _onCelebrate = () => {
    this.workers.forEach(w => {
      if (w.sprite.active) {
        this._burst(w.sprite.x, w.sprite.y);
      }
    });
  };

  // ── resize ──

  _onResize = (gameSize) => {
    this.w = gameSize.width;
    this.h = gameSize.height;
    this.groundY = this.h - 40;
    this.drawBackground();
    this.createWorkstations();
  };
}
