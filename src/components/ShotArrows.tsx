'use client';

/** Dezente Bildwechsel-Leiste mittig unter dem Artikel: ‹ 1/3 › */
export function ShotArrows({ index, count, onChange }: { index: number; count: number; onChange: (i: number) => void }) {
  if (count < 2) return null;
  const go = (d: number) => onChange((index + d + count) % count);
  return (
    <div className="shot-nav" role="group" aria-label="Bild wechseln">
      <button type="button" className="shot-nav__btn" onClick={() => go(-1)} aria-label={`Vorheriges Bild (${index + 1} von ${count})`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <span className="shot-nav__count mono" aria-hidden="true">
        {index + 1}/{count}
      </span>
      <button type="button" className="shot-nav__btn" onClick={() => go(1)} aria-label={`Nächstes Bild (${index + 1} von ${count})`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
