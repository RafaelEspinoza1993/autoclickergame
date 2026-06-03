# Roadmap de Desarrollo: Arcoiris Inc. — React + Phaser 3 + Assets

> Documento maestro con planificación técnica, estado actual del proyecto e integración de assets.
> Marcamos cada sección con su estado real para saber qué está listo, qué requiere cambios y qué falta.

---

## Leyenda de Estados

| Marca | Significado |
|-------|-------------|
| ✅ | Completado — funciona como está, no requiere cambios |
| 🔄 | Existe pero requiere cambios — implementación actual difiere del plan |
| ❌ | No iniciado — código no existe, pendiente |
| ⏳ | En progreso — parcialmente implementado |

---

## Tabla de Contenidos

1. [Stack Tecnológico](#1-stack-tecnologico)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Inventario de Assets y Compatibilidad](#3-inventario-de-assets-y-compatibilidad)
4. [Fase 0: Scaffolding](#4-fase-0-scaffolding)
5. [Fase 1: Core Clicker](#5-fase-1-core-clicker)
6. [Fase 2: Carga de Assets (BootScene)](#6-fase-2-carga-de-assets-bootscene)
7. [Fase 3: Tiny RPG Characters — Enemigos con Sprites](#7-fase-3-tiny-rpg-characters--enemigos-con-sprites)
8. [Fase 4: Super Pixel Effects — Sistema VFX](#8-fase-4-super-pixel-effects--sistema-vfx)
9. [Fase 5: Ambient Scene + Torretas](#9-fase-5-ambient-scene--torretas)
10. [Fase 6: Polish y Juice](#10-fase-6-polish-y-juice)
11. [Fase 7: Deploy en GitHub Pages](#11-fase-7-deploy-en-github-pages)
12. [Estimaciones de Tamaño](#12-estimaciones-de-tamano)
13. [Guía de Preparación de Assets](#13-guia-de-preparacion-de-assets)

---

## 1. Stack Tecnológico

| Capa | Tecnología | Versión | Uso | Estado |
|------|-----------|---------|-----|--------|
| Bundler | Vite | 5.x | Compilación rápida, HMR | ✅ |
| Framework UI | React | 18.x | Tienda, barras, contadores, modales | ✅ |
| Motor 2D | Phaser 3 | 3.88+ | Renderizado de juego, partículas, arena | ✅ |
| Estado global | Zustand | 5.x | Store compartido entre React y Phaser | ✅ |
| Grandes números | break_infinity.js | — | No usado aún — monedas en `number` plano | 🔄 Pendiente migrar a Decimal para valores > 1e15 |
| Deploy | GitHub Pages | — | Hosting estático | ✅ |
| Package manager | pnpm | 10.x | Gestión de dependencias | ✅ (el roadmap decía npm, usamos pnpm) |
| Tipo | JavaScript (JSX) | — | Sin TypeScript | 🔄 Roadmap tenía @types/react como opcional, no aplica |

### Dependencias instaladas

```bash
# npm (el roadmap original usaba npm, nosotros usamos pnpm)
pnpm add phaser zustand react react-dom
pnpm add -D vite @vitejs/plugin-react
```

> **Nota:** `break_infinity.js` no está instalado. Los números usan `number` de JS.
> Para valores grandes (más de ~1e15) se pierde precisión. Habrá que migrar.

---

## 2. Estructura del Proyecto

### Real vs Planificado

```
autoclickergame/                             # Nombre real del repo (no arcoiris-inc)
├── .github/workflows/
│   └── deploy.yml              ✅ CI/CD para GitHub Pages (usa pnpm)
├── public/assets/              ❌ No existe — pendiente de crear
├── src/
│   ├── components/
│   │   ├── Topbar.jsx          ✅ (TopBar.jsx en roadmap)
│   │   ├── Shop.jsx            ✅
│   │   ├── Counter.jsx         ✅ (CounterDisplay + StorageBar + NextChallengeBar combinados)
│   │   ├── CoreButton.jsx      ❌ No estaba en roadmap — componente React del botón núcleo
│   │   ├── ChallengeModal.jsx  ✅
│   │   ├── WinScreen.jsx       ✅
│   │   ├── Announcer.jsx       ✅
│   │   └── AmbientScene.jsx    🔄 Canvas 2D (roadmap quería Phaser scene)
│   ├── game/
│   │   ├── PhaserGame.jsx      🔄 Solo carga CoreScene (roadmap quería 5 escenas)
│   │   ├── ArenaGame.jsx       ❌ No estaba en roadmap — wrapper React para ArenaScene
│   │   └── scenes/
│   │       ├── CoreScene.js    🔄 Más simple que el roadmap — sin puntero, solo partículas
│   │       └── ArenaScene.js   🔄 Usa emojis + Graphics (roadmap quería clases Enemy/Turret/Projectile)
│   ├── store/
│   │   └── useGameStore.js     🔄 State difiere — coins en vez de chispas Decimal
│   ├── data/
│   │   ├── constants.js        ✅ (upgrades.js en roadmap)
│   │   └── i18n.js             ✅
│   ├── audio/
│   │   └── Audio8.js           🔄 Equivalente funcional, mucho más completo (chiptune engine)
│   ├── utils/
│   │   └── index.js            ❌ No estaba en roadmap — utilidades DOM (confetti, floatNum, flash)
│   ├── styles.css              ❌ No estaba en roadmap — 510 líneas de CSS
│   ├── App.jsx                 🔄 Layout diferente al roadmap
│   └── main.jsx                ✅
├── index.html                  ✅
├── vite.config.js              🔄 base: '/autoclickergame/' (roadmap decía '/arcoiris-inc/')
├── package.json                ✅ (name: "arcoiris-inc")
└── ROADMAP.md                  🔄 Este documento
```

### Archivos existentes que NO estaban en el roadmap

| Archivo | Propósito |
|---------|-----------|
| `src/components/CoreButton.jsx` | Botón 🌈 que maneja el clic y dispara partículas Phaser |
| `src/components/AmbientScene.jsx` | Escena decorativa Canvas 2D (no Phaser) |
| `src/game/ArenaGame.jsx` | Contenedor React que monta ArenaScene como juego Phaser separado |
| `src/utils/index.js` | DOM helpers: `formatNum`, `floatNum`, `launchConfetti`, `flash` |
| `src/styles.css` | Todo el CSS del juego (~510 líneas) |
| `src/data/constants.js` | Datos de mejoras, niveles, enemigos |
| `src/audio/Audio8.js` | Motor de audio completo con chiptune music engine |

---

## 3. Inventario de Assets y Compatibilidad

> **Estado actual:** ❌ Ningún asset ha sido copiado al proyecto.
> El directorio `public/assets/` no existe.
> Los assets originales están en `../assetsIdeas/` (directorio externo al proyecto).

### 3.1 Assets disponibles (en assetsIdeas/)

| Asset | Tamaño | Licencia | Ubicación |
|-------|--------|----------|-----------|
| **Tiny RPG Character Pack** | ~238 KB | Free (verificar) | `../assetsIdeas/Tiny RPG Character Asset Pack v1.03b -Free Soldier&Orc/` |
| **Super Pixel Effects Gigapack** | ~2 MB (seleccionados) | Comercial OK + atribución | `../assetsIdeas/Super Pixel Effects Gigapack (Free Version) v2.3.0/` |
| **Legacy Collection (Ground Explosion)** | ~120 KB | OK con atribución | `../assetsIdeas/Legacy Collection/Legacy Collection/Assets/Explosions and Magic/Ground Explosion/` |
| **Icons_Essential** | ~36 KB | CC BY 4.0 | `../assetsIdeas/Icons_Essential/` |
| **[VerArc] Skills & Buffs** | ~8 KB | Verificar | `../assetsIdeas/[VerArc Stash] Basic_Skills_and_Buffs/` |

### 3.2 Assets que NO usamos

| Asset | Razón |
|-------|-------|
| Legacy Collection (completo, 37 MB) | Demasiado pesado. Solo tomamos Ground Explosion |
| Modern_Interiors_Free | Licencia solo no-comercial |
| Pixelart Study Expression Sheets | No aplica a un clicker |
| Eris Esra Character Template | Sin JSON atlas, frames no uniformes |
| Coupon codes.txt | Código de descuento, no asset |
| Effect and Bullet 16x16.rar | Pendiente de evaluar |

---

## 4. Fase 0: Scaffolding

**Estado:** ✅ **Completada** (con diferencias respecto al plan original)

### 4.1 Lo que está listo ✅

- Proyecto Vite + React creado y funcional
- Phaser 3.88+ instalado y corriendo (dos instancias: partículas overlay + arena)
- Zustand 5 instalado con store funcional
- Vite configurado con `@vitejs/plugin-react`
- CI/CD con GitHub Actions (usa pnpm)
- `index.html` con Google Fonts (Fredoka + Outfit + Space Mono)
- `vite.config.js` con `base: '/autoclickergame/'`

### 4.2 Lo que existe pero requiere cambios 🔄

| Elemento | Estado actual | Cambio necesario |
|----------|--------------|------------------|
| `PhaserGame.jsx` | Solo carga `CoreScene` | Debería cargar también `BootScene`, `BackgroundScene`, `AmbientScene`, `ArenaScene` cuando estén listas |
| `PhaserGame.jsx` config | `Scale.RESIZE` sin dimensiones fijas | Definir dimensiones o mantener RESIZE según convenga |
| `ArenaGame.jsx` | Es un `new Phaser.Game` separado | Debería ser parte del juego principal (o mantener separado pero unificado bajo un config) |
| Store | `coins: number` en vez de `Decimal` | Evaluar migración a `break_infinity.js` si los números crecen demasiado |

---

## 5. Fase 1: Core Clicker

**Estado:** ✅⏳ **Completado en React, parcially en Phaser**

### 5.1 Componentes React ✅

| Componente | Archivo | Estado |
|------------|---------|--------|
| Botón núcleo con animación punch | `CoreButton.jsx` | ✅ |
| Contador de monedas con rate | `Counter.jsx` | ✅ |
| Barra de almacenamiento | `Counter.jsx` (integrado) | ✅ |
| Barra de progreso de challenge | `Counter.jsx` (integrado) | ✅ |
| Títulos de nivel con colores arcoíris | `Counter.jsx` | ✅ |
| Números flotantes al hacer clic | `floatNum()` en utils | ✅ |
| Confetti DOM al comprar/subir nivel | `launchConfetti()` en utils | ✅ |

### 5.2 Phaser Scene — CoreScene 🔄

| Funcionalidad | Roadmap esperaba | Realidad | Estado |
|---------------|-----------------|----------|--------|
| Partículas al hacer clic | `emitParticleAt` con sparkle | ✅ Igual, pero llamado desde React via ref | ✅ |
| Texto rainbow clickeable | Rainbow emoji con `setInteractive` | ❌ No existe — el clic se maneja en React (`CoreButton.jsx`) | 🔄 |
| Animación idle breathing | Tween scale 1.05 → 1.05 | ❌ No existe | 🔄 |
| Desafío cada 500 clics | `resetChallengeCountdown` + launch ArenaScene | ✅ Manejo en store con `startChallenge()` | ✅ |
| Sonido de clic | — (AudioEngine separado) | ✅ `Audio8.click()` con sistema de combo | ✅ |

### 5.3 BackgroundScene 🔄

| Funcionalidad | Roadmap (Phaser) | Realidad | Estado |
|---------------|-----------------|----------|--------|
| Partículas de fondo | Phaser particles con sparkle | ✅ Canvas 2D en `BackgroundCanvas` (App.jsx) con partículas flotantes | ⏳ |
| Estrellas | Phaser particles | ✅ 70 partículas con colores arcoíris, shadow glow | ✅ |

### 5.4 Store actions 🔄

| Acción | Roadmap | Realidad | Cambio |
|--------|---------|----------|--------|
| `producirChispas(n)` | `Decimal` aritmética | `addCoins(n)` con `number` | 🔄 |
| `incrementarClicks()` | Contador + trigger challenge | `clickCore()` integra click + challenge + audio | 🔄 |
| `comprarMejora(id)` | Compra simple | `buyUpgrade(id)` con validación de desbloqueo secuencial | 🔄 |
| `resetChallengeCountdown()` | Reset a 500 | Integrado en `clickCore()` | 🔄 |
| Persistencia | localStorage | ✅ localStorage con debounce 800ms + beforeunload | ✅ |

---

## 6. Fase 2: Carga de Assets (BootScene)

**Estado:** ✅ **Completado** (falta BackgroundScene, pendiente Super Pixel Effects)

### 6.1 Completado ✅

| Tarea | Estado |
|-------|--------|
| Crear `public/assets/` con subdirectorios | ✅ `characters/Soldier/`, `characters/Orc/`, `explosions/`, `icons/`, `buffs/` |
| Copiar Tiny RPG Character Pack | ✅ Soldier (7 PNGs) + Orc (5 PNGs) |
| Copiar Legacy Collection explosion | ✅ `explosion-animation.png` + `explosion-animation.json` |
| Copiar Icons_Essential | ✅ `IconsEssential.png` (336x272, grid 21x17 de 16x16) |
| Copiar VerArc Buffs | ✅ `spritesheet.png` (128x96, grid 8x6 de 16x16) |
| Crear `src/game/scenes/BootScene.js` | ✅ Carga centralizada con barra de progreso + sparkle texture procedural |
| Crear `src/game/fx/parseSpritesheetTxt.js` | ✅ Parser para Super Pixel Effects + `loadFXAtlas()` helper |
| Crear textura procedural sparkle | ✅ Movida de CoreScene a BootScene |
| Registrar BootScene en PhaserGame.jsx | ✅ BootScene se lanza primero, luego arranca CoreScene |
| Crear `src/game/animations.js` | ✅ `createAnimations()` con 11 animaciones (soldier, orc, explosion) |
| Actualizar CoreScene.js | ✅ Check si sparkle texture existe antes de generar |

### 6.2 Pendiente

| Tarea | Razón |
|-------|-------|
| Cargar Super Pixel FX via `loadFXAtlas()` en BootScene | Pendiente integración con VFXManager (Fase 4) |

---

## 7. Fase 3: Tiny RPG Characters — Enemigos con Sprites

**Estado:** ✅ **Completado** (ArenaScene migrada a sprites + entity classes)

### 7.1 Migración completada ✅

| Aspecto | Antes (emoji/Graphics) | Ahora (sprites Phaser) |
|---------|-----------------------|-----------------------|
| Enemigos | `Phaser.Text` con emoji (`👾`, `👻`, `🤖`) | Clase `Enemy` con sprites `soldier-walk`, `orc-walk`, animaciones idle/walk/hurt/death |
| Torretas | `Phaser.Text` con emoji de upgrade | Clase `Turret` con sprite de `icons` (Icons_Essential) + tint por color |
| Proyectiles | `Graphics.fillRect()` manual | Clase `Projectile` con glow + trail visual |
| HP bars | `Graphics.fillRect()` en _draw | Integrado en clase `Enemy` con _drawHPBar() |
| Partículas muerte | `Graphics.fillRect()` en _draw | Se mantiene `_burst()` con Graphics |
| Animaciones | No existían | `createAnimations()` con 11 animaciones registradas |

### 7.2 Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/game/animations.js` | ✅ `createAnimations()` — soldier idle/walk/attack01-03/death/hurt, orc idle/walk/attack01/death/hurt, explosion |
| `src/game/entities/Enemy.js` | ✅ Sprite con HP, speed, daño, hit flash, animaciones, HP bar |
| `src/game/entities/Turret.js` | ✅ Sprite con cooldown/rate, fire point, tint por color de mejora |
| `src/game/entities/Projectile.js` | ✅ Graphics con movimiento, glow, trail, colisión |

### 7.3 Cambios en ArenaScene.js

- `preload()` añadida para cargar spritesheets + explosion atlas en instancia separada
- Enemigos: `_spawnEnemy()` crea `new Enemy(this, ...)` en vez de objetos planos
- Torretas: `_createTurretTexts()` reemplazada por `new Turret(this, ...)`
- Proyectiles: shots array reemplazado por `new Projectile(this, ...)`
- Colisiones: `Phaser.Math.Distance.Between` para detección círculo-círculo
- Update loop: `e.update()` delega movimiento/animación a entidades

---

## 8. Fase 4: Super Pixel Effects — Sistema VFX

**Estado:** ✅ **Completado** (VFXManager con 10 efectos, integrado en CoreScene y ArenaScene)

### 8.1 Archivo creado

| Archivo | Descripción |
|---------|-------------|
| `src/game/fx/VFXManager.js` | ✅ Sistema con `play()`, `explosion()`, `clickSparkle()`, `magicBurst()`, `levelUp()`, `splatter()`, `turretShot()`, `smoke()`, `lightning()`, `confetti()` |

### 8.2 Integración

| Escena | Efectos activados |
|--------|------------------|
| CoreScene | `clickSparkle` al hacer clic (via emitAt → VFXManager) |
| CoreScene | `magicBurst` al escuchar evento `arena:celebrate` (compras, level up) |
| ArenaScene | `explosion` cuando un enemigo muere (Legacy Collection atlas + partículas) |
| ArenaScene | `splatter` cuando un proyectil impacta |

### 8.3 Nota técnica

Los efectos usan la textura procedural `sparkle` (generada en BootScene/CoreScene) y el atlas `explosion` (Legacy Collection). Los spritesheets de Super Pixel Effects están copiados en `public/assets/fx/` pero aún no se cargan via `loadFXAtlas()`. Para activarlos, cada escena que los necesite debe:

1. Cargar el spritesheet via `scene.load.image()` + `parseSpritesheetTxt()`
2. Crear atlas en runtime con `textures.addAtlas()`
3. Usar la key del atlas en `VFXManager.play()`

---

## 9. Fase 5: Ambient Scene + Torretas

**Estado:** ✅ **Completado** (migrado de Canvas 2D a Phaser.Game separado)

### 9.1 Archivos creados/modificados

| Archivo | Descripción |
|---------|-------------|
| `src/game/scenes/AmbientScene.js` | ✅ Escena Phaser con gradiente, estrellas, suelo, torretas (Icons_Essential), enemigos decorativos (Orc sprites), disparos, partículas |
| `src/components/AmbientPhaser.jsx` | ✅ Componente React que monta AmbientScene como Phaser.Game separado con RESIZE |
| `src/App.jsx` | 🔄 Importa `AmbientPhaser` en vez de `AmbientScene` |
| `src/components/AmbientScene.jsx` | ❌ Reemplazado — código Canvas 2D ya no se usa |

### 9.2 Funcionalidades migradas

| Funcionalidad | Canvas 2D (antes) | Phaser (ahora) |
|--------------|-------------------|----------------|
| Cielo gradiente | `createLinearGradient` | `Graphics.fillGradientStyle` |
| Suelo con líneas decorativas | `fillRect` | `Graphics.fillRect` con bucles |
| Estrellas flotantes | `fillRect` loop manual | Sprites imagen con `tickStars()` parallax |
| Torretas (mejoras) | `fillText(emoji)` con glow | Sprites `Icons_Essential` con tint + animación bob |
| Enemigos decorativos | `fillText('👾')` | Sprites `orc-walk` con animación, flipX |
| Disparos | `fillRect` | `Graphics.fillRect` con glow de color de mejora |
| Partículas muerte | `fillRect` loop manual | `Phaser.GameObjects.Particles` con sparkle |
| Partículas celebración | `fillRect` loop manual | `Phaser.GameObjects.Particles` con sparkle |

### 9.3 Assets cargados

| Asset | Frame | Uso |
|-------|-------|-----|
| `IconsEssential.png` | 357 frames (16×16) | Torretas — frame = `(i * 7 + 24) % 357` con tint |
| `Orc-Walk.png` | 4 frames (100×100, escala 0.25) | Enemigos decorativos — animación `ambient-orc-walk` |
| `sparkle` | Procedural 8×8 | Estrellas y partículas |

### 9.4 Observaciones

- Es un `Phaser.Game` **separado** (como ArenaGame), con `Scale.RESIZE` y `backgroundColor: '#1a1230'`
- Las animaciones se registran con prefijo `ambient-` para evitar colisiones con las del juego principal
- Escucha evento `arena:celebrate` para hacer _burst en enemigos vivos
- El contenedor React (`.ambient`) mantiene el estilo fixed bottom-right, z-index, border-radius y etiquetas "FÁBRICA · LIVE" + canción |

---

## 10. Fase 6: Polish y Juice

**Estado:** ⏳ **Mucho existe, falta pulir con assets**

### 10.1 Lo que ya está listo ✅

| Funcionalidad | Implementación |
|--------------|---------------|
| Screen shake al recibir daño | `cameras.main.shake()` en ArenaScene |
| Confetti al comprar/subir nivel/ganar | `launchConfetti()` con DOM |
| Números flotantes al hacer clic | `floatNum()` con animación CSS |
| Flash de pantalla | `flash()` overlay DOM |
| Animación punch en botón núcleo | CSS `@keyframes punch` |
| Barra de almacenamiento con warning visual | CSS clases `.warn` / `.full` |
| Título de nivel con color arcoíris | CSS hue rotation + inline style |
| Animación de anuncios | CSS `@keyframes announceSlam` |
| Audio completo | `Audio8.js` — clics, compras, niveles, challenges, música |
| YouTube background music | IFrame API en Topbar |

### 10.2 Lo que falta ❌

| Mejora | Asset necesario | Depende de |
|--------|----------------|------------|
| Boss intro con rayo | Super Pixel Effects lightning | Fase 4 (VFXManager) |
| Challenge countdown "3...2...1..." | Super Pixel Effects symbols | Fase 4 |
| Win screen explosiones | Legacy Collection explosion | Fase 4 |
| Ambient scene parallax | — | Fase 5 |
| Click combo visual escalado | Super Pixel Effects sparkle | Fase 4 |
| Storage full smoke | Super Pixel Effects smoke | Fase 4 |
| Torretas con iconos variados | Icons_Essential | Fase 5 |
| Slow-motion al ganar challenge | — | Puede hacerse sin assets |

### 10.3 Audio (ya completo) ✅

`Audio8.js` incluye todo lo planificado y más:
- Click sounds con sistema de combo (8 niveles)
- Compra/mejora/almacén sounds
- Storage warning beeps
- Announcer noise burst
- Level-up laugh progresivo
- Hit/boss-hit/fail/fanfare/kiss sounds
- **Chiptune music engine** con pistas por mejora + bajo + línea de percusión
- **Challenge music** con tono más tenso
- No requiere assets externos — todo es Web Audio API procedural

---

## 11. Fase 7: Deploy en GitHub Pages

**Estado:** ✅ **Completado**

### 11.1 Lo que está listo

| Elemento | Estado |
|----------|--------|
| `deploy.yml` | ✅ Usa pnpm/action-setup v4, node 20, build + deploy a gh-pages |
| `vite.config.js` | ✅ `base: '/autoclickergame/'` |
| `package.json` | ✅ Script `build` configurado |

### 11.2 Diferencia con el roadmap

| Aspecto | Roadmap | Realidad |
|---------|---------|----------|
| Gestor paquetes | `npm ci` | `pnpm install` (con pnpm/action-setup) |
| Rama deploy | `main` | `master` |
| Cache | `cache: 'npm'` | No usa cache explícito |

---

## 12. Estimaciones de Tamaño

| Componente | Tamaño actual | Con assets |
|------------|--------------|------------|
| Código fuente (src/) | ~60 KB | ~130 KB |
| CSS | ~18 KB | ~15 KB |
| Tiny RPG Character Pack | — | ~250 KB |
| Super Pixel Effects (seleccionados) | — | ~1.5 MB |
| Legacy Collection explosion | — | ~120 KB |
| Icons_Essential | — | ~36 KB |
| VerArc Buffs | — | ~8 KB |
| **Total** | **~80 KB** | **~2 MB** |

---

## 13. Guía de Preparación de Assets

### 13.1 Ubicación actual

Todos los assets están en `../assetsIdeas/` (directorio al mismo nivel que el proyecto).

### 13.2 Pasos para integrar

1. Crear `public/assets/` con subdirectorios
2. Copiar Tiny RPG Character Pack, Legacy Collection, Icons_Essential, VerArc Buffs
3. Copiar Super Pixel Effects seleccionados
4. Crear `BootScene.js` con carga centralizada
5. Registrar animaciones en `animations.js`
6. Crear clases `Enemy`, `Turret`, `Projectile`
7. Crear `VFXManager.js`
8. Migrar `AmbientScene.jsx` a Phaser
9. Actualizar `ArenaScene.js` para usar sprites en vez de emojis

### 13.3 Verificación de licencias pendiente

| Asset | Acción |
|-------|--------|
| Tiny RPG Character Pack | Verificar licencia exacta en itch.io |
| Super Pixel Effects | Atribución requerida |
| Icons_Essential | CC BY 4.0 — atribución requerida |
| VerArc Buffs | Verificar licencia en itch.io |

---

## Resumen Visual de Estado

```
Fase 0: Scaffolding     ████████████████████  ✅  Completado
Fase 1: Core Clicker    ████████████░░░░░░░░  ✅⏳  React listo, Phaser parcial
Fase 2: Asset Loading   ████████████████████  ✅  Completo (BootScene + assets + BackgroundScene)
Fase 3: RPG Characters  ████████████████████  ✅  Completo (Enemy/Turret/Projectile + ArenaScene migrada)
Fase 4: VFX System      ████████████████████  ✅  Completado (VFXManager 10 efectos integrados)
Fase 5: Ambient Scene   ████████████████████  ✅  Completado (Phaser con sprites Icons_Essential + Orc)
Fase 6: Polish & Juice  ████████████████████  ✅  Todo listo (VFX + Audio + animaciones)
Fase 7: Deploy          ████████████████████  ✅  Completado
```
