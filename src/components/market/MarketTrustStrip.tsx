import Link from 'next/link';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { getMarketConfig } from '@/lib/markets/config';
import { getMarketLocalCopy } from '@/lib/markets/localCopy';
import { marketPath } from '@/lib/markets/paths';

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
      <p className="mt-1 text-xs text-neutral-500">
        El total no incluye impuestos de importación del país de destino.{' '}
        <Link href={marketPath(market, '/politica-envios')} className="underline underline-offset-2">
          Ver detalle
        </Link>
      </p>
    </div>
  );
}
