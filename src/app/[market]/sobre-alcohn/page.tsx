import type { Metadata } from 'next';
import SobreAlcohnPageContent from '@/components/pages/SobreAlcohnPageContent';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { createPageMetadata } from '@/lib/seo';

const TITLE = 'Sobre Alcohn | Sellos de bronce CNC desde Argentina';
const DESCRIPTION =
  'Fabricamos sellos de bronce de alta precisión con CNC propia en Mar del Plata. Envío internacional DHL.';

type PageParams = { params: { market: string } };

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);

  return createPageMetadata({
    title: marketSeoTitle(TITLE, market),
    description: marketSeoDescription(DESCRIPTION, market),
    path: '/sobre-alcohn',
    market,
  });
}

export default function InternationalSobreAlcohnPage({ params }: PageParams) {
  const market = requireInternationalMarket(params.market) as InternationalMarketCode;
  return <SobreAlcohnPageContent market={market} />;
}
