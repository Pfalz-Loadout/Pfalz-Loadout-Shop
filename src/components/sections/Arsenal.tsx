'use client';

import { useEffect, useRef, useState } from 'react';
import { PRODUCTS } from '@/data/shop';
import { ProductCard } from './ProductCard';

/** Mobil: Produkte als Wisch-Karussell mit Fortschrittsanzeige */
export function Arsenal() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const cards = [...el.querySelectorAll<HTMLElement>('.pcard')];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(cards.indexOf(e.target as HTMLElement));
      },
      { root: el, threshold: 0.6 },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const go = (i: number) => {
    const el = track.current;
    const card = el?.querySelectorAll<HTMLElement>('.pcard')[i];
    if (el && card) el.scrollTo({ left: card.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft), behavior: 'smooth' });
  };

  return (
    <div className="arsenal">
      <div ref={track} className="arsenal__track" aria-label="Produkte – zum Wechseln wischen">
        {PRODUCTS.map((p, i) => (
          <ProductCard key={p.code} product={p} index={i} />
        ))}
      </div>
      <div className="arsenal__nav wrap">
        <div className="arsenal__bars" role="tablist" aria-label="Produkt wählen">
          {PRODUCTS.map((p, i) => (
            <button
              key={p.code}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`${p.code} ${p.name}`}
              onClick={() => go(i)}
            >
              <span className="mono">{p.code}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
