/**
 * PayPal Orders API v2 (Redirect-Ablauf, kein PayPal-Skript auf der Seite):
 *   1. createOrder → Kunde wird zu PayPal weitergeleitet
 *   2. PayPal leitet zurück auf /api/checkout/paypal/capture?token=…
 *   3. captureOrder → Zahlung abgeschlossen → Mails
 * Die Bestellung „lebt“ bei PayPal (Artikel, Adresse, Bestellnummer) –
 * dadurch braucht der Shop keine eigene Datenbank.
 */
import { SHOP, type Totals } from '@/data/shop';
import type { Customer } from './order';

const base = () => (process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com');

export const paypalConfigured = () => !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

async function token() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error('PayPal ist noch nicht eingerichtet.');
  const r = await fetch(`${base()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`PayPal-Anmeldung fehlgeschlagen (${r.status})`);
  const j = (await r.json()) as { access_token: string };
  return j.access_token;
}

const eur = (cents: number) => ({ currency_code: SHOP.currency, value: (cents / 100).toFixed(2) });

export async function createOrder(opts: { totals: Totals; customer: Customer; orderNo: string; returnUrl: string; cancelUrl: string }) {
  const { totals, customer, orderNo } = opts;
  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: orderNo,
        invoice_id: orderNo,
        custom_id: orderNo,
        description: `PFALZ LOADOUT Bestellung ${orderNo}`,
        amount: {
          ...eur(totals.totalCents),
          breakdown: {
            item_total: eur(totals.subtotalCents),
            shipping: eur(totals.shippingCents),
            discount: eur(totals.discountCents),
          },
        },
        items: totals.lines.map((l) => ({
          name: `${l.code} ${l.name}`.slice(0, 127),
          description: l.variantLabel.slice(0, 127),
          sku: l.sku,
          quantity: String(l.qty),
          unit_amount: eur(l.unitCents),
          category: 'PHYSICAL_GOODS',
        })),
        shipping: {
          type: 'SHIPPING',
          name: { full_name: `${customer.firstName} ${customer.lastName}`.slice(0, 300) },
          address: {
            address_line_1: customer.street,
            address_line_2: customer.extra,
            admin_area_2: customer.city,
            postal_code: customer.zip,
            country_code: 'DE',
          },
        },
      },
    ],
    payment_source: {
      paypal: {
        email_address: customer.email,
        name: { given_name: customer.firstName, surname: customer.lastName },
        experience_context: {
          brand_name: SHOP.brand,
          locale: 'de-DE',
          shipping_preference: 'SET_PROVIDED_ADDRESS',
          user_action: 'PAY_NOW',
          return_url: opts.returnUrl,
          cancel_url: opts.cancelUrl,
        },
      },
    },
  };

  const r = await fetch(`${base()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${await token()}`,
      'content-type': 'application/json',
      'paypal-request-id': orderNo, // Idempotenz
      prefer: 'return=representation',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const j = (await r.json()) as { id?: string; links?: { rel: string; href: string }[]; message?: string; details?: unknown };
  if (!r.ok || !j.id) {
    console.error('PayPal createOrder', r.status, JSON.stringify(j));
    throw new Error('PayPal-Zahlung konnte nicht gestartet werden.');
  }
  const approve = j.links?.find((l) => l.rel === 'payer-action' || l.rel === 'approve')?.href;
  if (!approve) throw new Error('PayPal hat keinen Zahlungslink geliefert.');
  return { id: j.id, approveUrl: approve };
}

export type PaypalOrder = {
  id: string;
  status: string;
  payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
  purchase_units?: {
    invoice_id?: string;
    custom_id?: string;
    amount?: { value: string; currency_code: string };
    items?: { name: string; description?: string; sku?: string; quantity: string; unit_amount: { value: string } }[];
    shipping?: {
      name?: { full_name?: string };
      address?: { address_line_1?: string; address_line_2?: string; admin_area_2?: string; postal_code?: string; country_code?: string };
    };
    payments?: { captures?: { id: string; status: string; amount: { value: string } }[] };
  }[];
};

export async function captureOrder(id: string): Promise<{ order: PaypalOrder; fresh: boolean }> {
  const t = await token();
  const r = await fetch(`${base()}/v2/checkout/orders/${encodeURIComponent(id)}/capture`, {
    method: 'POST',
    headers: { authorization: `Bearer ${t}`, 'content-type': 'application/json', prefer: 'return=representation' },
    cache: 'no-store',
  });
  const j = (await r.json()) as PaypalOrder & { details?: { issue?: string }[] };
  if (r.ok) return { order: j, fresh: true };
  // Seite neu geladen → schon bezahlt: Bestellung lesen, keine doppelten Mails
  if (j.details?.some((d) => d.issue === 'ORDER_ALREADY_CAPTURED')) {
    const g = await fetch(`${base()}/v2/checkout/orders/${encodeURIComponent(id)}`, {
      headers: { authorization: `Bearer ${t}` },
      cache: 'no-store',
    });
    return { order: (await g.json()) as PaypalOrder, fresh: false };
  }
  console.error('PayPal capture', r.status, JSON.stringify(j));
  throw new Error('Zahlung konnte nicht abgeschlossen werden.');
}
