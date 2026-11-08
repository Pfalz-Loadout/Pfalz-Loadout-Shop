import { Picture, hasMedia, mediaMeta } from './Picture';

/**
 * Zubehör, das immer dabei ist (z. B. PVC-Patch beim IFAK): sitzt wie das Zahlenschloss oben rechts
 * im Vorschaubild, blendet weich ein, das rote Kreuz leuchtet in Abständen kurz auf (nur opacity animiert).
 */
export function PatchBadge({ k, glow, label, show = true }: { k: string; glow?: string; label: string; show?: boolean }) {
  if (!show || !hasMedia(k)) return null;
  const m = mediaMeta(k);
  return (
    <div className="lockbadge patchbadge is-in">
      <div className="lockbadge__shot" style={{ aspectRatio: `${m.w} / ${m.h}` }}>
        <Picture k={k} alt={label} sizes="120px" priority className="lockbadge__img" />
        {glow && hasMedia(glow) && (
          <span className="lockbadge__glow patchbadge__glow">
            <Picture k={glow} alt="" sizes="120px" priority className="lockbadge__img" />
          </span>
        )}
      </div>
      <span className="badge-incl mono">inklusive</span>
    </div>
  );
}
