import media from '@/data/media.generated.json';

type MediaMeta = { w: number; h: number; widths: number[]; bg: string; v?: string };
const MEDIA = media as Record<string, MediaMeta>;

export const hasMedia = (key?: string) => !!key && key in MEDIA;
export const mediaMeta = (key: string) => MEDIA[key];

/** URL der kleinsten/größten WebP-Variante, z. B. für JSON-LD oder Mails */
export function mediaUrl(key: string, prefer: 'small' | 'large' = 'large') {
  const m = MEDIA[key];
  if (!m) return '';
  const w = prefer === 'small' ? m.widths[0] : m.widths[m.widths.length - 1];
  return `/media/${key}-${w}.webp${m.v ? `?v=${m.v}` : ''}`;
}

type Props = {
  k: string;
  alt: string;
  /** sizes-Attribut für responsive Auswahl */
  sizes?: string;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
};

/**
 * <picture> mit AVIF + WebP aus der Medien-Pipeline (npm run medien).
 * Breite/Höhe gesetzt → kein Layout-Sprung. Lazy, außer priority.
 */
export function Picture({ k, alt, sizes = '100vw', className, priority, style }: Props) {
  const m = MEDIA[k];
  if (!m) return null;
  const v = m.v ? `?v=${m.v}` : '';
  const set = (ext: string) => m.widths.map((w) => `/media/${k}-${w}.${ext}${v} ${w}w`).join(', ');
  const fallback = `/media/${k}-${m.widths[Math.min(1, m.widths.length - 1)]}.webp${v}`;
  return (
    <picture className={className} style={{ backgroundColor: m.bg, ...style }}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={fallback}
        alt={alt}
        width={m.w}
        height={m.h}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  );
}
