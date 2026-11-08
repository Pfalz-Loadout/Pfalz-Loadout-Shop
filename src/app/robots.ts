import type { MetadataRoute } from 'next';

const SITE = process.env.SITE_URL ?? 'https://pfalz-loadout.de';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/danke'] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
