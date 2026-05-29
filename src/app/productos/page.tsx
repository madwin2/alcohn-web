import type { Metadata } from 'next';
import Image from 'next/image';
import SpecStrip from '@/components/SpecStrip';
import IntentCard from '@/components/IntentCard';
import PersonalizadoProductCard from '@/components/sellos/PersonalizadoProductCard';
import ActionButton from '@/components/ActionButton';
import PageIntro from '@/components/PageIntro';
import SalesCtaBand from '@/components/SalesCtaBand';
import { products } from '@/data/products';
import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl, buildBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Productos - Alcohn',
  description: 'Sellos de bronce y abecedarios. Precisión industrial para cuero, madera, cerámica y alimentos.',
  alternates: {
    canonical: '/productos',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/productos',
    siteName: SITE_NAME,
    title: 'Productos - Alcohn',
    description: 'Sellos de bronce y abecedarios. Precisión industrial para cuero, madera, cerámica y alimentos.',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Productos - Alcohn',
    description: 'Sellos de bronce y abecedarios. Precisión industrial para cuero, madera, cerámica y alimentos.',
    images: [DEFAULT_OG_IMAGE],
  },
};

const collectionPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Productos - Alcohn',
  description:
    'Sellos de bronce y abecedarios. Precisión industrial para cuero, madera, cerámica y alimentos.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/productos/${product.slug}`),
      name: product.name,
    })),
  },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Productos', path: '/productos' },
]);

export default function ProductosPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="Catálogo Alcohn"
          title="Elegí cómo querés marcar"
          description="Dos caminos de compra claros: subir tu logo para diseñar un sello a medida, o elegir un diseño estándar listo para personalizar. Todo orientado a ver medida, muestra, precio y pago sin depender de una conversación manual."
          mobileDescription="Dos caminos claros: subir tu logo para un sello a medida o comprar un diseño estándar listo para usar."
          primaryCta={{
            label: 'Subir logo y ver precio',
            href: '/buy?mode=custom',
          }}
          secondaryCta={{
            label: 'Comprar estándar',
            href: '/sellos/estandar',
            variant: 'secondary',
          }}
          hideHighlightsOnMobile
          highlights={[
            'Bronce mecanizado CNC para uso real de taller',
            'Compatible con cuero, madera, packaging y alimentos',
            'Compra guiada con datos guardados para seguimiento',
          ]}
        />

        <SpecStrip />

        <section className="mb-20">
          <div className="mb-8">
            <h2 className="craft-label mb-2">CAMINOS DE COMPRA</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <PersonalizadoProductCard
              title="Sellos personalizados"
              description="Subí tu logo, elegí el material y avanzá por el flujo online hasta ver muestra, medida sugerida y precio. Es el camino recomendado para marcas, talleres y productos propios."
              image="/images/sello/sellologo.webp"
              imageAlt="Sello personalizado de bronce"
              priority
            />
            <IntentCard
              title="Sellos estándar"
              description="Diseños listos para comprar: elegís el motivo, seleccionás medida, agregás al carrito y completás checkout. Menos decisión, compra más rápida."
              href="/sellos/estandar"
              variant="secondary"
              image="/images/sello/selloestandar.webp"
              imageAlt="Sellos estándar de bronce"
              priority
            />
          </div>
        </section>

        <section className="border-t border-[var(--alcohn-line)] pt-16 mb-20">
          <div className="mb-8">
            <h2 className="craft-label mb-2">ABECEDARIOS</h2>
          </div>

          <div className="material-card p-3 flex flex-col">
            <div className="material-frame aspect-[8/3] relative overflow-hidden">
              <Image
                src="/images/abecedario/abecedario.webp"
                alt="Abecedario de bronce con letras y números"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 100vw"
              />
            </div>

            <div className="p-5 md:p-9 flex flex-col flex-1">
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-4 tracking-tight">
                  Abecedarios
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
                  Conjunto de letras y números individuales de bronce para marcar textos personalizados, series, fechas o iniciales. Cada pieza funciona como una herramienta modular de taller.
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-[var(--alcohn-line)]">
                <ActionButton href="/abecedarios" variant="secondary" className="w-full sm:w-auto">
                  Ver abecedarios
                </ActionButton>
              </div>
            </div>
          </div>
        </section>

        <SalesCtaBand
          title="Si tenés logo, el camino más rápido es el diseñador online"
          copy="La página guía el pedido, guarda los datos, genera una muestra cuando puede y deja el pedido listo para pagar o recuperar si algo falla."
          primaryLabel="Subir logo y ver precio"
          primaryHref="/buy?mode=custom"
          secondaryLabel="Ver cómo funciona"
          secondaryHref="/proceso"
          dark
        />
      </div>
    </div>
  );
}
