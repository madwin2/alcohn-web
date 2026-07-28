import { notFound } from 'next/navigation';
import { INTERNATIONAL_MARKETS, isInternationalMarket } from '@/lib/markets/config';

export function generateStaticParams() {
  return INTERNATIONAL_MARKETS.map((market) => ({ market }));
}

export default function MarketLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { market: string };
}) {
  if (!isInternationalMarket(params.market)) {
    notFound();
  }

  return children;
}
