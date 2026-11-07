import type { Metadata } from 'next';
import ComoUsarSellosPageContent from '@/components/pages/ComoUsarSellosPageContent';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { createPageMetadata } from '@/lib/seo';
import { localizeTree } from '@/lib/markets/localizeTree';
import type { MarketCode } from '@/lib/markets/types';

const TITLE = 'Cómo usar sellos de bronce en cuero, madera y alimentos | Alcohn';
const DESCRIPTION =
  'Guía práctica: temperatura, presión y técnica para marcar cuero, madera, pan, packaging, hielo y más con sellos de bronce.';

type PageParams = { params: { market: string } };

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);

  return createPageMetadata({
    title: marketSeoTitle(TITLE, market),
    description: marketSeoDescription(DESCRIPTION, market),
    path: '/como-usar-sellos',
    market,
  });
}

function InternationalComoUsarSellosPageContent({ params }: PageParams) {
  const market = requireInternationalMarket(params.market) as InternationalMarketCode;
  return <ComoUsarSellosPageContent market={market} />;
}

export default function InternationalComoUsarSellosPage(props: PageParams) {
  return localizeTree(InternationalComoUsarSellosPageContent(props), props.params.market as MarketCode);
}
