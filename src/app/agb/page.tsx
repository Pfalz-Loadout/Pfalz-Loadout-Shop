import type { Metadata } from 'next';
import { SHOP } from '@/data/shop';

export const metadata: Metadata = { title: 'AGB – PFALZ LOADOUT', alternates: { canonical: '/agb' } };

/**
 * ENTWURF. Vor dem Livegang durch geprüfte AGB ersetzen
 * (z. B. Händlerbund, IT-Recht Kanzlei, Trusted Shops Rechtstexter).
 */
export default function Agb() {
  const c = SHOP.contact;
  return (
    <article className="wrap legal">
      <h1 className="display">AGB</h1>
      <p className="todo">ENTWURF – vor dem Livegang durch rechtlich geprüfte AGB ersetzen.</p>
      <h2>§ 1 Geltungsbereich</h2>
      <p>
        Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen über pfalz-loadout.de zwischen {c.company}, Inh. {c.owner},{' '}
        {c.street}, {c.zip} {c.city} (nachfolgend „wir“) und dir als Kunde. Wir liefern nur innerhalb Deutschlands.
      </p>
      <h2>§ 2 Vertragsschluss</h2>
      <p>
        Die Darstellung der Produkte im Shop ist kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung. Mit Klick auf
        „Zahlungspflichtig bestellen“ gibst du ein verbindliches Angebot ab. Bei Zahlung per PayPal kommt der Vertrag mit Abschluss des
        Zahlungsvorgangs zustande, bei Überweisung mit unserer Bestellbestätigung per E-Mail.
      </p>
      <h2>§ 3 Preise und Zahlung</h2>
      <p>
        Alle Preise sind Endpreise zuzüglich Versandkosten. {SHOP.vatNote} Zahlung per PayPal oder Überweisung (Vorkasse). Bei Vorkasse ist
        der Betrag innerhalb von 7 Tagen nach Bestellung fällig.
      </p>
      <h2>§ 4 Lieferung</h2>
      <p>Die Lieferung erfolgt an die angegebene Lieferadresse innerhalb Deutschlands. Lieferzeiten und Versandkosten siehe „Versand & Zahlung“.</p>
      <h2>§ 5 Eigentumsvorbehalt</h2>
      <p>Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.</p>
      <h2>§ 6 Widerrufsrecht</h2>
      <p>
        Verbrauchern steht ein Widerrufsrecht nach Maßgabe der <a href="/widerruf">Widerrufsbelehrung</a> zu.
      </p>
      <h2>§ 7 Gewährleistung</h2>
      <p>Es gelten die gesetzlichen Mängelhaftungsrechte.</p>
      <h2>§ 8 Hinweis zu Waffen und Zubehör</h2>
      <p>
        Wir verkaufen Taschen und Zubehör, keine Waffen oder Munition. Für Transport und Aufbewahrung von Waffen gelten die Vorschriften des
        Waffengesetzes; deren Einhaltung liegt in der Verantwortung des Käufers.
      </p>
      <h2>§ 9 Vertragstext und Sprache</h2>
      <p>Vertragssprache ist Deutsch. Den Vertragstext (Bestelldaten und AGB) erhältst du per E-Mail mit der Bestellbestätigung.</p>
    </article>
  );
}
