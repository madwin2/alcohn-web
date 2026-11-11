'use client';

import { useMarket } from '@/contexts/MarketContext';
import { formatMarketMoney } from '@/lib/markets/money';
import { TRANSFER_DISCOUNT_PERCENT } from '@/lib/installments';

interface CartSummaryProps {
  subtotal: number;
  shippingCost?: number;
  shippingLabel?: string;
  /** 3 sellos o más: muestra la línea de envío como "Gratis". */
  freeShipping?: boolean;
  /** Solo Argentina: subtotal pagando por transferencia (los precios del carrito son con tarjeta). */
  transferSubtotal?: number;
  className?: string;
}

export default function CartSummary({
  subtotal,
  shippingCost = 0,
  shippingLabel,
  freeShipping = false,
  transferSubtotal,
  className = '',
}: CartSummaryProps) {
  const { market } = useMarket();
  const total = subtotal + shippingCost;
  const transferTotal = transferSubtotal != null ? transferSubtotal + shippingCost : null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-neutral-600">Subtotal</span>
        <span className="font-semibold text-neutral-900">
          {formatMarketMoney(subtotal, market)}
        </span>
      </div>
      {shippingCost > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral-600">
            Envío{shippingLabel ? ` (${shippingLabel})` : ''}
          </span>
          <span className="font-semibold text-neutral-900">
            {formatMarketMoney(shippingCost, market)}
          </span>
        </div>
      )}
      {freeShipping && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral-600">
            Envío{shippingLabel ? ` (${shippingLabel})` : ''}
          </span>
          <span className="font-semibold text-emerald-700">Gratis</span>
        </div>
      )}
      <div className="flex justify-between items-center text-sm pt-2 border-t border-neutral-200">
        <span className="text-neutral-900 font-medium">Total</span>
        <span className="text-lg font-semibold text-neutral-900">
          {formatMarketMoney(total, market)}
        </span>
      </div>
      {transferTotal != null && transferTotal > 0 && transferTotal < total && (
        <p className="text-right text-[12.5px] text-neutral-600">
          o <strong className="font-semibold text-neutral-900">{formatMarketMoney(transferTotal, market)}</strong>{' '}
          por transferencia ({TRANSFER_DISCOUNT_PERCENT}% off)
        </p>
      )}
      {shippingCost === 0 && !shippingLabel && !freeShipping && (
        <p className="text-xs text-neutral-500">El envío se confirma en el siguiente paso</p>
      )}
    </div>
  );
}
