import type { Metadata } from 'next';
import Image from 'next/image';
import AboutHeroSection from '@/components/AboutHeroSection';
import AlcohnTeamSection from '@/components/AlcohnTeamSection';
import AlcohnValuesSection from '@/components/AlcohnValuesSection';
import SalesCtaBand from '@/components/SalesCtaBand';
import StoryPhraseStrip from '@/components/StoryPhraseStrip';
import WhyChooseDifferentiatorsSection from '@/components/WhyChooseDifferentiatorsSection';
import { buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Sobre Alcohn | Sellos de bronce CNC en Mar del Plata, Argentina',
  description:
    'Fabricamos sellos de bronce de alta precisión con CNC propia. +6.000 sellos, marcas nacionales y envío a todo el país.',
  path: '/sobre-alcohn',
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Sobre Alcohn', path: '/sobre-alcohn' },
]);

export default function SobreAlcohnPage() {
  return (
    <div className="atelier-page min-h-screen pb-10 md:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AboutHeroSection />

      <div className="relative z-10">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl pt-6 md:pt-8">
        <section className="mb-20 technical-sheet">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.44fr_0.56fr]">
            <div className="relative min-h-[240px] border-b lg:border-b-0 lg:border-r border-[var(--alcohn-line)] md:min-h-[320px] lg:min-h-0">
              <Image
                src="/images/nosotros/mecanizado-cnc-precision.webp"
                alt="Mecanizado CNC de precisión en el taller Alcohn"
                fill
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-6 md:p-10 lg:p-12">
              <p className="craft-label mb-4">Historia</p>
              <h2 className="mb-5 text-3xl md:text-5xl font-semibold tracking-tight leading-tight text-neutral-950">
                Un sello no es un pedazo de bronce
              </h2>
              <div className="space-y-5 text-sm md:text-base leading-relaxed text-neutral-700">
                <p>
                  Alcohn nació en Mar del Plata como un taller de diseño industrial con una misión clara: unir la precisión de la tecnología CNC con el alma artesanal de los oficios tradicionales.
                </p>
                <p>
                  Cada sello está pensado para sentirse como una pieza de joyería industrial: una herramienta duradera, clara y lista para llevar la identidad de una marca al producto final.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <StoryPhraseStrip />

      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <WhyChooseDifferentiatorsSection />

        <AlcohnTeamSection />

        <AlcohnValuesSection />

        <SalesCtaBand
          title="La mejor forma de conocer Alcohn es probar tu marca en el flujo"
          copy="Subí tu logo, elegí uso y dejá que la web te muestre el camino hacia muestra, precio y pago."
          primaryLabel="Subir logo y ver precio"
          primaryHref="/buy?mode=custom"
          secondaryLabel="Ver proceso"
          secondaryHref="/proceso"
          dark
        />
        </div>
      </div>
    </div>
  );
}
