import { Picture, hasMedia, mediaMeta } from './Picture';

/**
 * Zubehör, das immer dabei ist (z. B. PVC-Patch beim IFAK): sitzt wie das Zahlenschloss oben rechts
 * im Vorschaubild, blendet weich ein, das rote Kreuz leuchtet in Abständen kurz auf (nur opacity animiert).
 */
export function PatchBadge({ k, glow, label, show = true }: { k: string; glow?: string; label: string; show?: boolean }) {
  if (!show || !hasMedia(k)) return null;
  const m = mediaMeta(k);
  return (
    <div className="lockbadge patchbadge is-in" style={{ ['--badge-ar' as string]: m.h / m.w, ['--badge-max' as string]: '50px' }}>
      <div className="lockbadge__shot" style={{ aspectRatio: `${m.w} / ${m.h}` }}>
        <Picture k={k} alt={label} sizes="120px" priority className="lockbadge__img" />
        {glow && hasMedia(glow) && (
          <span className="lockbadge__glow patchbadge__glow">
            <Picture k={glow} alt="" sizes="120px" priority className="lockbadge__img" />
          </span>
        )}
      </div>
    </div>
  );
}
