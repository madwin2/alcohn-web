import type { Metadata } from 'next';
import HomeLanding from '@/components/HomeLanding';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { SITE_DEFAULT_DESCRIPTION, SITE_DEFAULT_TITLE, createPageMetadata } from '@/lib/seo';

type PageParams = {
  params: { market: string };
};

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);

  return createPageMetadata({
    title: marketSeoTitle(SITE_DEFAULT_TITLE, market),
    description: marketSeoDescription(SITE_DEFAULT_DESCRIPTION, market),
    path: '/',
    market,
  });
}

export default function InternationalHomePage({ params }: PageParams) {
  const market = requireInternationalMarket(params.market) as InternationalMarketCode;

  return <HomeLanding market={market} />;
}
