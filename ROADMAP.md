# Roadmap de Desarrollo: Arcoiris Inc. — React + Phaser 3 + Assets

> Documento maestro con toda la planificacion tecnica, integracion de assets y fases de desarrollo
> para la migracion del clicker vanilla JS a React + Phaser 3.

---

## Tabla de Contenidos

1. [Stack Tecnologico](#1-stack-tecnologico)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Inventario de Assets y Compatibilidad](#3-inventario-de-assets-y-compatibilidad)
4. [Fase 0: Scaffolding](#4-fase-0-scaffolding)
5. [Fase 1: Core Clicker en Phaser](#5-fase-1-core-clicker-en-phaser)
6. [Fase 2: Carga de Assets (BootScene)](#6-fase-2-carga-de-assets-bootscene)
7. [Fase 3: Tiny RPG Characters — Enemigos con Sprites](#7-fase-3-tiny-rpg-characters--enemigos-con-sprites)
8. [Fase 4: Super Pixel Effects — Sistema VFX](#8-fase-4-super-pixel-effects--sistema-vfx)
9. [Fase 5: Ambient Scene + Torretas](#9-fase-5-ambient-scene--torretas)
10. [Fase 6: Polish y Juice](#10-fase-6-polish-y-juice)
11. [Fase 7: Deploy en GitHub Pages](#11-fase-7-deploy-en-github-pages)
12. [Estimaciones de Tamano](#12-estimaciones-de-tamano)
13. [Guia de Preparacion de Assets](#13-guia-de-preparacion-de-assets)
14. [Codigos de Ejemplo por Clase](#14-codigos-de-ejemplo-por-clase)

---

## 1. Stack Tecnologico

| Capa | Tecnologia | Version | Uso |
|---|---|---|---|
| Bundler | Vite | 5.x | Compilacion rapida, HMR |
| Framework UI | React | 18.x | Tienda, barras, contadores, modales |
| Motor 2D | Phaser 3 | 3.80+ | Renderizado de juego, fisica, sprites, animaciones |
| Estado global | Zustand | 4.x | Store compartido entre React y Phaser |
| Grandes numeros | break_infinity.js | 1.x | Chispas e ingresos exponenciales |
| Deploy | GitHub Pages | - | Hosting estatico gratuito |

### Dependencias de npm

```bash
npm create vite@latest arcoiris-inc -- --template react
npm install phaser zustand break_infinity.js
npm install -D @types/react   # opcional, para TypeScript
```

---

## 2. Estructura del Proyecto

```
arcoiris-inc/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD para GitHub Pages
├── public/
│   └── assets/
│       ├── characters/             # Tiny RPG Character Pack
│       │   ├── Soldier/
│       │   │   ├── Soldier-Idle.png        (600x100, 6 frames)
│       │   │   ├── Soldier-Walk.png        (800x100, 8 frames)
│       │   │   ├── Soldier-Attack01.png    (600x100, 6 frames)
│       │   │   ├── Soldier-Attack02.png    (600x100, 6 frames)
│       │   │   ├── Soldier-Attack03.png    (900x100, 9 frames)
│       │   │   ├── Soldier-Death.png       (400x100, 4 frames)
│       │   │   ├── Soldier-Hurt.png        (400x100, 4 frames)
│       │   │   └── Soldier.png             (900x700, atlas preview)
│       │   └── Orc/
│       │       ├── Orc-Idle.png            (600x100, 6 frames)
│       │       ├── Orc-Walk.png            (800x100, 8 frames)
│       │       ├── Orc-Attack01.png        (600x100, 6 frames)
│       │       ├── Orc-Death.png           (400x100, 4 frames)
│       │       ├── Orc-Hurt.png            (400x100, 4 frames)
│       │       └── Orc.png                 (800x600, atlas preview)
│       ├── fx/                            # Super Pixel Effects (seleccionados)
│       │   ├── explosion/
│       │   ├── round_sparkle_burst/
│       │   ├── magic_burst/
│       │   ├── directional_splatter/
│       │   ├── symbol_level_up_text/
│       │   ├── symbol_combo_text/
│       │   ├── symbol_success_text/
│       │   ├── symbol_failure_text/
│       │   ├── symmetrical_smoke_burst/
│       │   ├── scifi_muzzle_flash/
│       │   └── lightning/
│       ├── explosions/                    # Legacy Collection (Ground Explosion)
│       │   ├── explosion-animation.png
│       │   └── explosion-animation.json
│       ├── icons/                         # Icons_Essential
│       │   ├── IconsEssential.png         (336x272, grid 21x17 de 16x16)
│       │   └── Icons/                     # PNGs individuales
│       └── buffs/                         # VerArc Skills & Buffs
│           ├── spritesheet.png            (128x96, grid 8x6 de 16x16)
│           ├── Buffs/
│           ├── Debuffs/
│           └── Spells/
├── src/
│   ├── components/
│   │   ├── TopBar.jsx
│   │   ├── Shop.jsx
│   │   ├── CounterDisplay.jsx
│   │   ├── StorageBar.jsx
│   │   ├── ChallengeModal.jsx
│   │   ├── WinScreen.jsx
│   │   ├── Announcer.jsx
│   │   ├── NextChallengeBar.jsx
│   │   └── YouTubePlayer.jsx
│   ├── game/
│   │   ├── scenes/
│   │   │   ├── BootScene.js
│   │   │   ├── BackgroundScene.js
│   │   │   ├── CoreScene.js
│   │   │   ├── AmbientScene.js
│   │   │   └── ArenaScene.js
│   │   ├── entities/
│   │   │   ├── Enemy.js
│   │   │   ├── Turret.js
│   │   │   └── Projectile.js
│   │   ├── fx/
│   │   │   ├── VFXManager.js
│   │   │   └── parseSpritesheetTxt.js
│   │   ├── PhaserGame.jsx
│   │   └── animations.js
│   ├── store/
│   │   └── useGameStore.js
│   ├── data/
│   │   ├── upgrades.js
│   │   └── i18n.js
│   ├── audio/
│   │   └── AudioEngine.js
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── ROADMAP.md                          # Este documento
```

---

## 3. Inventario de Assets y Compatibilidad

### 3.1 Assets que SI vamos a usar

| Asset | Tamano | Licencia | Phaser Ease | Uso principal |
|---|---|---|---|---|
| **Tiny RPG Character Pack** | 238 KB | Free (verificar) | Facil — grid uniforme 100x100 | Enemigos del arena (Soldier + Orc) |
| **Super Pixel Effects Gigapack** | ~2 MB (seleccionados) | Comercial OK + atribucion | Facil-Medio — spritesheet.txt parser | Explosiones, sparks, level up, combo, muzzle flash |
| **Legacy Collection (Ground Explosion)** | ~120 KB | OK con atribucion | Trivial — JSON atlas listo | Explosiones grandes |
| **Icons_Essential** | 36 KB | CC BY 4.0 | Facil — grid uniforme 16x16 | Iconos de UI y torretas en ambient scene |
| **[VerArc] Skills & Buffs** | 8 KB | Verificar | Facil — grid uniforme 16x16 | Buff icons para ambient scene |

### 3.2 Assets que NO usamos

| Asset | Razon |
|---|---|
| Legacy Collection (completo, 37 MB) | Demasiado pesado, estilos variados. Solo tomamos Ground Explosion |
| Modern_Interiors_Free | Licencia solo no-comercial. No aplica al genero |
| Pixelart Study Expression Sheets | Hojas de expresion facial. No aplica a un clicker |
| Eris Esra Character Template | Sin JSON atlas, frames no uniformes en Jump. Podria usarse en futuro si se necesitan mas personajes |
| Coupon codes.txt | Codigo de descuento, no asset |

### 3.3 Estructura de cada spritesheet

#### Tiny RPG Character Pack (100x100 frames)

```
Soldier-Idle.png     600x100  → 6 frames  → frameWidth: 100, frameHeight: 100
Soldier-Walk.png     800x100  → 8 frames  → frameWidth: 100, frameHeight: 100
Soldier-Attack01.png 600x100  → 6 frames  → frameWidth: 100, frameHeight: 100
Soldier-Attack02.png 600x100  → 6 frames  → frameWidth: 100, frameHeight: 100
Soldier-Attack03.png 900x100  → 9 frames  → frameWidth: 100, frameHeight: 100
Soldier-Death.png    400x100  → 4 frames  → frameWidth: 100, frameHeight: 100
Soldier-Hurt.png     400x100  → 4 frames  → frameWidth: 100, frameHeight: 100

Orc-Idle.png         600x100  → 6 frames  → frameWidth: 100, frameHeight: 100
Orc-Walk.png         800x100  → 8 frames  → frameWidth: 100, frameHeight: 100
Orc-Attack01.png     600x100  → 6 frames  → frameWidth: 100, frameHeight: 100
Orc-Death.png        400x100  → 4 frames  → frameWidth: 100, frameHeight: 100
Orc-Hurt.png         400x100  → 4 frames  → frameWidth: 100, frameHeight: 100
```

Todos los PNGs son **franjas horizontales uniformes** — se parsean directamente con `addSpriteSheet()`.

#### Legacy Collection Ground Explosion (JSON atlas)

```
explosion-animation.png  1008x128  → 9 frames
explosion-animation.json → Aseprite JSON export (Phaser-compatible)

Formato JSON:
{
  "frames": [
    {
      "filename": "frame0",
      "frame": { "x": 0, "y": 0, "w": 112, "h": 128 },
      "duration": 70
    },
    ...
  ]
}

Carga directa: this.load.atlas('explosion', '...png', '...json')
```

#### Super Pixel Effects (spritesheet.txt)

```
Formato del archivo spritesheet.txt:
  PNG/path/frame0000.png = 0 0 64 64
  PNG/path/frame0001.png = 64 0 64 64
  PNG/path/frame0002.png = 128 0 64 64
  ...

Cada linea: archivo_origen = x y width height

Hay dos formatos encontrados:
  1. Franja unica (single row): todos los frames en una fila
  2. Grid multi-fila: frames distribuidos en varias filas con frame uniforme
```

#### Icons_Essential (grid uniforme 16x16)

```
IconsEssential.png  336x272  → 336/16 = 21 columnas, 272/16 = 17 filas
Total: 357 posiciones de frame (no todas ocupadas)

Carga: this.load.spritesheet('icons', 'IconsEssential.png', {
  frameWidth: 16, frameHeight: 16
})
```

#### VerArc Skills & Buffs (grid uniforme 16x16)

```
spritesheet.png  128x96  → 128/16 = 8 columnas, 96/16 = 6 filas
Total: 48 frames (16 spells + 16 debuffs + 16 buffs)

Carga: this.load.spritesheet('buffs', 'spritesheet.png', {
  frameWidth: 16, frameHeight: 16
})
```

---

## 4. Fase 0: Scaffolding del Proyecto

**Duracion estimada:** 1 dia
**Objetivo:** Tener Vite + React + Phaser corriendo con el juego basico funcionando

### 4.1 Pasos de instalacion

```bash
# 1. Crear proyecto Vite con React
npm create vite@latest arcoiris-inc -- --template react
cd arcoiris-inc

# 2. Instalar dependencias
npm install phaser zustand break_infinity.js

# 3. Limpiar boilerplate
rm -f src/App.css src/assets/react.svg
```

### 4.2 Configurar `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/arcoiris-inc/',  // Nombre exacto del repo en GitHub
});
```

### 4.3 Crear `useGameStore.js` — Estado Global

Migrar el `State` de `core.js` (lineas 7-11) a Zustand con break_infinity.js:

```javascript
// src/store/useGameStore.js
import { create } from 'zustand';
import Decimal from 'break_infinity.js';

const UPGRADES_DATA = [];   // importar de data/upgrades.js
const CLICK_UPGRADES = [];  // importar de data/upgrades.js
const STORAGE_UPGRADES = []; // importar de data/upgrades.js
const BASE_STORAGE = 500;

export const useGameStore = create((set, get) => ({
  // ── Estado ──
  chispas: new Decimal(0),
  totalChispas: new Decimal(0),
  totalClicks: 0,
  clicksToChallenge: 500,
  challengeWave: 0,
  owned: {},           // { upgradeId: number } stacking levels
  clickLevel: 0,
  storageLevel: 0,
  won: false,

  // ── Getters computados ──
  rate: () => {
    const { owned } = get();
    return UPGRADES_DATA.reduce((s, u) =>
      s + (owned[u.id] || 0) * u.rate, 0);
  },

  clickPower: () => {
    const { clickLevel } = get();
    return 1 + CLICK_UPGRADES.slice(0, clickLevel)
      .reduce((s, u) => s + u.power, 0);
  },

  upgradeCost: (upgrade) => {
    const { owned } = get();
    return Math.floor(upgrade.cost * Math.pow(1.15, owned[upgrade.id] || 0));
  },

  maxStorage: () => {
    const { storageLevel } = get();
    return storageLevel === 0
      ? BASE_STORAGE
      : STORAGE_UPGRADES[storageLevel - 1].cap;
  },

  // ── Acciones ──
  producirChispas: (cantidad) => set((state) => {
    const max = get().maxStorage();
    const nuevaCantidad = state.chispas.add(cantidad);
    return {
      chispas: Decimal.min(nuevaCantidad, max),
      totalChispas: state.totalChispas.add(cantidad),
    };
  }),

  gastarChispas: (costo) => set((state) => ({
    chispas: state.chispas.sub(costo),
  })),

  comprarMejora: (upgradeId) => {
    const { chispas, owned } = get();
    const upgrade = UPGRADES_DATA.find(u => u.id === upgradeId);
    if (!upgrade) return false;
    const cost = get().upgradeCost(upgrade);
    if (chispas.lessThan(cost)) return false;

    set({
      chispas: chispas.sub(cost),
      owned: { ...owned, [upgradeId]: (owned[upgradeId] || 0) + 1 },
    });
    return true;
  },

  incrementarClicks: () => set((state) => ({
    totalClicks: state.totalClicks + 1,
    clicksToChallenge: state.clicksToChallenge - 1,
  })),

  resetChallengeCountdown: () => set((state) => ({
    clicksToChallenge: 500,
    challengeWave: state.challengeWave + 1,
  })),

  setWon: () => set({ won: true }),
}));
```

### 4.4 Crear `PhaserGame.jsx` — Puente React-Phaser

```jsx
// src/game/PhaserGame.jsx
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { BackgroundScene } from './scenes/BackgroundScene';
import { CoreScene } from './scenes/CoreScene';
import { AmbientScene } from './scenes/AmbientScene';
import { ArenaScene } from './scenes/ArenaScene';

export const PhaserGame = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 400,
      height: 400,
      parent: 'phaser-container',
      transparent: true,
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
      },
      scene: [BootScene, BackgroundScene, CoreScene, AmbientScene, ArenaScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        pixelArt: true,  // Importante para pixel art assets
        antialias: false,
      }
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="phaser-container" className="phaser-window" />;
};
```

### 4.5 Crear `App.jsx` — Layout base

```jsx
// src/App.jsx
import { PhaserGame } from './game/PhaserGame';
import { TopBar } from './components/TopBar';
import { Shop } from './components/Shop';
import { CounterDisplay } from './components/CounterDisplay';
import { StorageBar } from './components/StorageBar';
import { ChallengeModal } from './components/ChallengeModal';
import { WinScreen } from './components/WinScreen';
import { Announcer } from './components/Announcer';

export default function App() {
  return (
    <div className="app">
      <TopBar />
      <main className="main-layout">
        <div className="game-area">
          <CounterDisplay />
          <PhaserGame />
          <StorageBar />
        </div>
        <Shop />
      </main>
      <ChallengeModal />
      <WinScreen />
      <Announcer />
    </div>
  );
}
```

### 4.6 Verificar

```bash
npm run dev
# Deberia ver: canvas Phaser vacio + tienda React basica
```

---

## 5. Fase 1: Core Clicker en Phaser

**Duracion estimada:** 2-3 dias
**Objetivo:** El nucleo clickable con particulas y feedback visual

### 5.1 CoreScene.js — Nucleo clickable

```javascript
// src/game/scenes/CoreScene.js
import Phaser from 'phaser';
import { useGameStore } from '../../store/useGameStore';

export class CoreScene extends Phaser.Scene {
  constructor() {
    super('CoreScene');
  }

  create() {
    const { width, height } = this.scale;

    // Nucleo rainbow como texto (emoji por ahora, sprite en futuro)
    this.rainbow = this.add.text(width / 2, height / 2, '\u{1F308}', {
      fontSize: '120px'
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Animacion de respiracion (idle)
    this.tweens.add({
      targets: this.rainbow,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Emisor de particulas de chispas
    this.sparkleEmitter = this.add.particles(0, 0, 'sparkle', {
      speed: { min: -200, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      lifespan: 800,
      gravityY: 400,
      emitting: false
    });

    // Evento de clic
    this.rainbow.on('pointerdown', (pointer) => {
      const store = useGameStore.getState();

      // Feedback visual: squash & stretch
      this.tweens.add({
        targets: this.rainbow,
        scaleX: 0.8,
        scaleY: 0.8,
        duration: 50,
        yoyo: true,
        ease: 'Quad.easeOut'
      });

      // Emitir particulas en la posicion del cursor
      this.sparkleEmitter.emitParticleAt(pointer.x, pointer.y, 8);

      // Mutar estado global
      const clickPower = store.clickPower();
      store.producirChispas(clickPower);
      store.incrementarClicks();

      // Verificar si toca abrir challenge
      if (store.clicksToChallenge <= 0) {
        store.resetChallengeCountdown();
        this.scene.launch('ArenaScene', { wave: store.challengeWave });
        this.scene.pause();
      }
    });
  }
}
```

### 5.2 BackgroundScene.js — Particulas de fondo

```javascript
// src/game/scenes/BackgroundScene.js
import Phaser from 'phaser';

export class BackgroundScene extends Phaser.Scene {
  constructor() {
    super('BackgroundScene');
  }

  create() {
    // Estrellas flotantes con particulas
    this.add.particles(0, 0, 'sparkle', {
      x: { min: 0, max: 800 },
      y: { min: 0, max: 600 },
      speed: { min: 5, max: 20 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: { min: 3000, max: 6000 },
      frequency: 200,
      quantity: 1,
      tint: [0xffffff, 0xffd700, 0xff69b4, 0x87ceeb],
    });
  }
}
```

### 5.3 Store actions para el click

```javascript
// Agregar a useGameStore.js
incrementarClicks: () => set((state) => {
  const nuevosClicks = state.clicksToChallenge - 1;
  return {
    totalClicks: state.totalClicks + 1,
    clicksToChallenge: nuevosClicks,
    // Si llega a 0, el CoreScene detecta y lanza ArenaScene
  };
}),
```

### 5.4 Componentes React que se migran directo

Los siguientes componentes son基本mente DOM puro y se migran casi identico a React:

- `CounterDisplay.jsx` — Lee `chispas`, `rate()`, `clickPower()` del store
- `StorageBar.jsx` — Barra de progreso con estados warn/full
- `Shop.jsx` — Grid de cards con 3 secciones
- `TopBar.jsx` — Brand, lang toggle, mute
- `NextChallengeBar.jsx` — Barra de progreso de 500 clicks

---

## 6. Fase 2: Carga de Assets (BootScene)

**Duracion estimada:** 1 dia
**Objetivo:** Cargar TODOS los assets en Phaser de forma centralizada

### 6.1 Preparar assets en disco

Crear la estructura de carpetas en `public/assets/` y copiar los archivos:

```bash
# Crear estructura
mkdir -p public/assets/{characters,fx,explosions,icons,buffs}

# Copiar Tiny RPG Character Pack
cp "../assetsIdeas/Tiny RPG Character Asset Pack v1.03b -Free Soldier&Orc/Characters(100x100)/Soldier/Soldier/"*.png public/assets/characters/Soldier/
cp "../assetsIdeas/Tiny RPG Character Asset Pack v1.03b -Free Soldier&Orc/Characters(100x100)/Orc/Orc/"*.png public/assets/characters/Orc/

# Copiar Legacy Collection explosion (solo el JSON atlas)
cp "../assetsIdeas/Legacy Collection/Legacy Collection/Assets/Explosions and Magic/Ground Explosion/spritesheet/"* public/assets/explosions/

# Copiar Icons_Essential spritesheet
cp "../assetsIdeas/Icons_Essential/Icons_Essential/v1.2/Spritesheet/IconsEssential.png" public/assets/icons/
cp -r "../assetsIdeas/Icons_Essential/Icons_Essential/v1.2/Icons/" public/assets/icons/individual/

# Copiar VerArc Skills & Buffs
cp "../assetsIdeas/[VerArc Stash] Basic_Skills_and_Buffs/spritesheet.png" public/assets/buffs/
cp -r "../assetsIdeas/[VerArc Stash] Basic_Skills_and_Buffs/Buffs/" public/assets/buffs/
cp -r "../assetsIdeas/[VerArc Stash] Basic_Skills_and_Buffs/Debuffs/" public/assets/buffs/
cp -r "../assetsIdeas/[VerArc Stash] Basic_Skills_and_Buffs/Spells/" public/assets/buffs/
```

Para Super Pixel Effects, copiar solo los efectos seleccionados:

```bash
# Efectos seleccionados del Gigapack
FX_SELECTED=(
  "explosion"
  "round_sparkle_burst_003"
  "magic_burst_round_sparkle_001"
  "directional_splatter_003"
  "symbol_level_up_text_001"
  "symbol_combo_text_001"
  "symbol_success_text_001"
  "symbol_failure_text_001"
  "symmetrical_smoke_burst_001"
  "scifi_muzzle_flash_001"
  "lightning_001"
)

for fx in "${FX_SELECTED[@]}"; do
  # Copiar PNG individual + spritesheet
  cp "../assetsIdeas/Super Pixel Effects Gigapack (Free Version) v2.3.0/PNG/small/${fx}/"* public/assets/fx/${fx}/ 2>/dev/null
  mkdir -p public/assets/fx/${fx}/spritesheet
  cp "../assetsIdeas/Super Pixel Effects Gigapack (Free Version) v2.3.0/spritesheet/small/${fx}/spritesheet."* public/assets/fx/${fx}/spritesheet/ 2>/dev/null
done
```

### 6.2 BootScene.js — Carga centralizada

```javascript
// src/game/scenes/BootScene.js
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // ── Loading bar ──
    const { width, height } = this.scale;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 10);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xff5ed6, 1);
      progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 8);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });

    // ══════════════════════════════════════════════════════════
    // TINY RPG CHARACTER PACK (enemigos)
    // ══════════════════════════════════════════════════════════
    // Todos son franjas horizontales uniformes de 100x100
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

    // ══════════════════════════════════════════════════════════
    // LEGACY COLLECTION — Ground Explosion (JSON atlas)
    // ══════════════════════════════════════════════════════════
    this.load.atlas('explosion',
      'assets/explosions/explosion-animation.png',
      'assets/explosions/explosion-animation.json');

    // ══════════════════════════════════════════════════════════
    // ICONS ESSENTIAL (grid uniforme 16x16)
    // ══════════════════════════════════════════════════════════
    this.load.spritesheet('icons',
      'assets/icons/IconsEssential.png',
      { frameWidth: 16, frameHeight: 16 });

    // ══════════════════════════════════════════════════════════
    // VERARC SKILLS & BUFFS (grid uniforme 16x16)
    // ══════════════════════════════════════════════════════════
    this.load.spritesheet('buffs',
      'assets/buffs/spritesheet.png',
      { frameWidth: 16, frameHeight: 16 });

    // ══════════════════════════════════════════════════════════
    // SUPER PIXEL EFFECTS (carga de imagenes individuales)
    // Cada efecto se carga como imagen individual
    // El parser de spritesheet.txt se usa para crear atlas en runtime
    // ══════════════════════════════════════════════════════════
    this._loadFX('fx-explosion',       'assets/fx/explosion/small/');
    this._loadFX('fx-sparkle',         'assets/fx/round_sparkle_burst_003/small/');
    this._loadFX('fx-magic-burst',     'assets/fx/magic_burst_round_sparkle_001/small/');
    this._loadFX('fx-splatter',        'assets/fx/directional_splatter_003/small/');
    this._loadFX('fx-levelup',         'assets/fx/symbol_level_up_text_001/small/');
    this._loadFX('fx-combo',           'assets/fx/symbol_combo_text_001/small/');
    this._loadFX('fx-success',         'assets/fx/symbol_success_text_001/small/');
    this._loadFX('fx-failure',         'assets/fx/symbol_failure_text_001/small/');
    this._loadFX('fx-smoke',           'assets/fx/symmetrical_smoke_burst_001/small/');
    this._loadFX('fx-muzzle',          'assets/fx/scifi_muzzle_flash_001/small/');
    this._loadFX('fx-lightning',       'assets/fx/lightning_001/small/');

    // ══════════════════════════════════════════════════════════
    // ASSETS GENERICOS (particulas, etc)
    // ══════════════════════════════════════════════════════════
    // Sparkle basico para BackgroundScene (generar procedurally)
    this._generateSparkleTexture();
  }

  // Helper: cargar todos los PNGs de una carpeta de efectos
  _loadFX(key, basePath) {
    // Los efectos del Super Pixel Effects tienen frames nombrados
    // frame0000.png, frame0001.png, etc.
    // Cargamos los primeros N frames como imagenes separadas
    const maxFrames = 33; // el efecto mas largo tiene 33 frames
    for (let i = 0; i < maxFrames; i++) {
      const frameKey = `${key}_frame${String(i).padStart(4, '0')}`;
      this.load.image(frameKey, `${basePath}frame${String(i).padStart(4, '0')}.png`);
    }
  }

  // Generar textura de sparkle procedurally
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
    this.scene.start('BackgroundScene');
  }
}
```

### 6.3 Parser de spritesheet.txt (para carga lazy de efectos)

```javascript
// src/game/fx/parseSpritesheetTxt.js

/**
 * Parsea el formato spritesheet.txt del Super Pixel Effects Gigapack
 * y genera un objeto compatible con Phaser Texture Atlas.
 *
 * Formato de entrada:
 *   PNG/path/frame0000.png = 0 0 64 64
 *   PNG/path/frame0001.png = 64 0 64 64
 *
 * Formato de salida:
 *   { frames: { "frame0": { frame: { x, y, width, height } }, ... } }
 */
export function parseSpritesheetTxt(txtContent, imgWidth, imgHeight) {
  const frames = {};
  let i = 0;

  txtContent.split('\n').forEach(line => {
    const match = line.match(/= (\d+) (\d+) (\d+) (\d+)/);
    if (match) {
      frames[`frame${String(i++).padStart(4, '0')}`] = {
        frame: {
          x: parseInt(match[1], 10),
          y: parseInt(match[2], 10),
          width: parseInt(match[3], 10),
          height: parseInt(match[4], 10)
        },
        rotated: false,
        trimmed: false,
        spriteSourceSize: {
          x: 0, y: 0,
          width: parseInt(match[3], 10),
          height: parseInt(match[4], 10)
        },
        sourceSize: {
          width: parseInt(match[3], 10),
          height: parseInt(match[4], 10)
        }
      };
    }
  });

  return {
    frames,
    meta: {
      image: '',  // se asigna dinamicamente
      size: { w: imgWidth, h: imgHeight },
      scale: 1
    }
  };
}

/**
 * Carga un efecto del Super Pixel Effects en Phaser
 * usando spritesheet.txt + spritesheet.png
 */
export function loadFXAtlas(scene, key, pngPath, txtPath) {
  return new Promise((resolve) => {
    // Primero cargar el TXT via fetch
    fetch(txtPath)
      .then(res => res.text())
      .then(txtContent => {
        // Obtener dimensiones de la imagen
        const texture = scene.textures.get(`${key}_source`);
        let imgWidth = 512, imgHeight = 512; // fallback

        if (texture && texture.source[0]) {
          imgWidth = texture.source[0].width;
          imgHeight = texture.source[0].height;
        }

        const atlasData = parseSpritesheetTxt(txtContent, imgWidth, imgHeight);
        atlasData.meta.image = pngPath;

        // Cargar la imagen y crear el atlas
        scene.load.image(`${key}_atlas`, pngPath);
        scene.load.on('filecomplete', (loadedKey) => {
          if (loadedKey === `${key}_atlas`) {
            scene.textures.addAtlas(
              key,
              scene.textures.get(`${key}_atlas`).getSourceImage(),
              atlasData
            );
            resolve(atlasData);
          }
        });
        scene.load.start();
      })
      .catch(() => resolve(null));
  });
}
```

---

## 7. Fase 3: Tiny RPG Characters — Enemigos con Sprites

**Duracion estimada:** 3-4 dias
**Objetivo:** Reemplazar emojis de enemigos por sprites animados del Soldier/Orc

### 7.1 Mapeo de enemigos actual → sprite

| Emoji actual | Tipo de enemigo | Sprite assignado | HP | Velocidad | Danio |
|---|---|---|---|---|---|
| `👾` | basic | `orc-walk` | 2 | 42 + wave*4 | 9 |
| `👻` | fast | `soldier-walk` | 1 | 70 + wave*6 | 7 |
| `🤖` | tough | `orc-walk` (+ shadows) | 4 + floor(wave/2) | 28 + wave*2 | 16 |
| `😈` | boss | `soldier-attack03` | 10 + wave*3 | 20 + wave*2 | 25 |

### 7.2 Registro de animaciones

```javascript
// src/game/animations.js
export function createAnimations(scene) {
  // ── SOLDIER ──
  scene.anims.create({
    key: 'soldier-idle',
    frames: scene.anims.generateFrameNumbers('soldier-idle', { start: 0, end: 5 }),
    frameRate: 8,
    repeat: -1
  });
  scene.anims.create({
    key: 'soldier-walk',
    frames: scene.anims.generateFrameNumbers('soldier-walk', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });
  scene.anims.create({
    key: 'soldier-attack01',
    frames: scene.anims.generateFrameNumbers('soldier-attack01', { start: 0, end: 5 }),
    frameRate: 12,
    repeat: 0
  });
  scene.anims.create({
    key: 'soldier-attack02',
    frames: scene.anims.generateFrameNumbers('soldier-attack02', { start: 0, end: 5 }),
    frameRate: 12,
    repeat: 0
  });
  scene.anims.create({
    key: 'soldier-attack03',
    frames: scene.anims.generateFrameNumbers('soldier-attack03', { start: 0, end: 8 }),
    frameRate: 14,
    repeat: 0
  });
  scene.anims.create({
    key: 'soldier-death',
    frames: scene.anims.generateFrameNumbers('soldier-death', { start: 0, end: 3 }),
    frameRate: 8,
    repeat: 0
  });
  scene.anims.create({
    key: 'soldier-hurt',
    frames: scene.anims.generateFrameNumbers('soldier-hurt', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0
  });

  // ── ORC ──
  scene.anims.create({
    key: 'orc-idle',
    frames: scene.anims.generateFrameNumbers('orc-idle', { start: 0, end: 5 }),
    frameRate: 8,
    repeat: -1
  });
  scene.anims.create({
    key: 'orc-walk',
    frames: scene.anims.generateFrameNumbers('orc-walk', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });
  scene.anims.create({
    key: 'orc-attack01',
    frames: scene.anims.generateFrameNumbers('orc-attack01', { start: 0, end: 5 }),
    frameRate: 12,
    repeat: 0
  });
  scene.anims.create({
    key: 'orc-death',
    frames: scene.anims.generateFrameNumbers('orc-death', { start: 0, end: 3 }),
    frameRate: 8,
    repeat: 0
  });
  scene.anims.create({
    key: 'orc-hurt',
    frames: scene.anims.generateFrameNumbers('orc-hurt', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0
  });

  // ── EXPLOSION (Legacy Collection) ──
  scene.anims.create({
    key: 'explode',
    frames: scene.anims.generateFrameNames('explosion', {
      prefix: 'frame', start: 0, end: 8
    }),
    frameRate: 14,
    repeat: 0
  });
}
```

### 7.3 Clase Enemy.js

```javascript
// src/game/entities/Enemy.js
import Phaser from 'phaser';

// Configuracion por tipo de enemigo
const ENEMY_CONFIG = {
  basic: {
    spriteKey: 'orc-walk',
    walkAnim: 'orc-walk',
    deathAnim: 'orc-death',
    hurtAnim: 'orc-hurt',
    scale: 0.5,
    hp: 2,
    speed: 0,       // calculado con wave
    dmg: 9,
    radius: 16,
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
    tint: 0xaaaaff,  // ligeramente azulado para distinguir
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
    tint: 0xff8888,  // ligeramente rojizo para distinguir
  },
  boss: {
    spriteKey: 'soldier-attack03',
    walkAnim: 'soldier-walk',
    attackAnim: 'soldier-attack03',
    deathAnim: 'soldier-death',
    hurtAnim: 'soldier-hurt',
    scale: 0.8,
    hp: 10,
    speed: 0,
    dmg: 25,
    radius: 24,
    tint: 0xff44ff,  // morado para boss
  },
};

export class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, type, wave) {
    const config = ENEMY_CONFIG[type] || ENEMY_CONFIG.basic;
    super(scene, x, y, config.spriteKey);

    this.scene = scene;
    this.type = type;
    this.config = config;

    // Stats escalados con wave
    this.hp = this._scaleHP(config.hp, type, wave);
    this.maxHp = this.hp;
    this.speed = this._scaleSpeed(config.speed, type, wave);
    this.dmg = config.dmg + Math.floor(wave / 3);
    this.radius = config.radius;
    this.isDead = false;
    this.hitFlash = 0;

    // Configurar sprite
    scene.add.existing(this);
    this.setScale(config.scale);
    if (config.tint) this.setTint(config.tint);

    // Barra de HP (solo para tough y boss)
    if (type === 'tough' || type === 'boss') {
      this.hpBarBg = scene.add.graphics();
      this.hpBarFill = scene.add.graphics();
      this._drawHPBar();
    }

    // Iniciar animacion walk
    this.play(config.walkAnim);
  }

  _scaleHP(base, type, wave) {
    if (type === 'tough') return base + Math.floor(wave / 2);
    if (type === 'boss') return base + wave * 3;
    return base;
  }

  _scaleSpeed(base, type, wave) {
    if (type === 'basic') return 42 + wave * 4;
    if (type === 'fast') return 70 + wave * 6;
    if (type === 'tough') return 28 + wave * 2;
    if (type === 'boss') return 20 + wave * 2;
    return base;
  }

  update(time, delta) {
    if (this.isDead) return;

    // Movimiento hacia la izquierda
    this.x -= this.speed * (delta / 1000);

    // Actualizar barra de HP
    if (this.hpBarBg) this._drawHPBar();

    // Reducir hit flash
    if (this.hitFlash > 0) {
      this.hitFlash -= delta;
      if (this.hitFlash <= 0) this.clearTint();
    }
  }

  takeDamage(dmg) {
    if (this.isDead) return false;

    this.hp -= dmg;
    this.hitFlash = 100;
    this.setTintFill(0xffffff);  // flash blanco

    // Play hurt animation
    if (this.config.hurtAnim) {
      this.play(this.config.hurtAnim);
      this.once('animationcomplete', () => {
        if (!this.isDead) this.play(this.config.walkAnim);
      });
    }

    // Actualizar barra HP
    if (this.hpBarBg) this._drawHPBar();

    if (this.hp <= 0) {
      this.die();
      return true;  // murio
    }
    return false;
  }

  die() {
    this.isDead = true;

    // Explosion FX
    if (this.scene.vfx) {
      this.scene.vfx.explosion(this.x, this.y);
    }

    // Animacion de muerte
    if (this.config.deathAnim) {
      this.play(this.config.deathAnim);
      this.once('animationcomplete', () => {
        this._destroyHPBar();
        this.destroy();
      });
    } else {
      this._destroyHPBar();
      this.destroy();
    }

    // Fade out
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
    const color = this.type === 'tough' ? 0xff5ed6 : 0xffe24d;
    this.hpBarFill.fillStyle(color, 1);
    this.hpBarFill.fillRect(bx, by, bw * pct, bh);
  }

  _destroyHPBar() {
    if (this.hpBarBg) this.hpBarBg.destroy();
    if (this.hpBarFill) this.hpBarFill.destroy();
  }

  destroy(fromScene) {
    this._destroyHPBar();
    super.destroy(fromScene);
  }
}
```

### 7.4 Clase Turret.js

```javascript
// src/game/entities/Turret.js
import Phaser from 'phaser';

export class Turret extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, upgradeData, index) {
    super(scene, x, y, 'icons');  // Usar iconos como base
    this.scene = scene;

    this.upgrade = upgradeData;
    this.color = Phaser.Display.Color.HexStringToColor(upgradeData.color).color;
    this.rate = 28 + index * 3;  // ms entre disparos
    this.cooldown = 30 + index * 5;
    this.damage = 2;

    scene.add.existing(this);
    this.setScale(1.5);
    this.setTint(this.color);
  }

  update(time, delta, enemies, shootCallback) {
    this.cooldown -= delta;
    if (this.cooldown <= 0 && enemies.length > 0) {
      this.cooldown = this.rate;
      shootCallback(this);
    }
  }

  getFirePoint() {
    return { x: this.x + 15, y: this.y };
  }
}
```

### 7.5 Clase Projectile.js

```javascript
// src/game/entities/Projectile.js
import Phaser from 'phaser';

export class Projectile extends Phaser.GameObjects.Graphics {
  constructor(scene, x, y, color, damage) {
    super(scene);
    this.scene = scene;
    this.color = color;
    this.damage = damage;
    this.speed = 360;
    this.isDead = false;

    scene.add.existing(this);

    // Dibujar proyectil (linea con glow)
    this._draw();
  }

  _draw() {
    this.clear();
    // Glow
    this.lineStyle(5, this.color, 0.3);
    this.lineBetween(-1, -1, 10, -1);
    // Core
    this.lineStyle(3, 0xffffff, 1);
    this.lineBetween(0, 0, 8, 0);
    this.lineStyle(2, this.color, 1);
    this.lineBetween(0, -1, 8, -1);
    this.lineBetween(0, 1, 8, 1);
  }

  update(time, delta) {
    if (this.isDead) return;
    this.x += this.speed * (delta / 1000);

    // Muzzle flash trail (efecto sutil)
    if (Math.random() < 0.3) {
      this.scene.vfx.turretShot(this.x, this.y);
    }

    // Fuera de pantalla
    if (this.x > this.scene.scale.width + 20) {
      this.isDead = true;
      this.destroy();
    }
  }

  hit() {
    this.isDead = true;
    // Impacto FX
    if (this.scene.vfx) {
      this.scene.vfx.splatter(this.x, this.y);
    }
    this.destroy();
  }
}
```

---

## 8. Fase 4: Super Pixel Effects — Sistema VFX

**Duracion estimada:** 2-3 dias
**Objetivo:** Sistema de efectos visuales reutilizable

### 8.1 VFXManager.js

```javascript
// src/game/fx/VFXManager.js
import Phaser from 'phaser';

export class VFXManager {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Reproduce un efecto de particulas en la posicion dada
   * @param {number} x
   * @param {number} y
   * @param {string} textureKey - Key de la textura en Phaser
   * @param {object} config - Configuracion del emitter
   */
  play(x, y, textureKey, config = {}) {
    const {
      lifespan = 600,
      scale = { start: 0.6, end: 0 },
      alpha = { start: 1, end: 0 },
      speed = 0,
      quantity = 1,
      tint = null,
      follow = null,
    } = config;

    const emitter = this.scene.add.particles(x, y, textureKey, {
      speed,
      scale,
      alpha,
      lifespan,
      quantity,
      tint,
      emitting: false,
      follow,
    });

    emitter.explode(quantity);

    // Auto-destruir despues de la animacion
    this.scene.time.delayedCall(lifespan + 100, () => {
      if (emitter && emitter.active) emitter.destroy();
    });

    return emitter;
  }

  // ══════════════════════════════════════════════════════════
  // EFECTOS PREDEFINIDOS
  // ══════════════════════════════════════════════════════════

  /** Explosion cuando un enemigo muere */
  explosion(x, y) {
    // Primero: explosion del Legacy Collection (atlas animado)
    const boom = this.scene.add.sprite(x, y, 'explosion')
      .setScale(0.8)
      .setAlpha(0.9);
    boom.play('explode');
    boom.once('animationcomplete', () => boom.destroy());

    // Segundo: particulas de debris
    this.play(x, y, 'sparkle', {
      lifespan: 400,
      scale: { start: 0.5, end: 0 },
      speed: { min: 80, max: 200 },
      quantity: 12,
      tint: [0xff0000, 0xff8800, 0xffdd00, 0xffffff],
    });
  }

  /** Chispas al clickear el nucleo */
  clickSparkle(x, y) {
    this.play(x, y, 'sparkle', {
      lifespan: 500,
      scale: { start: 0.4, end: 0 },
      speed: { min: 100, max: 250 },
      quantity: 6,
      tint: [0xffd700, 0xff69b4, 0x87ceeb, 0xffffff],
    });
  }

  /** Burst de magia al comprar mejora */
  magicBurst(x, y) {
    this.play(x, y, 'sparkle', {
      lifespan: 800,
      scale: { start: 0.8, end: 0 },
      speed: { min: 50, max: 150 },
      quantity: 20,
      tint: [0xff5ed6, 0xffa500, 0x4dff9e, 0x3dd6ff],
    });
  }

  /** Flash de nivel arriba */
  levelUp(x, y) {
    // Ring expanding
    const ring = this.scene.add.circle(x, y, 10, 0xffd700, 0.8)
      .setStrokeStyle(3, 0xffffff);
    this.scene.tweens.add({
      targets: ring,
      radius: 80,
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });

    // Particulas ascendentes
    this.play(x, y, 'sparkle', {
      lifespan: 1000,
      scale: { start: 0.6, end: 0 },
      speed: { min: 30, max: 80 },
      quantity: 15,
      tint: [0xffd700, 0xffa500, 0xffffff],
    });
  }

  /** Splash de danio cuando proyectil impacta */
  splatter(x, y) {
    this.play(x, y, 'sparkle', {
      lifespan: 300,
      scale: { start: 0.3, end: 0 },
      speed: { min: 40, max: 100 },
      quantity: 5,
      tint: [0xff4444, 0xff8888],
    });
  }

  /** Muzzle flash de torreta */
  turretShot(x, y) {
    this.play(x, y, 'sparkle', {
      lifespan: 150,
      scale: { start: 0.2, end: 0 },
      speed: 0,
      quantity: 1,
      tint: [0xffff00, 0xffffff],
    });
  }

  /** Humo cuando almacen esta lleno */
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

  /** Rayo para boss intro */
  lightning(x, y) {
    this.play(x, y, 'sparkle', {
      lifespan: 200,
      scale: { start: 0.8, end: 0.2 },
      speed: { min: 200, max: 400 },
      quantity: 20,
      tint: [0x88aaff, 0xffffff, 0xaaaaff],
    });
  }

  /** Confetti para victoria */
  confetti(x, y, count = 30) {
    this.play(x, y, 'sparkle', {
      lifespan: 2000,
      scale: { start: 0.5, end: 0 },
      speed: { min: 50, max: 200 },
      quantity: count,
      tint: [
        0xff2d6f, 0xff8a3d, 0xffe24d,
        0x4dff9e, 0x3dd6ff, 0x9a6bff, 0xff5ed6
      ],
    });
  }

  /** Celebracion de ambient scene */
  ambientCelebrate(x, y) {
    this.play(x, y, 'sparkle', {
      lifespan: 800,
      scale: { start: 0.4, end: 0 },
      speed: { min: 60, max: 160 },
      quantity: 22,
      tint: [
        0xff2d6f, 0xff8a3d, 0xffe24d,
        0x4dff9e, 0x3dd6ff, 0x9a6bff, 0xff5ed6
      ],
    });
  }
}
```

### 8.2 Donde se usa cada efecto

| Efecto VFX | Donde se llama | Reemplaza |
|---|---|---|
| `clickSparkle()` | CoreScene pointerdown | `launchConfetti(4)` |
| `magicBurst()` | useGameStore.comprarMejora() | `launchConfetti(50)` |
| `explosion()` | Enemy.die() | `burst(x, y, n)` manual |
| `levelUp()` | Al subir de nivel | `launchConfetti(90)` + `flash()` |
| `turretShot()` | Turret.update() cada disparo | Dibujar rectangulo manual |
| `splatter()` | Projectile.hit() | Nada (efecto nuevo) |
| `confetti()` | winGame() | `launchConfetti(280)` + `launchConfetti(140)` |
| `ambientCelebrate()` | AmbientScene en compra | `Arena.celebrate()` con rectangulos |
| `smoke()` | StorageBar >= 100% | `Audio8.storageWarn()` (solo audio antes) |
| `lightning()` | Boss aparece (futuro) | Nada (efecto nuevo) |

---

## 9. Fase 5: Ambient Scene + Torretas

**Duracion estimada:** 3-4 dias
**Objetivo:** Escena decorativa del rincon con sprites de mejoras

### 9.1 Migracion de Canvas 2D a Phaser

| Elemento actual (Canvas 2D) | Equivalente Phaser |
|---|---|
| Gradiente de cielo `createLinearGradient` | `this.add.graphics().fillGradientStyle()` |
| Estrellas `fillRect` en bucle | Phaser particles con textura de punto |
| Suelo `fillRect` | Graphics con `fillStyle` + `fillRect` |
| Mejoras como `fillText(emoji)` | Sprite de `Icons_Essential` o `VerArc Buffs` |
| Enemigos `fillText('👾')` | Sprite de `orc-walk` a escala pequena |
| Disparos `fillRect` | Graphics con lineas de color |
| Particulas `fillRect` con alpha | Phaser particles con fade |
| Scroll de fondo | Tween de posicion en grupo de estrellas |

### 9.2 AmbientScene.js

```javascript
// src/game/scenes/AmbientScene.js
import Phaser from 'phaser';
import { useGameStore } from '../../store/useGameStore';

export class AmbientScene extends Phaser.Scene {
  constructor() {
    super('AmbientScene');
  }

  create() {
    const w = 200, h = 120;
    this.scale.resize(w, h);

    // Cielo con gradiente
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x1a1230, 0x1a1230, 0x0a0818, 0x0a0818);
    sky.fillRect(0, 0, w, h);

    // Estrellas (18 puntos blancos con alpha bajo)
    this.stars = [];
    for (let i = 0; i < 18; i++) {
      const star = this.add.circle(
        (i * 61) % w,
        (i * 37) % (h * 0.6),
        1,
        0xffffff,
        0.25
      );
      this.stars.push(star);
    }

    // Suelo
    const groundY = h - 22;
    const ground = this.add.graphics();
    ground.fillStyle(0x241a3a, 1);
    ground.fillRect(0, groundY, w, 22);

    // Grupo de torretas (mejoras compradas)
    this.turretGroup = this.add.group();
    this.enemyGroup = this.add.group();
    this.shots = [];

    // Emisor de celebracion
    this.vfx = new (await import('../fx/VFXManager.js')).VFXManager(this);

    // Loop de actualizacion
    this.time.addEvent({
      delay: 16,  // ~60fps
      callback: this._update,
      callbackScope: this,
      loop: true
    });

    // Spawn de enemigos ambient
    this._spawnTimer = 0;
  }

  _update() {
    const owned = useGameStore.getState().owned;
    const groundY = this.scale.height - 22;

    // Actualizar estrellas (scroll lento)
    this.stars.forEach(s => {
      s.x -= 0.4;
      if (s.x < -5) s.x = this.scale.width + 5;
    });

    // Sync torretas con mejoras compradas
    this._syncTurrets(owned, groundY);

    // Spawn enemigos si hay torretas
    if (this.turretGroup.getLength() > 0) {
      this._spawnTimer--;
      if (this._spawnTimer <= 0) {
        this._spawnTimer = 70 + Math.random() * 60;
        this._spawnEnemy(groundY);
      }
    }

    // Actualizar disparos
    this._updateShots();

    // Actualizar enemigos
    this._updateEnemies(groundY);
  }

  _syncTurrets(owned, groundY) {
    const upgradeIds = Object.keys(owned).filter(id => owned[id] > 0);
    // ... sync logica similar a ambientLoop actual
  }

  _spawnEnemy(groundY) {
    // Crear sprite orc pequeno que camina de derecha a izquierda
    const enemy = this.add.sprite(this.scale.width + 10, groundY - 10, 'orc-walk')
      .setScale(0.3);
    enemy.play('orc-walk');
    this.enemyGroup.add(enemy);
  }

  _updateShots() {
    // Logica de disparos similar a ambientLoop actual
  }

  _updateEnemies(groundY) {
    this.enemyGroup.getChildren().forEach(enemy => {
      enemy.x -= 1.1;
      if (enemy.x < -20) {
        enemy.destroy();
      }
    });
  }

  celebrate() {
    const groundY = this.scale.height - 22;
    if (this.vfx) {
      this.vfx.ambientCelebrate(this.scale.width / 2, groundY - 10);
    }
  }
}
```

---

## 10. Fase 6: Polish y Juice

**Duracion estimada:** 3-4 dias
**Objetivo:** Pulir la experiencia con todos los assets integrados

### 10.1 Mejoras visuales con assets existentes

| Mejora | Asset usado | Detalle tecnico |
|---|---|---|
| Screen shake al recibir dano | — | `this.cameras.main.shake(200, 0.01)` |
| Slow-motion al ganar challenge | — | `this.physics.world.timeScale = 2` por 1s |
| Boss intro con rayo | Super Pixel Effects lightning | `vfx.lightning()` antes de spawn boss |
| Challenge countdown "3...2...1..." | Super Pixel Effects symbols | Phaser Text + tween de slam |
| Win screen explosiones | Legacy Collection explosion | Cadena de `boom.play('explode')` |
| Ambient scene parallax | — | 3 capas con velocidades de scroll diferentes |
| Click combo visual | Super Pixel Effects sparkle | Escala de efecto segun combo count |
| Storage full smoke | Super Pixel Effects smoke | `vfx.smoke()` en la barra de almacen |
| Torretas con iconos variados | Icons_Essential | Cada upgrade usa un icono diferente |

### 10.2 Mapeo de iconos para torretas

```javascript
// Cada mejora de fabrica se muestra con un icono de Icons_Essential
const TURRET_ICONS = {
  flag:    { frame: 60, color: '#ff2d6f' },  // Trophy
  wand:    { frame: 42, color: '#ff8a3d' },  // Lightbulb
  uni:     { frame: 52, color: '#ffe24d' },  // Gamepad
  diamond: { frame: 24, color: '#4dff9e' },  // Coin
  disco:   { frame: 7,  color: '#3dd6ff' },  // CD
  crown:   { frame: 35, color: '#9a6bff' },  // Key
  legend:  { frame: 57, color: '#ff5ed6' },  // Star (o buff icon)
};
```

### 10.3 Audio que se mantiene igual

El `AudioEngine.js` se migra casi identico — es Web Audio API procedural sin archivos externos. Solo se adapta la interfaz para que sea un singleton accesible desde Phaser scenes y React hooks.

### 10.4 CSS que se elimina (reemplazado por Phaser)

| CSS eliminado | Reemplazo Phaser |
|---|---|
| `@keyframes fall` (confetti) | VFXManager.confetti() |
| `.float-num` animation | Phaser Text con tween |
| `.flash` animation | `this.cameras.main.flash()` |
| `#bg` canvas inline | BackgroundScene |

### 10.5 CSS que se mantiene (React UI)

| CSS que se conserva | Razon |
|---|---|
| Glassmorphism del shop | `backdrop-filter: blur()` solo funciona en DOM |
| Gradientes arcoiris en texto | CSS custom properties |
| Animaciones hover en cards | CSS transitions |
| Responsive layout | CSS grid |
| `prefers-reduced-motion` | Accesibilidad |

---

## 11. Fase 7: Deploy en GitHub Pages

**Duracion estimada:** 0.5 dias

### 11.1 GitHub Actions workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages
```

### 11.2 Configuracion del repo

1. Subir codigo a GitHub
2. Settings → Pages → Source: "Deploy from a branch"
3. Branch: `gh-pages`, folder: `/ (root)`

### 11.3 Optimizacion de assets

```bash
# Instalar sharp para compresion de PNGs
npm install -D sharp

# Script de optimizacion (build script)
node -e "
const sharp = require('sharp');
const glob = require('glob');
// Comprimir todos los PNGs de public/assets/
// Reducir tamano ~40-60% sin perdida visible
"
```

---

## 12. Estimaciones de Tamano

| Componente | Tamano actual | Tamano con assets |
|---|---|---|
| Codigo fuente | ~50 KB | ~120 KB |
| CSS | ~18 KB | ~15 KB (reducido) |
| Tiny RPG Character Pack | — | ~250 KB |
| Super Pixel Effects (seleccionados) | — | ~1.5 MB |
| Legacy Collection explosion | — | ~120 KB |
| Icons_Essential | — | ~36 KB |
| VerArc Buffs | — | ~8 KB |
| **Total** | **~70 KB** | **~2 MB** |

Para referencia: un juego web promedio pesa 5-20 MB.

---

## 13. Guia de Preparacion de Assets

### 13.1 Extraer Effect and Bullet 16x16.rar

```bash
# Linux
unrar x "../assetsIdeas/Effect and Bullet 16x16.rar" public/assets/fx/bullets/

# Windows (7zip)
7z x "../assetsIdeas/Effect and Bullet 16x16.rar" -opublic/assets/fx/bullets/
```

Despues de extraer, evaluar si los sprites son compatibles (grid uniforme 16x16).

### 13.2 Verificar licencias

| Asset | Accion necesaria |
|---|---|
| Tiny RPG Character Pack | Verificar en itch.io la licencia exacta. Si es "free with attribution", documentar |
| Super Pixel Effects | Atribucion requerida: "(Pack Name) - Will Tice / unTied Games" |
| Icons_Essential | CC BY 4.0 — Atribucion: "Crusenho Agus Hennihuno (crusenho.itch.io)" |
| VerArc Buffs | Verificar en itch.io |

### 13.3 Agregar attribuciones en el juego

```html
<!-- En index.html o en una pagina de credits -->
<section class="credits">
  <h3>Asset Credits</h3>
  <ul>
    <li>Tiny RPG Character Pack - [autor] (itch.io)</li>
    <li>Super Pixel Effects Gigapack - Will Tice / unTied Games</li>
    <li>Icons Essential - Crusenho Agus Hennihuno (CC BY 4.0)</li>
    <li>[VerArc] Basic Skills and Buffs - VerArc (itch.io)</li>
    <li>Legacy Collection Ground Explosion - Warped (itch.io)</li>
  </ul>
</section>
```

---

## 14. Codigos de Ejemplo por Clase

### 14.1 ArenaScene.js (completo)

```javascript
// src/game/scenes/ArenaScene.js
import Phaser from 'phaser';
import { useGameStore } from '../../store/useGameStore';
import { createAnimations } from '../animations';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { VFXManager } from '../fx/VFXManager';

export class ArenaScene extends Phaser.Scene {
  constructor() {
    super('ArenaScene');
  }

  init(data) {
    this.wave = data.wave || 1;
  }

  create() {
    const { width, height } = this.scale;

    // Crear animaciones (solo una vez)
    if (!this.anims.exists('soldier-walk')) {
      createAnimations(this);
    }

    // VFX
    this.vfx = new VFXManager(this);

    // Estado del challenge
    const dur = Math.min(26, 16 + this.wave);
    this.gameState = {
      wave: this.wave,
      timer: dur,
      duration: dur,
      hp: 100,
      maxHp: 100,
      kills: 0,
      enemies: [],
      turrets: [],
      spawnTimer: 30,
      isOver: false,
      clickDmg: 2 + Math.floor(this.wave / 3),
    };

    // Fondo
    this._drawBackground(width, height);

    // Base (factory tower)
    this._drawBase(width, height);

    // Crear torretas de mejoras compradas
    this._createTurrets(height);

    // Input
    this.input.on('pointerdown', (pointer) => this._onPointerDown(pointer));

    // Musica challenge
    // Audio8.startChallengeMusic(); // adaptado
  }

  _drawBackground(w, h) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x170f2e, 0x170f2e, 0x0a0818, 0x0a0818);
    bg.fillRect(0, 0, w, h);

    // Estrellas
    const stars = this.add.graphics();
    stars.fillStyle(0xffffff, 0.18);
    for (let i = 0; i < 40; i++) {
      stars.fillRect((i * 53) % w, (i * 29) % (h * 0.7), 2, 2);
    }

    // Suelo
    const ground = this.add.graphics();
    ground.fillStyle(0x241a3a, 1);
    ground.fillRect(0, h - 34 + 18, w, 16);
    ground.fillStyle(0xffffff, 0.06);
    for (let i = 0; i < w / 26; i++) {
      ground.fillRect(i * 26, h - 34 + 22, 8, 3);
    }
  }

  _drawBase(w, h) {
    const baseEdge = 44;
    const groundY = h - 34;

    const base = this.add.graphics();
    // Gradiente arcoiris para la base
    const colors = [0xff2d6f, 0xff8a3d, 0xffe24d, 0x4dff9e, 0x3dd6ff, 0x9a6bff, 0xff5ed6];
    const step = baseEdge / colors.length;
    colors.forEach((c, i) => {
      base.fillStyle(c, 1);
      base.fillRect(i * step, 18, step + 1, groundY);
    });

    // Icono de fabrica
    this.add.text(baseEdge / 2, groundY - 6, '\u{1F3ED}', {
      fontSize: '22px'
    }).setOrigin(0.5);
  }

  _createTurrets(height) {
    const groundY = height - 34;
    const owned = useGameStore.getState().owned;
    const UPGRADES = []; // importar de data/upgrades.js

    const ownedUpgrades = UPGRADES.filter(u => owned[u.id] > 0);

    ownedUpgrades.forEach((u, i) => {
      const turret = this.add.sprite(
        52 + (i % 3) * 14,
        groundY + 2 - Math.floor(i / 3) * 16,
        'icons'  // Usar sprite de icons_Essential
      ).setScale(1.5);

      // Aplicar color de la mejora
      const color = Phaser.Display.Color.HexStringToColor(u.color);
      turret.setTint(color.color);

      this.gameState.turrets.push({
        sprite: turret,
        color: color.color,
        cooldown: 30 + i * 5,
        rate: 28 + i * 3,
      });
    });
  }

  update(time, delta) {
    if (this.gameState.isOver) return;

    const dt = delta / 1000;
    const gs = this.gameState;

    // Timer
    gs.timer -= dt;
    if (gs.timer <= 0) {
      gs.timer = 0;
      this._endChallenge(true);
      return;
    }

    // Spawn enemigos
    gs.spawnTimer -= dt * 60;
    if (gs.spawnTimer <= 0) {
      this._spawnEnemy();
      gs.spawnTimer = Math.max(22, 60 - gs.wave * 4) + Math.random() * 20;
    }

    // Actualizar enemigos
    gs.enemies.forEach(e => {
      e.update(time, delta);

      // Alcanzaron la base
      if (e.x <= 44 && !e.isDead) {
        gs.hp -= e.dmg;
        e.die();
        this.cameras.main.shake(200, 0.01);
        if (gs.hp <= 0) {
          gs.hp = 0;
          this._endChallenge(false);
        }
      }
    });

    // Torretas disparan
    gs.turrets.forEach(turret => {
      turret.cooldown -= dt * 60;
      if (turret.cooldown <= 0 && gs.enemies.length > 0) {
        turret.cooldown = turret.rate;
        this._fireProjectile(turret);
      }
    });

    // Actualizar proyectiles
    this.children.list
      .filter(c => c instanceof Projectile)
      .forEach(p => {
        p.update(time, delta);
        // Check collision with enemies
        gs.enemies.forEach(e => {
          if (!e.isDead && !p.isDead) {
            const dist = Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y);
            if (dist < e.radius + 10) {
              const killed = e.takeDamage(p.damage);
              p.hit();
              if (killed) {
                gs.kills++;
              }
            }
          }
        });
      });

    // Live HUD (actualizar barras en React via events)
    this.scene.get('CoreScene')?.events.emit('arena-hud', {
      hp: gs.hp / gs.maxHp,
      time: gs.timer / gs.duration,
      kills: gs.kills,
    });
  }

  _spawnEnemy() {
    const roll = Math.random();
    let type = 'basic';
    const w = this.gameState.wave;

    if (w >= 3 && roll < 0.18) type = 'tough';
    else if (roll < 0.30) type = 'fast';

    const groundY = this.scale.height - 34;
    const enemy = new Enemy(
      this,
      this.scale.width + 24,
      groundY - 16,
      type,
      w
    );
    this.gameState.enemies.push(enemy);
  }

  _fireProjectile(turret) {
    const groundY = this.scale.height - 34;
    const projectile = new Projectile(
      this,
      turret.sprite.x + 15,
      turret.sprite.y,
      turret.color,
      2
    );
  }

  _onPointerDown(pointer) {
    if (this.gameState.isOver) return;

    // Encontrar enemigo mas cercano al click
    let bestEnemy = null;
    let bestDist = Infinity;

    this.gameState.enemies.forEach(e => {
      if (e.isDead) return;
      const dist = Phaser.Math.Distance.Between(
        pointer.x, pointer.y, e.x, e.y
      );
      if (dist < e.radius + 10 && dist < bestDist) {
        bestDist = dist;
        bestEnemy = e;
      }
    });

    if (bestEnemy) {
      const killed = bestEnemy.takeDamage(this.gameState.clickDmg);
      if (killed) this.gameState.kills++;
    }
  }

  _endChallenge(survived) {
    this.gameState.isOver = true;

    if (survived) {
      // Victoria
      this.vfx.confetti(this.scale.width / 2, this.scale.height / 2, 40);
      // awardChallenge(200)
    } else {
      // Derrota
      // this.cameras.main.flash(500, 255, 0, 0);
    }

    // Emitir evento para que React muestre el modal de resultado
    this.events.emit('challenge-end', { survived, wave: this.wave });
  }
}
```

---

## Timeline Visual

```
Semana 1     ████░░░░░░░░░░░░  Fase 0: Scaffolding (1 dia)
Semana 1-2   ████████░░░░░░░░  Fase 1: Core Clicker (2-3 dias)
Semana 2     ██████████░░░░░░  Fase 2: Asset Loading (1 dia)
Semana 3     ████████████████  Fase 3: Tiny RPG Characters (3-4 dias)
Semana 3-4   ████████████████  Fase 4: Super Pixel Effects VFX (2-3 dias)
Semana 4-5   ████████████████  Fase 5: Ambient Scene (3-4 dias)
Semana 5-6   ████████████████  Fase 6: Polish (3-4 dias)
Semana 6     ████████████████  Fase 7: Deploy (0.5 dias)

Total estimado: 4-6 semanas a ritmo tranquilo
```

---

> **Nota:** Este documento es el plan maestro. Cada fase se puede ajustar segun prioridades.
> Los assets del Super Pixel Effects se pueden ir integrando incrementalmente --
> no es necesario cargarlos todos en la Fase 2. Se pueden agregar efectos uno por uno
> en la Fase 4 y 6 segun se necesiten.
