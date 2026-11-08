'use client';

import { useEffect, useRef, useState } from 'react';
import { formatEuro, SHOP } from '@/data/shop';
import { useCart } from './cart/CartProvider';
import { pull, scrollToId } from './MotionProvider';

/**
 * Mobile Loadout-Leiste: erscheint nach dem Hero, zählt live mit,
 * zeigt Set-Rabatt und führt zum Warenkorb. Kurzer „Puls“ bei Änderung.
 */
export function LoadoutBar() {
  const { count, totals, setCartOpen } = useCart();
  const [show, setShow] = useState(false);
  const [bump, setBump] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const prev = useRef(count);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (count !== prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 600);
      prev.current = count;
      return () => clearTimeout(t);
    }
  }, [count]);

  const missing = SHOP.bundle.minDistinctProducts - totals.distinctProducts;
  return (
    <div className={`lbar${show ? ' is-on' : ''}${bump ? ' is-bump' : ''}`} role="region" aria-label="Dein Loadout">
      <div className="lbar__info">
        <span className="mono lbar__label">
          Loadout · {count} {count === 1 ? 'Teil' : 'Teile'}
        </span>
        <span className="lbar__sum">{count ? formatEuro(totals.totalCents) : 'Noch leer'}</span>
        <span className="mono lbar__hint">
          {totals.bundleActive
            ? `Set −${SHOP.bundle.percent} % aktiv`
            : count && missing > 0
              ? `Noch ${missing} Teil → −${SHOP.bundle.percent} %`
              : count
                ? ''
                : 'Stell dein Set zusammen'}
        </span>
      </div>
      <button
        ref={btn}
        type="button"
        className="btn btn--signal tab lbar__btn"
        onClick={() => {
          pull(btn.current);
          if (count) setCartOpen(true);
          else scrollToId('ausruestung');
        }}
      >
        {count ? 'Warenkorb' : 'Ausrüsten'}
      </button>
    </div>
  );
}
