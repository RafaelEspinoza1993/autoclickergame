/* ════════════════════════════════════════════════════════════════
   core.js — state, shop, clicker, levels, announcer, win
   depends on: i18n.js, audio.js, arena.js
   ════════════════════════════════════════════════════════════════ */

// ── STATE ──────────────────────────────────────────────────────
const State = {
  coins: 0, totalCoins: 0, totalClicks: 0,
  clicksToChallenge: 500, challengeWave: 0,
  owned: {}, clickLevel: 0, storageLevel: 0, won: false,
};

let _saveT = 0, _savePending = false;
function _writeSave() {
  localStorage.setItem('ai_save', JSON.stringify({
    coins: State.coins, totalCoins: State.totalCoins, totalClicks: State.totalClicks,
    clicksToChallenge: State.clicksToChallenge, challengeWave: State.challengeWave,
    owned: State.owned, clickLevel: State.clickLevel, storageLevel: State.storageLevel, won: State.won,
  }));
}
function save() {
  // throttle to ~1/s to avoid thrashing localStorage on passive ticks
  const now = Date.now();
  if (now - _saveT > 1000) { _saveT = now; _writeSave(); _savePending = false; }
  else if (!_savePending) { _savePending = true; setTimeout(() => { _saveT = Date.now(); _writeSave(); _savePending = false; }, 1000); }
}
window.addEventListener('beforeunload', _writeSave);
function load() {
  try {
    const s = JSON.parse(localStorage.getItem('ai_save'));
    if (s) {
      // migrate: boolean owned → number (stacking levels)
      if (s.owned) Object.keys(s.owned).forEach(k => {
        if (typeof s.owned[k] === 'boolean') s.owned[k] = s.owned[k] ? 1 : 0;
      });
      Object.assign(State, s);
    }
  } catch (e) {}
}

// ── DOM refs ───────────────────────────────────────────────────
const $ = (s) => document.querySelector(s);
const coinEl = $('#coin-amount'), rateEl = $('#coin-rate'), clickPowEl = $('#click-pow'),
      titleEl = $('#title'), core = $('#core'),
      shopGrid = $('#shop-grid'), shopCount = $('#shop-count'),
      statTotal = $('#stat-total'), statUpg = $('#stat-upg'),
      ncFill = $('#nc-fill'), ncClicks = $('#nc-clicks'),
      storeFillEl = $('#storage-fill'), storeTextEl = $('#storage-bar-text'),
      storeWrapEl = $('#storage-bar-wrap'), storeLabelEl = $('#storage-label-text');

// ── helpers ────────────────────────────────────────────────────
function formatNum(n) {
  n = Math.floor(n);
  if (n >= 1e12) return (n/1e12).toFixed(2)+'T';
  if (n >= 1e9)  return (n/1e9).toFixed(2)+'B';
  if (n >= 1e6)  return (n/1e6).toFixed(2)+'M';
  if (n >= 1e3)  return (n/1e3).toFixed(1)+'K';
  return n.toString();
}
function rate() {
  return UPGRADES.reduce((s, u) => s + (State.owned[u.id] || 0) * u.rate, 0);
}
function upgradeCost(u) {
  return Math.floor(u.cost * Math.pow(1.15, State.owned[u.id] || 0));
}
function clickPower() {
  return 1 + CLICK_UPGRADES.slice(0, State.clickLevel).reduce((s, u) => s + u.power, 0);
}
function maxStorage() {
  return State.storageLevel === 0 ? BASE_STORAGE : STORAGE_UPGRADES[State.storageLevel - 1].cap;
}
function refreshAllShops() {
  updateShopStates();
  updateClickShopStates();
  updateStorageShopStates();
}
function ownedCount() { return UPGRADES.filter(u => (State.owned[u.id] || 0) >= 1).length; }
function currentLevel() {
  let lv = 0;
  for (let i=LEVEL_THRESHOLDS.length-1;i>=0;i--)
    if (State.totalCoins >= LEVEL_THRESHOLDS[i]) { lv=i; break; }
  return lv;
}

// ── UI ─────────────────────────────────────────────────────────
function updateUI() {
  coinEl.textContent = formatNum(State.coins);
  rateEl.textContent = `+${formatNum(rate())}${t().rate}`;
  clickPowEl.textContent = `+${formatNum(clickPower())}${t().clickPerClick}`;
  statTotal.innerHTML = `${t().total}: <b>${formatNum(State.totalCoins)}</b>`;
  statUpg.innerHTML = `${t().upgrades}: <b>${ownedCount()}/${UPGRADES.length}</b>`;
  shopCount.textContent = `${ownedCount()}/${UPGRADES.length}`;
  const pct = Math.max(0, Math.min(100, (1 - State.clicksToChallenge/500) * 100));
  ncFill.style.width = pct + '%';
  ncClicks.textContent = t().nextChallengeClicks(State.clicksToChallenge);
  // storage bar
  const max = maxStorage();
  if (max === Infinity) {
    storeFillEl.style.width = '0%';
    storeTextEl.textContent = '∞';
    storeWrapEl.classList.remove('warn', 'full');
  } else {
    const sPct = Math.min(100, (State.coins / max) * 100);
    storeFillEl.style.width = sPct + '%';
    storeTextEl.textContent = `${formatNum(State.coins)} / ${formatNum(max)}`;
    storeWrapEl.classList.toggle('warn', sPct >= 70 && sPct < 100);
    storeWrapEl.classList.toggle('full', sPct >= 100);
    if (sPct >= 90) Audio8.storageWarn(sPct);
  }
}

