'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { getMarketConfig } from '@/lib/markets/config';
import { marketFromPathname } from '@/lib/markets/paths';
import type { MarketCode, MarketConfig } from '@/lib/markets/types';

interface MarketContextValue {
  market: MarketCode;
  config: MarketConfig;
}

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const market = marketFromPathname(pathname);
  const value = useMemo(
    () => ({
      market,
      config: getMarketConfig(market),
    }),
    [market]
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within MarketProvider');
  }
  return context;
}
