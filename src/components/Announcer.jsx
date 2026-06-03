import { useGameStore } from '../store/useGameStore';

export function Announcer() {
  const text = useGameStore(s => s.announceText);
  const key = useGameStore(s => s.announceKey);

  if (!text) return <div className="announce" />;

  return <div key={key} className="announce go">{text}</div>;
}
