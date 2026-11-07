import type { Metadata } from 'next';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import { createPageMetadata } from '@/lib/seo';

type LayoutParams = { params: { market: string } };

export function generateMetadata({ params }: LayoutParams): Metadata {
  const market = requireInternationalMarket(params.market);
  return createPageMetadata({
    title: marketSeoTitle('Checkout | Comprar sello de bronce | Alcohn', market),
    description: marketSeoDescription(
      'Finaliza tu compra de sellos de bronce personalizados.',
      market
    ),
    path: '/checkout',
    market,
    robots: { index: false, follow: false },
  });
}

export default function InternationalCheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
