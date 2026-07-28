import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ActionButton from '@/components/ActionButton';
import IntentCard from '@/components/IntentCard';
import ImportDutiesNotice from '@/components/market/ImportDutiesNotice';
import PageIntro from '@/components/PageIntro';
import PersonalizadoProductCard from '@/components/sellos/PersonalizadoProductCard';
import PriceFrom from '@/components/PriceFrom';
import SpecStrip from '@/components/SpecStrip';
import { stampUseCases } from '@/data/stampUseCases';
import { getMarketConfig } from '@/lib/markets/config';
import { isStampUseCaseAvailableInMarket } from '@/lib/markets/catalog';
import { marketBuyPath, marketPath } from '@/lib/markets/paths';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketAbsoluteUrl, marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import type { InternationalMarketCode } from '@/lib/markets/types';
import {
  getAbecedarioMinPrice,
  getCustomStampMinPrice,
} from '@/lib/pricing';
import { buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';
import { getAccessoryBySlug, getAccessoryLinkPrice } from '@/data/accessories';

const PRODUCTOS_TITLE = 'Sellos de bronce personalizados | Cuero, madera y packaging | Alcohn';
const PRODUCTOS_DESCRIPTION =
  'Catálogo internacional de sellos de bronce CNC, abecedarios y accesorios seleccionados.';

type PageParams = {
  params: { market: string };
};

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);

  return createPageMetadata({
    title: marketSeoTitle(PRODUCTOS_TITLE, market),
    description: marketSeoDescription(PRODUCTOS_DESCRIPTION, market),
    path: '/productos',
    market,
  });
}

export default function InternationalProductosPage({ params }: PageParams) {
  const market = requireInternationalMarket(params.market) as InternationalMarketCode;
  const country = getMarketConfig(market).countryName;
  const customStampMinPrice = getCustomStampMinPrice();
  const abecedarioMinPrice = getAbecedarioMinPrice();
  const mango = getAccessoryBySlug('mango-de-golpe');
  const mangoPrice = mango ? getAccessoryLinkPrice(mango) : 0;

  const internationalUseCases = stampUseCases.filter((useCase) =>
    isStampUseCaseAvailableInMarket(useCase.slug, market)
  );

  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: marketSeoTitle(PRODUCTOS_TITLE, market),
    description: marketSeoDescription(PRODUCTOS_DESCRIPTION, market),
    url: marketAbsoluteUrl(market, '/productos'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: internationalUseCases.map((useCase, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: marketAbsoluteUrl(market, `/sellos/${useCase.slug}`),
        name: useCase.title,
      })),
    },
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Inicio', path: marketPath(market, '/') },
    { name: 'Productos', path: marketPath(market, '/productos') },
  ]);

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
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <PageIntro
          label={`Catálogo · ${country}`}
          title="Productos disponibles con envío DHL"
          description="Versión internacional del catálogo Alcohn: sellos personalizados por uso, abecedarios y mango de golpe. Precios en moneda local, envío DHL desde Argentina."
          mobileDescription="Sellos personalizados, abecedarios y mango de golpe con envío DHL."
          primaryCta={{
            label: 'Diseñar mi sello',
            href: marketBuyPath(market),
          }}
          secondaryCta={{
            label: 'Ver sellos por uso',
            href: '#sellos-por-uso',
            variant: 'secondary',
          }}
          hideHighlightsOnMobile
          priceFrom={customStampMinPrice}
          highlights={[
            'Fabricación CNC en Argentina',
            'Envío internacional DHL',
            'Precio en moneda local',
          ]}
        />

        <div className="mb-10">
          <ImportDutiesNotice market={market} />
        </div>

        <SpecStrip />

        <section id="sellos-por-uso" className="mb-20">
          <div className="mb-8">
            <h2 className="craft-label mb-2">SELLOS POR USO</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {internationalUseCases.map((useCase) => (
              <IntentCard
                key={useCase.slug}
                title={useCase.title}
                description={useCase.description}
                href={marketPath(market, `/sellos/${useCase.slug}`)}
                image={useCase.heroImage}
                imageAlt={useCase.heroAlt}
                priceFrom={customStampMinPrice}
              />
            ))}
          </div>
        </section>

        <section className="mb-20 border-t border-[var(--alcohn-line)] pt-16">
          <div className="mb-8">
            <h2 className="craft-label mb-2">PERSONALIZADOS Y COMPLEMENTOS</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <PersonalizadoProductCard
              title="Sellos personalizados"
              description="Elegí el material principal y diseñá tu sello con logo, medida y muestra previa antes de pagar."
              image="/images/sello/sello-personalizado-logo.webp"
              imageAlt="Sello personalizado de bronce"
              priceFrom={customStampMinPrice}
            />
            <div className="material-card flex flex-col p-3">
              <div className="material-frame relative aspect-[8/3] overflow-hidden">
                <Image
                  src="/images/abecedario/abecedario.webp"
                  alt="Abecedario de bronce"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-9">
                <h3 className="text-2xl font-semibold tracking-tight text-neutral-900">Abecedarios</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  Letras y números individuales de bronce para marcar textos variables en cuero y madera.
                </p>
                <PriceFrom amount={abecedarioMinPrice} className="mt-4" size="sm" />
                <div className="mt-auto pt-6">
                  <ActionButton
                    href={marketPath(market, '/abecedarios')}
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Ver abecedarios
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {mango ? (
          <section className="border-t border-[var(--alcohn-line)] pt-16">
            <div className="material-card flex flex-col p-3 md:flex-row md:items-stretch">
              <div className="material-frame relative aspect-square w-full overflow-hidden md:aspect-auto md:w-72">
                <Image
                  src={mango.image}
                  alt={mango.title}
                  fill
                  className="object-cover"
                  sizes="288px"
                />
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-9">
                <h3 className="text-2xl font-semibold tracking-tight text-neutral-900">{mango.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{mango.description}</p>
                <PriceFrom amount={mangoPrice} className="mt-4" size="sm" />
                <div className="mt-auto pt-6">
                  <ActionButton
                    href={marketPath(market, '/accesorios/mango-de-golpe')}
                    variant="primary"
                    className="w-full sm:w-auto"
                  >
                    Ver mango de golpe
                  </ActionButton>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <p className="mt-12 text-sm text-neutral-600">
          ¿Buscás el catálogo completo de Argentina?{' '}
          <Link href="/productos" className="font-semibold text-neutral-900 underline underline-offset-2">
            Ver alcohn.com.ar
          </Link>
        </p>
      </div>
    </div>
  );
}
