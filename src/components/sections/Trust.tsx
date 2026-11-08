import { SHOP } from '@/data/shop';

const CELLS = [
  { code: 'LOG-01', title: 'Versand aus Worms', text: `Verpackt und verschickt in ${SHOP.shipping.handlingDays}. Ab ${(SHOP.shipping.freeFromCents / 100).toLocaleString('de-DE')} € versandkostenfrei.` },
  { code: 'RET-14', title: '14 Tage Widerruf', text: 'Passt nicht? Innerhalb von 14 Tagen ohne Angabe von Gründen widerrufen.' },
  { code: 'GEW-24', title: '2 Jahre Gewährleistung', text: 'Gesetzliche Gewährleistung auf alle Teile – Mängel melden, wir kümmern uns.' },
  { code: 'PAY-02', title: 'Sicher bezahlen', text: 'PayPal (auch „Später bezahlen“) oder Überweisung. Deine Zahldaten sehen wir nie.' },
];

export function Trust() {
  return (
    <section className="trust scan" aria-labelledby="trust-h">
      <div className="scan__beam" data-hud="SEKTOR 06 // VERTRAUEN" />
      <div className="wrap">
        <div className="sec-head mono">
          <span className="sec-head__label" id="trust-h">
            Vertrauen
          </span>
          <span className="dim-3">Händler aus {SHOP.contact.city}</span>
        </div>
        <div className="trust__grid">
          {CELLS.map((c) => (
            <div className="trust__cell" key={c.code}>
              <span className="mono signal">{c.code}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>

        <div className="voices">
          <div className="voice">
            <span className="mono dim-3">eBay-Bewertungen · Stand {SHOP.ebay.asOf}</span>
            <div className="display voice__big">{SHOP.ebay.rating}</div>
            <p className="dim" style={{ margin: '6px 0 12px' }}>
              aus {SHOP.ebay.count} Bewertungen als Verkäufer „pfalz-loadout“
            </p>
            <a className="mono" href={SHOP.ebay.url} target="_blank" rel="noopener noreferrer">
              Bewertungen auf eBay ansehen ↗
            </a>
          </div>
          {[1, 2].map((n) => (
            <figure className="voice voice--ph" key={n}>
              <span className="mono" style={{ color: 'var(--coyote-ink)' }}>
                Platzhalter · Kundenstimme {n}
              </span>
              <blockquote>
                Hier kommt eine echte Kundenstimme hin – nur mit Einverständnis der Person, Vorname + Ort, ggf. Produktcode.
              </blockquote>
              <figcaption className="mono dim-3">— Name, Ort · PL-XXXX</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
