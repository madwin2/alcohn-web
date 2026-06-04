import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';
import SalesCtaBand from '@/components/SalesCtaBand';
import Timeline from '@/components/Timeline';
import { processSteps } from '@/data/process';
import { buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Cómo comprar tu sello de bronce | Proceso en 72hs | Alcohn',
  description:
    'Pasos para comprar un sello personalizado: subí tu logo, elegí medida y material, revisá muestra y recibí tu sello de bronce CNC.',
  path: '/proceso',
});

const facts = [
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
    copy: 'Sabemos que tus tiempos son importantes. Por eso fabricamos en 72hs hábiles. Y te lo enviamos por Correo Argentino a sucursal o domicilio.',
  },
  {
    title: 'Seguridad Garantizada',
    copy: 'Nuestro sistema de pago es seguro y confiable. Y nosotros te acompañamos en todo el proceso.',
  },
];

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Cómo funciona', path: '/proceso' },
]);

export default function ProcesoPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="Proceso Alcohn"
          title="Del logo al bronce sin perder tiempo"
          description="Aca te explicamos como es todo el porceso. Para que entiendas qué se fabrica, cómo se aprueba, cuánto tarda y qué pasa después de pagar. Menos incertidumbre para vos y mas claridad para tu compra."
          primaryCta={{
            label: 'Diseñar y ver precio',
            href: '/buy?mode=custom',
          }}
          secondaryCta={{
            label: 'Ver usos del sello',
            href: '/como-usar-sellos',
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
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight text-neutral-950 max-w-3xl">
                Información clave antes de comprar
              </h2>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
              {facts.map((fact) => (
                <article key={fact.title} className="border-b md:border-r even:md:border-r-0 border-[var(--alcohn-line)] p-6 md:p-8">
                  <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
                    {fact.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                    {fact.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SalesCtaBand
          title="Empezá por el diseñador y dejá que el sistema ordene el pedido"
          copy="Subí tu logo, elegí uso, cargá datos y avanzá con muestra, medida y precio antes de fabricar."
          primaryLabel="Diseñar y ver precio"
          primaryHref="/buy?mode=custom"
          secondaryLabel="Comprar estándar"
          secondaryHref="/sellos/estandar"
          dark
        />
      </div>
    </div>
  );
}
