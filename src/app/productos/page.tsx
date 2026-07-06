import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SpecStrip from '@/components/SpecStrip';
import IntentCard from '@/components/IntentCard';
import PersonalizadoProductCard from '@/components/sellos/PersonalizadoProductCard';
import ActionButton from '@/components/ActionButton';
import PageIntro from '@/components/PageIntro';
import PriceFrom from '@/components/PriceFrom';
import SalesCtaBand from '@/components/SalesCtaBand';
import { stampUseCases } from '@/data/stampUseCases';
import {
  getAbecedarioMinPrice,
  getAccessoryMinPriceFrom,
  getCustomStampMinPrice,
  getStandardStampMinPrice,
} from '@/lib/pricing';
import { absoluteUrl, buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

const PRODUCTOS_TITLE =
  'Sellos de bronce personalizados | Cuero, madera, pan y packaging | Alcohn';
const PRODUCTOS_DESCRIPTION =
  'Catálogo de sellos de bronce y abecedarios CNC. Cuero, madera, alimentos, cerámica y lacre. Comprá online o diseñá con tu logo.';

export const metadata: Metadata = createPageMetadata({
  title: PRODUCTOS_TITLE,
  description: PRODUCTOS_DESCRIPTION,
  path: '/productos',
});

const collectionPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: PRODUCTOS_TITLE,
  description: PRODUCTOS_DESCRIPTION,
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      ...stampUseCases.map((useCase, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/sellos/${useCase.slug}`),
        name: useCase.title,
      })),
      {
        '@type': 'ListItem',
        position: stampUseCases.length + 1,
        url: absoluteUrl('/abecedarios'),
        name: 'Abecedarios',
      },
      {
        '@type': 'ListItem',
        position: stampUseCases.length + 2,
        url: absoluteUrl('/sellos/estandar'),
        name: 'Sellos estándar',
      },
    ],
  },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Productos', path: '/productos' },
]);

const customStampMinPrice = getCustomStampMinPrice();
const standardStampMinPrice = getStandardStampMinPrice();
const abecedarioMinPrice = getAbecedarioMinPrice();
const accessoryMinPrice = getAccessoryMinPriceFrom();

function BronceSeoCopy() {
  return (
  <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-neutral-700">
    <p>
      Los <strong>sellos de bronce</strong> de Alcohn son matrices mecanizadas en CNC a partir de tu logo o
      diseño. El bronce retiene bien el calor, transfiere el relieve con precisión y aguanta miles de
      marcados sin perder definición. Por eso elegimos este material para cuero, madera, alimentos y
      packaging.
    </p>
    <p>
      Fabricamos <strong>sellos en bronce personalizados</strong> para cada uso: un{' '}
      <Link href="/sellos/para-madera" className="text-neutral-900 underline decoration-[var(--alcohn-bronze)] underline-offset-2 hover:text-neutral-700">
        sello de bronce para madera
      </Link>
      , otro para{' '}
      <Link href="/sellos/para-cuero" className="text-neutral-900 underline decoration-[var(--alcohn-bronze)] underline-offset-2 hover:text-neutral-700">
        cuero y calzado
      </Link>
      , o para cajas y etiquetas. El mismo proceso de{' '}
      <Link href="/proceso" className="text-neutral-900 underline decoration-[var(--alcohn-bronze)] underline-offset-2 hover:text-neutral-700">
        marcaje en bronce
      </Link>{' '}
      aplica a todos: subís el logo, revisás la muestra y recibís el sello listo para el taller.
    </p>
    <p>
      Si buscás un proveedor de sellos de bronce en Argentina con tiempos claros y compra online, este
      catálogo reúne las opciones por material y el camino para diseñar el tuyo a medida.
    </p>
  </div>
  );
}

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
          priceFrom={customStampMinPrice}
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
              image="/images/sello/sello-personalizado-logo.webp"
              imageAlt="Sello personalizado de bronce"
              priceFrom={customStampMinPrice}
              priority
            />
            <IntentCard
              title="Sellos estándar"
              description="Diseños listos para comprar: elegís el motivo, seleccionás medida, agregás al carrito y completás checkout. Menos decisión, compra más rápida."
              href="/sellos/estandar"
              variant="secondary"
              image="/images/sello/sello-estandar-bronce.webp"
              imageAlt="Sellos estándar de bronce"
              priceFrom={standardStampMinPrice}
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
                <PriceFrom amount={abecedarioMinPrice} className="mt-4" size="sm" />
              </div>

              <div className="mt-auto pt-6 border-t border-[var(--alcohn-line)]">
                <ActionButton href="/abecedarios" variant="secondary" className="w-full sm:w-auto">
                  Ver abecedarios
                </ActionButton>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--alcohn-line)] pt-16 mb-20">
          <div className="mb-8">
            <h2 className="craft-label mb-2">ACCESORIOS</h2>
          </div>

          <div className="material-card p-3 flex flex-col">
            <div className="material-frame aspect-[8/3] relative overflow-hidden">
              <Image
                src="/images/accesorios/accesorios banner.jpeg"
                alt="Accesorios Alcohn: calentador eléctrico, mango de golpe y base de aluminio"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 100vw"
              />
            </div>

            <div className="p-5 md:p-9 flex flex-col flex-1">
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-4 tracking-tight">
                  Accesorios
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
                  Calentador eléctrico, mango de golpe y base de aluminio para remachadora. Complementos para marcar cuero y madera con mayor control y comodidad en el taller.
                </p>
                <PriceFrom amount={accessoryMinPrice} className="mt-4" size="sm" />
              </div>

              <div className="mt-auto pt-6 border-t border-[var(--alcohn-line)] flex flex-col gap-3 sm:flex-row">
                <ActionButton href="/accesorios/calentador-electrico" variant="primary" className="w-full sm:w-auto">
                  Ver calentador eléctrico
                </ActionButton>
                <ActionButton href="/accesorios" variant="secondary" className="w-full sm:w-auto">
                  Ver accesorios
                </ActionButton>
              </div>
            </div>
          </div>
        </section>

        <details className="mb-20 border-t border-[var(--alcohn-line)] pt-10 md:hidden">
          <summary className="cursor-pointer list-none">
            <span className="craft-label">Sobre los sellos de bronce</span>
            <span className="mt-2 flex items-center justify-between text-lg font-semibold tracking-tight text-neutral-950">
              ¿Qué es un sello de bronce CNC?
              <svg
                className="ml-4 h-5 w-5 shrink-0 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </summary>
          <div className="pt-6">
            <BronceSeoCopy />
          </div>
        </details>

        <section className="mb-20 hidden border-t border-[var(--alcohn-line)] pt-10 md:block">
          <p className="craft-label">Sobre los sellos de bronce</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
            ¿Qué es un sello de bronce CNC?
          </h2>
          <div className="mt-6">
            <BronceSeoCopy />
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
