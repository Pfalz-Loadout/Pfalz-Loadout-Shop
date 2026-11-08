'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { COLORS, formatEuro, SHOP, variantLabel, type ColorKey, type Product } from '@/data/shop';
import { Picture, hasMedia } from '../Picture';
import { useCart } from '../cart/CartProvider';
import { pull } from '../MotionProvider';

/** Auswahl-Logik (Farbe + Ausführung) – gemeinsam für Karte und Bühne nutzbar */
export function useVariantPicker(product: Product) {
  const colors = useMemo(() => [...new Set(product.variants.map((v) => v.color))], [product]);
  const first = product.variants.find((v) => v.stock !== 'ausverkauft') ?? product.variants[0];
  const [color, setColor] = useState<ColorKey>(first.color);
  const options = useMemo(
    () => [...new Set(product.variants.filter((v) => v.color === color).map((v) => v.option ?? ''))],
    [product, color],
  );
  const [option, setOption] = useState(first.option ?? '');
  useEffect(() => {
    if (!options.includes(option)) setOption(options[0]);
  }, [options, option]);
  const variant =
    product.variants.find((v) => v.color === color && (v.option ?? '') === option) ??
    product.variants.find((v) => v.color === color)!;
  return { colors, color, setColor, options, option, setOption, variant };
}

/** Mobile Produktkarte: Bild, 3 Nutzen, Farbe, Preis, Kaufen. Datenblatt nur auf Wunsch. */
export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { add } = useCart();
  const { colors, color, setColor, options, option, setOption, variant } = useVariantPicker(product);
  const btn = useRef<HTMLButtonElement>(null);
  const shot = (product.stage[color] ?? []).find(hasMedia);
  const soldOut = variant.stock === 'ausverkauft';

  return (
    <article className="pcard" id={`${product.slug}-karte`} aria-labelledby={`${product.slug}-k`}>
      <div className="pcard__media">
        {/* key = Farbe → neues Bild läuft mit Scan-Effekt ein */}
        <div className="pcard__shot" key={color}>
          {shot ? (
            <Picture k={shot} alt={`${product.name} in ${COLORS[color].label}`} sizes="86vw" />
          ) : (
            <div className="stage__missing mono">Foto folgt</div>
          )}
          <span className="pcard__scan" aria-hidden="true" />
        </div>
        <span className="pcard__code mono">{product.code}</span>
        <span className="pcard__num mono">{String(index + 1).padStart(2, '0')}/04</span>
      </div>

      <div className="pcard__body">
        <span className="mono dim-3">{product.use}</span>
        <h3 id={`${product.slug}-k`} className="display pcard__name">
          {product.name}
        </h3>
        <p className="pcard__claim">{product.claim}</p>
        <ul className="pcard__bullets">
          {product.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>

        <div className="pcard__pick">
          <div className="dots" role="radiogroup" aria-label="Farbe">
            {colors.map((c) => {
              const out = product.variants.filter((v) => v.color === c).every((v) => v.stock === 'ausverkauft');
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={color === c}
                  aria-label={`${COLORS[c].label}${out ? ' (ausverkauft)' : ''}`}
                  disabled={out}
                  className="dot"
                  style={{ background: COLORS[c].swatch }}
                  onClick={() => setColor(c)}
                />
              );
            })}
            <span className="mono dim">{COLORS[color].label}</span>
          </div>
          {options.length > 1 && (
            <div className="seg" role="radiogroup" aria-label="Ausführung">
              {options.map((o) => (
                <button key={o || 'std'} type="button" role="radio" aria-checked={option === o} onClick={() => setOption(o)}>
                  {o || 'Standard'}
                </button>
              ))}
            </div>
          )}
          {options.length === 1 && variant.option && <span className="mono signal">{variant.option} inklusive</span>}
        </div>

        <div className="pcard__buy">
          <div>
            <div className="pcard__price">{formatEuro(variant.priceCents)}</div>
            <span className="buy__meta">
              Keine USt. (§ 19 UStG) · zzgl. <a href="/versand-zahlung">Versand</a>
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
            {soldOut ? 'Ausverkauft' : 'Ins Loadout'}
          </button>
        </div>

        <details className="pcard__sheet">
          <summary className="mono">Datenblatt {product.code}</summary>
          <dl className="specs">
            {product.specs.map((s) => (
              <div className="specs__row" key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="sheet__desc">{product.description}</p>
          {product.note && <p className="sheet__note">{product.note}</p>}
          <p className="sheet__note">{SHOP.vatNote}</p>
        </details>
      </div>
    </article>
  );
}
