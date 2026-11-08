'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { COLORS, colorCode, formatEuro, SHOP, variantLabel, type ColorKey, type Product, colorName } from '@/data/shop';
import { Picture, hasMedia, lockSpace } from '../Picture';
import { useCart } from '../cart/CartProvider';
import { pull, useMotion } from '../MotionProvider';
import { LockBadge } from '../LockBadge';
import { ShotArrows } from '../ShotArrows';
import { useVariantPicker } from './ProductCard';

const STOCK_TEXT = { lager: 'Auf Lager – Versand in 1–2 Werktagen', wenige: 'Nur noch wenige', ausverkauft: 'Ausverkauft' };

/**
 * Eine gepinnte Produktbühne: links Studiofoto mit Hotspots, das sich beim
 * Scrollen dreht und eine Lichtkante bekommt; rechts Datenblatt + Kauf.
 */
export function ProductStage({ product, index }: { product: Product; index: number }) {
  const { add } = useCart();
  const { ready, reduced, desktop } = useMotion();
  const root = useRef<HTMLElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  // gemeinsame Auswahl-Logik: Farben in Code-Reihenfolge, 01 Schwarz vorausgewählt
  const { colors, color, setColor, options, option, setOption, variant } = useVariantPicker(product);
  const optRef = useRef<HTMLElement | null>(null);
  const baseShots = (product.stage[color] ?? []).filter(hasMedia);
  const extraShots = (product.optionStage?.[option ?? ''] ?? []).filter(hasMedia);
  const shots = [...baseShots, ...extraShots];
  const split = product.optionSplit?.[option ?? ''];
  const splitOn = !!split && hasMedia(split.k);
  const [shot, setShot] = useState(0);
  const [openSpot, setOpenSpot] = useState<number | null>(null);
  // Infokästchen bleiben nicht stehen: zu bei Bild-/Farbwechsel, Klick daneben und nach 3,5 s
  useEffect(() => setOpenSpot(null), [shot, color]);
  useEffect(() => {
    if (openSpot === null) return;
    const t = setTimeout(() => setOpenSpot(null), 3500);
    const outside = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.('.hotspot')) setOpenSpot(null);
    };
    document.addEventListener('pointerdown', outside);
    return () => {
      clearTimeout(t);
      document.removeEventListener('pointerdown', outside);
    };
  }, [openSpot]);

  useEffect(() => setShot(0), [color]);
  // Zubehör gewählt (z. B. QD-Öse) → direkt das Zusatzbild zeigen
  useEffect(() => setShot(extraShots.length ? baseShots.length : 0), [option]); // eslint-disable-line react-hooks/exhaustive-deps

  // Foto kippt leicht mit der Maus (nicht mehr mit dem Scrollen) – weich nachgeführt, beim Verlassen zurück
  useEffect(() => {
    if (!ready || reduced || !desktop || !root.current) return;
    const visual = root.current.querySelector<HTMLElement>('.stage__visual');
    const frame = root.current.querySelector<HTMLElement>('.stage__frame');
    if (!visual || !frame) return;
    const rotY = gsap.quickTo(frame, 'rotateY', { duration: 0.6, ease: 'power3.out' });
    const rotX = gsap.quickTo(frame, 'rotateX', { duration: 0.6, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      rotY(x * 12);
      rotX(-y * 8);
    };
    const leave = () => {
      rotY(0);
      rotX(0);
    };
    visual.addEventListener('pointermove', move);
    visual.addEventListener('pointerleave', leave);
    return () => {
      visual.removeEventListener('pointermove', move);
      visual.removeEventListener('pointerleave', leave);
      gsap.set(frame, { rotateY: 0, rotateX: 0 });
    };
  }, [ready, reduced, desktop]);

  useEffect(() => {
    if (!ready || reduced || !desktop || !root.current) return;
    const ctx = gsap.context(() => {
      // Datenblatt-Zeilen bauen sich einmalig auf (wie ein Ausdruck)
      gsap.from('.specs__row', {
        opacity: 0,
        x: 24,
        stagger: 0.06,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: { trigger: root.current, start: 'top 60%' },
      });
    }, root);
    return () => ctx.revert();
  }, [ready, reduced, desktop, shots.length]);

  const soldOut = variant.stock === 'ausverkauft';
  const flip = index % 2 === 1;

  return (
    <article ref={root} className="stage scan" id={product.slug} aria-labelledby={`${product.slug}-h`}>
      <div className="scan__beam" data-hud={`ZIEL ERFASST // ${product.code}`} />
      <div className="wrap stage__pin" style={flip && desktop ? { direction: 'rtl' } : undefined}>
        <div
          className="stage__visual hud"
          // --r = Seitenverhältnis (H/B) des aktuellen Fotos → Schloss sitzt an dessen oberer rechter Ecke
          // --tr = kleinster Freiraum oben rechts über alle Ansichten → Schloss bleibt gleich groß und überdeckt nie das Produkt
          style={{ direction: 'ltr', ...lockSpace(shots) }}
        >
          {/* außerhalb des 3D-Rahmens: bleibt gestochen scharf, dreht nicht mit */}
          <LockBadge on={variant.option === 'mit Zahlenschloss'} />
          <div className={`stage__frame${splitOn ? ' is-split' : ''}`}>
            {shots.length ? (
              shots.map((k, i) => (
                <Picture
                  key={k}
                  k={k}
                  alt={`${product.name} in ${colorName(color)}${i === 1 ? ', zweite Ansicht' : ''}`}
                  className="stage__shot"
                  sizes="(max-width: 960px) 92vw, 50vw"
                  style={{ opacity: i === shot ? 1 : 0 }}
                />
              ))
            ) : (
              <div className="stage__missing mono">
                Foto {colorName(color)} folgt
                <br />
                Platzhalter: Studiofoto auf grauem Grund, 3:4
              </div>
            )}
            <div className="stage__sweep" />
            <div className="stage__vignette" />
          </div>
          {/* geteilte Vorschau: zweites Bild rechts (z. B. QD-Montage am Gewehr) */}
          {split && hasMedia(split.k) && (
            <div className={`stage__split${splitOn ? ' is-on' : ''}`} aria-hidden={!splitOn}>
              <Picture k={split.k} alt={split.label} sizes="(max-width: 960px) 46vw, 25vw" />
              <span className="stage__split-label mono">{split.label}</span>
            </div>
          )}
          {shots.length > 1 && (
            <div className="stage__thumbs" role="group" aria-label="Ansicht wählen">
              {shots.map((k, i) => (
                <button key={k} type="button" aria-pressed={i === shot} aria-label={`Ansicht ${i + 1}`} onClick={() => setShot(i)} />
              ))}
            </div>
          )}
          <ShotArrows index={shot} count={shots.length} onChange={setShot} />
          <span className="stage__serial mono">{product.serial}</span>
          <span className="stage__code mono">
            {colorCode(product, color)} · {colorName(color)}
          </span>
          {shots.length > 0 &&
            product.hotspots.map((h, i) => {
              const pos = h.at[shots[shot]];
              if (!pos) return null;
              const [x, y] = pos;
              return (
              <div
                key={h.label}
                className={`hotspot${openSpot === i ? ' is-open' : ''}${x > 60 ? ' hotspot--left' : ''}`}
                style={{ left: `${x}%`, top: `${y}%` }}
                onPointerLeave={() => setOpenSpot((o) => (o === i ? null : o))}
              >
                <button
                  type="button"
                  className="hotspot__dot"
                  aria-expanded={openSpot === i}
                  aria-label={`Detail: ${h.label}`}
                  onClick={() => setOpenSpot(openSpot === i ? null : i)}
                />
                <div className="hotspot__tip" role="note">
                  <b>{h.label}</b>
                  <span>{h.text}</span>
                </div>
              </div>
              );
            })}
        </div>

        <div className="sheet" style={{ direction: 'ltr' }}>
          <div className="sheet__top mono">
            <span className="sheet__code">{colorCode(product, color)}</span>
            <span>{product.category}</span>
            <span>
              {String(index + 1).padStart(2, '0')} / 04
            </span>
          </div>
          <h3 id={`${product.slug}-h`} className="display sheet__name">
            {product.name}
          </h3>
          <p className="sheet__claim">{product.claim}</p>
          <p className="sheet__desc">{product.description}</p>

          <dl className="specs">
            {product.specs.slice(0, 4).map((s) => (
              <div className="specs__row" key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
          {product.specs.length > 4 && (
            <details className="specs__more" style={{ marginTop: -16, marginBottom: 16 }}>
              <summary className="mono">Alle Daten ({product.specs.length - 4} weitere)</summary>
              <dl className="specs" style={{ borderTop: 0, margin: 0 }}>
                {product.specs.slice(4).map((s) => (
                  <div className="specs__row" key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}

          <div className="picker">
            <fieldset>
              <legend className="mono">Farbe – {colorName(color)}</legend>
              <div className="swatches">
                {colors.map((c) => {
                  const all = product.variants.filter((v) => v.color === c);
                  const out = all.every((v) => v.stock === 'ausverkauft');
                  return (
                    <label className="swatch" key={c}>
                      <input
                        type="radio"
                        name={`${product.slug}-color`}
                        value={c}
                        checked={color === c}
                        disabled={out}
                        onChange={() => setColor(c)}
                      />
                      <span>
                        <i style={{ background: COLORS[c].swatch }} />
                        {colorName(c)}
                        {out && <span className="sr-only"> (ausverkauft)</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {options.length > 1 && (
              <fieldset>
                <legend className="mono">Ausführung</legend>
                <div className="swatches">
                  {options.map((o) => (
                    <label className="swatch" key={o || 'standard'}>
                      <input
                        type="radio"
                        name={`${product.slug}-opt`}
                        value={o}
                        checked={option === o}
                        onChange={(e) => {
                          optRef.current = e.currentTarget.closest('label');
                          setOption(o);
                        }}
                      />
                      <span>{o || 'Standard'}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </div>

          {options.length === 1 && variant.option && (
            <p className="mono" style={{ margin: '-6px 0 14px', color: 'var(--coyote-ink)' }}>
              Ausführung: {variant.option} (inklusive)
            </p>
          )}
          <span className="stock mono" data-s={variant.stock}>
            {STOCK_TEXT[variant.stock]}
          </span>
          <div className="buy">
            <div>
              <div className="buy__price">{formatEuro(variant.priceCents)}</div>
              <span className="buy__meta">
                zzgl. <a href="/versand-zahlung">Versand</a>
              </span>
            </div>
            <button
              ref={btn}
              type="button"
              className="btn btn--signal tab"
              disabled={soldOut}
              onClick={() => {
                pull(btn.current);
                add([{ sku: variant.sku, qty: 1 }]);
              }}
              aria-label={`${product.name}, ${variantLabel(variant)}, in den Warenkorb`}
            >
              {soldOut ? 'Ausverkauft' : 'In den Warenkorb'}
            </button>
          </div>
          {product.note && <p className="sheet__note">{product.note}</p>}
        </div>
      </div>
    </article>
  );
}
