'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Zahlenschloss-Badge: fliegt beim Wählen von „mit Zahlenschloss“ vom Auswahl-Button
 * ins Produktbild, bleibt dort leuchtend stehen und verblasst beim Abwählen.
 * Gezeichnet nach den verfügbaren Schlössern: TSA-Vorhängeschloss, Stahlbügel,
 * schwarzes Gehäuse mit farbigem U-Rahmen (Farbe nach Verfügbarkeit → Rahmen wechselt langsam durch).
 */
export function LockBadge({ on, origin }: { on: boolean; origin: React.RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'hidden' | 'in' | 'out'>(on ? 'in' : 'hidden');
  const first = useRef(true);

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (on) {
      // Flugweg: vom angeklickten Button zur Endposition im Bild
      const el = ref.current;
      const o = origin.current;
      if (el && o) {
        const a = o.getBoundingClientRect();
        const b = el.getBoundingClientRect();
        el.style.setProperty('--dx', `${a.left + a.width / 2 - (b.left + b.width / 2)}px`);
        el.style.setProperty('--dy', `${a.top + a.height / 2 - (b.top + b.height / 2)}px`);
      }
      setState('in');
    } else if (state !== 'hidden') {
      setState('out');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  useEffect(() => {
    if (state !== 'out') return;
    const t = setTimeout(() => setState('hidden'), 500);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <div ref={ref} className={`lockbadge is-${state}`} aria-hidden={state !== 'in'}>
      <svg viewBox="0 0 100 132" role="img" aria-label="Zahlenschloss inklusive, Farbe nach Verfügbarkeit">
        <defs>
          <linearGradient id="lb-steel" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8d8d89" />
            <stop offset="0.35" stopColor="#f4f4f2" />
            <stop offset="0.7" stopColor="#a9a9a5" />
            <stop offset="1" stopColor="#e2e2de" />
          </linearGradient>
        </defs>
        {/* Bügel */}
        <path d="M29 58 V32 a21 21 0 0 1 42 0 V58" fill="none" stroke="url(#lb-steel)" strokeWidth="8" strokeLinecap="round" />
        {/* Gehäuse schwarz + farbiger U-Rahmen */}
        <rect x="12" y="50" width="76" height="78" rx="11" fill="#141414" />
        <rect className="lockbadge__frame" x="12" y="58" width="76" height="70" rx="11" />
        <rect x="29" y="56" width="42" height="62" rx="6" fill="#151515" />
        <rect x="12" y="50" width="76" height="9" rx="4" fill="#1d1d1c" />
        {/* TSA-Raute */}
        <path d="M43 70 l7 -6 l7 6 l-7 6 Z" fill="#d42a2a" />
        <path d="M46 70 l4 -3 l4 3 l-4 3 Z" fill="#ffffff" opacity="0.85" />
        {/* drei Zahlenräder */}
        {[86, 98, 110].map((y) => (
          <g key={y}>
            <rect x="34" y={y - 7} width="32" height="11" rx="2" fill="#0b0b0b" />
            <text x="50" y={y + 2} textAnchor="middle" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#efede8" letterSpacing="2">
              301
            </text>
          </g>
        ))}
      </svg>
      <span className="lockbadge__tag mono">+ Zahlenschloss</span>
    </div>
  );
}
