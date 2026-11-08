'use client';

import { useRef } from 'react';
import { SHOP } from '@/data/shop';
import { useCart } from './cart/CartProvider';
import { pull, scrollToId } from './MotionProvider';

const NAV = [
  { id: 'ausruestung', label: 'Ausrüstung' },
  { id: 'labor', label: 'Materiallabor' },
  { id: 'einsatz', label: 'Einsatz' },
  { id: 'loadout', label: 'Loadout' },
];

export function Header() {
  const { count, setCartOpen } = useCart();
  const btn = useRef<HTMLButtonElement>(null);
  return (
    <header className="hdr">
      <a className="hdr__brand" href="/#top" aria-label="PFALZ LOADOUT – zum Seitenanfang">
        <img src="/media/logo-badge-160.webp" alt="" width={36} height={36} />
        <span className="hdr__word">PFALZ LOADOUT</span>
      </a>
      <nav className="hdr__nav mono" aria-label="Hauptnavigation">
        {NAV.map((n) => (
          <a
            key={n.id}
            href={`/#${n.id}`}
            onClick={(e) => {
              if (location.pathname !== '/') return;
              e.preventDefault();
              scrollToId(n.id);
            }}
          >
            {n.label}
          </a>
        ))}
      </nav>
      <span className="hdr__coords mono" aria-hidden="true">
        {SHOP.coords.lat} / {SHOP.coords.lon}
      </span>
      <button
        ref={btn}
        type="button"
        className="btn hdr__cart tab"
        onClick={() => {
          pull(btn.current);
          setCartOpen(true);
        }}
        aria-label={`Warenkorb öffnen, ${count} Artikel`}
      >
        <svg className="hdr__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 8h12l-1 12H7L6 8Z M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="hdr__cart-label">Warenkorb</span> <span className="hdr__count">{count}</span>
      </button>
    </header>
  );
}
