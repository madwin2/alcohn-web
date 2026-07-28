import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AccessoryProductPage from '@/components/accesorios/AccessoryProductPage';
import ImportDutiesNotice from '@/components/market/ImportDutiesNotice';
import { getAccessoryBySlug } from '@/data/accessories';
import { getAccessoryLinkPrice } from '@/data/accessories';
import { isAccessoryAvailableInMarket } from '@/lib/markets/catalog';
import { marketPath } from '@/lib/markets/paths';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { buildBreadcrumbJsonLd, buildProductJsonLd, createPageMetadata } from '@/lib/seo';

type PageParams = {
  params: { market: string };
};

const MANGO_SLUG = 'mango-de-golpe';

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);
  const accessory = getAccessoryBySlug(MANGO_SLUG);

  if (!accessory || !isAccessoryAvailableInMarket(MANGO_SLUG, market)) {
    return {
      title: 'Accesorio no encontrado - Alcohn',
      robots: { index: false, follow: false },
    };
  }

  const canonical = `/accesorios/${accessory.slug}`;

  return createPageMetadata({
    title: marketSeoTitle(accessory.seoTitle ?? `${accessory.title} | Alcohn`, market),
    description: marketSeoDescription(accessory.seoDescription ?? accessory.description, market),
    path: canonical,
    image: accessory.image,
    market,
  });
}

export default function InternationalMangoPage({ params }: PageParams) {
  const market = requireInternationalMarket(params.market) as InternationalMarketCode;
  const accessory = getAccessoryBySlug(MANGO_SLUG);

  if (!accessory || !isAccessoryAvailableInMarket(MANGO_SLUG, market)) {
    notFound();
  }

  const canonical = `/accesorios/${accessory.slug}`;
  const priceValue = accessory.variants?.[0]?.linkPrice ?? getAccessoryLinkPrice(accessory);

  const productJsonLd = buildProductJsonLd({
    name: accessory.title,
    description: accessory.description,
    path: canonical,
    image: accessory.image,
    sku: accessory.code,
    category: 'Accesorios',
    price: priceValue,
    market,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Inicio', path: marketPath(market, '/') },
    { name: 'Productos', path: marketPath(market, '/productos') },
    { name: accessory.title, path: marketPath(market, canonical) },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="py-6 md:py-8">
          <ImportDutiesNotice market={market} />
        </div>
      </div>
      <AccessoryProductPage
        accessory={accessory}
        backHref={marketPath(market, '/productos')}
        checkoutHref={marketPath(market, '/checkout')}
        continueShoppingHref={marketPath(market, '/productos')}
        showTransferPrice={false}
      />
    </>
  );
}
