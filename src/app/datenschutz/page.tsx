import type { Metadata } from 'next';
import { SHOP } from '@/data/shop';

export const metadata: Metadata = { title: 'Datenschutz – PFALZ LOADOUT', alternates: { canonical: '/datenschutz' } };

/** ENTWURF – vor dem Livegang prüfen lassen */
export default function Datenschutz() {
  const c = SHOP.contact;
  return (
    <article className="wrap legal">
      <h1 className="display">Datenschutz</h1>
      <p className="todo">ENTWURF – vor dem Livegang rechtlich prüfen lassen bzw. durch einen geprüften Text ersetzen.</p>

      <h2>1. Verantwortliche Stelle</h2>
      <p>
        {c.company}, Inh. {c.owner}, {c.street}, {c.zip} {c.city}, E-Mail: {c.email}, Telefon: {c.phone}
      </p>

      <h2>2. Keine Tracking-Cookies</h2>
      <p>
        Diese Website setzt keine Analyse-, Marketing- oder Tracking-Cookies und bindet keine Inhalte von Social-Media-Diensten ein.
        Schriften werden von unserem eigenen Server geladen, nicht von Google. Deshalb gibt es kein Cookie-Banner.
      </p>
      <p>
        Dein Warenkorb wird im lokalen Speicher deines Browsers (localStorage) abgelegt, damit er beim nächsten Besuch noch da ist. Diese
        Daten verlassen deinen Browser erst, wenn du bestellst. Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TDDDG (technisch erforderlich).
      </p>

      <h2>3. Hosting</h2>
      <p>
        Die Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA gehostet. Beim Aufruf werden technisch notwendige
        Daten (IP-Adresse, Zeitpunkt, aufgerufene Seite, Browser) in Server-Logs verarbeitet. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO
        (sicherer Betrieb). Vercel ist unter dem EU-US Data Privacy Framework zertifiziert; zusätzlich bestehen Standardvertragsklauseln.
      </p>

      <h2>4. Bestellung</h2>
      <p>
        Für die Abwicklung deiner Bestellung verarbeiten wir Name, Lieferadresse, E-Mail und optional Telefonnummer
        (Art. 6 Abs. 1 lit. b DSGVO). Die Bestelldaten werden per E-Mail an uns übermittelt und für die gesetzlichen Aufbewahrungsfristen
        (bis zu 10 Jahre, § 147 AO, § 257 HGB) gespeichert. Zur Lieferung geben wir Name und Adresse an den Versanddienstleister weiter.
      </p>

      <h2>5. Zahlung mit PayPal</h2>
      <p>
        Wählst du PayPal, wirst du zu PayPal (Europe) S.à r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxemburg weitergeleitet. Wir
        übermitteln Bestellpositionen, Betrag, Name, Lieferadresse und E-Mail. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Es gilt zusätzlich
        die Datenschutzerklärung von PayPal.
      </p>

      <h2>6. E-Mail-Versand</h2>
      <p>Bestellbestätigungen versenden wir über unseren E-Mail-Anbieter (Strato AG, Berlin) als Auftragsverarbeiter.</p>

      <h2>7. Drop-Info (Newsletter)</h2>
      <p>
        Wenn du dich für die Drop-Info einträgst, schicken wir dir eine Bestätigungsmail (Double-Opt-in). Erst nach Klick auf den Link bist
        du eingetragen; dabei protokollieren wir Zeitpunkt von Anmeldung und Bestätigung als Nachweis. Rechtsgrundlage: Einwilligung,
        Art. 6 Abs. 1 lit. a DSGVO. Abmelden kannst du dich jederzeit per Mail an {c.email} oder über den Link in jeder Drop-Info.
      </p>

      <h2>8. Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie
        auf Widerruf erteilter Einwilligungen. Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren, z. B. beim
        Landesbeauftragten für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz.
      </p>
    </article>
  );
}
