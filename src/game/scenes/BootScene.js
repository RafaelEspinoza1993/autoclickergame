import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const { width, height } = this.scale;

    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 10);
    const progressBar = this.add.graphics();

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xff5ed6, 1);
      progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 8);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });

    this.load.spritesheet('soldier-idle',
      'assets/characters/Soldier/Soldier-Idle.png',
      { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('soldier-walk',
      'assets/characters/Soldier/Soldier-Walk.png',
      { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('soldier-attack01',
      'assets/characters/Soldier/Soldier-Attack01.png',
      { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('soldier-attack02',
      'assets/characters/Soldier/Soldier-Attack02.png',
      { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('soldier-attack03',
      'assets/characters/Soldier/Soldier-Attack03.png',
      { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('soldier-death',
      'assets/characters/Soldier/Soldier-Death.png',
      { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('soldier-hurt',
      'assets/characters/Soldier/Soldier-Hurt.png',
      { frameWidth: 100, frameHeight: 100 });

    this.load.spritesheet('orc-idle',
      'assets/characters/Orc/Orc-Idle.png',
      { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('orc-walk',
      'assets/characters/Orc/Orc-Walk.png',
      { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('orc-attack01',
      'assets/characters/Orc/Orc-Attack01.png',
      { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('orc-death',
      'assets/characters/Orc/Orc-Death.png',
      { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('orc-hurt',
      'assets/characters/Orc/Orc-Hurt.png',
      { frameWidth: 100, frameHeight: 100 });

    this.load.atlas('explosion',
      'assets/explosions/explosion-animation.png',
      'assets/explosions/explosion-animation.json');

    this.load.spritesheet('icons',
      'assets/icons/IconsEssential.png',
      { frameWidth: 16, frameHeight: 16 });

    this.load.spritesheet('buffs',
      'assets/buffs/spritesheet.png',
      { frameWidth: 16, frameHeight: 16 });

    this._generateSparkleTexture();
  }

  _generateSparkleTexture() {
    const canvas = this.textures.createCanvas('sparkle', 8, 8);
    const ctx = canvas.getContext();
    const gradient = ctx.createRadialGradient(4, 4, 0, 4, 4, 4);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 215, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 8, 8);
    canvas.refresh();
  }

  create() {
    this.scene.launch('BackgroundScene');
    this.scene.start('CoreScene');
  }
}
