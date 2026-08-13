import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ActionButton from '@/components/ActionButton';
import MobileCarousel from '@/components/MobileCarousel';
import MobileOverlayCarousel from '@/components/MobileOverlayCarousel';
import PriceFrom from '@/components/PriceFrom';
import PurchaseInclusions from '@/components/PurchaseInclusions';
import SalesCtaBand from '@/components/SalesCtaBand';
import StampProductCarousel from '@/components/sellos/StampProductCarousel';
import StampUseCasePageIntro from '@/components/sellos/StampUseCasePageIntro';
import StampUsageGuideSection from '@/components/sellos/StampUsageGuideSection';
import { getAggregateRating, toProductReviewInputs } from '@/data/testimonials';
import {
  getStampUseCaseBySlug,
  getStampPriceFrom,
  getStampUseCaseBuyHref,
  stampUseCases,
} from '@/data/stampUseCases';
import { getStampUsageGuideBySlug } from '@/data/stampUsageGuides';
import { isStampUseCaseAvailableInMarket } from '@/lib/markets/catalog';
import { marketPath } from '@/lib/markets/paths';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { getProductCarouselImages } from '@/lib/stampProductCarousel';
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildProductJsonLd,
  createPageMetadata,
} from '@/lib/seo';
import { INTERNATIONAL_MARKETS } from '@/lib/markets/config';

type PageParams = {
  params: { market: string; slug: string };
};

export function generateStaticParams() {
  return INTERNATIONAL_MARKETS.flatMap((market) =>
    stampUseCases
      .filter((useCase) => isStampUseCaseAvailableInMarket(useCase.slug, market))
      .map((useCase) => ({ market, slug: useCase.slug }))
  );
}

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);
  const useCase = getStampUseCaseBySlug(params.slug);

  if (!useCase || !isStampUseCaseAvailableInMarket(params.slug, market)) {
    return {
      title: 'Sellos personalizados - Alcohn',
      robots: { index: false, follow: false },
    };
  }

  const canonical = `/sellos/${useCase.slug}`;
  const description = useCase.seoDescription ?? useCase.description;

  return createPageMetadata({
    title: marketSeoTitle(useCase.seoTitle, market),
    description: marketSeoDescription(description, market),
    path: canonical,
    image: useCase.heroImage,
    market,
  });
}

