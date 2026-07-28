import type { Metadata } from 'next';
import InternationalLegalLayout from '@/components/market/InternationalLegalLayout';
import { getMarketConfig } from '@/lib/markets/config';
import { getInternationalShippingPolicySections } from '@/lib/markets/legal';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import { createPageMetadata } from '@/lib/seo';

type PageParams = {
  params: { market: string };
};

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);
  const country = getMarketConfig(market).countryName;

  return createPageMetadata({
    title: marketSeoTitle(`Política de envíos internacionales DHL a ${country} | Alcohn`, market),
    description: marketSeoDescription(
      `Envío DHL desde Argentina a ${country}, plazos de fabricación y costos de importación.`,
      market
    ),
    path: '/politica-envios',
    market,
  });
}

export default function InternationalPoliticaEnviosPage({ params }: PageParams) {
  const market = requireInternationalMarket(params.market);
  const country = getMarketConfig(market).countryName;

  return (
    <InternationalLegalLayout
      market={market}
      title="Política de envíos"
      intro={`Cómo recibís tu sello en ${country}: envío DHL desde Argentina, plazos y costos transparentes antes de pagar.`}
      sections={getInternationalShippingPolicySections(country)}
    />
  );
}
