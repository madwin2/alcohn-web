import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StampUseCasePageIntro from '@/components/sellos/StampUseCasePageIntro';
import StampUsageGuideSection from '@/components/sellos/StampUsageGuideSection';
import StickyMobileCta from '@/components/sellos/StickyMobileCta';
import PurchaseInclusions from '@/components/PurchaseInclusions';
import SalesCtaBand from '@/components/SalesCtaBand';
import StampProductCarousel from '@/components/sellos/StampProductCarousel';
import MobileCarousel from '@/components/MobileCarousel';
import MobileOverlayCarousel from '@/components/MobileOverlayCarousel';
import {
  getStampUseCaseBuyHref,
  getStampUseCaseBySlug,
  materialInSentence,
  stampUseCases,
} from '@/data/stampUseCases';
import { getStampUsageGuideBySlug } from '@/data/stampUsageGuides';
import { getProductCarouselImages } from '@/lib/stampProductCarousel';
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildProductJsonLd,
  createPageMetadata,
} from '@/lib/seo';
import { getStampPriceFrom } from '@/data/stampUseCases';
import { getStampDepthSpec } from '@/data/stampDepth';
import ProductBuyBox from '@/components/sellos/ProductBuyBox';

type PageParams = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return stampUseCases.map((useCase) => ({ slug: useCase.slug }));
}

