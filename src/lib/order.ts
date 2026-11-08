/**
 * Serverseitige Bestellprüfung. Preise kommen IMMER aus src/data/shop.ts –
 * was der Browser schickt, wird nur als Wunschliste (SKU + Menge) gelesen.
 */
import crypto from 'node:crypto';
import { computeTotals, findVariant, formatEuro, SHOP, type CartLine, type Totals } from '@/data/shop';

export type Customer = {
  email: string;
  firstName: string;
  lastName: string;
  street: string;
  extra?: string;
  zip: string;
  city: string;
  phone?: string;
};

export class OrderError extends Error {
  status = 400;
}

const str = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function parseOrder(body: unknown): { customer: Customer; totals: Totals } {
  if (!body || typeof body !== 'object') throw new OrderError('Ungültige Anfrage.');
  const b = body as Record<string, unknown>;
  // Honeypot: Bots füllen das versteckte Feld aus
  if (str(b.website)) throw new OrderError('Anfrage abgelehnt.');

  const rawLines = Array.isArray(b.lines) ? b.lines.slice(0, 30) : [];
  const lines: CartLine[] = [];
  for (const l of rawLines) {
    const sku = str((l as CartLine)?.sku, 40);
    const qty = Math.floor(Number((l as CartLine)?.qty));
    const hit = findVariant(sku);
    if (!hit || !(qty >= 1 && qty <= 20)) continue;
    if (hit.variant.stock === 'ausverkauft') {
      throw new OrderError(`${hit.product.name} (${hit.variant.color}) ist leider ausverkauft.`);
    }
    lines.push({ sku, qty });
  }
  if (!lines.length) throw new OrderError('Dein Warenkorb ist leer.');

  const c = (b.customer ?? {}) as Record<string, unknown>;
  const customer: Customer = {
    email: str(c.email, 160).toLowerCase(),
    firstName: str(c.firstName, 60),
    lastName: str(c.lastName, 60),
    street: str(c.street, 120),
    extra: str(c.extra, 120) || undefined,
    zip: str(c.zip, 5),
    city: str(c.city, 80),
    phone: str(c.phone, 40) || undefined,
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email)) throw new OrderError('Bitte gib eine gültige E-Mail-Adresse an.');
  if (!customer.firstName || !customer.lastName) throw new OrderError('Bitte gib Vor- und Nachnamen an.');
  if (!customer.street || !/\d/.test(customer.street)) throw new OrderError('Bitte gib Straße und Hausnummer an.');
  if (!/^\d{5}$/.test(customer.zip)) throw new OrderError('Bitte gib eine gültige deutsche PLZ an.');
  if (!customer.city) throw new OrderError('Bitte gib den Ort an.');

  return { customer, totals: computeTotals(lines) };
}

/** Bestellnummer: PL-JJMMTT-XXXX (ohne verwechselbare Zeichen) */
export function orderNumber(d = new Date()) {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rnd = [...crypto.randomBytes(4)].map((b) => abc[b % abc.length]).join('');
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `PL-${ymd}-${rnd}`;
}

/** Bestellübersicht als Text (für Mails) */
export function orderText(totals: Totals) {
  const rows = totals.lines.map((l) => `${l.qty} × ${l.code} ${l.name} (${l.variantLabel})  ${formatEuro(l.lineCents)}`);
  rows.push('');
  rows.push(`Zwischensumme  ${formatEuro(totals.subtotalCents)}`);
  if (totals.discountCents) rows.push(`Set-Rabatt −${SHOP.bundle.percent} %  − ${formatEuro(totals.discountCents)}`);
  rows.push(`Versand  ${totals.shippingCents ? formatEuro(totals.shippingCents) : 'kostenlos'}`);
  rows.push(`GESAMT  ${formatEuro(totals.totalCents)}`);
  rows.push(SHOP.vatNote);
  return rows.join('\n');
}

export function addressText(c: Customer) {
  return [`${c.firstName} ${c.lastName}`, c.street, c.extra, `${c.zip} ${c.city}`, 'Deutschland', c.phone ? `Tel. ${c.phone}` : '', c.email]
    .filter(Boolean)
    .join('\n');
}

export function siteUrl(req?: Request) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (req) return new URL(req.url).origin;
  return 'http://localhost:3000';
}

/** Sehr einfache Bremse gegen Spam (pro Serverinstanz) */
const hits = new Map<string, number[]>();
export function rateLimit(req: Request, max = 8, windowMs = 10 * 60_000) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  if (list.length > max) {
    const e = new OrderError('Zu viele Anfragen. Bitte versuch es in ein paar Minuten nochmal.');
    e.status = 429;
    throw e;
  }
}
