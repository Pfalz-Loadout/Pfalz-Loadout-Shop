'use client';

/** Pfeile links/rechts direkt auf dem Vorschaubild + Zähler (z. B. 2/3). */
export function ShotArrows({ index, count, onChange }: { index: number; count: number; onChange: (i: number) => void }) {
  if (count < 2) return null;
  const go = (d: number) => onChange((index + d + count) % count);
  return (
    <>
      <button type="button" className="shot-arrow shot-arrow--prev" onClick={() => go(-1)} aria-label={`Vorheriges Bild (${index + 1} von ${count})`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <button type="button" className="shot-arrow shot-arrow--next" onClick={() => go(1)} aria-label={`Nächstes Bild (${index + 1} von ${count})`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <span className="shot-count mono" aria-hidden="true">
        {index + 1}/{count}
      </span>
    </>
  );
}
