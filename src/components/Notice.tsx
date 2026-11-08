'use client';

import { useEffect, useState } from 'react';

const TEXT: Record<string, string> = {
  'zahlung=abgebrochen': 'Zahlung abgebrochen – dein Warenkorb ist noch da.',
  'zahlung=fehler': 'Die Zahlung konnte nicht abgeschlossen werden. Es wurde nichts abgebucht. Versuch es nochmal oder wähle Überweisung.',
  'drop=bestaetigt': 'Danke! Deine Drop-Info ist bestätigt.',
  'drop=ungueltig': 'Der Bestätigungslink ist ungültig oder abgelaufen. Trag dich einfach nochmal ein.',
};

/** Kurze Statusmeldung nach Rücksprung (PayPal abgebrochen, Drop-Info bestätigt …) */
export function Notice() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    for (const [k, v] of q) {
      const t = TEXT[`${k}=${v}`];
      if (t) {
        setMsg(t);
        history.replaceState(null, '', location.pathname + location.hash);
        break;
      }
    }
  }, []);
  if (!msg) return null;
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 24,
        transform: 'translateX(-50%)',
        zIndex: 80,
        maxWidth: 'min(560px, calc(100vw - 32px))',
        padding: '14px 18px',
        background: '#edebe6',
        color: '#141414',
        borderLeft: '4px solid #ff5f1f',
        display: 'flex',
        gap: 16,
        alignItems: 'center',
      }}
    >
      <span>{msg}</span>
      <button type="button" onClick={() => setMsg('')} aria-label="Hinweis schließen" style={{ border: 0, background: 'none', cursor: 'pointer', fontSize: 18 }}>
        ✕
      </button>
    </div>
  );
}
