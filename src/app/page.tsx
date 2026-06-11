import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/Hero';
import ActionButton from '@/components/ActionButton';
import LogoCloud from '@/components/LogoCloud';
import TrustStatsStrip from '@/components/TrustStatsStrip';
import BeforeAfterStrip from '@/components/BeforeAfterStrip';
import HomeScrollShell from '@/components/animations/HomeScrollShell';
import DossInspiredSections from '@/components/DossInspiredSections';
import MobileCarousel from '@/components/MobileCarousel';
import MobileOverlayCarousel from '@/components/MobileOverlayCarousel';
import { getStampPriceFrom, stampUseCases } from '@/data/stampUseCases';
import { getCustomStampMinPrice } from '@/lib/pricing';
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_NAME,
  absoluteUrl,
  createPageMetadata,
} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: SITE_DEFAULT_TITLE,
  description: SITE_DEFAULT_DESCRIPTION,
  path: '/',
});

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: absoluteUrl('/'),
  inLanguage: 'es-AR',
  description:
    'Sellos de bronce personalizados para cuero, madera, alimentos y packaging.',
};

const materialProofs = [
  {
    label: 'Cuero',
    title: 'Marroquinería Profesional',
    image: '/images/inicio/cuero.webp',
    alt: 'Marroquinería profesional con sello aplicado en cuero',
  },
  {
    label: 'Madera',
    title: 'Carpintería Profesional',
    image: '/images/inicio/madera-carpinteria-profesional.webp',
    alt: 'Carpintería profesional con marca en madera',
  },
  {
    label: 'Acero',
    title: 'Piezas de autor',
    image: '/images/inicio/pieza-acero-marca-artesanal.webp',
    alt: 'Pieza de autor con marca artesanal',
  },
  {
    label: 'Packaging',
    title: 'Artículos únicos',
    image: '/images/inicio/cuero.webp',
    alt: 'Artículos únicos con presentación de marca',
  },
];

const craftStoryImages = [
  {
    label: 'Produccion Local',
    title: 'Industria Argentina',
    image: '/images/scroll/madera-firma-repetible.webp',
    alt: 'Piezas de madera con firma repetible',
  },
  {
    label: 'Mecanizado CNC',
    title: 'Precision Industrial',
    image: '/images/nosotros/mecanizado-cnc-precision.webp',
    alt: 'Mecanizado CNC de precisión industrial',
  },
  {
    label: 'Experiencia Unica',
    title: 'Atencion Personalizada',
    image: '/images/nosotros/atencion.png',
    alt: 'Artesano cosiendo cuero a mano en taller',
  },
  {
    label: 'Valor Agregado',
    title: 'Piezas con Identidad',
    image: '/images/scroll/tote-packaging-marca-producto.png',
    alt: 'Bolsa de tela con marca aplicada',
  },
];

const beforeAfterImages = [
  {
    src: '/images/transforma/antes-despues-logo-sello-01.jpeg',
    alt: 'Sello de bronce personalizado con diseño en relieve',
  },
  {
    src: '/images/transforma/antes-despues-sello-cuero-02.jpeg',
    alt: 'Marca aplicada en cuero con sello de bronce',
  },
  {
    src: '/images/transforma/antes-despues-estampado-cuero-03.jpeg',
    alt: 'Estampado en cuero con sello personalizado',
  },
  {
    src: '/images/transforma/antes-despues-producto-cuero-04.jpeg',
    alt: 'Producto terminado con marca en cuero en el taller',
  },
];

const customStampMinPrice = getCustomStampMinPrice();

