# STATUS — Arcoiris Inc. v2.0.0

> Memoria del proyecto: dónde estamos, qué se ha hecho y qué sigue.

---

## Sesión actual: 03/Jun/2026

### Objetivo de la sesión
Arrancar Fase 2 del ROADMAP: sistema de carga de assets (BootScene + estructura `public/assets/` + parser de spritesheets).

### Lo que ya existía al comenzar

| Área | Estado |
|------|--------|
| Vite + React + Phaser + Zustand | ✅ Funcional |
| Core clicker (CoreButton + Counter + store) | ✅ Funcional |
| Arena minigame (emoji/Graphics) | ✅ Funcional |
| Audio8 (chiptune engine completo) | ✅ Funcional |
| i18n ES/EN | ✅ Funcional |
| YouTube background music | ✅ Funcional |
| Persistencia localStorage | ✅ Funcional |
| AmbientScene (Canvas 2D React) | ✅ Funcional |
| CSS completo (~510 líneas) | ✅ Funcional |
| CI/CD deploy.yml | ✅ Configurado |
| `break_infinity.js` | ❌ No instalado |
| `public/assets/` | ❌ No existe |
| BootScene / BackgroundScene / animaciones | ❌ No existen |
| Clases Enemy / Turret / Projectile | ❌ No existen |
| VFXManager | ❌ No existe |

### Assets disponibles (en `../assetsIdeas/`)

| Asset | Path relativo |
|-------|--------------|
| Tiny RPG Character Pack (Soldier + Orc) | `Tiny RPG Character Asset Pack v1.03b -Free Soldier&Orc/Characters(100x100)/` |
| Legacy Collection Ground Explosion | `Legacy Collection/Legacy Collection/Assets/Explosions and Magic/Ground Explosion/spritesheet/` |
| Icons_Essential | `Icons_Essential/Icons_Essential/v1.2/Spritesheet/IconsEssential.png` |
| VerArc Skills & Buffs | `[VerArc Stash] Basic_Skills_and_Buffs/spritesheet.png` |
| Super Pixel Effects Gigapack | `Super Pixel Effects Gigapack (Free Version) v2.3.0/PNG/small/` y `spritesheet/small/` |

### Prioridades definidas

1. **Fase 2: Asset Loading** — Crear BootScene, copiar assets, parser spritesheet.txt
2. **Fase 3: RPG Characters** — Clases Enemy/Turret/Projectile + animations.js
3. **Fase 4: VFX System** — VFXManager con efectos
4. **Fase 5: Ambient Phaser** — Migrar AmbientScene.jsx a Phaser scene
5. **Fase 6: Polish** — Integrar VFX en gameplay loops

### Decisiones técnicas tomadas

- Usaremos `pnpm` (no npm como decía roadmap original)
- La store usa `number`, no `Decimal` — evaluar migración si números > 1e15
- Phaser se usa en **dos instancias separadas**: PhaserGame (partículas overlay) y ArenaGame (minijuego). Evaluar unificación cuando estén todas las escenas.
- `ArenaGame.jsx` se mantiene como instancia separada por ahora

---

## Sesión activa

### Logros de esta sesión

| Tarea | Estado |
|-------|--------|
| ROADMAP.md reescrito con estados reales | ✅ |
| STATUS.md creado | ✅ |
| `public/assets/` creado con 5 subdirectorios | ✅ |
| Soldier sprites (7 PNGs) copiados | ✅ |
| Orc sprites (5 PNGs) copiados | ✅ |
| Legacy Collection explosion (PNG + JSON) copiado | ✅ |
| Icons_Essential spritesheet copiado | ✅ |
| VerArc Buffs spritesheet copiado | ✅ |
| `src/game/scenes/BootScene.js` creado | ✅ |
| `src/game/fx/parseSpritesheetTxt.js` creado | ✅ |
| `src/game/animations.js` creado (11 animaciones) | ✅ |
| `PhaserGame.jsx` actualizado con BootScene | ✅ |
| `CoreScene.js` actualizado (texture check) | ✅ |
| **Super Pixel Effects (10 efectos) copiados** | ✅ |
| **`BackgroundScene.js` creado** | ✅ |
| **`src/game/entities/Enemy.js`** | ✅ |
| **`src/game/entities/Turret.js`** | ✅ |
| **`src/game/entities/Projectile.js`** | ✅ |
| **`ArenaScene.js` migrado a sprites + clases** | ✅ |
| Build exitoso (`pnpm build`) | ✅ |

### Próximos pasos

1. **Fase 4**: Crear `VFXManager.js` con efectos usando Super Pixel FX + Legacy explosion
2. **Fase 5**: Migrar `AmbientScene.jsx` de Canvas 2D a Phaser scene con sprites/icons
3. **Fase 6**: Integrar VFX en gameplay (clickSparkle, explosion, confetti, etc.)
4. Evaluar "Effect and Bullet 16x16.rar" como assets adicionales

---

## Historial de cambios

| Fecha | Cambio |
|-------|--------|
| 03/Jun/2026 | ROADMAP.md reescrito con estados reales (✅/🔄/❌/⏳) |
| 03/Jun/2026 | STATUS.md creado |
| 03/Jun/2026 | Fase 2 completada: BootScene + assets + BackgroundScene + Super Pixel FX |
| 03/Jun/2026 | Fase 3 completada: Enemy/Turret/Projectile classes + ArenaScene migrada |
