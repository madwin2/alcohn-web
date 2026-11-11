'use client';

import type { CartItem } from '@/lib/cart';
import {
  FREE_SHIPPING_MIN_STAMPS,
  countStampUnits,
  stampsMissingForFreeShipping,
} from '@/lib/shipping/freeShipping';

type CartLine = Pick<CartItem, 'id' | 'designSlug' | 'collection' | 'variantSize' | 'qty'>;

/** Barra "Te falta 1 sello para el envío gratis" (solo Argentina). */
export default function FreeShippingProgress({
  items,
  className = '',
}: {
  items: CartLine[];
  className?: string;
}) {
  const stamps = countStampUnits(items);
  if (stamps === 0) return null;
  const missing = stampsMissingForFreeShipping(items);
  const pct = Math.min(100, Math.round((stamps / FREE_SHIPPING_MIN_STAMPS) * 100));

  return (
    <div className={className}>
      <p className="text-[13px] leading-snug text-neutral-800">
        {missing === 0 ? (
          <strong className="font-semibold text-emerald-700">¡Tenés envío gratis!</strong>
        ) : (
          <>
            Te {missing === 1 ? 'falta' : 'faltan'}{' '}
            <strong className="font-semibold">
              {missing} {missing === 1 ? 'sello' : 'sellos'}
            </strong>{' '}
            para el envío gratis.
          </>
        )}
      </p>
      <div
        className="mt-1.5 h-1.5 w-full overflow-hidden bg-neutral-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_MIN_STAMPS}
        aria-valuenow={Math.min(stamps, FREE_SHIPPING_MIN_STAMPS)}
        aria-label="Avance hacia el envío gratis"
      >
        <div
          className={`h-full transition-all duration-300 ${missing === 0 ? 'bg-emerald-600' : 'bg-[var(--alcohn-bronze,#a87a4a)]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
