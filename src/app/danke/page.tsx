import type { Metadata } from 'next';
import { bankDetails } from '@/lib/bank';
import { SHOP } from '@/data/shop';
import { ClearCart } from './ClearCart';

export const metadata: Metadata = { title: 'Danke für deine Bestellung – PFALZ LOADOUT', robots: { index: false } };

export default async function Danke({ searchParams }: { searchParams: Promise<{ nr?: string; art?: string }> }) {
  const { nr = '', art } = await searchParams;
  const orderNo = /^PL-\d{6}-[A-Z0-9]{4}$/.test(nr) ? nr : '';
  const bank = art === 'ueberweisung' ? bankDetails() : null;
  return (
    <section className="wrap legal">
      <ClearCart />
      <span className="mono signal">AUFTRAG ERFASST</span>
      <h1 className="display">Danke.</h1>
      {orderNo && (
        <p>
          Deine Bestellnummer: <strong className="mono" style={{ fontSize: '1rem' }}>{orderNo}</strong>
        </p>
      )}
      {art === 'paypal' && (
        <p>
          Deine Zahlung über PayPal ist eingegangen. Wir packen in Worms und verschicken in {SHOP.shipping.handlingDays}. Eine
          Bestätigung ist per Mail unterwegs.
        </p>
      )}
      {art === 'ueberweisung' && (
        <>
          <p>Bitte überweise den Betrag innerhalb von 7 Tagen. Sobald er da ist, verschicken wir. Alle Angaben stehen auch in deiner Bestätigungsmail.</p>
          {bank && (
            <div className="box mono" style={{ fontSize: '.9rem', lineHeight: 2 }}>
              Kontoinhaber: {bank.holder}
              <br />
              IBAN: {bank.iban}
              <br />
              {bank.bic && (
                <>
                  BIC: {bank.bic}
                  <br />
                </>
              )}
              {bank.name && (
                <>
                  Bank: {bank.name}
                  <br />
                </>
              )}
              Verwendungszweck: {orderNo || 'Bestellnummer aus der Mail'}
            </div>
          )}
        </>
      )}
      <p style={{ marginTop: 32 }}>
        Fragen? <a href={`mailto:${SHOP.contact.email}`}>{SHOP.contact.email}</a>
      </p>
      <a className="btn tab" href="/" style={{ marginTop: 16 }}>
        Zurück zum Shop
      </a>
    </section>
  );
}
