'use client';

import BuyPageContentWithSuspense from '@/components/BuyPageContent';
import { useMarket } from '@/contexts/MarketContext';
import { localizeTree } from '@/lib/markets/localizeTree';

function InternationalBuyPageContent() {
  return <BuyPageContentWithSuspense />;
}

export default function InternationalBuyPage() {
  const { market } = useMarket();
  return localizeTree(InternationalBuyPageContent(), market);
}
