import MaterialUsageSelector from '@/components/sellos/MaterialUsageSelector';
import PageIntroWithMaterialModal from '@/components/sellos/PageIntroWithMaterialModal';
import SalesCtaBand from '@/components/SalesCtaBand';
import MobileCarousel from '@/components/MobileCarousel';
import { marketBreadcrumbJsonLd, marketBuyCta } from '@/lib/markets/infoPages';
import { marketBuyPath, marketPath } from '@/lib/markets/paths';
import type { MarketCode } from '@/lib/markets/types';

const setupSteps = [
  ['01', 'Prepará el material', 'Superficie limpia, plana y con retazo de prueba disponible.'],
  ['02', 'Calibrá presión o calor', 'Hacé una primera marca de descarte y ajustá sin apurarte.'],
  ['03', 'Marcá perpendicular', 'Apoyá de forma pareja para evitar doble borde o presión inclinada.'],
  ['04', 'Registrá el ajuste', 'Guardá tiempo, temperatura o presión para repetir el resultado.'],
];

const mistakes = [
  {
    title: 'Marca quemada',
    cause: 'Exceso de temperatura o demasiados segundos de contacto.',
    fix: 'Bajá tiempo primero; si sigue oscuro, bajá temperatura.',
  },
  {
    title: 'Marca despareja',
    cause: 'Base inclinada, material irregular o presión lateral.',
    fix: 'Usá una base plana y apoyá el sello perpendicular al material.',
  },
  {
    title: 'Doble borde',
    cause: 'El sello se movió cuando ya estaba apoyado.',
    fix: 'Alineá antes de tocar la pieza y presioná sin girar ni arrastrar.',
  },
  {
    title: 'Poca lectura',
    cause: 'Logo demasiado fino, medida chica o presión insuficiente.',
    fix: 'Subí tamaño, aumentá presión o pedí revisión del archivo.',
  },
];

const care = [
  'Limpiá con paño seco o cepillo suave, sin productos abrasivos.',
  'No forzar ni retorcer el cable del soldador.',
  'No dejar el sello calentando por más tiempo del necesario, para no correr riesgo de que se doble por el calor.',
  'Cuidarlo de golpes y caídas para evitar rayaduras.',
];

type ComoUsarSellosPageContentProps = {
  market: MarketCode;
};

export default function ComoUsarSellosPageContent({ market }: ComoUsarSellosPageContentProps) {
  const breadcrumbJsonLd = marketBreadcrumbJsonLd(market, [
    { name: 'Inicio', path: '/' },
    { name: 'Cómo usar los sellos', path: '/como-usar-sellos' },
  ]);

  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <PageIntroWithMaterialModal
          label="Manual de uso"
          title="Cómo usar nuestros sellos"
          description="Una guía de banco de trabajo para elegir método, probar el material, evitar errores comunes y repetir una marca consistente en cuero, madera, packaging, alimentos, cerámica o lacre."
          mobileDescription="Guía rápida para elegir método, probar material y evitar errores al marcar."
          primaryCta={marketBuyCta(market, 'Diseñar sello personalizado')}
        />

        <section className="mb-14 md:mb-20 motion-reveal">
          <div className="technical-sheet blueprint-sheet">
            <MaterialUsageSelector />
          </div>
        </section>

        <section className="mb-14 md:mb-20 dark-system-panel p-4 text-white md:p-10">
          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-[0.32fr_0.68fr]">
            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase text-white/56">
                Secuencia recomendada
              </p>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                Una marca buena sale de una prueba controlada
              </h2>
            </div>
            <MobileCarousel
              rowClassName="sm:grid sm:grid-cols-2 lg:grid-cols-4"
              hint="Deslizá secuencia"
              className="hidden md:block"
            >
              {setupSteps.map(([code, title, copy]) => (
                <article
                  key={code}
                  className="mobile-snap-card border border-white/12 bg-black/10 p-5 sm:min-w-0 sm:border-b sm:border-r sm:bg-transparent sm:last:border-r-0"
                >
                  <p className="text-[10px] font-semibold uppercase text-white/42">{code}</p>
                  <h3 className="mt-8 text-lg font-semibold tracking-tight text-white">{title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-white/58">{copy}</p>
                </article>
              ))}
            </MobileCarousel>
            <ol className="space-y-3 md:hidden">
              {setupSteps.map(([code, title, copy]) => (
                <li key={code} className="border border-white/15 bg-black/15 p-3">
                  <p className="text-[10px] font-semibold uppercase text-white/52">{code}</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/75">{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mb-14 md:mb-20">
          <div className="mb-8 max-w-2xl">
            <p className="craft-label mb-4">Diagnóstico rápido</p>
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 md:text-4xl">
              Errores comunes y cómo corregirlos
            </h2>
          </div>
          <div className="technical-sheet blueprint-sheet hidden md:block">
            <MobileCarousel rowClassName="relative z-10 md:grid md:grid-cols-2" hint="Deslizá diagnóstico">
              {mistakes.map((item) => (
                <article
                  key={item.title}
                  className="mobile-snap-card border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-6 md:min-w-0 md:border-b md:border-r md:bg-transparent md:even:border-r-0"
                >
                  <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
                    {item.title}
                  </h3>
                  <dl className="mt-5 space-y-4 text-sm">
                    <div>
                      <dt className="craft-label mb-1">Causa probable</dt>
                      <dd className="text-neutral-700">{item.cause}</dd>
                    </div>
                    <div>
                      <dt className="craft-label mb-1">Cómo corregirlo</dt>
                      <dd className="text-neutral-900">{item.fix}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </MobileCarousel>
          </div>
          <div className="divide-y divide-[var(--alcohn-line)] border-y border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] md:hidden">
            {mistakes.map((item) => (
              <article key={item.title} className="p-4">
                <h3 className="text-2xl font-semibold tracking-tight text-neutral-950">{item.title}</h3>
                <p className="mt-3 text-sm text-neutral-600">
                  <span className="font-semibold">Causa:</span> {item.cause}
                </p>
                <p className="mt-2 text-sm text-neutral-900">
                  <span className="font-semibold">Solución:</span> {item.fix}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="technical-sheet blueprint-sheet mb-14 md:mb-20">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.34fr_0.66fr]">
            <div className="border-b border-[var(--alcohn-line)] p-4 md:p-8 lg:border-b-0 lg:border-r">
              <p className="craft-label mb-4">Mantenimiento</p>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 md:text-4xl">
                Cuidados del sello
              </h2>
            </div>
            <MobileCarousel
              rowClassName="md:grid md:grid-cols-2"
              hint="Deslizá cuidados"
              className="hidden md:block"
            >
              {care.map((tip) => (
                <div
                  key={tip}
                  className="mobile-snap-card border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-5 md:min-w-0 md:border-b md:border-r md:bg-transparent md:even:border-r-0 md:p-6"
                >
                  <p className="text-sm leading-relaxed text-neutral-800">{tip}</p>
                </div>
              ))}
            </MobileCarousel>
            <ul className="space-y-2.5 p-4 md:hidden">
              {care.map((tip) => (
                <li key={tip} className="text-sm leading-relaxed text-neutral-800">
                  - {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <SalesCtaBand
          title="Elegí el sello según el material que vas a marcar"
          copy="El diseñador online te pide el uso principal para orientar mejor medida, muestra y precio antes de fabricar."
          primaryLabel="Subir logo y ver precio"
          primaryHref={marketBuyPath(market)}
          secondaryLabel="Ver sellos personalizados"
          secondaryHref={marketPath(market, '/productos')}
          dark
        />
      </div>
    </div>
  );
}
