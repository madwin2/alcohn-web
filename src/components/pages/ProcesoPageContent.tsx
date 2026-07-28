import PageIntro from '@/components/PageIntro';
import SalesCtaBand from '@/components/SalesCtaBand';
import Timeline from '@/components/Timeline';
import { processSteps } from '@/data/process';
import { getMarketConfig } from '@/lib/markets/config';
import {
  marketBreadcrumbJsonLd,
  marketBuyCta,
  marketStandardSecondaryCta,
} from '@/lib/markets/infoPages';
import { marketBuyPath, marketPath } from '@/lib/markets/paths';
import type { MarketCode } from '@/lib/markets/types';

function getFacts(market: MarketCode) {
  const country = getMarketConfig(market).countryName;

  return [
    {
      title: 'El mismo sello puede servir en varios materiales',
      copy: 'Cuero, madera, carton, pan, lacre, hielo, cerámica, jabón o packaging pueden resolverse con una misma pieza si la medida, profundidad y método de marcado están bien elegidos.',
    },
    {
      title: 'Calor o presión según el uso',
      copy: 'Podés usarlo con hornalla, soplete, prensa o remachadora. La técnica correcta depende del material y del acabado buscado.',
    },
    {
      title: 'Fabricacion Rapida',
      copy:
        market === 'ar'
          ? 'Sabemos que tus tiempos son importantes. Por eso fabricamos en 72hs hábiles. Y te lo enviamos por Correo Argentino a sucursal o domicilio.'
          : `Fabricamos en 72hs hábiles desde Argentina y enviamos a ${country} por DHL con seguimiento internacional.`,
    },
    {
      title: 'Seguridad Garantizada',
      copy: 'Nuestro sistema de pago es seguro y confiable. Y nosotros te acompañamos en todo el proceso.',
    },
  ];
}

type ProcesoPageContentProps = {
  market: MarketCode;
};

export default function ProcesoPageContent({ market }: ProcesoPageContentProps) {
  const breadcrumbJsonLd = marketBreadcrumbJsonLd(market, [
    { name: 'Inicio', path: '/' },
    { name: 'Cómo funciona', path: '/proceso' },
  ]);
  const secondaryCta = marketStandardSecondaryCta(market);

  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <PageIntro
          label="Proceso Alcohn"
          title="Del logo al bronce sin perder tiempo"
          description="Aca te explicamos como es todo el porceso. Para que entiendas qué se fabrica, cómo se aprueba, cuánto tarda y qué pasa después de pagar. Menos incertidumbre para vos y mas claridad para tu compra."
          primaryCta={marketBuyCta(market, 'Diseñar y ver precio')}
          secondaryCta={{
            label: 'Ver usos del sello',
            href: marketPath(market, '/como-usar-sellos'),
            variant: 'secondary',
          }}
        />

        <section className="mb-20">
          <Timeline steps={processSteps} />
        </section>

        <section className="mb-20">
          <div className="technical-sheet">
            <div className="relative z-10 border-b border-[var(--alcohn-line)] p-6 md:p-10">
              <p className="craft-label mb-4">Lo que necesitás saber</p>
              <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-5xl">
                Información clave antes de comprar
              </h2>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
              {getFacts(market).map((fact) => (
                <article
                  key={fact.title}
                  className="border-b border-[var(--alcohn-line)] p-6 even:md:border-r-0 md:border-r md:p-8"
                >
                  <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
                    {fact.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-700">{fact.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SalesCtaBand
          title="Empezá por el diseñador y dejá que el sistema ordene el pedido"
          copy="Subí tu logo, elegí uso, cargá datos y avanzá con muestra, medida y precio antes de fabricar."
          primaryLabel="Diseñar y ver precio"
          primaryHref={marketBuyPath(market)}
          secondaryLabel={secondaryCta.label}
          secondaryHref={secondaryCta.href}
          dark
        />
      </div>
    </div>
  );
}