const oficioMaterialBlocks = stampUseCases.map((useCase) => ({
  oficio: useCase.oficio,
  material: useCase.material,
  image: useCase.heroImage,
  alt: useCase.heroAlt,
  href: `/sellos/${useCase.slug}`,
  priceFrom: getStampPriceFrom(useCase.buyMaterial),
}));

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeScrollShell>
        <Hero
        title="Más que una herramienta, una forma de contar tu historia."
        subtitle="Sellos de bronce personalizados para marcar cuero, madera, alimentos y packaging. Subí tu logo, elegí cómo lo vas a usar y recibí muestra, medida y precio antes de fabricar."
        primaryCta={{ text: 'Subir logo y ver precio', mobileText: 'Subir logo', href: '/buy?mode=custom' }}
        secondaryCta={{ text: 'Comprar diseño estándar', mobileText: 'Diseño estándar', href: '/sellos/estandar' }}
        priceFrom={customStampMinPrice}
      />

      <section id="oficio-identidad" className="atelier-page relative z-[1] -mt-px border-t border-[var(--alcohn-line)] py-6 md:py-24 md:min-h-0">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div
            data-scroll-panel
            className="flex flex-col gap-4 md:technical-sheet md:blueprint-sheet md:mobile-clean-sheet lg:grid lg:grid-cols-[0.46fr_0.54fr] lg:gap-0"
          >
            <div
              data-scroll-panel-mobile
              className="max-md:border max-md:border-[var(--alcohn-line)] max-md:bg-[var(--alcohn-surface)] lg:contents"
            >
                <div className="p-4 md:p-10 lg:border-b-0 lg:border-r lg:border-[var(--alcohn-line)] lg:p-12">
                  <p className="craft-label mb-4">Oficio premium + marca propia</p>
                  <h2 className="max-w-xl text-[1.6rem] font-semibold leading-tight tracking-tight text-neutral-950 md:text-5xl">
                    Lo que hacemos en Alcohn.
                  </h2>
                  <blockquote className="mt-4 max-w-xl border-l border-[var(--alcohn-bronze)] pl-4 text-base leading-relaxed text-neutral-800 md:mt-7 md:pl-5 md:text-2xl">
                    <span className="md:hidden">
                      Ayudamos a que cada taller pase de “hacer bien” a tener una marca reconocible.
                    </span>
                    <span className="hidden md:inline">
                      Convertimos a los trabajadores del cuero y la madera en profesionales del oficio, revalorizando su trabajo y su identidad profesional.
                    </span>
                  </blockquote>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row md:mt-8 md:gap-3">
                    <ActionButton href="/sobre-alcohn" variant="primary" className="hidden md:inline-flex">
                      Más sobre Alcohn
                    </ActionButton>
                    <ActionButton href="/casos-reales" variant="ghost">
                      Ver trabajos reales
                    </ActionButton>
                  </div>
                </div>

                <div className="md:hidden">
                  <MobileOverlayCarousel
                    items={craftStoryImages.map((item) => ({
                      key: item.label,
                      image: item.image,
                      alt: item.alt,
                      caption: { label: item.label, title: item.title },
                    }))}
                  />
                </div>

                <div className="hidden md:block">
                  <MobileCarousel rowClassName="md:grid md:grid-cols-2" hint="Deslizá trabajos">
                    {craftStoryImages.map((item, index) => (
                      <article
                        key={item.label}
                        data-scroll-card
                        className={`mobile-snap-card group md:min-w-0 md:border-0 md:bg-transparent md:p-4 ${index < 2 ? 'md:border-b' : ''} ${index % 2 === 0 ? 'md:border-r' : ''}`}
                      >
                        <div className="material-frame relative aspect-[4/3] overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.alt}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="pt-4">
                          <p className="craft-label mb-2">{item.label}</p>
                          <h3 className="text-base font-semibold leading-snug text-neutral-950">{item.title}</h3>
                        </div>
                      </article>
                    ))}
                  </MobileCarousel>
                </div>
            </div>
          </div>
        </div>
      </section>

      <TrustStatsStrip />

      <section id="lo-transforma" className="atelier-page border-b border-[var(--alcohn-line)] py-6 md:py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div
            data-scroll-panel
            className="flex flex-col max-md:gap-0 md:technical-sheet md:blueprint-sheet md:mobile-clean-sheet md:gap-0"
          >
            <div
              data-scroll-panel-mobile
              className="max-md:border max-md:border-[var(--alcohn-line)] max-md:bg-[var(--alcohn-surface)] max-md:overflow-hidden md:contents"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[0.58fr_0.42fr]">
                <div className="p-4 md:p-10 lg:p-12">
                  <p className="craft-label mb-4 md:mb-5">Antes y después</p>
                  <h2 className="max-w-4xl text-[1.55rem] font-semibold leading-[1.06] tracking-tight text-neutral-950 sm:text-4xl md:text-[2.65rem] lg:text-[2.85rem] xl:text-5xl xl:leading-[1.06]">
                    <span className="block">Un sello no decora tu producto.</span>
                    <span className="block">
                      <span data-title-keyword className="title-keyword">
                        <span className="title-keyword__fill" aria-hidden="true" />
                        Lo transforma.
                      </span>
                    </span>
                  </h2>
                </div>

                <div className="flex flex-col justify-between gap-4 max-md:border-t-0 border-t border-[var(--alcohn-line)] p-4 md:gap-7 md:p-10 lg:border-l lg:border-t-0 lg:p-12">
                  <p className="max-w-md text-sm leading-relaxed text-neutral-700 md:text-base">
                    <span className="md:hidden">
                      Ver la marca aplicada cambia al instante cómo se percibe el producto.
                    </span>
                    <span className="hidden md:inline">
                      El antes y después muestra el aporte de valor sin explicar de más: una marca visible cambia la percepción del producto.
                    </span>
                  </p>
                  <div className="flex justify-start">
                    <ActionButton href="/buy?mode=custom" variant="primary">
                      Probar con mi logo
                    </ActionButton>
                  </div>
                </div>
              </div>

              <div className="md:border-t md:border-[var(--alcohn-line)]">
                <BeforeAfterStrip images={beforeAfterImages} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="hidden" aria-hidden="true">
        <DossInspiredSections />
      </div>

      <section className="atelier-page border-y border-[var(--alcohn-line)] py-6 md:py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div
            data-scroll-panel
            className="technical-sheet mobile-clean-sheet max-md:border-0 max-md:bg-transparent max-md:shadow-none"
          >
            <div
              data-scroll-panel-mobile
              className="max-md:border max-md:border-[var(--alcohn-line)] max-md:bg-[var(--alcohn-surface)] lg:contents"
            >
              <div className="relative z-10 p-4 md:border-b md:border-[var(--alcohn-line)] md:p-10 lg:p-12">
                <div className="max-w-3xl">
                  <p className="craft-label mb-4">Usos, materiales y oficios</p>
                  <h2 className="text-[1.6rem] font-semibold leading-tight tracking-tight text-neutral-950 md:text-5xl">
                    Sellos para cada oficio y material.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-700 md:mt-5 md:text-base">
                    <span className="md:hidden">
                      Un mismo sello te sirve para todos los materiales y usos.
                    </span>
                    <span className="hidden md:inline">
                      Un mismo sello puede resolver usos muy distintos: cuero, madera, pan, lacre, hielo, cerámica, jabón o packaging. Con un mismo sello podes resolver varias partes de un producto.
                    </span>
                  </p>
                </div>
              </div>

              <div className="md:hidden">
                <MobileOverlayCarousel
                  showDots
                  items={oficioMaterialBlocks.map((block, index) => ({
                    key: `${block.oficio}-${block.material}`,
                    image: block.image,
                    alt: block.alt,
                    href: block.href,
                    overlay: (
                      <>
                        <p className="absolute left-4 top-4 text-[10px] font-semibold uppercase text-white/64">
                          {String(index + 1).padStart(2, '0')}
                        </p>
                        <div>
                          <h3 className="text-2xl font-semibold leading-tight tracking-tight">{block.oficio}</h3>
                          <p className="mt-2 text-xs font-semibold uppercase text-white/72">{block.material}</p>
                          <p className="mt-1 text-xs font-semibold text-white/80">
                            Desde ${block.priceFrom.toLocaleString('es-AR')}
                          </p>
                        </div>
                      </>
                    ),
                  }))}
                />
              </div>

              <MobileCarousel
                className="relative z-10 hidden md:block"
                rowClassName="md:grid md:grid-cols-2 lg:grid-cols-3"
                hint="Deslizá oficios"
              >
                {oficioMaterialBlocks.map((block, index) => (
                  <Link
                    key={`${block.oficio}-${block.material}`}
                    href={block.href}
                    data-scroll-card
                    className="mobile-snap-card group relative min-h-[220px] overflow-hidden border border-[var(--alcohn-line)] p-6 text-white md:min-w-0 md:border-b md:border-r"
                  >
                    <img
                      src={block.image}
                      alt={block.alt}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      loading={index < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,16,14,0.12)_0%,rgba(17,16,14,0.48)_65%,rgba(17,16,14,0.68)_100%)]" />
                    <div className="absolute inset-0 opacity-35 mix-blend-screen [background-image:linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:64px_64px]" />
                    <div className="relative flex h-full min-h-[172px] flex-col justify-end pb-1 pt-12">
                      <p className="absolute left-0 top-0 text-[10px] font-semibold uppercase text-white/64">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <div>
                        <h3 className="text-2xl font-semibold leading-tight tracking-tight md:text-3xl">{block.oficio}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="text-xs font-semibold uppercase text-white/72">{block.material}</p>
                          <p className="text-xs font-semibold text-white/80">
                            Desde ${block.priceFrom.toLocaleString('es-AR')}
                          </p>
                          <p className="text-xs font-semibold uppercase text-white/74 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            Ver guía específica
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </MobileCarousel>
            </div>
          </div>
        </div>
      </section>

      <section className="atelier-page border-b border-[var(--alcohn-line)] py-6 md:py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div
            data-scroll-panel
            className="flex flex-col gap-4 md:technical-sheet md:blueprint-sheet md:mobile-clean-sheet lg:grid lg:grid-cols-[0.42fr_0.58fr] lg:gap-0"
          >
            <div
              data-scroll-panel-mobile
              className="max-md:border max-md:border-[var(--alcohn-line)] max-md:bg-[var(--alcohn-surface)] lg:contents"
            >
              <div className="flex flex-col justify-start p-4 md:border-b md:border-[var(--alcohn-line)] md:p-10 lg:border-b-0 lg:border-r lg:p-12 lg:pt-10 xl:pt-12">
                <p className="craft-label mb-4 md:mb-5">Más que fabricación</p>
                <h2 className="text-[1.5rem] font-semibold leading-[1.08] tracking-tight text-neutral-950 sm:text-4xl md:text-[2.65rem] lg:text-[2.85rem] xl:text-5xl xl:leading-[1.06]">
                  <span className="md:hidden">
                    No solo fabricamos sellos: ayudamos a transformar oficio en marca.
                  </span>
                  <span className="hidden md:block">
                    <span className="block">No solo fabricamos sellos</span>
                    <span className="block">de bronce personalizados:</span>
                    <span className="block">
                      ayudamos a{' '}
                      <span data-title-keyword className="title-keyword">
                        <span className="title-keyword__fill" aria-hidden="true" />
                        transformar
                      </span>{' '}
                      un trabajo
                    </span>
                    <span className="block">
                      en una marca con{' '}
                      <span data-title-keyword className="title-keyword">
                        <span className="title-keyword__fill" aria-hidden="true" />
                        identidad propia
                      </span>
                      .
                    </span>
                  </span>
                </h2>
              </div>

              <div className="md:hidden">
                <MobileOverlayCarousel
                  items={materialProofs.map((item) => ({
                    key: item.label,
                    image: item.image,
                    alt: item.alt,
                    caption: { label: item.label, title: item.title },
                  }))}
                />
              </div>

              <div className="hidden md:block">
                <MobileCarousel rowClassName="md:grid md:grid-cols-2" hint="Deslizá materiales">
                  {materialProofs.map((item, index) => (
                    <article
                      key={item.label}
                      data-scroll-card
                      className={`mobile-snap-card group md:min-w-0 md:border-0 md:bg-transparent md:p-4 ${index < 2 ? 'md:border-b' : ''} ${index % 2 === 0 ? 'md:border-r' : ''}`}
                    >
                      <div className="material-frame relative aspect-[4/3] overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.alt}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="pt-4">
                        <p className="craft-label mb-2">{item.label}</p>
                        <h3 className="text-base font-semibold leading-snug text-neutral-950">{item.title}</h3>
                      </div>
                    </article>
                    ))}
                  </MobileCarousel>
                </div>
            </div>
          </div>
        </div>
      </section>

      <LogoCloud />

      <section data-final-cta className="border-t border-[var(--alcohn-bronze)] bg-[var(--alcohn-ink)] py-10 md:py-12 text-white">
        <div className="container mx-auto max-w-7xl px-4 text-center md:px-8">
          <h2 className="mb-3 md:mb-4 text-[1.85rem] font-semibold tracking-tight text-white md:text-4xl leading-[1.1]">
            ¿Listo para marcar tu próximo producto?
          </h2>
          <p className="mx-auto mb-6 md:mb-8 max-w-2xl text-[15px] md:text-base text-neutral-300">
            <span className="md:hidden">Subí tu logo, revisá la muestra y avanzá al pago.</span>
            <span className="hidden md:inline">Subí tu logo, mirá una muestra, confirmá medida y avanzá al pago online.</span>
          </p>
          <div className="inline-flex w-full justify-center sm:w-auto">
            <ActionButton
              href="/buy?mode=custom"
              variant="secondary"
              className="border-white bg-white text-neutral-900 hover:bg-neutral-100 w-full sm:w-auto min-h-[52px] md:min-h-[44px] px-6"
            >
              Diseñar y comprar online
            </ActionButton>
          </div>
        </div>
      </section>
      </HomeScrollShell>
    </>
  );
}
