'use client';

import { useEffect, useState } from 'react';
import { Picture, hasMedia, mediaMeta } from './Picture';

/**
 * Zahlenschloss im Vorschaubild (oben rechts) – echtes, freigestelltes Foto.
 * Kein Einflug: blendet weich ein, sobald „mit Zahlenschloss“ gewählt ist.
 * Farbe nach Verfügbarkeit: alle 4 s nächste Farbe, bei jedem Wechsel ein kurzes Aufleuchten.
 * Fotos je Farbe: medien/zubehoer/zahlenschloss/<farbe>.png → Medien-Key zs-<farbe>.
 * Liegt nur ein Foto vor, wechselt nur das farbige Leuchten dahinter.
 * Animiert werden nur opacity/transform (GPU) – keine Filter, kein Ruckeln.
 */
const LOCK_COLORS = [
  { key: 'schwarz', glow: '140, 140, 136' },
  { key: 'pink', glow: '240, 98, 146' },
  { key: 'gruen', glow: '124, 198, 63' },
  { key: 'orange', glow: '255, 122, 31' },
  { key: 'gelb', glow: '242, 207, 46' },
  { key: 'blau', glow: '47, 143, 220' },
];
const STEP_MS = 4000;
const grad = (rgb: string, a: number) => `radial-gradient(closest-side, rgba(${rgb}, ${a}), rgba(${rgb}, ${a * 0.35}) 55%, rgba(${rgb}, 0))`;

export function LockBadge({ on }: { on: boolean }) {
  const [state, setState] = useState<'hidden' | 'in' | 'out'>(on ? 'in' : 'hidden');
  const [i, setI] = useState(0);

  const photos = LOCK_COLORS.filter((c) => hasMedia(`zs-${c.key}`));

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
    if (state !== 'in') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((n) => n + 1), STEP_MS);
    return () => clearInterval(t);
  }, [state]);

  if (!photos.length || state === 'hidden') return null;
  // mehrere Farbfotos: Foto und Leuchten wechseln gemeinsam; nur eins: nur das Leuchten wechselt
  const shown = photos.length > 1 ? photos[i % photos.length].key : photos[0].key;
  const glow = photos.length > 1 ? LOCK_COLORS.find((c) => c.key === shown)! : LOCK_COLORS[i % LOCK_COLORS.length];

  return (
    <div className={`lockbadge is-${state}`}>
      <div className="lockbadge__shot" style={{ aspectRatio: `${mediaMeta(`zs-${photos[0].key}`).w} / ${mediaMeta(`zs-${photos[0].key}`).h}` }}>
        {LOCK_COLORS.map((c) => (
          <span key={c.key} className="lockbadge__aura" style={{ background: grad(c.glow, 0.24), opacity: c.key === glow.key ? 1 : 0 }} />
        ))}
        {/* key = Farbwechsel → Aufleuchten startet neu */}
        {i > 0 && <span key={i} className="lockbadge__flash" style={{ background: grad(glow.glow, 0.45) }} />}
        {photos.map((c) => (
          <Picture
            key={c.key}
            k={`zs-${c.key}`}
            alt={c.key === shown ? 'Zahlenschloss, im Lieferumfang der Variante mit Zahlenschloss' : ''}
            sizes="240px"
            priority
            className="lockbadge__img"
            style={{ opacity: c.key === shown ? 1 : 0 }}
          />
        ))}
      </div>
    </div>
  );
}
