'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { COLORS, COLOR_NO, colorCode, formatEuro, SHOP, variantLabel, type ColorKey, type Product, colorName } from '@/data/shop';
import { LockBadge } from '../LockBadge';
import { PatchBadge } from '../PatchBadge';
import { QdBadge } from '../QdBadge';
import { ShotArrows } from '../ShotArrows';
import { Picture, hasMedia, lockSpace } from '../Picture';
import { useCart } from '../cart/CartProvider';
import { pull } from '../MotionProvider';

/** Auswahl-Logik (Farbe + Ausführung) – gemeinsam für Karte und Bühne nutzbar */
export function useVariantPicker(product: Product) {
  // Farben in Code-Reihenfolge (01 Schwarz, 02 Oliv …); vorausgewählt: niedrigste lieferbare Nummer
  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color))].sort((a, b) => COLOR_NO[a].localeCompare(COLOR_NO[b])),
    [product],
  );
  const first =
    colors.map((c) => product.variants.find((v) => v.color === c && v.stock !== 'ausverkauft')).find(Boolean) ??
    product.variants[0];
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
  const baseShots = (product.stage[color] ?? []).filter(hasMedia);
  const extraShots = (product.optionStage?.[option ?? ''] ?? []).filter(hasMedia);
  const shots = [...baseShots, ...extraShots];
  const split = product.optionSplit?.[option ?? ''];
  const splitOn = !!split && hasMedia(split.k);
  const [shotIdx, setShotIdx] = useState(0);
  useEffect(() => setShotIdx(0), [color]);
  useEffect(() => setShotIdx(extraShots.length ? baseShots.length : 0), [option]); // eslint-disable-line react-hooks/exhaustive-deps
  const shot = shots[shotIdx % Math.max(1, shots.length)];
  const soldOut = variant.stock === 'ausverkauft';
  const optRef = useRef<HTMLElement | null>(null);

  return (
    <article className="pcard" id={`${product.slug}-karte`} aria-labelledby={`${product.slug}-k`}>
      <div className="pcard__media" style={lockSpace(shot ? [shot] : [])}>
        {/* key = Farbe → neues Bild läuft mit Scan-Effekt ein */}
        <div className={`pcard__shot${splitOn ? ' is-split' : ''}`} key={`${color}-${shotIdx}`}>
          {shot ? (
            <Picture k={shot} alt={`${product.name} in ${colorName(color)}`} sizes="86vw" />
          ) : (
            <div className="stage__missing mono">Foto folgt</div>
          )}
          <span className="pcard__scan" aria-hidden="true" />
        </div>
        {split && hasMedia(split.k) && (
          <div className={`stage__split pcard__split${splitOn ? ' is-on' : ''}`} aria-hidden={!splitOn}>
            <Picture k={split.k} alt={split.label} sizes="46vw" />
            <span className="stage__split-label mono">{split.label}</span>
          </div>
        )}
        <ShotArrows index={shotIdx % Math.max(1, shots.length)} count={shots.length} onChange={setShotIdx} />
        {/* Zubehör steht statisch in fester Größe über jedem Vorschaubild */}
        <LockBadge on={variant.option === 'mit Zahlenschloss'} />
        <QdBadge on={variant.option === '+ QD-Öse'} />
        {product.badge && <PatchBadge {...product.badge} />}
        <span className="pcard__code mono">{colorCode(product, color)}</span>
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
                  aria-label={`${colorName(c)}${out ? ' (ausverkauft)' : ''}`}
                  disabled={out}
                  className="dot"
                  style={{ background: COLORS[c].swatch }}
                  onClick={() => setColor(c)}
                />
              );
            })}
            <span className="mono dim">{colorName(color)}</span>
          </div>
          {options.length > 1 && (
            <div className="seg" role="radiogroup" aria-label="Ausführung">
              {options.map((o) => (
                <button
                  key={o || 'std'}
                  type="button"
                  role="radio"
                  aria-checked={option === o}
                  onClick={(e) => {
                    optRef.current = e.currentTarget;
                    setOption(o);
                  }}
                >
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
        </details>
      </div>
    </article>
  );
}
