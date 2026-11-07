import type { Metadata } from 'next';
import CasosRealesPageContent from '@/components/pages/CasosRealesPageContent';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { createPageMetadata } from '@/lib/seo';
import { localizeTree } from '@/lib/markets/localizeTree';
import type { MarketCode } from '@/lib/markets/types';

const TITLE =
  'Casos reales: marcas que usan sellos Alcohn (Brooksfield, Tucci, Mistral, Lee) | Alcohn';
const DESCRIPTION =
  'Galería de sellos terminados y trabajos reales. Marcas, talleres y emprendedores que marcan con bronce CNC Alcohn.';

type PageParams = { params: { market: string } };

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);

  return createPageMetadata({
    title: marketSeoTitle(TITLE, market),
    description: marketSeoDescription(DESCRIPTION, market),
    path: '/casos-reales',
    market,
  });
}

function InternationalCasosRealesPageContent({ params }: PageParams) {
  const market = requireInternationalMarket(params.market) as InternationalMarketCode;
  return <CasosRealesPageContent market={market} />;
}

export default function InternationalCasosRealesPage(props: PageParams) {
  return localizeTree(InternationalCasosRealesPageContent(props), props.params.market as MarketCode);
}