let lastLevel = -1;
function refreshTitle(force) {
  const lv = currentLevel();
  if (lv !== lastLevel || force) {
    const txt = t().levels[lv].replace(/\n/g,'<br>');
    if (titleEl.innerHTML !== txt) titleEl.innerHTML = txt;
    if (lv > lastLevel && lastLevel !== -1) {
      Audio8.laugh(lv);
      Arena.celebrate();
      launchConfetti(90);
      flash();
    }
    lastLevel = lv;
  }
}

// rainbow cycle on title
let hueI = 0;
setInterval(() => {
  titleEl.style.color = RAINBOW[hueI % RAINBOW.length];
  titleEl.style.textShadow = `0 0 26px ${RAINBOW[hueI % RAINBOW.length]}66`;
  hueI++;
}, 700);

// ── coins ──────────────────────────────────────────────────────
function addCoins(amt) {
  const max = maxStorage();
  const actual = Math.min(amt, max - State.coins);
  if (actual <= 0) return;
  State.coins += actual;
  State.totalCoins += actual;
  updateUI(); refreshTitle(); refreshAllShops(); save();
}

// ── click ──────────────────────────────────────────────────────
core.addEventListener('click', (e) => {
  Audio8.ensure();
  const cp = clickPower();
  addCoins(cp);
  Audio8.click();
  floatNum(e.clientX, e.clientY, `+${formatNum(cp)}`);
  launchConfetti(4);
  core.classList.remove('punch'); void core.offsetWidth; core.classList.add('punch');

  State.totalClicks++;
  State.clicksToChallenge--;
  if (State.clicksToChallenge <= 0) {
    State.clicksToChallenge = 500;
    State.challengeWave++;
    save();
    Arena.startChallenge(State.challengeWave);
  }
  updateUI();
});

// ── passive income ─────────────────────────────────────────────
setInterval(() => {
  const r = rate();
  if (r > 0) addCoins(r / 10);
}, 100);

// ── SHOP ───────────────────────────────────────────────────────
function renderShop() {
  shopGrid.innerHTML = '';
  UPGRADES.forEach(u => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = u.id;
    card.style.setProperty('--ico-glow', u.color);
    card.innerHTML = `
      <div class="card-ico">${u.emoji}</div>
      <div class="card-body">
        <div class="card-name-row">
          <div class="card-name" data-name></div>
          <div class="card-lvbadge" data-lvbadge></div>
        </div>
        <div class="card-rate">+${formatNum(u.rate)}${t().rate} / <span data-lv-label></span></div>
        <div class="card-cost"><span>✨</span><span data-cost></span></div>
      </div>`;
    card.addEventListener('click', () => buyUpgrade(u.id));
    shopGrid.appendChild(card);
  });
  refreshShopText();
  updateShopStates();
}
function refreshShopText() {
  shopGrid.querySelectorAll('.card').forEach(card => {
    const u = UPGRADES.find(x => x.id === card.dataset.id);
    card.querySelector('[data-name]').textContent = t().upgradeNames[u.id];
    card.querySelector('[data-lv-label]').textContent = t().level;
  });
}
function updateShopStates() {
  shopGrid.querySelectorAll('.card').forEach((card, idx) => {
    const u = UPGRADES[idx];
    const lvl = State.owned[u.id] || 0;
    const prevUnlocked = idx === 0 || (State.owned[UPGRADES[idx - 1].id] || 0) >= 1;
    const cost = upgradeCost(u);
    const canAfford = State.coins >= cost;

    // dynamic text
    card.querySelector('[data-cost]').textContent = formatNum(cost);
    const badge = card.querySelector('[data-lvbadge]');
    badge.textContent = lvl > 0 ? `${t().level} ${lvl}` : '';
    badge.className = 'card-lvbadge' + (lvl > 0 ? ' has-lvl' : '');

    card.classList.remove('owned', 'locked', 'buyable', 'active');
    if (!prevUnlocked) {
      card.classList.add('locked');
    } else {
      if (lvl > 0) card.classList.add('owned');       // rainbow border
      if (canAfford) card.classList.add('buyable');
      else card.classList.add('active');               // unlocked but can't afford
    }
  });
}

