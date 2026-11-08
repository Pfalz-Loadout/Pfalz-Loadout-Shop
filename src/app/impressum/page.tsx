import type { Metadata } from 'next';
import { SHOP } from '@/data/shop';

export const metadata: Metadata = { title: 'Impressum – PFALZ LOADOUT', alternates: { canonical: '/impressum' } };

export default function Impressum() {
  const c = SHOP.contact;
  return (
    <article className="wrap legal">
      <h1 className="display">Impressum</h1>
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {c.company}
        <br />
        Inhaberin: {c.owner}
        <br />
        {c.street}
        <br />
        {c.zip} {c.city}
        <br />
        {c.country}
      </p>
      <h2>Kontakt</h2>
      <p>
        Telefon: {c.phone}
        <br />
        E-Mail: <a href={`mailto:${c.email}`}>{c.email}</a>
      </p>
      <h2>Umsatzsteuer</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {c.vatId}
        <br />
        Kleinunternehmer gemäß § 19 UStG – es wird keine Umsatzsteuer berechnet und ausgewiesen.
      </p>
      <h2>Verpackungsregister</h2>
      <p>Registrierungsnummer LUCID (Zentrale Stelle Verpackungsregister): {c.epr}</p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir nicht verpflichtet und nicht bereit.</p>
      <h2>Aufsichtsbehörde audiovisuelle Mediendienste</h2>
      <p>Medienanstalt Rheinland-Pfalz</p>
      <h2>Verantwortlich für den Inhalt</h2>
      <p>
        {c.owner}, Anschrift wie oben
      </p>
      <h2>Bildnachweis</h2>
      <p>
        Produktfotos: eigene Aufnahmen. Als „Symbolbild (KI)“ gekennzeichnete Szenen sind mit KI erzeugt und zeigen das jeweilige
        Produkt in einer typischen Einsatzumgebung.
      </p>
    </article>
  );
}
