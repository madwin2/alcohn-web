import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';
import SalesCtaBand from '@/components/SalesCtaBand';
import MobileCarousel from '@/components/MobileCarousel';
import { buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Cómo usar sellos de bronce en cuero, madera y alimentos | Alcohn',
  description:
    'Guía práctica: temperatura, presión y técnica para marcar cuero, madera, pan, packaging, hielo y más con sellos de bronce.',
  path: '/como-usar-sellos',
});

const materialGuide = [
  {
    material: 'Cuero',
    method: 'Frío o caliente',
    recommendation: 'Frío para bajo relieve limpio; caliente cuando buscás contraste más visible.',
    note: 'Probá en retazo del mismo cuero: cambia mucho según curtido, espesor y terminación.',
  },
  {
    material: 'Madera',
    method: 'Caliente',
    recommendation: 'Calor parejo, apoyo perpendicular y presión firme por pocos segundos.',
    note: 'Las maderas blandas marcan más rápido; las duras necesitan más prueba previa.',
  },
  {
    material: 'Packaging',
    method: 'Caliente o presión',
    recommendation: 'Usá baja temperatura y tiempos cortos para no deformar cartón o papel.',
    note: 'Conviene empezar con presión leve y aumentar de a poco.',
  },
  {
    material: 'Alimentos',
    method: 'Caso especial',
    recommendation: 'Usá sello limpio, prueba de temperatura y contacto breve.',
    note: 'La compatibilidad depende del alimento, humedad, grasa y superficie.',
  },
  {
    material: 'Cerámica cruda',
    method: 'Presión',
    recommendation: 'Marcá antes de la cocción con base estable y presión controlada.',
    note: 'Evitá arrastrar el sello para no deformar bordes finos.',
  },
  {
    material: 'Lacre',
    method: 'Presión sobre lacre',
    recommendation: 'Aplicá cuando el lacre ya no esté líquido pero siga blando.',
    note: 'Esperá unos segundos antes de retirar para lograr bordes definidos.',
  },
];

const guideBlocks = [
  {
    label: 'Caliente',
    title: 'Marcado con temperatura',
    copy: 'Recomendado para madera, varios cueros, packaging y algunos alimentos. La clave no es más calor: es encontrar la combinación exacta entre temperatura, presión y segundos de contacto.',
    tips: [
      'Calentá el sello de forma pareja durante 30-90 segundos.',
      'Probá primero en descarte del mismo material.',
      'Apoyá perpendicular, sin arrastrar, por 1-3 segundos.',
      'Si queda muy oscuro, bajá temperatura o tiempo antes de repetir.',
    ],
  },
  {
    label: 'Frío',
    title: 'Marcado con presión',
    copy: 'Ideal para cuero, cerámica cruda y trabajos repetitivos donde buscás bajo relieve controlado sin quemado visible.',
    tips: [
      'Usá prensa, remachadora o base firme para presión constante.',
      'Alineá el sello antes de presionar; una vez apoyado, no lo gires.',
      'Aumentá presión de forma gradual hasta encontrar la marca deseada.',
      'En series largas, mantené la misma base y punto de apoyo.',
    ],
  },
];

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
  'Dejá enfriar el sello antes de guardarlo.',
  'Limpiá con paño seco o cepillo suave, sin productos abrasivos.',
  'Guardalo en lugar seco para cuidar mango, bronce y adaptación.',
  'Si cambiás material o grosor, repetí pruebas de calibración.',
];

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Cómo usar los sellos', path: '/como-usar-sellos' },
]);

