import type { MetadataRoute } from 'next';
import { INTERNATIONAL_MARKETS } from '@/lib/markets/config';
import { marketPath } from '@/lib/markets/paths';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const internationalDisallow = INTERNATIONAL_MARKETS.flatMap((market) => [
    marketPath(market, '/buy'),
    marketPath(market, '/carrito'),
    marketPath(market, '/checkout'),
  ]);

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/buy', '/carrito', '/checkout', ...internationalDisallow],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
