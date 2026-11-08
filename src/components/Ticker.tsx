import { PRODUCTS, SHOP, formatEuro, minPrice } from '@/data/shop';

/** Militärisches Laufband: Codes, Preise, Koordinaten – läuft endlos durch */
export function Ticker() {
  const items = [
    ...PRODUCTS.map((p) => `${p.code} ${p.name.toUpperCase()} — AB ${formatEuro(minPrice(p))}`),
    `${SHOP.coords.lat} / ${SHOP.coords.lon} ${SHOP.coords.label.toUpperCase()}`,
    'VERSAND AUS WORMS',
    `SET −${SHOP.bundle.percent} % AB ${SHOP.bundle.minDistinctProducts} TEILEN`,
  ];
  const row = (
    <span className="ticker__row">
      {items.map((t, i) => (
        <span key={i} className="ticker__item">
          <i aria-hidden="true" />
          {t}
        </span>
      ))}
    </span>
  );
  return (
    <div className="ticker mono" aria-hidden="true">
      <div className="ticker__track">
        {row}
        {row}
      </div>
    </div>
  );
}
