/* ════════════════════════════════════════════════════════════════
   i18n — bilingual strings (ES / EN), absurd & loud
   ════════════════════════════════════════════════════════════════ */

const I18N = {
  es: {
    brandSub: 'Fábrica de arcoíris S.A.',
    counterLabel: 'chispas producidas',
    rate: '/s',
    coreHint: '¡DALE CLIC AL NÚCLEO!',
    shopTitle: 'Fábrica',
    nextChallengeLab: 'Próximo reto',
    nextChallengeClicks: (n) => `${n} clics`,
    total: 'total',
    upgrades: 'mejoras',
    muteOn: 'Silenciar',
    muteOff: 'Activar sonido',
    level: 'Nv.',
    clickShopTitle: 'Técnica de Clic',
    clickPerClick: '/clic',
    storageShopTitle: 'Almacén',
    storageLabel: 'Almacén',
    storageFull: '¡LLENO!',
    storageCap: 'cap',
    storageUpgradeNames: {
      st1: 'Caja Extra',
      st2: 'Tienda Local',
      st3: 'Fábrica Ampliada',
      st4: 'Megacomplejo',
      st5: 'Almacén Infinito',
    },
    clickUpgradeNames: {
      ck1: 'Dedo Entrenado',
      ck2: 'Técnica de Dos',
      ck3: 'Mano Fabulosa',
      ck4: 'Palma del Poder',
      ck5: 'Fuerza Arcoíris',
    },
    // shop tooltips
    buy: 'Comprar',
    owned: 'En plantilla',
    locked: 'Bloqueado',
    // level titles (festive, absurd, NO targeting people)
    levels: [
      'Fábrica de\nArcoíris',
      '¡Producción\nImparable!',
      '¡Fiesta\nTotal!',
      '🏆 Imperio del\nArcoíris 🏆',
      '✨ Leyenda\nBrillante ✨',
    ],
    upgradeNames: {
      flag:   'Bandera Arcoíris',
      wand:   'Varita Mágica',
      uni:    'Unicornio Glam',
      diamond:'Diamante Pride',
      disco:  'Bola de Disco',
      crown:  'Corona Drag',
      legend: 'Arcoíris Legendario',
    },
    // MK-style announcer lines, escalate by purchase count
    announce: [
      '¡EXCELENTE!', '¡BRUTAL!', '¡COMBO ARCOÍRIS!', '¡IMPARABLE!',
      '¡PERFECTO!', '¡ULTRA GLAM!', '¡FATALITY FABULOSA!',
    ],
    // challenge
    chTitle: '¡RETO RELÁMPAGO!',
    chInstr: '¡Clica a los invasores antes de que lleguen a la fábrica! Tus mejoras disparan solas.',
    chWave: 'oleada',
    chBase: 'Fábrica',
    chTime: 'Tiempo',
    chKills: 'Caídos',
    winTitle: '¡SOBREVIVISTE!',
    winSub: 'Defendiste la fábrica como toda una diva.',
    loseTitle: '¡LA INVADIERON!',
    loseSub: 'La fábrica aguantó… casi. ¡A seguir clicando!',
    reward: (n) => `+${n} chispas`,
    continue: 'Seguir produciendo',
    // win
    gameWinTitle: '¡GANASTE EL JUEGO!',
    gameWinSub: 'Has reunido TODAS las mejoras. La fábrica de arcoíris brilla a máxima potencia. 💋',
    gameWinBtn: 'Seguir clicando por gusto',
  },
  en: {
    brandSub: 'Rainbow factory inc.',
    counterLabel: 'sparkles produced',
    rate: '/s',
    coreHint: 'CLICK THE CORE!',
    shopTitle: 'Factory',
    nextChallengeLab: 'Next challenge',
    nextChallengeClicks: (n) => `${n} clicks`,
    total: 'total',
    upgrades: 'upgrades',
    muteOn: 'Mute',
    muteOff: 'Unmute',
    level: 'Lv.',
    clickShopTitle: 'Click Tech',
    clickPerClick: '/click',
    storageShopTitle: 'Storage',
    storageLabel: 'Storage',
    storageFull: 'FULL!',
    storageCap: 'cap',
    storageUpgradeNames: {
      st1: 'Extra Box',
      st2: 'Local Store',
      st3: 'Expanded Factory',
      st4: 'Mega Complex',
      st5: 'Infinite Storage',
    },
    clickUpgradeNames: {
      ck1: 'Trained Finger',
      ck2: 'Two-Finger Technique',
      ck3: 'Fabulous Hand',
      ck4: 'Power Palm',
      ck5: 'Rainbow Force',
    },
    buy: 'Buy',
    owned: 'Hired',
    locked: 'Locked',
    levels: [
      'Rainbow\nFactory',
      'Production\nUnstoppable!',
      'Total\nParty!',
      '🏆 Rainbow\nEmpire 🏆',
      '✨ Shining\nLegend ✨',
    ],
    upgradeNames: {
      flag:   'Rainbow Flag',
      wand:   'Magic Wand',
      uni:    'Glam Unicorn',
      diamond:'Pride Diamond',
      disco:  'Disco Ball',
      crown:  'Drag Crown',
      legend: 'Legendary Rainbow',
    },
    announce: [
      'EXCELLENT!', 'BRUTAL!', 'RAINBOW COMBO!', 'UNSTOPPABLE!',
      'FLAWLESS!', 'ULTRA GLAM!', 'FABULOUS FATALITY!',
    ],
    chTitle: 'FLASH CHALLENGE!',
    chInstr: 'Click the invaders before they reach the factory! Your upgrades fire on their own.',
    chWave: 'wave',
    chBase: 'Factory',
    chTime: 'Time',
    chKills: 'Down',
    winTitle: 'YOU SURVIVED!',
    winSub: 'You defended the factory like a true diva.',
    loseTitle: 'OVERRUN!',
    loseSub: 'The factory almost held… keep clicking!',
    reward: (n) => `+${n} sparkles`,
    continue: 'Keep producing',
    gameWinTitle: 'YOU WIN!',
    gameWinSub: 'You gathered EVERY upgrade. The rainbow factory shines at full power. 💋',
    gameWinBtn: 'Keep clicking for fun',
  },
};

