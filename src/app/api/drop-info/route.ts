/**
 * Drop-Info mit Double-Opt-in, ohne Datenbank:
 * POST → Bestätigungsmail mit signiertem Link (HMAC, 72 h gültig)
 * GET  → Link geklickt → Shop bekommt Mail „bestätigt“ (= Einwilligungsnachweis)
 * Später austauschbar gegen einen Newsletter-Dienst (z. B. Brevo, CleverReach).
 */
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { sendMail, shopInbox, signature } from '@/lib/mail';
import { OrderError, rateLimit, siteUrl } from '@/lib/order';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const sign = (email: string, ts: number) => {
  const secret = process.env.SIGNING_SECRET;
  if (!secret) throw new Error('SIGNING_SECRET fehlt');
  return crypto.createHmac('sha256', secret).update(`${email}|${ts}`).digest('base64url');
};

export async function POST(req: Request) {
  try {
    rateLimit(req, 5);
    const b = (await req.json()) as { email?: string; website?: string };
    if (b.website) return NextResponse.json({ ok: true }); // Honeypot still schlucken
    const email = String(b.email ?? '').trim().toLowerCase().slice(0, 160);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new OrderError('Bitte gib eine gültige E-Mail-Adresse an.');
    const ts = Date.now();
    const link = `${siteUrl(req)}/api/drop-info?e=${encodeURIComponent(email)}&ts=${ts}&t=${sign(email, ts)}`;
    await sendMail({
      to: email,
      subject: 'Bitte bestätige deine Drop-Info – PFALZ LOADOUT',
      text: `Hallo,\n\ndu (oder jemand mit deiner Adresse) möchtest die Drop-Info von PFALZ LOADOUT bekommen.\nBitte bestätige mit diesem Link (72 Stunden gültig):\n\n${link}\n\nWenn du das nicht warst, ignoriere diese Mail einfach – dann passiert nichts.\n${signature()}`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = e instanceof OrderError ? e.status : 500;
    return NextResponse.json({ error: e instanceof OrderError ? e.message : 'Das hat nicht geklappt.' }, { status });
  }
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const site = siteUrl(req);
  const email = u.searchParams.get('e') ?? '';
  const ts = Number(u.searchParams.get('ts'));
  const t = u.searchParams.get('t') ?? '';
  try {
    const valid =
      email &&
      Date.now() - ts < 72 * 3600_000 &&
      crypto.timingSafeEqual(Buffer.from(sign(email, ts)), Buffer.from(t.padEnd(sign(email, ts).length).slice(0, sign(email, ts).length)));
    if (!valid) return NextResponse.redirect(`${site}/?drop=ungueltig`);
    await sendMail({
      to: shopInbox(),
      subject: `Drop-Info bestätigt: ${email}`,
      text: `Double-Opt-in bestätigt.\nE-Mail: ${email}\nAngefordert: ${new Date(ts).toISOString()}\nBestätigt: ${new Date().toISOString()}\nIP (gekürzt): ${(req.headers.get('x-forwarded-for') ?? '').split(',')[0].replace(/\.\d+$/, '.0')}`,
    });
    return NextResponse.redirect(`${site}/?drop=bestaetigt`);
  } catch {
    return NextResponse.redirect(`${site}/?drop=ungueltig`);
  }
}
