import type { Metadata } from 'next';
import InternationalLegalLayout from '@/components/market/InternationalLegalLayout';
import { getMarketConfig } from '@/lib/markets/config';
import { getInternationalPrivacySections } from '@/lib/markets/legal';
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
    title: marketSeoTitle(`Política de privacidad internacional | Alcohn ${country}`, market),
    description: marketSeoDescription(
      'Cómo tratamos tus datos en compras internacionales de sellos Alcohn.',
      market
    ),
    path: '/privacidad',
    market,
  });
}

export default function InternationalPrivacidadPage({ params }: PageParams) {
  const market = requireInternationalMarket(params.market);
  const country = getMarketConfig(market).countryName;

  return (
    <InternationalLegalLayout
      market={market}
      title="Política de privacidad"
      intro={`Última actualización: agosto de 2026. Tratamiento de datos personales para compras internacionales con envío DHL a ${country}.`}
      sections={getInternationalPrivacySections(market)}
    />
  );
}
