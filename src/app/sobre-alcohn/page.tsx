import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';
import SalesCtaBand from '@/components/SalesCtaBand';
import MobileCarousel from '@/components/MobileCarousel';
import { DEFAULT_OG_IMAGE, SITE_NAME, buildBreadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Sobre Alcohn - Sellos de bronce fabricados en CNC',
  description: 'Empresa de Mar del Plata con experiencia fabricando sellos de bronce de alta precisión con CNC propia.',
  alternates: {
    canonical: '/sobre-alcohn',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/sobre-alcohn',
    siteName: SITE_NAME,
    title: 'Sobre Alcohn - Sellos de bronce fabricados en CNC',
    description: 'Empresa de Mar del Plata con experiencia fabricando sellos de bronce de alta precisión con CNC propia.',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sobre Alcohn - Sellos de bronce fabricados en CNC',
    description: 'Empresa de Mar del Plata con experiencia fabricando sellos de bronce de alta precisión con CNC propia.',
    images: [DEFAULT_OG_IMAGE],
  },
};

const values = [
  ['Calidad', 'Cada sello debe ser funcional, preciso y estéticamente impecable.'],
  ['Diseño', 'El proceso de diseño es fundamental para nuestra empresa.'],
  ['Tecnología', 'Usamos CNC para lograr repetibilidad, profundidad y control.'],
  ['Oficio', 'Terminamos piezas reales para talleres, marcas y emprendedores.'],
  ['Innovacion', 'Buscamos siempre la innovacion en el diseño y la tecnologia.'],
];

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Sobre Alcohn', path: '/sobre-alcohn' },
]);

export default function SobreAlcohnPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="Sobre Alcohn"
          title="Diseño industrial aplicado al oficio"
          description="Alcohn une bronce, CNC y criterio de diseño para fabricar herramientas de marca para marroquineros, carpinteros, cuchilleros, gastronómicos y emprendimientos artesanales."
          primaryCta={{
            label: 'Diseñar sello',
            href: '/buy?mode=custom',
          }}
          secondaryCta={{
            label: 'Ver casos reales',
            href: '/casos-reales',
            variant: 'secondary',
          }}
          hideHighlightsOnMobile
          highlights={[
            'Fabricación en Mar del Plata',
            'Piezas de bronce con terminación precisa',
            'Tecnología CNC al servicio de marcas reales',
          ]}
        />

        <section className="mb-20 technical-sheet">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.36fr_0.64fr]">
            <div className="border-b lg:border-b-0 lg:border-r border-[var(--alcohn-line)] p-6 md:p-10">
              <p className="craft-label mb-4">Historia</p>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight text-neutral-950">
                Un sello no es un pedazo de bronce
              </h2>
            </div>
            <div className="p-6 md:p-10 space-y-5 text-sm md:text-base leading-relaxed text-neutral-700">
              <p>
                Alcohn nació en Mar del Plata como un taller de diseño industrial con una misión clara: unir la precisión de la tecnología CNC con el alma artesanal de los oficios tradicionales.
              </p>
              <p>
                Cada sello está pensado para sentirse como una pieza de joyería industrial: una herramienta duradera, clara y lista para llevar la identidad de una marca al producto final.
              </p>
              <p className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-950">
                Una forma de contar tu historia.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <div className="technical-sheet">
            <div className="relative z-10 border-b border-[var(--alcohn-line)] p-6 md:p-10">
              <p className="craft-label mb-4">Valores de fabricación</p>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-neutral-950">
                Precisión, material y criterio
              </h2>
            </div>
            <MobileCarousel rowClassName="relative z-10 md:grid md:grid-cols-2 lg:grid-cols-5" hint="Deslizá valores">
              {values.map(([title, copy]) => (
                <article key={title} className="mobile-snap-card border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-5 md:min-w-0 md:border-b md:border-r md:bg-transparent md:last:border-r-0 md:p-6">
                  <h3 className="text-lg font-semibold tracking-tight text-neutral-950">
                    {title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                    {copy}
                  </p>
                </article>
              ))}
            </MobileCarousel>
          </div>
        </section>

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
  );
}
