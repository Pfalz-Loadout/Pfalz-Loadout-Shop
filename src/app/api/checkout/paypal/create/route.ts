import { NextResponse } from 'next/server';
import { OrderError, orderNumber, parseOrder, rateLimit, siteUrl } from '@/lib/order';
import { createOrder, paypalConfigured } from '@/lib/paypal';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    rateLimit(req);
    const { customer, totals } = parseOrder(await req.json());
    if (!paypalConfigured()) {
      return NextResponse.json({ error: 'PayPal ist noch nicht freigeschaltet. Bitte wähle Überweisung.' }, { status: 503 });
    }
    const orderNo = orderNumber();
    const site = siteUrl(req);
    const { approveUrl } = await createOrder({
      totals,
      customer,
      orderNo,
      returnUrl: `${site}/api/checkout/paypal/capture`,
      cancelUrl: `${site}/?zahlung=abgebrochen`,
    });
    return NextResponse.json({ approveUrl, orderNo });
  } catch (e) {
    const status = e instanceof OrderError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Fehler' }, { status });
  }
}
