'use client';

import { useMarket } from '@/contexts/MarketContext';
import { formatMarketMoney } from '@/lib/markets/money';
import { convertPublicArsToMarketPrice } from '@/lib/markets/pricing';

type PriceFromProps = {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base md:text-lg',
  lg: 'text-xl md:text-2xl',
};

export default function PriceFrom({ amount, className = '', size = 'md' }: PriceFromProps) {
  const { market } = useMarket();
  const displayAmount = convertPublicArsToMarketPrice(amount, market);

  return (
    <p className={`${sizeClasses[size]} text-neutral-700 ${className}`.trim()}>
      <span className="craft-label mr-2 md:mr-3">Desde</span>
      <span className="font-semibold text-neutral-950">{formatMarketMoney(displayAmount, market)}</span>
    </p>
  );
}
