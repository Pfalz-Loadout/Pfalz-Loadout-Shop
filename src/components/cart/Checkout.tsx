'use client';

import { useRef, useState } from 'react';
import { formatEuro, SHOP } from '@/data/shop';
import { useCart } from './CartProvider';
import { useDialog } from './CartDrawer';
import { pull } from '../MotionProvider';

type PayId = (typeof SHOP.payments)[number]['id'];

const FIELDS = [
  { name: 'email', label: 'E-Mail', type: 'email', auto: 'email', full: true, req: true },
  { name: 'firstName', label: 'Vorname', auto: 'given-name', req: true },
  { name: 'lastName', label: 'Nachname', auto: 'family-name', req: true },
  { name: 'street', label: 'Straße und Hausnummer', auto: 'address-line1', full: true, req: true },
  { name: 'extra', label: 'Adresszusatz (optional)', auto: 'address-line2', full: true, req: false },
  { name: 'zip', label: 'PLZ', auto: 'postal-code', req: true, pattern: '\\d{5}', inputMode: 'numeric' as const },
  { name: 'city', label: 'Ort', auto: 'address-level2', req: true },
  { name: 'phone', label: 'Telefon (optional, für Rückfragen zur Lieferung)', type: 'tel', auto: 'tel', full: true, req: false },
];

export function Checkout() {
  const { totals, lines, checkoutOpen, setCheckoutOpen, clear } = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const [pay, setPay] = useState<PayId>('paypal');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useDialog(checkoutOpen, ref, () => !busy && setCheckoutOpen(false));

  if (!checkoutOpen) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    pull(btn.current);
    setBusy(true);
    setError('');
    const fd = new FormData(form);
    const customer = Object.fromEntries(FIELDS.map((f) => [f.name, String(fd.get(f.name) ?? '').trim()]));
    try {
      const endpoint = pay === 'paypal' ? '/api/checkout/paypal/create' : '/api/checkout/ueberweisung';
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lines, customer, website: fd.get('website') }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? 'Bestellung fehlgeschlagen.');
      if (pay === 'paypal') {
        window.location.href = j.approveUrl; // Weiter zu PayPal
      } else {
        clear();
        window.location.href = `/danke?nr=${encodeURIComponent(j.orderNo)}&art=ueberweisung`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bestellung fehlgeschlagen.');
      setBusy(false);
    }
  }

  return (
    <div ref={ref} className="checkout" role="dialog" aria-modal="true" aria-labelledby="co-h">
      <div className="checkout__bar">
        <span className="wide" style={{ fontSize: '.9rem' }}>
          PFALZ LOADOUT · Kasse
        </span>
        <button type="button" className="x-btn" onClick={() => setCheckoutOpen(false)} aria-label="Kasse schließen" disabled={busy}>
          ✕
        </button>
      </div>
      <form className="wrap checkout__inner" onSubmit={onSubmit} noValidate>
        <div>
          <h1 id="co-h" className="display" style={{ fontSize: 'clamp(2.6rem,6vw,4.5rem)' }}>
            Lieferung & Zahlung
          </h1>
          <p className="dim-3 mono" style={{ marginTop: 8 }}>
            Versand innerhalb Deutschlands · {SHOP.shipping.handlingDays}
          </p>

          <h2 className="h3">Lieferadresse</h2>
          <div className="form-grid">
            {FIELDS.map((f) => (
              <label key={f.name} className={`lbl${f.full ? ' full' : ''}`}>
                <span>
                  {f.label}
                  {f.req && <span aria-hidden="true"> *</span>}
                </span>
                <input
                  className="input"
                  name={f.name}
                  type={f.type ?? 'text'}
                  autoComplete={`shipping ${f.auto}`}
                  required={f.req}
                  pattern={f.pattern}
                  inputMode={f.inputMode}
                  maxLength={120}
                />
              </label>
            ))}
            <label className="lbl full">
              <span>Land</span>
              <input className="input" value="Deutschland" readOnly aria-readonly="true" />
            </label>
            <div className="hp" aria-hidden="true">
              <input tabIndex={-1} name="website" autoComplete="off" />
            </div>
          </div>

          <h2 className="h3">Zahlungsart</h2>
          <div className="pay" role="radiogroup" aria-label="Zahlungsart">
            {SHOP.payments.map((p) => (
              <label key={p.id} className="pay__opt">
                <input type="radio" name="pay" value={p.id} checked={pay === p.id} disabled={!p.enabled} onChange={() => setPay(p.id)} />
                <span>{p.label}</span>
                <small>{p.hint}</small>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="box" style={{ position: 'sticky', top: 'calc(var(--hdr) + 16px)' }}>
            <h2 className="h3" style={{ marginTop: 0 }}>
              Übersicht
            </h2>
            <div className="sum">
              {totals.lines.map((l) => (
                <div className="sum__row" key={l.sku}>
                  <span>
                    {l.qty} × {l.name} <span className="dim-3">({l.variantLabel})</span>
                  </span>
                  <span className="mono">{formatEuro(l.lineCents)}</span>
                </div>
              ))}
              <hr style={{ border: 0, borderTop: '1px solid var(--line-2)', width: '100%' }} />
              <div className="sum__row">
                <span>Zwischensumme</span>
                <span>{formatEuro(totals.subtotalCents)}</span>
              </div>
              {totals.bundleActive && (
                <div className="sum__row signal">
                  <span>Set-Rabatt −{SHOP.bundle.percent} %</span>
                  <span>− {formatEuro(totals.discountCents)}</span>
                </div>
              )}
              <div className="sum__row">
                <span>Versand</span>
                <span>{totals.shippingCents ? formatEuro(totals.shippingCents) : 'kostenlos'}</span>
              </div>
              <div className="sum__row sum__row--total">
                <span>Gesamt</span>
                <span>{formatEuro(totals.totalCents)}</span>
              </div>
              <div className="sum__hint">{SHOP.vatNote}</div>
            </div>

            <label className="legal-check" style={{ margin: '18px 0' }}>
              <input type="checkbox" name="agb" required />
              <span>
                Ich habe die <a href="/agb" target="_blank">AGB</a> gelesen und die{' '}
                <a href="/widerruf" target="_blank">Widerrufsbelehrung</a> sowie die{' '}
                <a href="/datenschutz" target="_blank">Datenschutzerklärung</a> zur Kenntnis genommen.
              </span>
            </label>

            {error && (
              <p className="err" role="alert">
                {error}
              </p>
            )}

            <button ref={btn} type="submit" className="btn btn--signal btn--block tab" disabled={busy || totals.lines.length === 0}>
              {busy ? 'Einen Moment …' : 'Zahlungspflichtig bestellen'}
            </button>
            <p className="sum__hint" style={{ marginTop: 10 }}>
              {pay === 'paypal'
                ? 'Du wirst zu PayPal weitergeleitet, bestätigst dort die Zahlung und kommst danach hierher zurück.'
                : 'Du bekommst die Bankverbindung sofort angezeigt und per Mail. Versand nach Zahlungseingang.'}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