export function generateMetadata({ params }: PageParams): Metadata {
  const useCase = getStampUseCaseBySlug(params.slug);

  if (!useCase) {
    return {
      title: 'Sellos personalizados - Alcohn',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical = `/sellos/${useCase.slug}`;
  const description = useCase.seoDescription ?? useCase.description;

  return createPageMetadata({
    title: useCase.seoTitle,
    description,
    path: canonical,
    image: useCase.heroImage,
  });
}

export default function SelloUseCasePage({ params }: PageParams) {
  const useCase = getStampUseCaseBySlug(params.slug);

  if (!useCase) {
    notFound();
  }

  const buyHref = getStampUseCaseBuyHref(useCase);
  const priceFrom = getStampPriceFrom(useCase.buyMaterial);
  const depthSpec = getStampDepthSpec(useCase.slug);
  const canonical = `/sellos/${useCase.slug}`;
  const productCarouselImages = getProductCarouselImages(useCase);
  const usageGuide = getStampUsageGuideBySlug(useCase.usageGuideSlug ?? useCase.slug);
  const relatedUseCases = stampUseCases
    .filter((item) => item.listed !== false && item.slug !== useCase.slug)
    .slice(0, 3);

  const productJsonLd = buildProductJsonLd({
    name: `Sello de bronce para ${useCase.material}`,
    description: useCase.seoDescription ?? useCase.description,
    path: canonical,
    image: useCase.heroImage,
    category: 'Sellos de bronce personalizados',
    price: priceFrom,
    additionalProperty: [
      { name: 'Material de uso', value: useCase.material },
      { name: 'Oficio', value: useCase.oficio },
    ],
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/productos' },
    { name: useCase.title, path: canonical },
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
            label: 'Elegí tu tamaño y comprá',
            href: '#comprar',
          }}
          priceFrom={priceFrom}
          tagline="Listo en 72 hs hábiles · Envío gratis desde 3 sellos"
          highlights={[
            `Uso principal: ${useCase.material}`,
            'Comprá directo y mandá el logo después, o mirá tu sello antes de pagar',
            'Mismo sello de bronce, contexto específico para tu oficio',
          ]}
        />

        <section className="mb-12 md:mb-20 grid grid-cols-1 gap-4 lg:grid-cols-[1.08fr_0.92fr]">
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
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight md:mt-2 md:text-3xl">{useCase.material}</h2>
              <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-white/75 md:mt-2 md:text-sm">
                <span className="md:hidden">{useCase.intro.split('. ')[0]}.</span>
                <span className="hidden md:inline">{useCase.intro}</span>
              </p>
            </div>
          </div>

          {/* En celular la compra va antes que la foto grande: es lo primero que se busca. */}
          <div className="order-first grid grid-cols-1 gap-4 lg:order-none">
            <div className="technical-sheet flex h-full flex-col p-5 md:p-8">
              <p className="craft-label mb-3 md:mb-4">Producto base</p>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-950 md:text-2xl">
                Sello de bronce para {materialInSentence(useCase.material)}
              </h2>
              <p className="mt-1.5 mb-4 text-sm leading-relaxed text-neutral-700 md:mt-2 md:mb-5">
                Elegí el tamaño y comprá. Si no tenés el logo a mano, lo mandás por WhatsApp después.
              </p>

              <ProductBuyBox
                usoSlug={useCase.slug}
                buyMaterial={useCase.buyMaterial}
                materialLabel={materialInSentence(useCase.material)}
                image={useCase.heroImage}
                designHref={buyHref}
                specs={
                  <>
                    <div className="grid grid-cols-2 gap-3 sm:gap-6">
                      <div>
                        <p className="craft-label mb-1.5">Material</p>
                        <p className="text-[13px] leading-snug text-neutral-800 md:text-sm">
                          Bronce CNC de alta precisión.
                        </p>
                      </div>
                      <div>
                        <p className="craft-label mb-1.5">Profundidad</p>
                        <p className="text-[13px] leading-snug text-neutral-800 md:text-sm">
                          {depthSpec.summary}.
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-snug text-neutral-600">{depthSpec.detail}</p>
                    <p className="mt-2 text-xs leading-snug text-neutral-600">
                      El mismo sello sirve en todos los materiales.
                      {usageGuide ? (
                        <>
                          {' '}
                          <a href="#guia-uso" className="underline">
                            Ver guía de uso
                          </a>
                          .
                        </>
                      ) : null}
                    </p>
                  </>
                }
              />
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
              Ejemplos en {materialInSentence(useCase.material)}
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
                <article key={item.src} className="mobile-snap-card material-card overflow-hidden p-0 md:min-w-0">
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
                Antes de diseñar tu sello.
              </h2>
            </div>

            <div className="technical-sheet divide-y divide-[var(--alcohn-line)]">
              {useCase.faqs.map((faq) => (
                <div key={faq.question} className="grid grid-cols-1 gap-4 p-6 md:grid-cols-[0.38fr_0.62fr] md:p-8">
                  <h3 className="text-lg font-semibold leading-snug text-neutral-950">{faq.question}</h3>
                  <p className="text-sm leading-relaxed text-neutral-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-8">
              <p className="craft-label mb-4">Otros usos</p>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
                También puede servirte.
              </h2>
            </div>

            <MobileCarousel rowClassName="md:grid md:grid-cols-3" hint="Deslizá usos relacionados">
              {relatedUseCases.map((item) => (
                <Link key={item.slug} href={`/sellos/${item.slug}`} className="mobile-snap-card material-card group block p-3 md:min-w-0">
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
                    <h3 className="text-lg font-semibold leading-snug text-neutral-950">{item.title}</h3>
                    <p className="mt-2 text-xs font-semibold text-neutral-600">
                      Desde ${getStampPriceFrom(item.buyMaterial).toLocaleString('es-AR')}
                    </p>
                  </div>
                </Link>
              ))}
            </MobileCarousel>
          </section>
        </div>

        <div className="mt-20" data-sticky-cta-end>
        <SalesCtaBand
          title={`Tu sello para ${materialInSentence(useCase.material)}, listo en 72 hs`}
          copy="Elegí el tamaño y comprá en un minuto. El logo lo subís ahora o nos lo mandás por WhatsApp después."
          primaryLabel="Elegí tu tamaño"
          primaryHref="#comprar"
          secondaryLabel="Ver cómo queda mi logo"
          secondaryHref={buyHref}
          dark
        />
        </div>

        <StickyMobileCta
          href="#comprar"
          label="Comprar · elegí tu tamaño"
          note={`Desde $${priceFrom.toLocaleString('es-AR')} · envío gratis desde 3 sellos`}
          hideWhileVisible="#comprar"
        />
      </div>
    </div>
  );
}