export default function InternationalStampUseCasePage({ params }: PageParams) {
  const market = requireInternationalMarket(params.market) as InternationalMarketCode;
  const useCase = getStampUseCaseBySlug(params.slug);

  if (!useCase || !isStampUseCaseAvailableInMarket(params.slug, market)) {
    notFound();
  }

  const canonical = `/sellos/${useCase.slug}`;
  const priceFrom = getStampPriceFrom(useCase.buyMaterial);
  const productCarouselImages = getProductCarouselImages(useCase);
  const usageGuide = getStampUsageGuideBySlug(useCase.slug);
  const relatedUseCases = stampUseCases
    .filter(
      (item) => item.slug !== useCase.slug && isStampUseCaseAvailableInMarket(item.slug, market)
    )
    .slice(0, 3);
  const productosHref = marketPath(market, '/productos');
  const buyHref = getStampUseCaseBuyHref(useCase, market);
  const contactHref = '/contacto';

  const productJsonLd = buildProductJsonLd({
    name: `Sello de bronce para ${useCase.material}`,
    description: useCase.seoDescription ?? useCase.description,
    path: canonical,
    image: useCase.heroImage,
    category: 'Sellos de bronce personalizados',
    price: priceFrom,
    market,
    additionalProperty: [
      { name: 'Material de uso', value: useCase.material },
      { name: 'Oficio', value: useCase.oficio },
    ],
    aggregateRating: getAggregateRating(),
    reviews: toProductReviewInputs(),
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Inicio', path: marketPath(market, '/') },
    { name: 'Productos', path: productosHref },
    { name: useCase.title, path: marketPath(market, canonical) },
  ]);

  const faqJsonLd = buildFaqJsonLd(useCase.faqs);

  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <StampUseCasePageIntro
          label={useCase.searchIntent}
          title={useCase.title}
          description={useCase.description}
          mobileDescription={useCase.intro}
          primaryCta={{
            label: 'Diseñar mi sello',
            href: buyHref,
          }}
          priceFrom={priceFrom}
          highlights={[
            `Uso principal: ${useCase.material}`,
            'Envío internacional DHL',
            'Precio en moneda local',
          ]}
        />

        <section className="mb-12 grid grid-cols-1 gap-4 md:mb-20 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="material-frame relative min-h-[280px] overflow-hidden md:min-h-[560px]">
            <Image
              src={useCase.heroImage}
              alt={useCase.heroAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 58vw"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 border-t border-white/18 bg-black/72 p-4 text-white backdrop-blur-sm md:p-7">
              <p className="text-[10px] font-semibold uppercase text-white/60">Aplicación real</p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight md:mt-2 md:text-3xl">
                {useCase.material}
              </h2>
              <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-white/75 md:mt-2 md:text-sm">
                <span className="md:hidden">{useCase.intro.split('. ')[0]}.</span>
                <span className="hidden md:inline">{useCase.intro}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="technical-sheet flex h-full flex-col p-5 md:p-8">
              <p className="craft-label mb-3 md:mb-4">Producto base</p>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-950 md:text-2xl">
                Sello de bronce para {useCase.material.toLowerCase()}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700 md:mt-3">
                Fabricado en Argentina y enviado por DHL. Mismo sello de bronce CNC, contexto para{' '}
                {useCase.oficio.toLowerCase()}.
              </p>

              <PriceFrom amount={priceFrom} className="mt-4 md:mt-5" size="sm" />

              <div className="mt-5 flex flex-col gap-3 border-t border-[var(--alcohn-line)] pt-4 sm:flex-row md:mt-auto md:border-0 md:pt-6">
                <ActionButton href={buyHref} variant="primary" className="w-full sm:w-auto">
                  Diseñar con mi logo
                </ActionButton>
                <ActionButton href={contactHref} variant="ghost" className="w-full sm:w-auto">
                  Consultar pedido
                </ActionButton>
              </div>
            </div>

            <StampProductCarousel images={productCarouselImages} />
          </div>
        </section>

        <div className="flex flex-col gap-20">
          <PurchaseInclusions
            showKitIllustration
            copy="Además del sello, cada compra incluye los elementos necesarios para utilizar el sello en el material seleccionado."
          />

          <section>
            <h2 className="mb-8 text-3xl font-semibold leading-tight tracking-tight text-neutral-950 md:mb-10 md:text-4xl">
              Ejemplos en {useCase.material.toLowerCase()}
            </h2>

            <div className="md:hidden">
              <MobileOverlayCarousel
                showDots
                squareMedia
                items={useCase.gallery.map((item) => ({
                  key: item.src,
                  image: item.src,
                  alt: item.alt,
                  caption: item.caption ? { label: '', title: item.caption } : undefined,
                }))}
              />
            </div>

            <MobileCarousel
              className="hidden md:block"
              rowClassName="md:grid md:grid-cols-2 lg:grid-cols-4"
              hint="Deslizá ejemplos"
            >
              {useCase.gallery.map((item) => (
                <article
                  key={item.src}
                  className="mobile-snap-card material-card overflow-hidden p-0 md:min-w-0"
                >
                  <div className="material-frame relative aspect-square overflow-hidden">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-[1.04]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  {item.caption ? (
                    <p className="px-2 pb-2 pt-4 text-sm font-medium leading-snug text-neutral-800">
                      {item.caption}
                    </p>
                  ) : null}
                </article>
              ))}
            </MobileCarousel>
          </section>

          {usageGuide ? <StampUsageGuideSection guide={usageGuide} /> : null}

          <section>
            <div className="mb-8">
              <p className="craft-label mb-4">Dudas frecuentes</p>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
                Antes de comprar tu sello.
              </h2>
            </div>

            <div className="technical-sheet divide-y divide-[var(--alcohn-line)]">
              {useCase.faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="grid grid-cols-1 gap-4 p-6 md:grid-cols-[0.38fr_0.62fr] md:p-8"
                >
                  <h3 className="text-lg font-semibold leading-snug text-neutral-950">
                    {faq.question}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {relatedUseCases.length > 0 ? (
            <section>
              <div className="mb-8">
                <p className="craft-label mb-4">Otros usos</p>
                <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
                  También puede servirte.
                </h2>
              </div>

              <MobileCarousel rowClassName="md:grid md:grid-cols-3" hint="Deslizá usos relacionados">
                {relatedUseCases.map((item) => (
                  <Link
                    key={item.slug}
                    href={marketPath(market, `/sellos/${item.slug}`)}
                    className="mobile-snap-card material-card group block p-3 md:min-w-0"
                  >
                    <div className="material-frame relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.heroImage}
                        alt={item.heroAlt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-3">
                      <p className="craft-label mb-2">{item.material}</p>
                      <h3 className="text-lg font-semibold leading-snug text-neutral-950">
                        {item.title}
                      </h3>
                      <div className="mt-2">
                        <PriceFrom amount={getStampPriceFrom(item.buyMaterial)} size="sm" />
                      </div>
                    </div>
                  </Link>
                ))}
              </MobileCarousel>
            </section>
          ) : null}
        </div>

        <div className="mt-20">
          <SalesCtaBand
            title={`Diseñá tu sello para ${useCase.material.toLowerCase()} con envío DHL`}
            copy="Subí tu logo, elegí medida, revisá la muestra y comprá en moneda local con envío DHL a tu país."
            primaryLabel="Diseñar mi sello"
            primaryHref={buyHref}
            secondaryLabel="Ver catálogo"
            secondaryHref={productosHref}
            dark
          />
        </div>
      </div>
    </div>
  );
}
