import type { Metadata } from 'next';
import InternationalLegalLayout from '@/components/market/InternationalLegalLayout';
import { getMarketConfig } from '@/lib/markets/config';
import { getInternationalReturnsPolicySections } from '@/lib/markets/legal';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import { createPageMetadata } from '@/lib/seo';

type PageParams = {
  params: { market: string };
};

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);

  return createPageMetadata({
    title: marketSeoTitle('Política de devoluciones internacionales | Alcohn', market),
    description: marketSeoDescription(
      'Devoluciones y garantía para pedidos internacionales de sellos personalizados Alcohn.',
      market
    ),
    path: '/politica-devoluciones',
    market,
  });
}

export default function InternationalPoliticaDevolucionesPage({ params }: PageParams) {
  const market = requireInternationalMarket(params.market);
  const country = getMarketConfig(market).countryName;

  return (
    <InternationalLegalLayout
      market={market}
      title="Política de devoluciones"
      intro={`Condiciones para pedidos internacionales a ${country}: productos personalizados, defectos y plazos de reclamo.`}
      sections={getInternationalReturnsPolicySections()}
    />
  );
}
