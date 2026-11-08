'use client';

import { useMemo, useRef, useState } from 'react';
import { COLORS, PRODUCTS, SHOP, computeTotals, formatEuro, variantLabel, type Product } from '@/data/shop';
import { Picture, hasMedia } from '../Picture';
import { useCart } from '../cart/CartProvider';
import { pull, useMotion } from '../MotionProvider';

/** Positionen auf der Packmatte (Knolling-Layout), Prozent der Matte */
const SLOTS: Record<string, { left: number; top: number; width: number; rot: number }> = {
  'PL_AP': { left: 4, top: 6, width: 38, rot: -2 },
  'PL_KWT': { left: 44, top: 8, width: 40, rot: 1.5 },
  'PL_IFAK': { left: 46, top: 52, width: 22, rot: -3 },
  'PL_GR': { left: 72, top: 50, width: 24, rot: 4 },
};

type Sel = { on: boolean; sku: string };

const firstSku = (p: Product) => (p.variants.find((v) => v.stock !== 'ausverkauft') ?? p.variants[0]).sku;

export function Builder() {
  const { add } = useCart();
  const { reduced } = useMotion();
  const btn = useRef<HTMLButtonElement>(null);
  const mat = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<Record<string, Sel>>(() =>
    Object.fromEntries(PRODUCTS.map((p, i) => [p.code, { on: i < 3, sku: firstSku(p) }])),
  );

  const chosen = PRODUCTS.filter((p) => sel[p.code].on);
  const totals = useMemo(() => computeTotals(chosen.map((p) => ({ sku: sel[p.code].sku, qty: 1 }))), [sel, chosen]);

  // 3D-Neigung der Matte mit dem Zeiger
  const onMove = (e: React.PointerEvent) => {
    if (reduced || !mat.current || e.pointerType !== 'mouse') return;
    const r = mat.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    mat.current.style.transform = `perspective(1200px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
  };
  const onLeave = () => mat.current && (mat.current.style.transform = '');

  return (
    <section className="builder scan" id="loadout" aria-labelledby="builder-h">
      <div className="scan__beam" data-hud="SEKTOR 05 // LOADOUT" />
      <div className="wrap">
        <div className="sec-head mono">
          <span className="sec-head__label" id="builder-h">
            Loadout-Builder
          </span>
          <span className="dim-3">
            {SHOP.volume.label}
          </span>
        </div>
        <h2 className="display h2" style={{ marginBottom: 36 }}>
          Stell dein
          <br />
          <span className="dim">Set zusammen.</span>
        </h2>

        <div className="builder__grid">
          <div className="picks">
            {PRODUCTS.map((p) => {
              const s = sel[p.code];
              const v = p.variants.find((x) => x.sku === s.sku)!;
              return (
                <div key={p.code} className={`pick${s.on ? ' is-on' : ''}`}>
                  <input
                    id={`pick-${p.code}`}
                    className="pick__check"
                    type="checkbox"
                    checked={s.on}
                    onChange={(e) => setSel({ ...sel, [p.code]: { ...s, on: e.target.checked } })}
                  />
                  <div>
                    <label htmlFor={`pick-${p.code}`} className="pick__name">
                      <span className="mono signal">{p.code}</span> {p.name}
                    </label>
                    <div className="pick__sub">
                      <label className="sr-only" htmlFor={`var-${p.code}`}>
                        Variante {p.name}
                      </label>
                      <select
                        id={`var-${p.code}`}
                        value={s.sku}
                        onChange={(e) => setSel({ ...sel, [p.code]: { on: true, sku: e.target.value } })}
                      >
                        {p.variants.map((x) => (
                          <option key={x.sku} value={x.sku} disabled={x.stock === 'ausverkauft'}>
                            {variantLabel(x)}
                            {x.stock === 'ausverkauft' ? ' – ausverkauft' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <span className="pick__price">{formatEuro(v.priceCents)}</span>
                </div>
              );
            })}
          </div>

          <div>
            <div ref={mat} className="mat" onPointerMove={onMove} onPointerLeave={onLeave} aria-label="Packmatte mit deinem Set" role="img">
              {PRODUCTS.map((p) => {
                const s = sel[p.code];
                const v = p.variants.find((x) => x.sku === s.sku)!;
                const key = p.cutout[v.color] ?? Object.values(p.cutout)[0];
                const slot = SLOTS[p.code];
                return (
                  <div
                    key={p.code}
                    className={`mat__item${s.on ? '' : ' is-off'}`}
                    style={{ left: `${slot.left}%`, top: `${slot.top}%`, width: `${slot.width}%`, rotate: `${slot.rot}deg` }}
                    aria-hidden="true"
                  >
                    {key && hasMedia(key) && <Picture k={key} alt="" sizes="(max-width: 960px) 40vw, 22vw" style={{ background: 'transparent' }} />}
                  </div>
                );
              })}
              {PRODUCTS.map((p) => {
                const slot = SLOTS[p.code];
                const v = p.variants.find((x) => x.sku === sel[p.code].sku)!;
                return (
                  <span
                    key={p.code}
                    className="mat__label"
                    style={{ left: `${slot.left + 1}%`, top: `${Math.min(92, slot.top + (p.code === 'PL_AP' || p.code === 'PL_KWT' ? 44 : 40))}%`, opacity: sel[p.code].on ? 1 : 0 }}
                  >
                    {p.code} · {COLORS[v.color].label}
                  </span>
                );
              })}
              {chosen.length === 0 && <div className="mat__empty">Matte leer – wähle links deine Teile</div>}
              <div className="mat__ruler" aria-hidden="true">
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>50 cm</span>
              </div>
            </div>

            <div className="tally" aria-live="polite">
              <div className="tally__row">
                <span>Einzelpreise ({chosen.length} Teile)</span>
                <span>{formatEuro(totals.subtotalCents)}</span>
              </div>
              <div className="tally__row">
                <span>Versand</span>
                <span className="dim-3">
                  {totals.subtotalCents >= SHOP.shipping.freeFromCents ? 'kostenlos' : `${formatEuro(SHOP.shipping.flatCents)}`}
                </span>
              </div>
              <div className="tally__row tally__row--sum">
                <span>Set</span>
                <span>{formatEuro(totals.subtotalCents)}</span>
              </div>
              <button
                ref={btn}
                type="button"
                className="btn btn--signal btn--block tab"
                disabled={chosen.length === 0}
                onClick={() => {
                  pull(btn.current);
                  add(chosen.map((p) => ({ sku: sel[p.code].sku, qty: 1 })));
                }}
              >
                Set in den Warenkorb
              </button>
              <span className="dim-3" style={{ fontSize: '.78rem' }}>
                Mengenrabatt: {SHOP.volume.label} – Stückzahl im Warenkorb anpassen, der Rabatt rechnet sich automatisch.{' '}
                {SHOP.vatNote}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
