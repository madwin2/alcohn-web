import type { Metadata } from 'next';
import HomeLanding from '@/components/HomeLanding';
import { getMarketLocalCopy } from '@/lib/markets/localCopy';
import { requireInternationalMarket } from '@/lib/markets/params';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { createPageMetadata } from '@/lib/seo';

type PageParams = {
  params: { market: string };
};

const HOME_TITLES: Record<InternationalMarketCode, string> = {
  cl: 'Cuños de bronce personalizados | Envío DHL a Chile | Alcohn',
  pe: 'Sellos de bronce personalizados | Envío DHL a Perú | Alcohn',
  co: 'Sellos al calor de bronce personalizados | Envío DHL a Colombia | Alcohn',
  mx: 'Sellos a fuego y hierros de marcar de bronce | Envío DHL a México | Alcohn',
};

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);

  return createPageMetadata({
    title: HOME_TITLES[market],
    description: getMarketLocalCopy(market).heroSubtitle,
    path: '/',
    market,
  });
}

export default function InternationalHomePage({ params }: PageParams) {
  const market = requireInternationalMarket(params.market) as InternationalMarketCode;

  return <HomeLanding market={market} />;
}
