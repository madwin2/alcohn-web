import { getMarketConfig } from './config';
import type { MarketCode } from './types';

export function roundToIncrement(value: number, increment: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (!Number.isFinite(increment) || increment <= 1) return Math.round(value);
  return Math.round(value / increment) * increment;
}

export function formatMarketMoney(value: number, market: MarketCode): string {
  const config = getMarketConfig(market);
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    maximumFractionDigits: config.currency === 'PEN' || config.currency === 'MXN' ? 2 : 0,
  }).format(value);
}
