'use client';

import { useEffect, useState } from 'react';
import { Picture, hasMedia, mediaMeta } from './Picture';

/**
 * QD-Öse (dazubuchbare Option beim Gewehrgurt): Originalfoto, freigestellt, oben rechts im Vorschaubild.
 * Statisch in fester Größe auf jedem Bild; blendet weich ein/aus, sobald „+ QD-Öse“ gewählt/abgewählt wird.
 * Quelle: medien/zubehoer/qd-oese/qd-oese.jpg → python -I scripts/qd-freistellen.py → node scripts/medien.mjs zb-qd
 */
export function QdBadge({ on }: { on: boolean }) {
  const [state, setState] = useState<'hidden' | 'in' | 'out'>(on ? 'in' : 'hidden');
  useEffect(() => {
    if (on) setState('in');
    else setState((s) => (s === 'hidden' ? s : 'out'));
  }, [on]);
  useEffect(() => {
    if (state !== 'out') return;
    const t = setTimeout(() => setState('hidden'), 520);
    return () => clearTimeout(t);
  }, [state]);

  if (!hasMedia('zb-qd') || state === 'hidden') return null;
  const m = mediaMeta('zb-qd');
  return (
    <div className={`lockbadge qdbadge is-${state}`}>
      <div className="lockbadge__shot" style={{ aspectRatio: `${m.w} / ${m.h}` }}>
        <Picture k="zb-qd" alt="QD-Öse mit Montageplatte, dazubuchbare Option" sizes="120px" priority className="lockbadge__img" />
      </div>
      <span className="badge-incl badge-incl--plus mono">+ Extra</span>
    </div>
  );
}
