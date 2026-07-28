import type { Metadata } from 'next';
import ProcesoPageContent from '@/components/pages/ProcesoPageContent';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { createPageMetadata } from '@/lib/seo';

const TITLE = 'Cómo comprar tu sello de bronce | Proceso en 72hs | Alcohn';
const DESCRIPTION =
  'Pasos para comprar un sello personalizado: subí tu logo, elegí medida y material, revisá muestra y recibí tu sello de bronce CNC.';

type PageParams = { params: { market: string } };

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);

  return createPageMetadata({
    title: marketSeoTitle(TITLE, market),
    description: marketSeoDescription(DESCRIPTION, market),
    path: '/proceso',
    market,
  });
}

export default function InternationalProcesoPage({ params }: PageParams) {
  const market = requireInternationalMarket(params.market) as InternationalMarketCode;
  return <ProcesoPageContent market={market} />;
}
