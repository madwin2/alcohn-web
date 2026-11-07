import type { Metadata } from 'next';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import { createPageMetadata } from '@/lib/seo';

type LayoutParams = { params: { market: string } };

export function generateMetadata({ params }: LayoutParams): Metadata {
  const market = requireInternationalMarket(params.market);
  return createPageMetadata({
    title: marketSeoTitle('Carrito | Alcohn', market),
    description: marketSeoDescription(
      'Revisa tu pedido de sellos de bronce antes de finalizar la compra.',
      market
    ),
    path: '/carrito',
    market,
    robots: { index: false, follow: false },
  });
}

export default function InternationalCartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
