import type { MetadataRoute } from 'next';

const SITE = process.env.SITE_URL ?? 'https://pfalz-loadout.de';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ['', '/versand-zahlung', '/impressum', '/datenschutz', '/agb', '/widerruf'].map((p) => ({
    url: `${SITE}${p}`,
    lastModified: now,
    priority: p === '' ? 1 : 0.3,
  }));
}
