import { create } from 'zustand';
import { UPGRADES, CLICK_UPGRADES, STORAGE_UPGRADES, LEVEL_THRESHOLDS, BASE_STORAGE } from '../data/constants';
import { I18N } from '../data/i18n';
import { Audio8 } from '../audio/Audio8';
import { launchConfetti, flash } from '../utils/index';

const SAVE_KEY = 'ai_save';
const LANG_KEY = 'ai_lang';

// ── Pure helpers ────────────────────────────────────────────────────
export function calcRate(owned) {
  return UPGRADES.reduce((s, u) => s + (owned[u.id] || 0) * u.rate, 0);
}
export function calcClickPower(clickLevel) {
  return 1 + CLICK_UPGRADES.slice(0, clickLevel).reduce((s, u) => s + u.power, 0);
}
export function calcMaxStorage(storageLevel) {
  return storageLevel === 0 ? BASE_STORAGE : STORAGE_UPGRADES[storageLevel - 1].cap;
}
export function calcUpgradeCost(u, owned) {
  return Math.floor(u.cost * Math.pow(1.15, owned[u.id] || 0));
}
export function calcLevel(totalCoins) {
  let lv = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--)
    if (totalCoins >= LEVEL_THRESHOLDS[i]) { lv = i; break; }
  return lv;
}
export function calcOwnedCount(owned) {
  return UPGRADES.filter(u => (owned[u.id] || 0) >= 1).length;
}

// ── Persistence ─────────────────────────────────────────────────────
let _saveTimer = null;
function persistSave(state) {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      coins: state.coins, totalCoins: state.totalCoins, totalClicks: state.totalClicks,
      clicksToChallenge: state.clicksToChallenge, challengeWave: state.challengeWave,
      owned: state.owned, clickLevel: state.clickLevel, storageLevel: state.storageLevel,
      won: state.won,
    }));
    _saveTimer = null;
  }, 800);
}

