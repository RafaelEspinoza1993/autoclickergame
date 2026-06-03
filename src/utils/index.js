import { RAINBOW } from '../data/constants';

export function formatNum(n) {
  n = Math.floor(n);
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}

export function floatNum(x, y, txt) {
  const el = document.createElement('div');
  el.className = 'float-num';
  el.textContent = txt;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

export function launchConfetti(n = 30) {
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = RAINBOW[(Math.random() * RAINBOW.length) | 0];
    const sz = Math.random() * 9 + 5;
    el.style.width = sz + 'px';
    el.style.height = sz * (Math.random() * 0.6 + 0.6) + 'px';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    const dur = (Math.random() * 1.8 + 1.6).toFixed(2);
    el.style.animationDuration = dur + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000);
  }
}

export function flash() {
  const el = document.createElement('div');
  el.className = 'flash';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
}
