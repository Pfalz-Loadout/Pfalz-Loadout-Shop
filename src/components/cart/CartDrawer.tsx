'use client';

import { useEffect, useRef } from 'react';
import { findVariant, formatEuro, SHOP } from '@/data/shop';
import { Picture, hasMedia } from '../Picture';
import { useCart } from './CartProvider';
import { pull, stopScroll } from '../MotionProvider';

/** Fokus im Dialog halten (Tab/Shift+Tab), Escape schließt */
export function useDialog(open: boolean, ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    if (!open || !ref.current) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const sel = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
    const first = el.querySelector<HTMLElement>(sel);
    first?.focus();
    stopScroll(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const items = [...el.querySelectorAll<HTMLElement>(sel)].filter((x) => x.offsetParent !== null);
      if (!items.length) return;
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      stopScroll(false);
      prev?.focus?.();
    };
  }, [open, ref, onClose]);
}

export function CartDrawer() {
  const { totals, cartOpen, setCartOpen, setQty, remove, setCheckoutOpen } = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useDialog(cartOpen, ref, () => setCartOpen(false));

  const freePct = Math.min(100, ((totals.totalCents - totals.shippingCents) / SHOP.shipping.freeFromCents) * 100);

  return (
    <>
      <div className={`overlay${cartOpen ? ' is-open' : ''}`} onClick={() => setCartOpen(false)} aria-hidden="true" />
      <aside
        ref={ref}
        className={`drawer${cartOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-h"
        aria-hidden={!cartOpen}
      >
        <div className="drawer__head">
          <h2 id="cart-h" className="wide" style={{ margin: 0, fontSize: '1rem' }}>
            Warenkorb
          </h2>
          <button type="button" className="x-btn" onClick={() => setCartOpen(false)} aria-label="Warenkorb schließen">
            ✕
          </button>
        </div>
        <div className="drawer__body">
          {totals.lines.length === 0 ? (
            <p className="dim" style={{ marginTop: 24 }}>
              Noch leer. Leg los – oder stell dir im <a href="#loadout" onClick={() => setCartOpen(false)}>Loadout-Builder</a> ein Set
              zusammen.
            </p>
          ) : (
            totals.lines.map((l) => {
              const hit = findVariant(l.sku)!;
              const key = hit.product.cutout[hit.variant.color] ?? Object.values(hit.product.cutout)[0];
              return (
                <div className="cline" key={l.sku}>
                  <div className="cline__img">{key && hasMedia(key) && <Picture k={key} alt="" sizes="64px" />}</div>
                  <div>
                    <div className="cline__name">
                      <span className="mono signal">{l.code}</span> {l.name}
                    </div>
                    <div className="mono dim-3">{l.variantLabel}</div>
                    <div className="qty" role="group" aria-label={`Menge ${l.name}`}>
                      <button type="button" onClick={() => setQty(l.sku, l.qty - 1)} aria-label="Eins weniger">
                        −
                      </button>
                      <span aria-live="polite">{l.qty}</span>
                      <button type="button" onClick={() => setQty(l.sku, l.qty + 1)} aria-label="Eins mehr">
                        +
                      </button>
                    </div>
                    <button type="button" className="cline__rm" onClick={() => remove(l.sku)}>
                      Entfernen
                    </button>
                  </div>
                  <div className="cline__price">{formatEuro(l.lineCents)}</div>
                </div>
              );
            })
          )}
        </div>
        {totals.lines.length > 0 && (
          <div className="drawer__foot">
            <div className="sum">
              <div className="sum__row">
                <span>Zwischensumme</span>
                <span>{formatEuro(totals.subtotalCents)}</span>
              </div>
              {totals.bundleActive ? (
                <div className="sum__row signal">
                  <span>Set-Rabatt −{SHOP.bundle.percent} %</span>
                  <span>− {formatEuro(totals.discountCents)}</span>
                </div>
              ) : (
                <div className="sum__hint">
                  Tipp: Ab {SHOP.bundle.minDistinctProducts} verschiedenen Teilen gibt es −{SHOP.bundle.percent} % Set-Rabatt.
                </div>
              )}
              <div className="sum__row">
                <span>Versand (DE)</span>
                <span>{totals.shippingCents ? formatEuro(totals.shippingCents) : 'kostenlos'}</span>
              </div>
              {totals.missingForFreeShippingCents > 0 && (
                <div className="sum__hint">
                  Noch {formatEuro(totals.missingForFreeShippingCents)} bis versandkostenfrei
                  <div className="free-bar">
                    <i style={{ width: `${freePct}%` }} />
                  </div>
                </div>
              )}
              <div className="sum__row sum__row--total">
                <span>Gesamt</span>
                <span>{formatEuro(totals.totalCents)}</span>
              </div>
              <div className="sum__hint">{SHOP.vatNote}</div>
            </div>
            <button
              ref={btn}
              type="button"
              className="btn btn--signal btn--block tab"
              onClick={() => {
                pull(btn.current);
                setCartOpen(false);
                setCheckoutOpen(true);
              }}
            >
              Zur Kasse
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
