import type { InternationalMarketCode } from '@/lib/markets/types';
import { getMarketConfig } from '@/lib/markets/config';

export default function ImportDutiesNotice({ market }: { market: InternationalMarketCode }) {
  const country = getMarketConfig(market).countryName;

  return (
    <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
      <p className="font-semibold">Impuestos de importación</p>
      <p className="mt-1">
        El precio incluye producto y envío internacional DHL a {country}. No incluye impuestos,
        aranceles ni gastos de importación del país de destino. Si corresponden, DHL te avisará por
        email o teléfono y los pagarás directamente en la página de DHL.
      </p>
    </div>
  );
}
