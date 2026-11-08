'use client';

import { useEffect, useState } from 'react';
import { Picture, hasMedia, mediaMeta } from './Picture';

/**
 * Zahlenschloss im Vorschaubild (oben rechts) – Original-Herstellerfotos, freigestellt.
 * Kein Einflug: blendet weich ein, sobald „mit Zahlenschloss“ gewählt ist.
 * Farbe nach Verfügbarkeit: alle 4 s nächste Farbe. Beim Wechsel leuchtet NUR das farbige Gehäuse kurz auf
 * (eigene Bildebene zs-<farbe>-glow, gleiche Leinwand wie das Foto) – kein Schein hinter dem Schloss.
 * Animiert werden nur opacity/transform (GPU) – keine Filter, kein Ruckeln.
 * Quelle: medien/zubehoer/zahlenschloss/<farbe>.jpg → python -I scripts/schloss-freistellen.py → node scripts/medien.mjs zs-
 */
const LOCK_COLORS = ['schwarz', 'pink', 'gruen', 'orange', 'gelb', 'blau'];
const STEP_MS = 4000;

export function LockBadge({ on }: { on: boolean }) {
  const [state, setState] = useState<'hidden' | 'in' | 'out'>(on ? 'in' : 'hidden');
  const [i, setI] = useState(0);

  const photos = LOCK_COLORS.filter((c) => hasMedia(`zs-${c}`));

  useEffect(() => {
    if (on) setState('in');
    else setState((s) => (s === 'hidden' ? s : 'out'));
  }, [on]);

  useEffect(() => {
    if (state !== 'out') return;
    const t = setTimeout(() => setState('hidden'), 520);
    return () => clearTimeout(t);
  }, [state]);

  // Farbwechsel nur, solange sichtbar und Bewegung erlaubt
  useEffect(() => {
    if (state !== 'in' || photos.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((n) => n + 1), STEP_MS);
    return () => clearInterval(t);
  }, [state, photos.length]);

  if (!photos.length || state === 'hidden') return null;
  const shown = photos[i % photos.length];
  const meta = mediaMeta(`zs-${photos[0]}`);

  return (
    <div className={`lockbadge is-${state}`}>
      <div className="lockbadge__shot" style={{ aspectRatio: `${meta.w} / ${meta.h}` }}>
        {photos.map((c) => (
          <Picture
            key={c}
            k={`zs-${c}`}
            alt={c === shown ? 'Zahlenschloss, im Lieferumfang der Variante mit Zahlenschloss' : ''}
            sizes="200px"
            priority
            className="lockbadge__img"
            style={{ opacity: c === shown ? 1 : 0 }}
          />
        ))}
        {/* Leucht-Ebenen vorab geladen (unsichtbar); key = Farbwechsel → Aufleuchten startet neu */}
        {photos
          .filter((c) => hasMedia(`zs-${c}-glow`))
          .map((c) => (
            <span key={c === shown ? `${c}-${i}` : c} className={`lockbadge__glow${c === shown && i > 0 ? ' is-flash' : ''}`}>
              <Picture k={`zs-${c}-glow`} alt="" sizes="200px" priority className="lockbadge__img" />
            </span>
          ))}
      </div>
      <span className="badge-incl mono">inklusive</span>
    </div>
  );
}
