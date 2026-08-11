import ActionButton from '@/components/ActionButton';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { getMarketConfig } from '@/lib/markets/config';
import { getMarketLocalCopy } from '@/lib/markets/localCopy';
import { marketBuyPath, marketPath } from '@/lib/markets/paths';

export default function InternationalBuySteps({ market }: { market: InternationalMarketCode }) {
  const country = getMarketConfig(market).countryName;
  const copy = getMarketLocalCopy(market);

  const steps = [
    {
      number: '01',
      title: 'Sube tu logo y mira la muestra',
      body: 'Eliges uso y medida en el diseñador online y ves cómo queda tu marca antes de pagar. El precio final aparece al instante, con envío incluido.',
    },
    {
      number: '02',
      title: 'Fabricamos tu sello en 72 h hábiles',
      body: `Mecanizamos el bronce en CNC en nuestro taller de Mar del Plata, Argentina. Pagas online en moneda local (${copy.paymentMethods.join(', ').toLowerCase()}).`,
    },
    {
      number: '03',
      title: `DHL lo lleva a tu puerta en ${country}`,
      body: `Despachamos por DHL Express con seguimiento: llega en ${copy.dhlDays} días hábiles desde el despacho. Si tu país aplica impuestos de importación, DHL te contacta y los pagas directo a DHL.`,
    },
  ];

  return (
    <section className="atelier-page border-b border-[var(--alcohn-line)] py-6 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-4 md:technical-sheet md:blueprint-sheet md:mobile-clean-sheet md:gap-0">
          <div className="max-md:border max-md:border-[var(--alcohn-line)] max-md:bg-[var(--alcohn-surface)] p-4 md:p-10 lg:p-12">
            <p className="craft-label mb-4">Compra internacional</p>
            <h2 className="max-w-2xl text-[1.6rem] font-semibold leading-tight tracking-tight text-neutral-950 md:text-5xl">
              Comprar desde {country} es simple.
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3 md:gap-8">
              {steps.map((step) => (
                <article key={step.number} className="border-t border-[var(--alcohn-line)] pt-4">
                  <p className="craft-label mb-2">{step.number}</p>
                  <h3 className="text-base font-semibold leading-snug text-neutral-950 md:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">{step.body}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row md:mt-8 md:gap-3">
              <ActionButton href={marketBuyPath(market)} variant="primary">
                Subir logo y ver precio
              </ActionButton>
              <ActionButton href={marketPath(market, '/politica-envios')} variant="ghost">
                Ver política de envíos
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
