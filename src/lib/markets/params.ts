import { notFound } from 'next/navigation';
import { isInternationalMarket } from './config';
import type { InternationalMarketCode } from './types';

export function requireInternationalMarket(market: string): InternationalMarketCode {
  if (!isInternationalMarket(market)) {
    notFound();
  }
  return market;
}
