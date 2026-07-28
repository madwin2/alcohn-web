import type { Metadata } from 'next';
import ContactoPageContent from '@/components/pages/ContactoPageContent';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { createPageMetadata } from '@/lib/seo';

const TITLE = 'Contacto | Sellos de bronce personalizados Alcohn';
const DESCRIPTION =
  'Escribinos por WhatsApp o formulario. Resolvemos dudas sobre tu sello de bronce CNC con envío internacional DHL.';

type PageParams = { params: { market: string } };

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);

  return createPageMetadata({
    title: marketSeoTitle(TITLE, market),
    description: marketSeoDescription(DESCRIPTION, market),
    path: '/contacto',
    market,
  });
}

export default function InternationalContactoPage({ params }: PageParams) {
  const market = requireInternationalMarket(params.market) as InternationalMarketCode;
  return <ContactoPageContent market={market} />;
}
