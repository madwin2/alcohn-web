import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ActionButton from '@/components/ActionButton';
import PageIntro from '@/components/PageIntro';
import PurchaseInclusions from '@/components/PurchaseInclusions';
import SalesCtaBand from '@/components/SalesCtaBand';
import StampSpecifications from '@/components/StampSpecifications';
import StampProductCarousel from '@/components/sellos/StampProductCarousel';
import {
  getStampUseCaseBuyHref,
  getStampUseCaseBySlug,
  stampUseCases,
} from '@/data/stampUseCases';
import { getProductCarouselImages } from '@/lib/stampProductCarousel';

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
    };
  }

  return {
    title: `${useCase.seoTitle} - Alcohn`,
    description: useCase.description,
    openGraph: {
      title: `${useCase.seoTitle} - Alcohn`,
      description: useCase.description,
      images: [useCase.heroImage],
    },
  };
}

export default function SelloUseCasePage({ params }: PageParams) {
  const useCase = getStampUseCaseBySlug(params.slug);

  if (!useCase) {
    notFound();
  }

  const buyHref = getStampUseCaseBuyHref(useCase);
  const productCarouselImages = getProductCarouselImages(useCase);
  const relatedUseCases = stampUseCases
    .filter((item) => item.slug !== useCase.slug)
    .slice(0, 3);

  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <PageIntro
          label={useCase.searchIntent}
          title={useCase.title}
          description={useCase.description}
          primaryCta={{
            label: 'Subir logo y ver precio',
            href: buyHref,
          }}
          secondaryCta={{
            label: 'Ver sellos personalizados',
            href: '/sellos/personalizados',
            variant: 'secondary',
          }}
          highlights={[
            `Uso principal: ${useCase.material}`,
            'Muestra, medida y precio antes de fabricar',
            'Mismo sello de bronce, contexto específico para tu oficio',
          ]}
        />

        <section className="mb-20 grid grid-cols-1 gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="material-frame relative min-h-[360px] overflow-hidden md:min-h-[560px]">
            <Image
              src={useCase.heroImage}
              alt={useCase.heroAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 58vw"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 border-t border-white/18 bg-black/72 p-5 text-white backdrop-blur-sm md:p-7">
              <p className="text-[10px] font-semibold uppercase text-white/60">Aplicación real</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{useCase.material}</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/72">{useCase.intro}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="technical-sheet p-6 md:p-8">
              <p className="craft-label mb-5">Producto base</p>
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 md:text-3xl">
                Un sello personalizado, ajustado al uso correcto.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                Todos nuestros sellos sirven para todos los materiales. La idea de esta pagiana: es mostrarte ejemplos útiles,
                recomendar medidas y puedas elegir el sello que mejor se adapta a tu uso.
              </p>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {useCase.proofPoints.map((point) => (
                  <div key={point} className="technical-dash bg-white/45 p-4">
                    <p className="text-sm font-semibold leading-snug text-neutral-950">{point}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ActionButton href={buyHref} variant="primary">
                  Diseñar para {useCase.material.toLowerCase()}
                </ActionButton>
                <ActionButton href="#medidas" variant="ghost">
                  Ver medidas
                </ActionButton>
              </div>
            </div>

            <StampProductCarousel images={productCarouselImages} />
          </div>
        </section>

        <StampSpecifications />

        <section className="mb-20">
          <div className="mb-8 grid grid-cols-1 items-end gap-6 lg:grid-cols-[0.65fr_0.35fr]">
            <div>
              <p className="craft-label mb-4">Fotos correctas para decidir</p>
              <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-5xl">
                Ejemplos de {useCase.material.toLowerCase()} y del sello que vas a comprar.
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-neutral-700">
              Las fotos de producto son comunes a todos los usos; las aplicaciones cambian para que el cliente vea
              una referencia cercana a su material.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {useCase.gallery.map((item) => (
              <article key={item.src} className="material-card overflow-hidden p-0">
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
          </div>
        </section>

        <PurchaseInclusions
          className="mb-20"
          showKitIllustration
          copy="Además del sello, cada compra incluye los elementos necesarios para utilizar el sello en el material seleccionado."
        />

        <section id="medidas" className="mb-20">
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

            <div className="grid grid-cols-1 md:grid-cols-3">
              {useCase.recommendedSizes.map((item) => (
                <article key={item.label} className="border-b border-[var(--alcohn-line)] p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 md:p-8">
                  <p className="craft-label mb-5">{item.label}</p>
                  <h3 className="text-2xl font-semibold tracking-tight text-neutral-950">{item.size}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-700">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-20">
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

        <section className="mb-20">
          <div className="mb-8">
            <p className="craft-label mb-4">Otros usos</p>
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
              También puede servirte.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {relatedUseCases.map((item) => (
              <Link key={item.slug} href={`/sellos/${item.slug}`} className="material-card group block p-3">
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
                </div>
              </Link>
            ))}
          </div>
        </section>

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
  );
}
