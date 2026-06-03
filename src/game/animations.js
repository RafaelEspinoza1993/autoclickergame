import Phaser from 'phaser';

export function createAnimations(scene) {
  if (scene.anims.exists('soldier-idle')) return;

  scene.anims.create({
    key: 'soldier-idle',
    frames: scene.anims.generateFrameNumbers('soldier-idle', { start: 0, end: 5 }),
    frameRate: 8, repeat: -1
  });
  scene.anims.create({
    key: 'soldier-walk',
    frames: scene.anims.generateFrameNumbers('soldier-walk', { start: 0, end: 7 }),
    frameRate: 10, repeat: -1
  });
  scene.anims.create({
    key: 'soldier-attack01',
    frames: scene.anims.generateFrameNumbers('soldier-attack01', { start: 0, end: 5 }),
    frameRate: 12, repeat: 0
  });
  scene.anims.create({
    key: 'soldier-attack02',
    frames: scene.anims.generateFrameNumbers('soldier-attack02', { start: 0, end: 5 }),
    frameRate: 12, repeat: 0
  });
  scene.anims.create({
    key: 'soldier-attack03',
    frames: scene.anims.generateFrameNumbers('soldier-attack03', { start: 0, end: 8 }),
    frameRate: 14, repeat: 0
  });
  scene.anims.create({
    key: 'soldier-death',
    frames: scene.anims.generateFrameNumbers('soldier-death', { start: 0, end: 3 }),
    frameRate: 8, repeat: 0
  });
  scene.anims.create({
    key: 'soldier-hurt',
    frames: scene.anims.generateFrameNumbers('soldier-hurt', { start: 0, end: 3 }),
    frameRate: 10, repeat: 0
  });

  scene.anims.create({
    key: 'orc-idle',
    frames: scene.anims.generateFrameNumbers('orc-idle', { start: 0, end: 5 }),
    frameRate: 8, repeat: -1
  });
  scene.anims.create({
    key: 'orc-walk',
    frames: scene.anims.generateFrameNumbers('orc-walk', { start: 0, end: 7 }),
    frameRate: 10, repeat: -1
  });
  scene.anims.create({
    key: 'orc-attack01',
    frames: scene.anims.generateFrameNumbers('orc-attack01', { start: 0, end: 5 }),
    frameRate: 12, repeat: 0
  });
  scene.anims.create({
    key: 'orc-death',
    frames: scene.anims.generateFrameNumbers('orc-death', { start: 0, end: 3 }),
    frameRate: 8, repeat: 0
  });
  scene.anims.create({
    key: 'orc-hurt',
    frames: scene.anims.generateFrameNumbers('orc-hurt', { start: 0, end: 3 }),
    frameRate: 10, repeat: 0
  });

  scene.anims.create({
    key: 'explode',
    frames: scene.anims.generateFrameNames('explosion', {
      prefix: 'frame', start: 0, end: 8
    }),
    frameRate: 14, repeat: 0
  });
}
