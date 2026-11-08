import { mediaMeta } from './Picture';

/**
 * Logo „Pfalz Loadout“ mit Fadenkreuz. Im Zielfernrohr: echtes Foto der Pfälzer Berge (Haardtrand mit Weinbergen).
 * Rahmen = Original-Logo mit transparentem Kreisinneren (scripts/logo-rahmen.py → Medien-Key logo-rahmen).
 */

/** Kreis im Rahmenbild (aus scripts/logo-rahmen.py), in % der Rahmen-Breite/-Höhe */
const FRAME_W = 652;
const FRAME_H = 404;
const CX = 69.018; // % Breite
const CY = 51.733; // % Höhe
const R = 20.399 + 0.45; // % Breite – leicht größer, damit das Foto unter den inneren Ring reicht

export const SCOPE_BOX = {
  left: `${CX - R}%`,
  top: `${CY - (R * FRAME_W) / FRAME_H}%`,
  width: `${2 * R}%`,
  height: `${(2 * R * FRAME_W) / FRAME_H}%`,
};

/**
 * Bildausschnitt im Zielfernrohr (gilt für Header-Logo UND Intro, damit der Übergang nahtlos ist):
 * Foto 3:2, 300 % × 200 % der Kreisgröße, Bergkamm knapp unter dem Fadenkreuz.
 */
export const SCOPE_PHOTO = 'einsatz-pfalz';
export const SCOPE_IMG_STYLE = {
  position: 'absolute' as const,
  width: '300%',
  height: '200%',
  left: '-166%',
  top: '-26%',
  maxWidth: 'none',
  objectFit: 'cover' as const,
};
/** Zoom-Ziel im Foto (Bergkamm) – als transform-origin relativ zum Foto-Element */
export const SCOPE_FOCUS = '72% 40%';

export function photoSrc(prefer: 'small' | 'large') {
  const m = mediaMeta(SCOPE_PHOTO);
  const w = prefer === 'small' ? m.widths[0] : m.widths[m.widths.length - 1];
  return `/media/${SCOPE_PHOTO}-${w}.webp${m.v ? `?v=${m.v}` : ''}`;
}

export function Logo() {
  const f = mediaMeta('logo-rahmen');
  const v = f.v ? `?v=${f.v}` : '';
  return (
    <span className="logo" style={{ aspectRatio: `${FRAME_W} / ${FRAME_H}` }}>
      <span className="logo__scope" style={SCOPE_BOX}>
        <img src={photoSrc('small')} alt="" style={SCOPE_IMG_STYLE} className="logo__photo" decoding="async" />
      </span>
      <img
        className="logo__frame"
        src={`/media/logo-rahmen-400.webp${v}`}
        srcSet={f.widths.map((w) => `/media/logo-rahmen-${w}.webp${v} ${w}w`).join(', ')}
        sizes="120px"
        alt=""
        width={FRAME_W}
        height={FRAME_H}
      />
    </span>
  );
}
