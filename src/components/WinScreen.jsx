import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { I18N } from '../data/i18n';

export function WinScreen() {
  const won = useGameStore(s => s.won);
  const lang = useGameStore(s => s.lang);
  const tx = I18N[lang];
  const [hidden, setHidden] = useState(false);

  if (!won || hidden) return null;

  return (
    <div className="win show">
      <div className="kiss">💋</div>
      <h1>{tx.gameWinTitle}</h1>
      <p>{tx.gameWinSub}</p>
      <button className="win-btn" onClick={() => setHidden(true)}>
        {tx.gameWinBtn}
      </button>
    </div>
  );
}
