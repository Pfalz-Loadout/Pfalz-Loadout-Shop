import { NextResponse } from 'next/server';
import { captureOrder, type PaypalOrder } from '@/lib/paypal';
import { sendMail, shopInbox, signature } from '@/lib/mail';
import { siteUrl } from '@/lib/order';
import { SHOP } from '@/data/shop';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const euro = (v?: string) => (v ? `${Number(v).toFixed(2).replace('.', ',')} €` : '');

function summary(o: PaypalOrder) {
  const pu = o.purchase_units?.[0];
  const items = (pu?.items ?? []).map((i) => `${i.quantity} × ${i.name} (${i.description ?? ''})  à ${euro(i.unit_amount.value)}`);
  const a = pu?.shipping?.address;
  const addr = [pu?.shipping?.name?.full_name, a?.address_line_1, a?.address_line_2, `${a?.postal_code ?? ''} ${a?.admin_area_2 ?? ''}`, a?.country_code]
    .filter(Boolean)
    .join('\n');
  return { items: items.join('\n'), addr, total: euro(pu?.amount?.value), orderNo: pu?.invoice_id ?? pu?.custom_id ?? o.id };
}

/** Rücksprung von PayPal: ?token=<PayPal-Order-ID>&PayerID=… */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('token');
  const site = siteUrl(req);
  if (!id) return NextResponse.redirect(`${site}/?zahlung=fehler`);

  try {
    const { order, fresh } = await captureOrder(id);
    const s = summary(order);
    const captured = order.purchase_units?.[0]?.payments?.captures?.[0];
    const ok = order.status === 'COMPLETED' || captured?.status === 'COMPLETED' || captured?.status === 'PENDING';
    if (!ok) return NextResponse.redirect(`${site}/?zahlung=fehler`);

    if (fresh) {
      const buyer = order.payer?.email_address;
      const pending = captured?.status === 'PENDING';
      await Promise.allSettled([
        sendMail({
          to: shopInbox(),
          replyTo: buyer,
          subject: `Neue Bestellung ${s.orderNo} · PayPal ${pending ? '(Zahlung in Prüfung)' : 'bezahlt'} · ${s.total}`,
          text: `Neue Bestellung über pfalz-loadout.de\n\nBestellnummer: ${s.orderNo}\nPayPal-Order: ${order.id}\nTransaktion: ${captured?.id ?? '-'} (${captured?.status ?? order.status})\nKäufer: ${buyer ?? '-'}\n\nARTIKEL\n${s.items}\n\nGesamt: ${s.total}\n\nLIEFERADRESSE\n${s.addr}`,
        }),
        buyer
          ? sendMail({
              to: buyer,
              subject: `Deine Bestellung ${s.orderNo} bei PFALZ LOADOUT`,
              text: `Hallo ${order.payer?.name?.given_name ?? ''},\n\ndanke für deine Bestellung – deine Zahlung über PayPal ${pending ? 'wird gerade von PayPal geprüft' : 'ist eingegangen'}.\nWir packen in Worms und verschicken in ${SHOP.shipping.handlingDays}.\n\nBestellnummer: ${s.orderNo}\n\n${s.items}\n\nGesamt: ${s.total}\n${SHOP.vatNote}\n\nLieferadresse:\n${s.addr}\n\nWiderrufsbelehrung und AGB: ${site}/widerruf · ${site}/agb\n${signature()}`,
            })
          : Promise.resolve(),
      ]);
    }
    return NextResponse.redirect(`${site}/danke?nr=${encodeURIComponent(s.orderNo)}&art=paypal`);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(`${site}/?zahlung=fehler`);
  }
}
