import type { Metadata } from 'next';
import { getMarketConfig } from '@/lib/markets/config';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import { createPageMetadata } from '@/lib/seo';

type PageParams = {
  params: { market: string };
};

const BUY_TITLE = 'Diseñar sello personalizado | Alcohn';
const BUY_DESCRIPTION =
  'Subí tu logo, elegí material y medida. Cotizá y fabricá tu sello de bronce CNC en minutos.';

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);

  return createPageMetadata({
    title: marketSeoTitle(BUY_TITLE, market),
    description: marketSeoDescription(BUY_DESCRIPTION, market),
    path: '/buy',
    market,
    robots: { index: false, follow: false },
  });
}

export default function InternationalBuyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
