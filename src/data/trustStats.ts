import type { MarketCode } from '@/lib/markets/types';

export interface TrustStat {
  value: string;
  label: string;
  mobileLabel: string;
}

export const trustStats: TrustStat[] = [
  { value: '+7', label: 'años de experiencia', mobileLabel: 'años de exp.' },
  { value: '+6000', label: 'sellos fabricados', mobileLabel: 'sellos fabricados' },
  { value: '72hs', label: 'hábiles de fabricación', mobileLabel: 'fabricación' },
  { value: 'Envíos', label: 'a todo el país', mobileLabel: 'todo el país' },
];

/** Stats por mercado. AR conserva el array original. */
export function getTrustStats(market: MarketCode): TrustStat[] {
  if (market === 'ar') return trustStats;
  return trustStats.map((stat) =>
    stat.value === 'Envíos'
      ? { value: 'Envíos', label: 'DHL a 5 países', mobileLabel: 'DHL a 5 países' }
      : stat
  );
}
