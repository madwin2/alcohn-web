'use client';

import { usePathname } from 'next/navigation';
import { useMarket } from '@/contexts/MarketContext';
import { getMarketConfig } from '@/lib/markets/config';
import { stripMarketFromPathname } from '@/lib/markets/paths';
import { INSTALLMENTS_WITHOUT_INTEREST, TRANSFER_DISCOUNT_PERCENT } from '@/lib/installments';

/**
 * Barra superior con las condiciones de compra. En Argentina: cuotas sin interés y
 * descuento por transferencia. Afuera: envío DHL y pago en moneda local.
 */
export default function PromoBar() {
  const { market } = useMarket();
  const pathname = usePathname() || '/';
  const config = getMarketConfig(market);
  // Los abecedarios se fabrican en 10–14 días hábiles: ahí no se promete 72 hs.
  const showLeadTime = !stripMarketFromPathname(pathname).startsWith('/abecedarios');
  const leadTime = market === 'ar' ? 'Sellos listos en 72 hs hábiles' : 'Sellos fabricados en 72 hs hábiles';

  const items = [
    ...(market === 'ar'
      ? [`${INSTALLMENTS_WITHOUT_INTEREST} cuotas sin interés`, `${TRANSFER_DISCOUNT_PERCENT}% off por transferencia`]
      : [`Envío DHL a ${config.countryName}`, `Pago en ${config.currency}`]),
    ...(showLeadTime ? [leadTime] : []),
  ];

  return (
    <div className="bg-[var(--alcohn-bronze,#a87a4a)] text-neutral-950" role="note" aria-label="Condiciones de compra">
      <p className="container mx-auto flex items-center justify-center gap-x-3 px-4 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide md:text-xs">
        {items.map((item, index) => (
          <span key={item} className={index === 2 ? 'hidden sm:inline' : undefined}>
            {index > 0 && <span aria-hidden="true" className="mr-3 opacity-60">·</span>}
            {item}
          </span>
        ))}
      </p>
    </div>
  );
}
