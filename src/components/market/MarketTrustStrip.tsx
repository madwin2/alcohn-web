import type { InternationalMarketCode } from '@/lib/markets/types';
import { getMarketConfig } from '@/lib/markets/config';
import { getMarketLocalCopy } from '@/lib/markets/localCopy';

export default function MarketTrustStrip({ market }: { market: InternationalMarketCode }) {
  const country = getMarketConfig(market).countryName;
  const copy = getMarketLocalCopy(market);

  const items = [
    `Envío DHL Express a ${country} en ${copy.dhlDays} días hábiles`,
    `Fabricación en 72 h hábiles`,
    copy.currencyPhrase.charAt(0).toUpperCase() + copy.currencyPhrase.slice(1),
  ];

  return (
    <div className="border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] px-4 py-3 text-sm leading-relaxed text-neutral-800">
      <ul className="flex flex-col gap-1 md:flex-row md:flex-wrap md:items-center md:gap-x-6 md:gap-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span aria-hidden="true" className="text-[var(--alcohn-bronze)]">
              ●
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
