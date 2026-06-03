import { useGameStore, calcUpgradeCost, calcOwnedCount } from '../store/useGameStore';
import { UPGRADES, CLICK_UPGRADES, STORAGE_UPGRADES } from '../data/constants';
import { I18N } from '../data/i18n';
import { formatNum } from '../utils/index';

function ShopCard({ emoji, name, sub, cost, badge, canAfford, isOwned, isLocked, onClick, color }) {
  let cls = 'card';
  if (isLocked) cls += ' locked';
  else if (isOwned) cls += ' owned';
  if (canAfford && !isLocked) cls += ' buyable';
  else if (!isLocked && !isOwned) cls += ' active';

  return (
    <div
      className={cls}
      style={{ '--ico-glow': color }}
      onClick={!isLocked ? onClick : undefined}
    >
      <div className="card-ico">{emoji}</div>
      <div className="card-body">
        <div className="card-name-row">
          <div className="card-name">{name}</div>
          {badge && <div className={`card-lvbadge${badge ? ' has-lvl' : ''}`}>{badge}</div>}
        </div>
        <div className="card-rate">{sub}</div>
        <div className="card-cost"><span>✨</span><span>{formatNum(cost)}</span></div>
      </div>
    </div>
  );
}

export function Shop() {
  const coins = useGameStore(s => s.coins);
  const owned = useGameStore(s => s.owned);
  const clickLevel = useGameStore(s => s.clickLevel);
  const storageLevel = useGameStore(s => s.storageLevel);
  const totalCoins = useGameStore(s => s.totalCoins);
  const lang = useGameStore(s => s.lang);
  const buyUpgrade = useGameStore(s => s.buyUpgrade);
  const buyClickUpgrade = useGameStore(s => s.buyClickUpgrade);
  const buyStorageUpgrade = useGameStore(s => s.buyStorageUpgrade);
  const tx = I18N[lang];

  const ownedCount = calcOwnedCount(owned);

  return (
    <section className="shop">
      {/* Factory upgrades */}
      <div className="shop-head">
        <div className="shop-title">🏭 <span>{tx.shopTitle}</span></div>
        <div className="shop-count">{ownedCount}/{UPGRADES.length}</div>
      </div>
      <div className="shop-grid">
        {UPGRADES.map((u, idx) => {
          const lvl = owned[u.id] || 0;
          const prevUnlocked = idx === 0 || (owned[UPGRADES[idx - 1].id] || 0) >= 1;
          const cost = calcUpgradeCost(u, owned);
          return (
            <ShopCard
              key={u.id}
              emoji={u.emoji}
              name={tx.upgradeNames[u.id]}
              sub={`+${formatNum(u.rate)}${tx.rate} / ${tx.level}`}
              cost={cost}
              badge={lvl > 0 ? `${tx.level} ${lvl}` : ''}
              canAfford={coins >= cost}
              isOwned={lvl > 0}
              isLocked={!prevUnlocked}
              color={u.color}
              onClick={() => buyUpgrade(u.id)}
            />
          );
        })}
      </div>

      <div className="shop-divider" />

      {/* Click tech upgrades */}
      <div className="shop-head">
        <div className="shop-title">⚡ <span>{tx.clickShopTitle}</span></div>
        <div className="shop-count">{clickLevel}/{CLICK_UPGRADES.length}</div>
      </div>
      <div className="shop-grid">
        {CLICK_UPGRADES.map((u, idx) => (
          <ShopCard
            key={u.id}
            emoji={u.emoji}
            name={tx.clickUpgradeNames[u.id]}
            sub={`+${formatNum(u.power)}${tx.clickPerClick}`}
            cost={u.cost}
            badge=""
            canAfford={coins >= u.cost && idx === clickLevel}
            isOwned={idx < clickLevel}
            isLocked={idx > clickLevel}
            color={u.color}
            onClick={() => buyClickUpgrade(idx)}
          />
        ))}
      </div>

      <div className="shop-divider" />

      {/* Storage upgrades */}
      <div className="shop-head">
        <div className="shop-title">📦 <span>{tx.storageShopTitle}</span></div>
        <div className="shop-count">{storageLevel}/{STORAGE_UPGRADES.length}</div>
      </div>
      <div className="shop-grid">
        {STORAGE_UPGRADES.map((u, idx) => (
          <ShopCard
            key={u.id}
            emoji={u.emoji}
            name={tx.storageUpgradeNames[u.id]}
            sub={`${u.cap === Infinity ? '∞' : formatNum(u.cap)} ${tx.storageCap}`}
            cost={u.cost}
            badge=""
            canAfford={coins >= u.cost && idx === storageLevel}
            isOwned={idx < storageLevel}
            isLocked={idx > storageLevel}
            color={u.color}
            onClick={() => buyStorageUpgrade(idx)}
          />
        ))}
      </div>

      <div className="statusbar">
        <span>{tx.total}: <b>{formatNum(totalCoins)}</b></span>
        <span>{tx.upgrades}: <b>{ownedCount}/{UPGRADES.length}</b></span>
      </div>
    </section>
  );
}