// ── STORAGE SHOP ───────────────────────────────────────────────
function renderStorageShop() {
  const grid = $('#storage-shop-grid');
  grid.innerHTML = '';
  STORAGE_UPGRADES.forEach((u, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.setProperty('--ico-glow', u.color);
    card.innerHTML = `
      <div class="card-ico">${u.emoji}</div>
      <div class="card-body">
        <div class="card-name-row">
          <div class="card-name" data-st-name></div>
        </div>
        <div class="card-rate"><span data-st-cap>${u.cap === Infinity ? '∞' : formatNum(u.cap)}</span> <span data-st-caplabel></span></div>
        <div class="card-cost"><span>✨</span><span data-st-cost>${formatNum(u.cost)}</span></div>
      </div>`;
    card.addEventListener('click', () => buyStorageUpgrade(idx));
    grid.appendChild(card);
  });
  refreshStorageShopText();
  updateStorageShopStates();
}
function refreshStorageShopText() {
  $('#storage-shop-title-text').textContent = t().storageShopTitle;
  storeLabelEl.textContent = t().storageLabel;
  $('#storage-shop-grid').querySelectorAll('.card').forEach((card, idx) => {
    card.querySelector('[data-st-name]').textContent = t().storageUpgradeNames[STORAGE_UPGRADES[idx].id];
    card.querySelector('[data-st-caplabel]').textContent = t().storageCap;
  });
}
function updateStorageShopStates() {
  $('#storage-shop-count').textContent = `${State.storageLevel}/${STORAGE_UPGRADES.length}`;
  $('#storage-shop-grid').querySelectorAll('.card').forEach((card, idx) => {
    const u = STORAGE_UPGRADES[idx];
    card.classList.remove('owned', 'locked', 'buyable', 'active');
    if (idx < State.storageLevel) {
      card.classList.add('owned');
    } else if (idx === State.storageLevel) {
      card.classList.add(State.coins >= u.cost ? 'buyable' : 'active');
    } else {
      card.classList.add('locked');
    }
  });
}
function buyStorageUpgrade(idx) {
  if (idx !== State.storageLevel) return;
  const u = STORAGE_UPGRADES[idx];
  if (State.coins < u.cost) return;
  State.coins -= u.cost;
  State.storageLevel++;
  Audio8.buyStorage();
  Audio8.announce();
  announcer();
  launchConfetti(50);
  Arena.celebrate();
  updateUI(); refreshAllShops(); save();
}

// ── CLICK SHOP ─────────────────────────────────────────────────
function renderClickShop() {
  const grid = $('#click-shop-grid');
  grid.innerHTML = '';
  CLICK_UPGRADES.forEach((u, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.ckid = u.id;
    card.style.setProperty('--ico-glow', u.color);
    card.innerHTML = `
      <div class="card-ico">${u.emoji}</div>
      <div class="card-body">
        <div class="card-name-row">
          <div class="card-name" data-ck-name></div>
        </div>
        <div class="card-rate">+${formatNum(u.power)}<span data-ck-perlabel></span></div>
        <div class="card-cost"><span>✨</span><span data-ck-cost>${formatNum(u.cost)}</span></div>
      </div>`;
    card.addEventListener('click', () => buyClickUpgrade(idx));
    grid.appendChild(card);
  });
  refreshClickShopText();
  updateClickShopStates();
}
function refreshClickShopText() {
  $('#click-shop-title-text').textContent = t().clickShopTitle;
  $('#click-shop-grid').querySelectorAll('.card').forEach((card, idx) => {
    card.querySelector('[data-ck-name]').textContent = t().clickUpgradeNames[CLICK_UPGRADES[idx].id];
    card.querySelector('[data-ck-perlabel]').textContent = t().clickPerClick;
  });
}
function updateClickShopStates() {
  $('#click-shop-count').textContent = `${State.clickLevel}/${CLICK_UPGRADES.length}`;
  $('#click-shop-grid').querySelectorAll('.card').forEach((card, idx) => {
    const u = CLICK_UPGRADES[idx];
    card.querySelector('[data-ck-cost]').textContent = formatNum(u.cost);
    card.classList.remove('owned', 'locked', 'buyable', 'active');
    if (idx < State.clickLevel) {
      card.classList.add('owned');
    } else if (idx === State.clickLevel) {
      card.classList.add(State.coins >= u.cost ? 'buyable' : 'active');
    } else {
      card.classList.add('locked');
    }
  });
}
function buyClickUpgrade(idx) {
  if (idx !== State.clickLevel) return;
  const u = CLICK_UPGRADES[idx];
  if (State.coins < u.cost) return;
  State.coins -= u.cost;
  State.clickLevel++;
  Audio8.buyClick();
  Audio8.announce();
  announcer();
  launchConfetti(50);
  Arena.celebrate();
  updateUI(); updateClickShopStates(); save();
}

