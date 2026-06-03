import { useRef } from 'react';
import { useGameStore, calcClickPower } from '../store/useGameStore';
import { I18N } from '../data/i18n';
import { floatNum, launchConfetti } from '../utils/index';
import { formatNum } from '../utils/index';

export function CoreButton({ phaserRef }) {
  const coreRef = useRef(null);
  const clickCore = useGameStore(s => s.clickCore);
  const clickLevel = useGameStore(s => s.clickLevel);
  const lang = useGameStore(s => s.lang);
  const tx = I18N[lang];

  function handleClick(e) {
    const btn = coreRef.current;
    btn.classList.remove('punch');
    void btn.offsetWidth;
    btn.classList.add('punch');

    clickCore();

    const cp = calcClickPower(clickLevel);
    floatNum(e.clientX, e.clientY, `+${formatNum(cp)}`);
    launchConfetti(4);

    phaserRef?.current?.emitAt(e.clientX, e.clientY);
  }

  return (
    <>
      <div className="core-wrap">
        <button
          ref={coreRef}
          className="core"
          aria-label="Producir arcoíris"
          onClick={handleClick}
        >
          <span className="glyph">🌈</span>
        </button>
      </div>
      <div className="core-hint">{tx.coreHint}</div>
    </>
  );
}
