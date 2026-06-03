import Phaser from 'phaser';

export class VFXManager {
  constructor(scene) {
    this.scene = scene;
  }

  play(x, y, textureKey, config = {}) {
    const {
      lifespan = 600,
      scale = { start: 0.6, end: 0 },
      alpha = { start: 1, end: 0 },
      speed = 0,
      quantity = 1,
      tint = null,
      follow = null,
      angle = null,
    } = config;

    const emitter = this.scene.add.particles(x, y, textureKey, {
      speed,
      scale,
      alpha,
      lifespan,
      quantity,
      tint,
      angle,
      emitting: false,
      follow,
    });

    emitter.explode(quantity);

    this.scene.time.delayedCall(lifespan + 100, () => {
      if (emitter && emitter.active) emitter.destroy();
    });

    return emitter;
  }

  explosion(x, y) {
    if (this.scene.textures.exists('explosion')) {
      const boom = this.scene.add.sprite(x, y, 'explosion')
        .setScale(0.8)
        .setAlpha(0.9)
        .setDepth(6);
      if (this.scene.anims.exists('explode')) {
        boom.play('explode');
      }
      boom.once('animationcomplete', () => boom.destroy());
    }

    this.play(x, y, 'sparkle', {
      lifespan: 400,
      scale: { start: 0.5, end: 0 },
      speed: { min: 80, max: 200 },
      quantity: 12,
      tint: [0xff0000, 0xff8800, 0xffdd00, 0xffffff],
    });
  }

  clickSparkle(x, y) {
    this.play(x, y, 'sparkle', {
      lifespan: 500,
      scale: { start: 0.4, end: 0 },
      speed: { min: 100, max: 250 },
      quantity: 6,
      tint: [0xffd700, 0xff69b4, 0x87ceeb, 0xffffff],
    });
  }

  magicBurst(x, y) {
    this.play(x, y, 'sparkle', {
      lifespan: 800,
      scale: { start: 0.8, end: 0 },
      speed: { min: 50, max: 150 },
      quantity: 20,
      tint: [0xff5ed6, 0xffa500, 0x4dff9e, 0x3dd6ff],
    });
  }

  levelUp(x, y) {
    const ring = this.scene.add.circle(x, y, 10, 0xffd700, 0.8)
      .setStrokeStyle(3, 0xffffff)
      .setDepth(6);
    this.scene.tweens.add({
      targets: ring,
      radius: 80,
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });

    this.play(x, y, 'sparkle', {
      lifespan: 1000,
      scale: { start: 0.6, end: 0 },
      speed: { min: 30, max: 80 },
      quantity: 15,
      tint: [0xffd700, 0xffa500, 0xffffff],
    });
  }

  splatter(x, y) {
    this.play(x, y, 'sparkle', {
      lifespan: 300,
      scale: { start: 0.3, end: 0 },
      speed: { min: 40, max: 100 },
      quantity: 5,
      tint: [0xff4444, 0xff8888],
    });
  }

  turretShot(x, y) {
    this.play(x, y, 'sparkle', {
      lifespan: 150,
      scale: { start: 0.2, end: 0 },
      speed: 0,
      quantity: 1,
      tint: [0xffff00, 0xffffff],
    });
  }

  smoke(x, y) {
    this.play(x, y, 'sparkle', {
      lifespan: 1200,
      scale: { start: 0.4, end: 1 },
      alpha: { start: 0.5, end: 0 },
      speed: { min: 10, max: 30 },
      quantity: 8,
      tint: 0x888888,
    });
  }

  lightning(x, y) {
    this.play(x, y, 'sparkle', {
      lifespan: 200,
      scale: { start: 0.8, end: 0.2 },
      speed: { min: 200, max: 400 },
      quantity: 20,
      tint: [0x88aaff, 0xffffff, 0xaaaaff],
    });
  }

  confetti(x, y, count = 30) {
    this.play(x, y, 'sparkle', {
      lifespan: 2000,
      scale: { start: 0.5, end: 0 },
      speed: { min: 50, max: 200 },
      quantity: count,
      tint: [
        0xff2d6f, 0xff8a3d, 0xffe24d,
        0x4dff9e, 0x3dd6ff, 0x9a6bff, 0xff5ed6,
      ],
    });
  }
}
