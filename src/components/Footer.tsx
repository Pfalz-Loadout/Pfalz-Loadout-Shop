'use client';

import { useState } from 'react';
import { SHOP } from '@/data/shop';

export function Footer() {
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState('busy');
    try {
      const r = await fetch('/api/drop-info', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: fd.get('email'), website: fd.get('website') }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? 'Fehler');
      setState('ok');
      setMsg('Fast geschafft: Bitte bestätige den Link in der Mail, die wir dir gerade geschickt haben.');
    } catch (err) {
      setState('err');
      setMsg(err instanceof Error ? err.message : 'Das hat nicht geklappt. Versuch es später nochmal.');
    }
  }

  const c = SHOP.contact;
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr__grid">
          <div>
            <span className="mono signal">DROP-INFO</span>
            <h2 className="display">Neues zuerst.</h2>
            <p className="dim" style={{ maxWidth: '44ch' }}>
              Neue Teile, Farben und Restposten – kurz per Mail, wenn es soweit ist. Kein Spam, jederzeit abbestellbar.
            </p>
            <form onSubmit={onSubmit} noValidate>
              <div className="field-row">
                <label className="sr-only" htmlFor="drop-email">
                  E-Mail-Adresse
                </label>
                <input id="drop-email" className="input" type="email" name="email" required autoComplete="email" placeholder="deine@mail.de" />
                <div className="hp" aria-hidden="true">
                  <input tabIndex={-1} name="website" autoComplete="off" />
                </div>
                <button className="btn tab" type="submit" disabled={state === 'busy'}>
                  Eintragen
                </button>
              </div>
              <p className="dim-3" style={{ fontSize: '.78rem', maxWidth: '52ch', marginTop: 10 }}>
                Mit dem Eintragen willigst du ein, dass wir dir die Drop-Info per Mail senden. Bestätigung per Double-Opt-in,
                Widerruf jederzeit. Details in der <a href="/datenschutz">Datenschutzerklärung</a>.
              </p>
              {msg && (
                <p className="form-msg" role="status">
                  {msg}
                </p>
              )}
            </form>
          </div>
          <div>
            <span className="mono dim-3">Kontakt</span>
            <ul style={{ marginTop: 12 }}>
              <li>{c.company}</li>
              <li>
                {c.street}, {c.zip} {c.city}
              </li>
              <li>
                <a href={`mailto:${c.email}`}>{c.email}</a>
              </li>
              <li>
                <a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a>
              </li>
            </ul>
          </div>
          <div>
            <span className="mono dim-3">Rechtliches</span>
            <ul style={{ marginTop: 12 }}>
              <li>
                <a href="/impressum">Impressum</a>
              </li>
              <li>
                <a href="/datenschutz">Datenschutz</a>
              </li>
              <li>
                <a href="/agb">AGB</a>
              </li>
              <li>
                <a href="/widerruf">Widerrufsbelehrung</a>
              </li>
              <li>
                <a href="/versand-zahlung">Versand & Zahlung</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="ftr__base mono">
          <span>© {new Date().getFullYear()} PFALZ LOADOUT · EST 2025</span>
          <span>
            {SHOP.coords.lat} / {SHOP.coords.lon} · {SHOP.coords.label}
          </span>
          <span>{SHOP.vatNote}</span>
        </div>
      </div>
    </footer>
  );
}
