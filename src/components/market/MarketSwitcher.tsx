'use client';

import Link from 'next/link';
import { INTERNATIONAL_MARKETS, MARKETS } from '@/lib/markets/config';
import { marketPrefCookieOptions } from '@/lib/markets/geo';
import { marketPath, stripMarketFromPathname } from '@/lib/markets/paths';
import { useMarket } from '@/contexts/MarketContext';
import type { MarketCode } from '@/lib/markets/types';
import { usePathname } from 'next/navigation';

const MARKET_OPTIONS: MarketCode[] = ['ar', ...INTERNATIONAL_MARKETS];

export default function MarketSwitcher({ className = '' }: { className?: string }) {
  const pathname = usePathname() ?? '/';
  const currentPath = stripMarketFromPathname(pathname);
  const { market } = useMarket();

  return (
    <div className={className}>
      <label className="sr-only" htmlFor="market-switcher">
        País
      </label>
      <select
        id="market-switcher"
        value={market}
        onChange={(event) => {
          const nextMarket = event.target.value as MarketCode;
          const pref = marketPrefCookieOptions(nextMarket);
          document.cookie = `${pref.name}=${pref.value}; max-age=${pref.maxAge}; path=${pref.path}; samesite=${pref.sameSite}`;
          window.location.href = marketPath(nextMarket, currentPath);
        }}
        className="border border-neutral-700 bg-neutral-900 px-2 py-2 text-xs text-white"
      >
        {MARKET_OPTIONS.map((code) => (
          <option key={code} value={code}>
            {MARKETS[code].countryName}
          </option>
        ))}
      </select>
      <noscript>
        <div className="mt-2 flex flex-wrap gap-2">
          {MARKET_OPTIONS.map((code) => (
            <Link key={code} href={marketPath(code, currentPath)}>
              {MARKETS[code].countryName}
            </Link>
          ))}
        </div>
      </noscript>
    </div>
  );
}