// ── Store ────────────────────────────────────────────────────────────
export const useGameStore = create((set, get) => ({
  // Persisted game state
  coins: 0, totalCoins: 0, totalClicks: 0,
  clicksToChallenge: 500, challengeWave: 0,
  owned: {}, clickLevel: 0, storageLevel: 0, won: false,

  // Session UI state
  lang: localStorage.getItem(LANG_KEY) || 'es',
  muted: localStorage.getItem('ai_muted') === '1',
  challengeActive: false,
  challengeResult: null,  // 'win' | 'lose' | null
  announceText: '',
  announceKey: 0,
  _announceIdx: 0,
  nowPlaying: '',

  // ── Load / Save ──────────────────────────────────────────────────
  load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!s) return;
      if (s.owned) {
        Object.keys(s.owned).forEach(k => {
          if (typeof s.owned[k] === 'boolean') s.owned[k] = s.owned[k] ? 1 : 0;
        });
      }
      set({
        coins: s.coins || 0,
        totalCoins: s.totalCoins || 0,
        totalClicks: s.totalClicks || 0,
        clicksToChallenge: s.clicksToChallenge ?? 500,
        challengeWave: s.challengeWave || 0,
        owned: s.owned || {},
        clickLevel: s.clickLevel || 0,
        storageLevel: s.storageLevel || 0,
        won: s.won || false,
      });
    } catch (_) {}
  },

  // ── Core actions ─────────────────────────────────────────────────
  addCoins(amt) {
    const state = get();
    const max = calcMaxStorage(state.storageLevel);
    const actual = Math.min(amt, max - state.coins);
    if (actual <= 0) return;

    const newCoins = state.coins + actual;
    const newTotal = state.totalCoins + actual;
    const prevLv = calcLevel(state.totalCoins);
    const newLv = calcLevel(newTotal);

    set({ coins: newCoins, totalCoins: newTotal });
    persistSave({ ...state, coins: newCoins, totalCoins: newTotal });

    if (max !== Infinity) {
      const pct = Math.min(100, (newCoins / max) * 100);
      if (pct >= 90) Audio8.storageWarn(pct);
    }

    if (newLv > prevLv) {
      Audio8.laugh(newLv);
      launchConfetti(90);
      flash();
      window.dispatchEvent(new Event('arena:celebrate'));
    }
  },

  clickCore() {
    Audio8.ensure();
    const state = get();
    const cp = calcClickPower(state.clickLevel);
    get().addCoins(cp);
    Audio8.click();

    let newClicks = state.clicksToChallenge - 1;
    let newWave = state.challengeWave;
    let triggerChallenge = false;

    if (newClicks <= 0) {
      newClicks = 500;
      newWave = state.challengeWave + 1;
      triggerChallenge = true;
    }

    set({ totalClicks: state.totalClicks + 1, clicksToChallenge: newClicks, challengeWave: newWave });
    persistSave(get());

    if (triggerChallenge) get().startChallenge();
  },

  // ── Shop ─────────────────────────────────────────────────────────
  buyUpgrade(id) {
    const state = get();
    const u = UPGRADES.find(x => x.id === id);
    const idx = UPGRADES.indexOf(u);
    if (!u) return;
    if (idx > 0 && !(state.owned[UPGRADES[idx - 1].id] >= 1)) return;
    const cost = calcUpgradeCost(u, state.owned);
    if (state.coins < cost) return;

    const newOwned = { ...state.owned, [id]: (state.owned[id] || 0) + 1 };
    set({ coins: state.coins - cost, owned: newOwned });
    Audio8.buy();
    Audio8.announce();
    get()._announce();
    launchConfetti(50);
    window.dispatchEvent(new Event('arena:celebrate'));
    Audio8.syncMusic(() => get().owned);
    persistSave(get());

    if (calcOwnedCount(newOwned) === UPGRADES.length && !state.won) get().winGame();
  },

  buyClickUpgrade(idx) {
    const state = get();
    if (idx !== state.clickLevel) return;
    const u = CLICK_UPGRADES[idx];
    if (state.coins < u.cost) return;
    set({ coins: state.coins - u.cost, clickLevel: state.clickLevel + 1 });
    Audio8.buyClick();
    Audio8.announce();
    get()._announce();
    launchConfetti(50);
    window.dispatchEvent(new Event('arena:celebrate'));
    persistSave(get());
  },

  buyStorageUpgrade(idx) {
    const state = get();
    if (idx !== state.storageLevel) return;
    const u = STORAGE_UPGRADES[idx];
    if (state.coins < u.cost) return;
    set({ coins: state.coins - u.cost, storageLevel: state.storageLevel + 1 });
    Audio8.buyStorage();
    Audio8.announce();
    get()._announce();
    launchConfetti(50);
    window.dispatchEvent(new Event('arena:celebrate'));
    persistSave(get());
  },

  // ── Announcer ────────────────────────────────────────────────────
  _announce() {
    const state = get();
    const lines = I18N[state.lang].announce;
    const txt = lines[Math.min(state._announceIdx, lines.length - 1)];
    set({ announceText: txt, announceKey: state.announceKey + 1, _announceIdx: state._announceIdx + 1 });
  },

  // ── Challenge ────────────────────────────────────────────────────
  startChallenge() {
    Audio8.ensure();
    Audio8.startChallengeMusic();
    set({ challengeActive: true, challengeResult: null });
  },

  endChallenge(survived) {
    if (survived) {
      get().addCoins(200);
      Audio8.fanfare();
      launchConfetti(120);
    } else {
      Audio8.fail();
    }
    set({ challengeResult: survived ? 'win' : 'lose' });
  },

  closeChallenge() {
    Audio8.resumeNormalMusic();
    set({ challengeActive: false, challengeResult: null });
  },

  // ── Win ──────────────────────────────────────────────────────────
  winGame() {
    set({ won: true });
    Audio8.kiss();
    Audio8.fanfare();
    launchConfetti(280);
    let burst = 0;
    const iv = setInterval(() => { launchConfetti(140); if (++burst >= 5) clearInterval(iv); }, 700);
    persistSave(get());
  },

  // ── Settings ─────────────────────────────────────────────────────
  setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    set({ lang });
  },

  toggleMute() {
    const m = !get().muted;
    Audio8.setMuted(m);
    set({ muted: m });
    if (window.YTPlayer) { m ? window.YTPlayer.mute() : window.YTPlayer.unMute(); }
  },

  setNowPlaying(title) { set({ nowPlaying: title }); },
}));

// Save on page close
window.addEventListener('beforeunload', () => {
  const s = useGameStore.getState();
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    coins: s.coins, totalCoins: s.totalCoins, totalClicks: s.totalClicks,
    clicksToChallenge: s.clicksToChallenge, challengeWave: s.challengeWave,
    owned: s.owned, clickLevel: s.clickLevel, storageLevel: s.storageLevel, won: s.won,
  }));
});

// Passive income loop
setInterval(() => {
  const s = useGameStore.getState();
  const r = calcRate(s.owned);
  if (r > 0) s.addCoins(r / 10);
}, 100);
