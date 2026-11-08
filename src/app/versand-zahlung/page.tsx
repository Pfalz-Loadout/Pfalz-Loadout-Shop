import type { Metadata } from 'next';
import { formatEuro, SHOP } from '@/data/shop';

export const metadata: Metadata = { title: 'Versand & Zahlung – PFALZ LOADOUT', alternates: { canonical: '/versand-zahlung' } };

export default function VersandZahlung() {
  const s = SHOP.shipping;
  return (
    <article className="wrap legal">
      <h1 className="display">Versand & Zahlung</h1>
      <h2>Versand</h2>
      <p>
        Wir liefern innerhalb Deutschlands. Versandkosten: {formatEuro(s.flatCents)} pro Bestellung, ab einem Bestellwert von{' '}
        {formatEuro(s.freeFromCents)} (nach Rabatt) versandkostenfrei.
      </p>
      <p>
        Versand ab Lager in Worms innerhalb von {s.handlingDays} nach Zahlungseingang (bei PayPal sofort, bei Überweisung nach Gutschrift).
        Die Zustellung durch den Versanddienstleister dauert in der Regel 1–3 Werktage.
      </p>
      <h2>Zahlungsarten</h2>
      <ul>
        {SHOP.payments
          .filter((p) => p.enabled)
          .map((p) => (
            <li key={p.id}>
              <strong>{p.label}</strong> – {p.hint}
            </li>
          ))}
      </ul>
      <p>
        Bei Überweisung (Vorkasse) bekommst du die Bankverbindung direkt nach der Bestellung angezeigt und per Mail. Bitte überweise innerhalb
        von 7 Tagen und gib die Bestellnummer als Verwendungszweck an.
      </p>
      <h2>Preise</h2>
      <p>Alle Preise sind Endpreise. {SHOP.vatNote}</p>
      <h2>Mengenrabatt</h2>
      <p>
        Ab {SHOP.volume.minQty} Stück IFAK oder {SHOP.volume.minQty} Stück Range Bag (Farben beliebig gemischt) ziehen wir
        automatisch {SHOP.volume.percent} % vom Preis dieser Artikel ab.
      </p>
    </article>
  );
}