export default function ComoUsarSellosPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="Manual de uso"
          title="Cómo lograr una marca prolija sin depender de soporte"
          description="Una guía de banco de trabajo para elegir método, probar el material, evitar errores comunes y repetir una marca consistente en cuero, madera, packaging, alimentos, cerámica o lacre."
          mobileDescription="Guía rápida para elegir método, probar material y evitar errores al marcar."
          primaryCta={{
            label: 'Diseñar sello personalizado',
            href: '/buy?mode=custom',
          }}
          secondaryCta={{
            label: 'Ver qué incluye la compra',
            href: '/productos',
            variant: 'secondary',
          }}
        />

        <section className="mb-14 md:mb-20 motion-reveal">
          <div className="technical-sheet blueprint-sheet hidden md:block">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.34fr_0.66fr]">
              <div className="border-b lg:border-b-0 lg:border-r border-[var(--alcohn-line)] p-6 md:p-8">
                <p className="craft-label mb-4">Selector de método</p>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-950">
                  Qué técnica usar según el material
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-neutral-700">
                  Esto evita la consulta más repetida: no todos los materiales se marcan igual, y una prueba chica suele ahorrar una pieza arruinada.
                </p>
              </div>
              <div className="divide-y divide-[var(--alcohn-line)]">
                {materialGuide.map((item) => (
                  <article key={item.material} className="grid grid-cols-1 md:grid-cols-[0.18fr_0.22fr_0.6fr]">
                    <div className="border-b md:border-b-0 md:border-r border-[var(--alcohn-line)] p-4 md:p-5">
                      <p className="text-sm font-semibold text-neutral-950">{item.material}</p>
                    </div>
                    <div className="border-b md:border-b-0 md:border-r border-[var(--alcohn-line)] p-4 md:p-5">
                      <p className="craft-label">{item.method}</p>
                    </div>
                    <div className="p-4 md:p-5">
                      <p className="text-sm font-medium text-neutral-900">{item.recommendation}</p>
                      <p className="mt-2 text-xs leading-relaxed text-neutral-600">{item.note}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <div className="md:hidden border-y border-[var(--alcohn-line)] bg-[var(--alcohn-surface)]">
            <div className="p-4 border-b border-[var(--alcohn-line)]">
              <p className="craft-label mb-3">Selector de método</p>
              <h2 className="text-[1.9rem] font-semibold leading-[1.08] tracking-tight text-neutral-950">
                Qué técnica usar según el material
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                Guía rápida para elegir método sin arruinar piezas.
              </p>
            </div>
            <div className="divide-y divide-[var(--alcohn-line)]">
              {materialGuide.map((item) => (
                <article key={item.material} className="p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-semibold text-neutral-950">{item.material}</h3>
                    <p className="craft-label">{item.method}</p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-neutral-900">{item.recommendation}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14 md:mb-20 motion-reveal-delay">
          <MobileCarousel rowClassName="lg:grid lg:grid-cols-2 lg:gap-6" hint="Deslizá métodos" className="hidden md:block">
            {guideBlocks.map((block) => (
              <article key={block.label} className="mobile-snap-card technical-sheet blueprint-sheet md:min-w-0">
                <div className="relative z-10 border-b border-[var(--alcohn-line)] p-6 md:p-8">
                  <p className="craft-label mb-4">Uso en {block.label}</p>
                  <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-950">
                    {block.title}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                    {block.copy}
                  </p>
                </div>
                <ul className="relative z-10 divide-y divide-[var(--alcohn-line)]">
                  {block.tips.map((tip, index) => (
                    <li key={tip} className="grid grid-cols-[56px_1fr]">
                      <span className="border-r border-[var(--alcohn-line)] p-4 text-xs font-semibold text-neutral-500">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="p-4 text-sm leading-relaxed text-neutral-800">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </MobileCarousel>
          <div className="md:hidden space-y-5">
            {guideBlocks.map((block) => (
              <article key={block.label} className="border-y border-[var(--alcohn-line)] bg-[var(--alcohn-surface)]">
                <div className="p-4 border-b border-[var(--alcohn-line)]">
                  <p className="craft-label mb-2">Uso en {block.label}</p>
                  <h2 className="text-[1.9rem] font-semibold leading-[1.08] tracking-tight text-neutral-950">{block.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700">{block.copy}</p>
                </div>
                <ol className="p-4 space-y-2">
                  {block.tips.map((tip, index) => (
                    <li key={tip} className="flex gap-3">
                      <span className="mt-0.5 text-xs font-semibold text-neutral-500">{String(index + 1).padStart(2, '0')}</span>
                      <span className="text-sm leading-relaxed text-neutral-800">{tip}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14 md:mb-20 dark-system-panel p-4 md:p-10 text-white">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.32fr_0.68fr] gap-8">
            <div>
              <p className="text-[10px] font-semibold uppercase text-white/56 mb-4">
                Secuencia recomendada
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                Una marca buena sale de una prueba controlada
              </h2>
            </div>
            <MobileCarousel rowClassName="sm:grid sm:grid-cols-2 lg:grid-cols-4" hint="Deslizá secuencia" className="hidden md:block">
              {setupSteps.map(([code, title, copy]) => (
                <article key={code} className="mobile-snap-card border border-white/12 bg-black/10 p-5 sm:min-w-0 sm:border-b sm:border-r sm:bg-transparent sm:last:border-r-0">
                  <p className="text-[10px] font-semibold uppercase text-white/42">{code}</p>
                  <h3 className="mt-8 text-lg font-semibold tracking-tight text-white">{title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-white/58">{copy}</p>
                </article>
              ))}
            </MobileCarousel>
            <ol className="md:hidden space-y-3">
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
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-950">
              Errores comunes y cómo corregirlos
            </h2>
          </div>
          <div className="technical-sheet blueprint-sheet hidden md:block">
            <MobileCarousel rowClassName="relative z-10 md:grid md:grid-cols-2" hint="Deslizá diagnóstico">
              {mistakes.map((item) => (
                <article key={item.title} className="mobile-snap-card border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-6 md:min-w-0 md:border-b md:border-r md:bg-transparent md:even:border-r-0">
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
          <div className="md:hidden border-y border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] divide-y divide-[var(--alcohn-line)]">
            {mistakes.map((item) => (
              <article key={item.title} className="p-4">
                <h3 className="text-2xl font-semibold tracking-tight text-neutral-950">{item.title}</h3>
                <p className="mt-3 text-sm text-neutral-600"><span className="font-semibold">Causa:</span> {item.cause}</p>
                <p className="mt-2 text-sm text-neutral-900"><span className="font-semibold">Solución:</span> {item.fix}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14 md:mb-20 technical-sheet blueprint-sheet">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.34fr_0.66fr]">
            <div className="border-b lg:border-b-0 lg:border-r border-[var(--alcohn-line)] p-4 md:p-8">
              <p className="craft-label mb-4">Mantenimiento</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-950">
                Cuidados del sello
              </h2>
            </div>
            <MobileCarousel rowClassName="md:grid md:grid-cols-2" hint="Deslizá cuidados" className="hidden md:block">
              {care.map((tip) => (
                <div key={tip} className="mobile-snap-card border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-5 md:min-w-0 md:border-b md:border-r md:bg-transparent md:even:border-r-0 md:p-6">
                  <p className="text-sm leading-relaxed text-neutral-800">{tip}</p>
                </div>
              ))}
            </MobileCarousel>
            <ul className="md:hidden p-4 space-y-2.5">
              {care.map((tip) => (
                <li key={tip} className="text-sm leading-relaxed text-neutral-800">- {tip}</li>
              ))}
            </ul>
          </div>
        </section>

        <SalesCtaBand
          title="Elegí el sello según el material que vas a marcar"
          copy="El diseñador online te pide el uso principal para orientar mejor medida, muestra y precio antes de fabricar."
          primaryLabel="Subir logo y ver precio"
          primaryHref="/buy?mode=custom"
          secondaryLabel="Ver sellos personalizados"
          secondaryHref="/productos"
          dark
        />
      </div>
    </div>
  );
}
