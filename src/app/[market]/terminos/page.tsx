import type { Metadata } from 'next';
import InternationalLegalLayout from '@/components/market/InternationalLegalLayout';
import { getMarketConfig } from '@/lib/markets/config';
import { getInternationalTermsSections } from '@/lib/markets/legal';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import { createPageMetadata } from '@/lib/seo';
import type { MarketCode } from '@/lib/markets/types';
import { localizeTree } from '@/lib/markets/localizeTree';

type PageParams = {
  params: { market: string };
};

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);

  return createPageMetadata({
    title: marketSeoTitle('Términos y condiciones internacionales | Alcohn', market),
    description: marketSeoDescription(
      'Términos de compra internacional, envío DHL e impuestos de importación.',
      market
    ),
    path: '/terminos',
    market,
  });
}

function InternationalTerminosPageContent({ params }: PageParams) {
  const market = requireInternationalMarket(params.market);
  const country = getMarketConfig(market).countryName;

  return (
    <InternationalLegalLayout
      market={market}
      title="Términos y condiciones"
      intro={`Condiciones de compra internacional para envíos DHL a ${country}.`}
      sections={getInternationalTermsSections(country)}
    />
  );
}

export default function InternationalTerminosPage(props: PageParams) {
  return localizeTree(InternationalTerminosPageContent(props), props.params.market as MarketCode);
}
