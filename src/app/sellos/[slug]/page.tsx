import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ActionButton from '@/components/ActionButton';
import PageIntro from '@/components/PageIntro';
import PriceFrom from '@/components/PriceFrom';
import PurchaseInclusions from '@/components/PurchaseInclusions';
import SalesCtaBand from '@/components/SalesCtaBand';
import StampProductCarousel from '@/components/sellos/StampProductCarousel';
import MobileCarousel from '@/components/MobileCarousel';
import MobileOverlayCarousel from '@/components/MobileOverlayCarousel';
import {
  getStampUseCaseBuyHref,
  getStampUseCaseBySlug,
  stampUseCases,
} from '@/data/stampUseCases';
import { getProductCarouselImages } from '@/lib/stampProductCarousel';
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  createPageMetadata,
} from '@/lib/seo';
import { getStampPriceFrom } from '@/data/stampUseCases';

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
  const canonical = `/sellos/${useCase.slug}`;
  const productCarouselImages = getProductCarouselImages(useCase);
  const relatedUseCases = stampUseCases
    .filter((item) => item.slug !== useCase.slug)
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
    { name: 'Sellos por uso', path: '/productos' },
    { name: useCase.title, path: canonical },
  ]);

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
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <PageIntro
          label={useCase.searchIntent}
          title={useCase.title}
          description={useCase.description}
          mobileDescription={useCase.intro}
          primaryCta={{
            label: 'Subir logo y ver precio',
            href: buyHref,
          }}
          secondaryCta={{
            label: 'Ver todos los materiales',
            href: '/productos',
            variant: 'secondary',
          }}
          hideHighlightsOnMobile
          priceFrom={priceFrom}
          highlights={[
            `Uso principal: ${useCase.material}`,
            'Muestra, medida y precio antes de fabricar',
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

          <div className="grid grid-cols-1 gap-4">
            <div className="technical-sheet flex h-full flex-col p-5 md:p-8">
              <p className="craft-label mb-3 md:mb-4">Producto base</p>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-950 md:text-2xl">
                Sello de bronce para {useCase.material.toLowerCase()}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700 md:mt-3">
                El mismo sello sirve en todos los materiales. Acá ves ejemplos y medidas pensadas para{' '}
                {useCase.oficio.toLowerCase()}.
              </p>

              <PriceFrom amount={priceFrom} className="mt-4 md:mt-5" size="sm" />

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--alcohn-line)] pt-4 sm:gap-6 md:mt-5 md:pt-5">
                <div>
                  <p className="craft-label mb-1.5">Material</p>
                  <p className="text-[13px] leading-snug text-neutral-800 md:text-sm">
                    Bronce CNC de alta precisión.
                  </p>
                </div>
                <div>
                  <p className="craft-label mb-1.5">Profundidad</p>
                  <p className="text-[13px] leading-snug text-neutral-800 md:text-sm">
                    3&nbsp;mm desbaste, 1,7&nbsp;mm grabado.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 pt-4 border-t border-[var(--alcohn-line)] sm:flex-row md:mt-auto md:pt-6 md:border-0 sm:pt-8">
                <ActionButton href={buyHref} variant="primary" className="w-full sm:w-auto">
                  Diseñar para {useCase.material.toLowerCase()}
                </ActionButton>
                <ActionButton href="#medidas" variant="ghost" className="w-full sm:w-auto">
                  Ver medidas
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

          <section id="medidas">
            <div className="technical-sheet">
              <div className="border-b border-[var(--alcohn-line)] p-6 md:p-10 lg:p-12">
                <p className="craft-label mb-4">Guía de compra</p>
                <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-5xl">
                  Medidas recomendadas para {useCase.material.toLowerCase()}.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-700 md:text-base">
                  La medida final depende del logo y de la superficie real. Estas referencias ayudan a llegar al
                  diseñador con una decisión más clara.
                </p>
              </div>

              <MobileCarousel rowClassName="md:grid md:grid-cols-3" hint="Deslizá medidas">
                {useCase.recommendedSizes.map((item) => (
                  <article key={item.label} className="mobile-snap-card border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-6 md:min-w-0 md:border-b-0 md:border-r md:bg-transparent md:last:border-r-0 md:p-8">
                    <p className="craft-label mb-5">{item.label}</p>
                    <h3 className="text-2xl font-semibold tracking-tight text-neutral-950">{item.size}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-neutral-700">{item.copy}</p>
                  </article>
                ))}
              </MobileCarousel>
            </div>
          </section>

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

        <div className="mt-20">
        <SalesCtaBand
          title={`Diseñá tu sello para ${useCase.material.toLowerCase()} y avanzá con precio real`}
          copy="Subí tu logo, elegí cómo lo vas a usar, revisá la muestra y dejá el pedido listo para pagar online."
          primaryLabel="Subir logo y ver precio"
          primaryHref={buyHref}
          secondaryLabel="Ver todos los productos"
          secondaryHref="/productos"
          dark
        />
        </div>
      </div>
    </div>
  );
}
