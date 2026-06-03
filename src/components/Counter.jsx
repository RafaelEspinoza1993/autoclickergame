import { useState, useEffect } from 'react';
import { useGameStore, calcRate, calcClickPower, calcMaxStorage, calcLevel } from '../store/useGameStore';
import { LEVEL_THRESHOLDS, RAINBOW } from '../data/constants';
import { I18N } from '../data/i18n';
import { formatNum } from '../utils/index';

export function Counter() {
  const coins = useGameStore(s => s.coins);
  const totalCoins = useGameStore(s => s.totalCoins);
  const owned = useGameStore(s => s.owned);
  const clickLevel = useGameStore(s => s.clickLevel);
  const storageLevel = useGameStore(s => s.storageLevel);
  const clicksToChallenge = useGameStore(s => s.clicksToChallenge);
  const lang = useGameStore(s => s.lang);
  const tx = I18N[lang];

  const rate = calcRate(owned);
  const cp = calcClickPower(clickLevel);
  const max = calcMaxStorage(storageLevel);
  const level = calcLevel(totalCoins);

  const [hueIdx, setHueIdx] = useState(0);
  const [prevLevel, setPrevLevel] = useState(level);

  useEffect(() => {
    const id = setInterval(() => setHueIdx(i => i + 1), 700);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setPrevLevel(level);
  }, [level]);

  const titleColor = RAINBOW[hueIdx % RAINBOW.length];
  const titleText = tx.levels[level].replace(/\n/g, '<br>');

  const sPct = max === Infinity ? 0 : Math.min(100, (coins / max) * 100);
  const ncPct = Math.max(0, Math.min(100, (1 - clicksToChallenge / 500) * 100));

  let storageClass = 'storage-bar-wrap';
  if (max !== Infinity) {
    if (sPct >= 100) storageClass += ' full';
    else if (sPct >= 70) storageClass += ' warn';
  }

  return (
    <>
      <div className="counter">
        <div className="counter-num">
          <span className="spark">✨</span>
          <span id="coin-amount">{formatNum(coins)}</span>
        </div>
        <div className="counter-label">{tx.counterLabel}</div>
        <div className="rate-pill">
          <span className="dot" />
          <span>+{formatNum(rate)}{tx.rate}</span>
        </div>
        <div className="rate-pill click-pill">
          <span>👆</span>
          <span>+{formatNum(cp)}{tx.clickPerClick}</span>
        </div>
      </div>

      <div className={storageClass}>
        <div className="storage-label">
          <span>{tx.storageLabel}</span>
          <span>{max === Infinity ? '∞' : `${formatNum(coins)} / ${formatNum(max)}`}</span>
        </div>
        <div className="storage-track">
          <div className="storage-fill" style={{ width: `${sPct}%` }} />
        </div>
      </div>

      <div
        className="title"
        style={{ color: titleColor, textShadow: `0 0 26px ${titleColor}66` }}
        dangerouslySetInnerHTML={{ __html: titleText }}
      />

      <div className="next-challenge">
        <div className="nc-label">
          <span>{tx.nextChallengeLab}</span>
          <span>{tx.nextChallengeClicks(clicksToChallenge)}</span>
        </div>
        <div className="nc-track">
          <div className="nc-fill" style={{ width: `${ncPct}%` }} />
        </div>
      </div>
    </>
  );
}
