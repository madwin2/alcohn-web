import type { Metadata } from 'next';
import FaqPageContent from '@/components/pages/FaqPageContent';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { createPageMetadata } from '@/lib/seo';

const TITLE = 'Preguntas frecuentes sobre sellos de bronce personalizados | Alcohn';
const DESCRIPTION =
  'Dudas sobre medidas, materiales, tiempos de fabricación, envíos internacionales y compra de sellos de bronce CNC.';

type PageParams = { params: { market: string } };

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);

  return createPageMetadata({
    title: marketSeoTitle(TITLE, market),
    description: marketSeoDescription(DESCRIPTION, market),
    path: '/faq',
    market,
  });
}

export default function InternationalFaqPage({ params }: PageParams) {
  const market = requireInternationalMarket(params.market) as InternationalMarketCode;
  return <FaqPageContent market={market} />;
}
