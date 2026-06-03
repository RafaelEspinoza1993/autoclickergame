import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { I18N } from '../data/i18n';
import { ArenaGame } from '../game/ArenaGame';

export function ChallengeModal() {
  const challengeActive = useGameStore(s => s.challengeActive);
  const challengeResult = useGameStore(s => s.challengeResult);
  const wave = useGameStore(s => s.challengeWave);
  const lang = useGameStore(s => s.lang);
  const closeChallenge = useGameStore(s => s.closeChallenge);
  const storageLevel = useGameStore(s => s.storageLevel);
  const tx = I18N[lang];

  const reward = 200 + storageLevel * 50;

  const hpBarRef = useRef(null);
  const timeBarRef = useRef(null);
  const killsRef = useRef(null);

  // Direct DOM updates for per-frame HUD — avoids React re-renders
  useEffect(() => {
    if (!challengeActive) return;
    const handler = (e) => {
      const { hpPct, timePct, kills } = e.detail;
      if (hpBarRef.current) hpBarRef.current.style.width = hpPct + '%';
      if (timeBarRef.current) timeBarRef.current.style.width = timePct + '%';
      if (killsRef.current) killsRef.current.textContent = kills;
    };
    window.addEventListener('arena:tick', handler);
    return () => window.removeEventListener('arena:tick', handler);
  }, [challengeActive]);

  if (!challengeActive) return null;

  return (
    <div className="challenge show">
      <div className="ch-panel">
        <div className="ch-head">
          <div>
            <div className="ch-title">{tx.chTitle}</div>
            <div className="ch-instr">{tx.chInstr}</div>
          </div>
          <div className="ch-stats">
            <div className="ch-stat">
              <div className="k">{tx.chWave}</div>
              <div className="v">{wave}</div>
            </div>
            <div className="ch-stat">
              <div className="k">{tx.chKills}</div>
              <div className="v" ref={killsRef}>0</div>
            </div>
          </div>
        </div>

        <div className="ch-bars">
          <div className="ch-bar">
            <div className="lab">
              <span>{tx.chBase}</span><span>❤</span>
            </div>
            <div className="ch-track hp">
              <div ref={hpBarRef} style={{ width: '100%' }} />
            </div>
          </div>
          <div className="ch-bar">
            <div className="lab">
              <span>{tx.chTime}</span><span>⏱</span>
            </div>
            <div className="ch-track time">
              <div ref={timeBarRef} style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        <div className="ch-canvas-wrap">
          <ArenaGame />

          {challengeResult && (
            <div className={`ch-result ${challengeResult} show`}>
              <h2>
                {challengeResult === 'win' ? tx.winTitle : tx.loseTitle}
              </h2>
              <p>
                {challengeResult === 'win' ? tx.winSub : tx.loseSub}
              </p>
              {challengeResult === 'win' && (
                <div className="reward">{tx.reward(reward)}</div>
              )}
              <button className="ch-continue" onClick={closeChallenge}>
                {tx.continue}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
