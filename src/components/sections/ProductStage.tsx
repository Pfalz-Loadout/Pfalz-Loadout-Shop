'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { COLORS, colorCode, formatEuro, SHOP, variantLabel, type ColorKey, type Product } from '@/data/shop';
import { Picture, hasMedia } from '../Picture';
import { useCart } from '../cart/CartProvider';
import { pull, useMotion } from '../MotionProvider';

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

  const colors = useMemo(() => [...new Set(product.variants.map((v) => v.color))], [product]);
  const firstAvailable = product.variants.find((v) => v.stock !== 'ausverkauft') ?? product.variants[0];
  const [color, setColor] = useState<ColorKey>(firstAvailable.color);
  const options = useMemo(
    () => [...new Set(product.variants.filter((v) => v.color === color).map((v) => v.option ?? ''))],
    [product, color],
  );
  const [option, setOption] = useState(firstAvailable.option ?? '');
  const variant =
    product.variants.find((v) => v.color === color && (v.option ?? '') === option) ??
    product.variants.find((v) => v.color === color)!;
  const shots = (product.stage[color] ?? []).filter(hasMedia);
  const [shot, setShot] = useState(0);
  const [openSpot, setOpenSpot] = useState<number | null>(null);

  useEffect(() => setShot(0), [color]);
  useEffect(() => {
    if (!options.includes(option)) setOption(options[0]);
  }, [options, option]);

  // Scroll: Foto dreht sich leicht in 3D, Lichtkante wandert, zweites Foto blendet ein
  useEffect(() => {
    if (!ready || reduced || !desktop || !root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (s) => {
            if (shots.length > 1) setShot(s.progress > 0.55 ? 1 : 0);
          },
        },
      });
      tl.fromTo('.stage__frame', { rotateY: -9, rotateX: 3 }, { rotateY: 9, rotateX: -2, ease: 'none' }, 0).fromTo(
        '.stage__sweep',
        { '--sweep': '-60%' },
        { '--sweep': '60%', ease: 'none' },
        0,
      );
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
        <div className="stage__visual hud" style={{ direction: 'ltr' }}>
          <div className="stage__frame">
            {shots.length ? (
              shots.map((k, i) => (
                <Picture
                  key={k}
                  k={k}
                  alt={`${product.name} in ${COLORS[color].label}${i === 1 ? ', zweite Ansicht' : ''}`}
                  className="stage__shot"
                  sizes="(max-width: 960px) 92vw, 50vw"
                  style={{ opacity: i === shot ? 1 : 0 }}
                />
              ))
            ) : (
              <div className="stage__missing mono">
                Foto {COLORS[color].label} folgt
                <br />
                Platzhalter: Studiofoto auf grauem Grund, 3:4
              </div>
            )}
            <div className="stage__sweep" />
            <div className="stage__vignette" />
          </div>
          {shots.length > 1 && (
            <div className="stage__thumbs" role="group" aria-label="Ansicht wählen">
              {shots.map((k, i) => (
                <button key={k} type="button" aria-pressed={i === shot} aria-label={`Ansicht ${i + 1}`} onClick={() => setShot(i)} />
              ))}
            </div>
          )}
          <span className="stage__serial mono">{product.serial}</span>
          <span className="stage__code mono">
            {colorCode(product, color)} · {COLORS[color].label}
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
                  {h.text}
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
              <legend className="mono">Farbe – {COLORS[color].label}</legend>
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
                        {COLORS[c].label}
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
                        onChange={() => setOption(o)}
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
                {SHOP.vatNote.replace('Gemäß ', '')} · zzgl. <a href="/versand-zahlung">Versand</a>
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