let announceI = 0;
function buyUpgrade(id) {
  const u = UPGRADES.find(x => x.id === id);
  const idx = UPGRADES.indexOf(u);
  if (!u) return;
  if (idx > 0 && !(State.owned[UPGRADES[idx - 1].id] >= 1)) return;
  const cost = upgradeCost(u);
  if (State.coins < cost) return;

  State.coins -= cost;
  State.owned[id] = (State.owned[id] || 0) + 1;
  Audio8.buy();
  Audio8.announce();
  announcer();
  launchConfetti(50);
  Arena.celebrate();
  Audio8.syncMusic(() => State.owned);
  updateUI(); refreshAllShops(); save();

  if (ownedCount() === UPGRADES.length && !State.won) winGame();
}

// ── MK-style announcer ─────────────────────────────────────────
const announceLayer = $('#announce');
function announcer() {
  const lines = t().announce;
  const txt = lines[Math.min(announceI, lines.length-1)];
  announceI++;
  announceLayer.textContent = txt;
  announceLayer.classList.remove('go'); void announceLayer.offsetWidth;
  announceLayer.classList.add('go');
}

// ── juice ──────────────────────────────────────────────────────
function floatNum(x, y, txt) {
  const el = document.createElement('div');
  el.className = 'float-num'; el.textContent = txt;
  el.style.left = x+'px'; el.style.top = y+'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
function launchConfetti(n=30) {
  for (let i=0;i<n;i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random()*100+'vw';
    el.style.background = RAINBOW[(Math.random()*RAINBOW.length)|0];
    const sz = (Math.random()*9+5);
    el.style.width = sz+'px'; el.style.height = sz*(Math.random()*0.6+0.6)+'px';
    el.style.borderRadius = Math.random()>0.5 ? '50%' : '2px';
    const dur = (Math.random()*1.8+1.6).toFixed(2);
    el.style.animationDuration = dur+'s';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), dur*1000);
  }
}
function flash() {
  const el = document.createElement('div');
  el.className = 'flash';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

// award from a survived challenge
function awardChallenge(amt) {
  addCoins(amt);
  floatNum(window.innerWidth/2, window.innerHeight/2, `+${amt}`);
}

// ── WIN ────────────────────────────────────────────────────────
function winGame() {
  State.won = true; save();
  const win = $('#win');
  $('#win-title').textContent = t().gameWinTitle;
  $('#win-sub').textContent = t().gameWinSub;
  $('#win-btn').textContent = t().gameWinBtn;
  win.classList.add('show');
  Audio8.kiss();
  Audio8.fanfare();
  // confetti barrage
  launchConfetti(280);
  let burst = 0;
  const iv = setInterval(() => { launchConfetti(140); if (++burst>=5) clearInterval(iv); }, 700);
}
$('#win-btn').addEventListener('click', () => $('#win').classList.remove('show'));

// ── language ───────────────────────────────────────────────────
function applyLang() {
  document.documentElement.lang = LANG;
  $('#brand-sub').textContent = t().brandSub;
  $('#counter-label').textContent = t().counterLabel;
  $('#core-hint').textContent = t().coreHint;
  $('#shop-title-text').textContent = t().shopTitle;
  $('#nc-label').textContent = t().nextChallengeLab;
  updateMuteLabel();
  refreshShopText();
  refreshClickShopText();
  refreshStorageShopText();
  refreshTitle(true);
  updateUI();
  refreshAllShops();
  $$('.lang-toggle button').forEach(b => b.classList.toggle('active', b.dataset.lang === LANG));
}
const $$ = (s) => document.querySelectorAll(s);
$$('.lang-toggle button').forEach(b => {
  b.addEventListener('click', () => {
    LANG = b.dataset.lang;
    localStorage.setItem('ai_lang', LANG);
    applyLang();
  });
});

// ── mute ───────────────────────────────────────────────────────
const muteBtn = $('#mute');
function updateMuteLabel() {
  const m = Audio8.isMuted();
  muteBtn.textContent = m ? '🔇' : '🔊';
  muteBtn.classList.toggle('muted', m);
  muteBtn.title = m ? t().muteOff : t().muteOn;
}
muteBtn.addEventListener('click', () => {
  Audio8.ensure();
  Audio8.setMuted(!Audio8.isMuted());
  updateMuteLabel();
});

// ── boot ───────────────────────────────────────────────────────
load();
renderShop();
renderClickShop();
renderStorageShop();
applyLang();
lastLevel = currentLevel();
refreshTitle(true);
updateUI();
Audio8.syncMusic(() => State.owned);
Arena.init();
if (State.won) { /* already won earlier; let them keep playing */ }
