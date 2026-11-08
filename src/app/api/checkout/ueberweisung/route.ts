import { NextResponse } from 'next/server';
import { OrderError, addressText, orderNumber, orderText, parseOrder, rateLimit, siteUrl } from '@/lib/order';
import { mailConfigured, sendMail, shopInbox, signature } from '@/lib/mail';
import { formatEuro, SHOP } from '@/data/shop';
import { bankDetails } from '@/lib/bank';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    rateLimit(req);
    const { customer, totals } = parseOrder(await req.json());
    const bank = bankDetails();
    if (!bank) return NextResponse.json({ error: 'Überweisung ist noch nicht eingerichtet. Bitte wähle PayPal.' }, { status: 503 });
    // Ohne Mailversand würde die Bestellung nirgends ankommen → in Produktion ablehnen
    if (!mailConfigured() && process.env.VERCEL_ENV === 'production') {
      return NextResponse.json({ error: 'Bestellung gerade nicht möglich. Bitte versuch es später.' }, { status: 503 });
    }

    const orderNo = orderNumber();
    const site = siteUrl(req);
    const sum = orderText(totals);
    const addr = addressText(customer);
    const bankText = `Kontoinhaber: ${bank.holder}\nIBAN: ${bank.iban}\nBIC: ${bank.bic}\nBank: ${bank.name}\nBetrag: ${formatEuro(totals.totalCents)}\nVerwendungszweck: ${orderNo}`;

    await sendMail({
      to: shopInbox(),
      replyTo: customer.email,
      subject: `Neue Bestellung ${orderNo} · Überweisung OFFEN · ${formatEuro(totals.totalCents)}`,
      text: `Neue Bestellung (Vorkasse) – erst nach Zahlungseingang versenden.\n\nBestellnummer: ${orderNo}\n\n${sum}\n\nLIEFERADRESSE\n${addr}`,
    });
    await sendMail({
      to: customer.email,
      subject: `Deine Bestellung ${orderNo} – Bankverbindung`,
      text: `Hallo ${customer.firstName},\n\ndanke für deine Bestellung bei PFALZ LOADOUT. Bitte überweise den Betrag innerhalb von 7 Tagen – sobald er da ist, verschicken wir in ${SHOP.shipping.handlingDays}.\n\n${bankText}\n\nDEINE BESTELLUNG\n${sum}\n\nLieferadresse:\n${addr}\n\nWiderrufsbelehrung und AGB: ${site}/widerruf · ${site}/agb\n${signature()}`,
    });

    return NextResponse.json({ orderNo });
  } catch (e) {
    const status = e instanceof OrderError ? e.status : 500;
    console.error(e);
    return NextResponse.json({ error: e instanceof OrderError ? e.message : 'Bestellung fehlgeschlagen. Bitte versuch es nochmal.' }, { status });
  }
}
