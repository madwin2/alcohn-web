'use client';

import { useMarket } from '@/contexts/MarketContext';
import { formatMarketMoney } from '@/lib/markets/money';
import { convertPublicArsToMarketPrice } from '@/lib/markets/pricing';
import type { PriceKind } from '@/lib/installments';
import InstallmentsNote from './InstallmentsNote';

type PriceFromProps = {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Si `amount` es precio por transferencia (sellos) o con tarjeta (abecedarios). */
  kind?: PriceKind;
};

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base md:text-lg',
  lg: 'text-xl md:text-2xl',
};

export default function PriceFrom({
  amount,
  className = '',
  size = 'md',
  kind = 'transfer',
}: PriceFromProps) {
  const { market } = useMarket();
  const displayAmount = convertPublicArsToMarketPrice(amount, market);

  return (
    <div className={className}>
      <p className={`${sizeClasses[size]} text-neutral-700`}>
        <span className="craft-label mr-2 md:mr-3">Desde</span>
        <span className="font-semibold text-neutral-950">{formatMarketMoney(displayAmount, market)}</span>
      </p>
      <InstallmentsNote amount={amount} kind={kind} className="mt-1" />
    </div>
  );
}