// shared, language-independent upgrade data
const UPGRADES = [
  { id:'flag',    emoji:'🏳️\u200d🌈', cost:10,     rate:0.5,  color:'#ff2d6f' },
  { id:'wand',    emoji:'✨',          cost:50,     rate:2,    color:'#ff8a3d' },
  { id:'uni',     emoji:'🦄',          cost:200,    rate:8,    color:'#ffe24d' },
  { id:'diamond', emoji:'💎',          cost:1000,   rate:32,   color:'#4dff9e' },
  { id:'disco',   emoji:'🪩',          cost:5000,   rate:128,  color:'#3dd6ff' },
  { id:'crown',   emoji:'👑',          cost:25000,  rate:512,  color:'#9a6bff' },
  { id:'legend',  emoji:'🌈',          cost:100000, rate:2048, color:'#ff5ed6' },
];

const BASE_STORAGE = 500;
const STORAGE_UPGRADES = [
  { id:'st1', emoji:'📦', cost:150,     cap:2000,     color:'#ff8a3d' },
  { id:'st2', emoji:'🏪', cost:2500,    cap:15000,    color:'#ffe24d' },
  { id:'st3', emoji:'🏭', cost:25000,   cap:150000,   color:'#4dff9e' },
  { id:'st4', emoji:'🏙️', cost:300000,  cap:2000000,  color:'#9a6bff' },
  { id:'st5', emoji:'♾️', cost:3000000, cap:Infinity, color:'#ff5ed6' },
];

const CLICK_UPGRADES = [
  { id:'ck1', emoji:'👆', cost:25,     power:1,   color:'#ff8a3d' },
  { id:'ck2', emoji:'✌️', cost:500,    power:5,   color:'#ffe24d' },
  { id:'ck3', emoji:'🤙', cost:5000,   power:25,  color:'#4dff9e' },
  { id:'ck4', emoji:'🖐️', cost:60000,  power:125, color:'#9a6bff' },
  { id:'ck5', emoji:'🫶', cost:800000, power:625, color:'#ff5ed6' },
];

const LEVEL_THRESHOLDS = [0, 250, 2500, 25000, 200000];
const RAINBOW = ['#ff2d6f','#ff8a3d','#ffe24d','#4dff9e','#3dd6ff','#9a6bff','#ff5ed6'];

let LANG = localStorage.getItem('ai_lang') || 'es';
function t() { return I18N[LANG]; }
