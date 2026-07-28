'use client';

import { usePathname } from 'next/navigation';
import { stripMarketFromPathname } from '@/lib/markets/paths';
import Header from './Header';

/**
 * En /buy mobile el wizard trae su propio header (como el mock Claude).
 * En desktop se mantiene el header del sitio.
 */
export default function ConditionalHeader() {
  const pathname = usePathname() || '/';
  const currentPath = stripMarketFromPathname(pathname);
  const isBuy = currentPath.startsWith('/buy');

  if (isBuy) {
    return (
      <div className="hidden md:block">
        <Header />
      </div>
    );
  }

  return <Header />;
}
