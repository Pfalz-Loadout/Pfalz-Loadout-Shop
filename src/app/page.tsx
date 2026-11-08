import { PRODUCTS, SHOP } from '@/data/shop';
import { mediaUrl } from '@/components/Picture';
import { Hero } from '@/components/sections/Hero';
import { Manifest } from '@/components/sections/Manifest';
import { Products } from '@/components/sections/Products';
import { Explode } from '@/components/sections/Explode';
import { Lab } from '@/components/sections/Lab';
import { Field } from '@/components/sections/Field';
import { Builder } from '@/components/sections/Builder';
import { Trust } from '@/components/sections/Trust';

const SITE = process.env.SITE_URL ?? 'https://pfalz-loadout.de';

/** Produkt-Schema (JSON-LD) aus den zentralen Shopdaten */
function jsonLd() {
  const org = {
    '@type': 'Organization',
    '@id': `${SITE}/#org`,
    name: 'PFALZ LOADOUT',
    url: SITE,
    logo: `${SITE}/media/logo-badge-320.webp`,
    email: SHOP.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SHOP.contact.street,
      postalCode: SHOP.contact.zip,
      addressLocality: SHOP.contact.city,
      addressCountry: 'DE',
    },
  };
  const products = PRODUCTS.map((p) => {
    const firstStage = Object.values(p.stage)[0]?.[0];
    return {
      '@type': 'ProductGroup',
      name: `${p.name} ${p.code}`,
      productGroupID: p.code,
      description: p.description,
      brand: { '@type': 'Brand', name: 'PFALZ LOADOUT' },
      image: firstStage ? `${SITE}${mediaUrl(firstStage)}` : undefined,
      url: `${SITE}/#${p.slug}`,
      variesBy: ['https://schema.org/color'],
      hasVariant: p.variants.map((v) => ({
        '@type': 'Product',
        sku: v.sku,
        name: `${p.name} ${v.option ?? ''} ${v.color}`.replace(/\s+/g, ' ').trim(),
        color: v.color,
        offers: {
          '@type': 'Offer',
          price: (v.priceCents / 100).toFixed(2),
          priceCurrency: 'EUR',
          availability: v.stock === 'ausverkauft' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': `${SITE}/#org` },
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'DE' },
            shippingRate: { '@type': 'MonetaryAmount', value: (SHOP.shipping.flatCents / 100).toFixed(2), currency: 'EUR' },
          },
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'DE',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 14,
          },
        },
      })),
    };
  });
  return { '@context': 'https://schema.org', '@graph': [org, ...products] };
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, '\\u003c') }} />
      <Hero />
      <Manifest />
      <Products />
      <Explode />
      <Lab />
      <Field />
      <Builder />
      <Trust />
    </>
  );
}
