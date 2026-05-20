import Link from 'next/link';
import Hero from '@/components/Hero';
import ActionButton from '@/components/ActionButton';
import LogoCloud from '@/components/LogoCloud';
import HoverImage from '@/components/HoverImage';
import SmoothScroll from '@/components/SmoothScroll';
import DossInspiredSections from '@/components/DossInspiredSections';
import { stampUseCases } from '@/data/stampUseCases';

const materialProofs = [
  {
    label: 'Cuero',
    title: 'Marroquinería Profesional',
    image: '/images/inicio/cuero.jpg',
    alt: 'Marroquinería profesional con sello aplicado en cuero',
  },
  {
    label: 'Madera',
    title: 'Carpintería Profesional',
    image: '/images/inicio/Madera.png',
    alt: 'Carpintería profesional con marca en madera',
  },
  {
    label: 'Acero',
    title: 'Piezas de autor',
    image: '/images/inicio/madera2.jpg',
    alt: 'Pieza de autor con marca artesanal',
  },
  {
    label: 'Packaging',
    title: 'Artículos únicos',
    image: '/images/inicio/cuero.png',
    alt: 'Artículos únicos con presentación de marca',
  },
];

const craftStoryImages = [
  {
    label: 'Madera',
    title: 'Piezas con firma repetible',
    image: '/images/scroll/motoquero2.png',
    alt: 'Piezas de madera con firma repetible',
  },
  {
    label: 'Cuero',
    title: 'Oficio que se reconoce',
    image: '/images/scroll/motquero1.png',
    alt: 'Oficio de cuero que se reconoce',
  },
  {
    label: 'Taller',
    title: 'Identidad Propia',
    image: '/images/scroll/viejo1.png',
    alt: 'Artesano trabajando en taller',
  },
  {
    label: 'Packaging',
    title: 'Producto listo para vender',
    image: '/images/scroll/Firefly_Gemini Flash_Una foto producto de una tote ba 586498 ViW (1).png',
    alt: 'Bolsa de tela con marca aplicada',
  },
];

const transformations = [
  {
    material: 'Cuero',
    title: 'Billetera sin marca vs. pieza firmada',
    defaultImage: { alt: 'Billetera de cuero sin marca', src: '/images/hover/billetera.png' },
    hoverImage: { alt: 'Billetera de cuero marcada', src: '/images/hover/billetera_edit.png' },
  },
  {
    material: 'Mate',
    title: 'Accesorio común vs. producto de marca',
    defaultImage: { alt: 'Mate sin marca', src: '/images/hover/mate.png' },
    hoverImage: { alt: 'Mate marcado con sello', src: '/images/hover/mate_edit.png' },
  },
  {
    material: 'Madera',
    title: 'Tabla artesanal vs. pieza reconocible',
    defaultImage: { alt: 'Tabla de madera sin marca', src: '/images/hover/tabla.png' },
    hoverImage: { alt: 'Tabla de madera marcada', src: '/images/hover/tabla_edit.png' },
  },
  {
    material: 'Muebles',
    title: 'Taburete sin marca vs. pieza firmada',
    defaultImage: { alt: 'Taburete de madera sin marca', src: '/images/hover/taburete.png' },
    hoverImage: { alt: 'Taburete de madera marcado con sello', src: '/images/hover/taburete_edit.png' },
  },
];

const oficioMaterialBlocks = stampUseCases.map((useCase) => ({
  oficio: useCase.oficio,
  material: useCase.material,
  image: useCase.heroImage,
  alt: useCase.heroAlt,
  href: `/sellos/${useCase.slug}`,
}));

export default function Home() {
  return (
    <SmoothScroll>
      <Hero
        title="Más que una herramienta, una forma de contar tu historia."
        subtitle="Sellos de bronce personalizados para marcar cuero, madera, alimentos y packaging. Subí tu logo, elegí cómo lo vas a usar y recibí muestra, medida y precio antes de fabricar."
        primaryCta={{ text: 'Subir logo y ver precio', href: '/buy?mode=custom' }}
        secondaryCta={{ text: 'Comprar diseño estándar', href: '/sellos/estandar' }}
      />

      <section id="oficio-identidad" className="atelier-page border-y border-[var(--alcohn-line)] py-16 md:snap-start md:py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="technical-sheet blueprint-sheet">
            <div className="grid grid-cols-1 lg:grid-cols-[0.46fr_0.54fr]">
              <div className="border-b border-[var(--alcohn-line)] p-6 md:p-10 lg:border-b-0 lg:border-r lg:p-12">
                <p className="craft-label mb-4">Oficio premium + marca propia</p>
                <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-5xl">
                  Del trabajo bien hecho a la marca que se reconoce.
                </h2>
                <blockquote className="mt-7 max-w-xl border-l border-[var(--alcohn-bronze)] pl-5 text-xl leading-relaxed text-neutral-800 md:text-2xl">
                  Convertimos a los trabajadores del cuero y la madera en profesionales del oficio, revalorizando su trabajo y su identidad profesional.
                </blockquote>
                <p className="mt-6 max-w-xl text-sm leading-relaxed text-neutral-700 md:text-base">
                  El sello transforma una pieza bien hecha en un producto reconocible: firma, repetición y presencia de marca sin perder el carácter artesanal del taller.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ActionButton href="/buy?mode=custom" variant="primary">
                    Subir logo
                  </ActionButton>
                  <ActionButton href="/casos-reales" variant="ghost">
                    Ver trabajos reales
                  </ActionButton>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                {craftStoryImages.map((item, index) => (
                  <article
                    key={item.label}
                    className={`group border-[var(--alcohn-line)] p-4 ${index < 2 ? 'border-b' : ''} ${index % 2 === 0 ? 'sm:border-r' : ''}`}
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
              </div>
            </div>

            <div className="mt-12 border-t border-[var(--alcohn-line)] md:mt-16 lg:mt-20">
              <div className="grid grid-cols-1 border-b border-[var(--alcohn-line)] lg:grid-cols-[0.58fr_0.42fr]">
                <div className="p-6 md:p-10 lg:p-12">
                  <p className="craft-label mb-4 md:mb-5">Antes y después</p>
                  <h2 className="max-w-4xl text-[1.75rem] font-semibold leading-[1.08] tracking-tight text-neutral-950 sm:text-4xl md:text-[2.65rem] lg:text-[2.85rem] xl:text-5xl xl:leading-[1.06]">
                    <span className="block">Un sello no decora tu producto.</span>
                    <span className="block">
                      <span className="title-keyword">Lo transforma.</span>
                    </span>
                  </h2>
                </div>

                <div className="flex flex-col justify-between gap-7 border-t border-[var(--alcohn-line)] p-6 md:p-10 lg:border-l lg:border-t-0 lg:p-12">
                  <p className="max-w-md text-sm leading-relaxed text-neutral-700 md:text-base">
                    El antes y después muestra el aporte de valor sin explicar de más: una marca visible cambia la percepción del producto.
                  </p>
                  <div className="flex justify-start">
                    <ActionButton href="/buy?mode=custom" variant="primary">
                      Probar con mi logo
                    </ActionButton>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {transformations.map((item) => (
                  <article
                    key={item.material}
                    className="group border-b border-r border-[var(--alcohn-line)] bg-white/28 p-4 transition-colors hover:bg-white/58"
                  >
                    <div className="material-frame aspect-square overflow-hidden">
                      <HoverImage defaultImage={item.defaultImage} hoverImage={item.hoverImage} />
                    </div>
                    <div className="min-h-[112px] px-2 pb-2 pt-5">
                      <p className="craft-label mb-3">{item.material}</p>
                      <h3 className="text-lg font-semibold leading-snug tracking-tight text-neutral-950">
                        {item.title}
                      </h3>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <DossInspiredSections />

      <section className="atelier-page border-y border-[var(--alcohn-line)] py-16 md:snap-start md:py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="technical-sheet motion-reveal">
            <div className="relative z-10 border-b border-[var(--alcohn-line)] p-6 md:p-10 lg:p-12">
              <div className="max-w-3xl">
                <p className="craft-label mb-4">Usos, materiales y oficios</p>
                <h2 className="text-3xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-5xl">
                  Sellos para cada oficio y material.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-700 md:text-base">
                  Un mismo sello puede resolver usos muy distintos: cuero, madera, pan, lacre, hielo, cerámica, jabón o packaging. Con un mismo sello podes resolver varias partes de un producto.
                </p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {oficioMaterialBlocks.map((block, index) => (
                <Link
                  key={`${block.oficio}-${block.material}`}
                  href={block.href}
                  className="group relative min-h-[220px] overflow-hidden border-b border-r border-[var(--alcohn-line)] p-6 text-white"
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
                        <p className="text-xs font-semibold uppercase text-white/74 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          Ver guía específica
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="atelier-page border-b border-[var(--alcohn-line)] py-16 md:snap-start md:py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="technical-sheet">
            <div className="grid grid-cols-1 lg:grid-cols-[0.42fr_0.58fr]">
              <div className="flex flex-col justify-start border-b border-[var(--alcohn-line)] p-6 md:p-10 lg:border-b-0 lg:border-r lg:p-12 lg:pt-10 xl:pt-12">
                <p className="craft-label mb-4 md:mb-5">Más que fabricación</p>
                <h2 className="text-[1.75rem] font-semibold leading-[1.08] tracking-tight text-neutral-950 sm:text-4xl md:text-[2.65rem] lg:text-[2.85rem] xl:text-5xl xl:leading-[1.06]">
                  <span className="block">No solo fabricamos sellos</span>
                  <span className="block">de bronce personalizados:</span>
                  <span className="block">
                    ayudamos a{' '}
                    <span className="title-keyword">transformar</span> un trabajo
                  </span>
                  <span className="block">
                    en una marca con <span className="title-keyword">identidad propia</span>.
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                {materialProofs.map((item, index) => (
                  <article
                    key={item.label}
                    className={`group border-[var(--alcohn-line)] p-4 ${index < 2 ? 'border-b' : ''} ${index % 2 === 0 ? 'sm:border-r' : ''}`}
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
              </div>
            </div>
          </div>
        </div>
      </section>

      <LogoCloud />

      <section className="border-t border-[var(--alcohn-bronze)] bg-[var(--alcohn-ink)] py-16 text-white md:snap-start">
        <div className="container mx-auto max-w-7xl px-4 text-center md:px-8">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            ¿Listo para marcar tu próximo producto?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-neutral-300">
            Subí tu logo, mirá una muestra, confirmá medida y avanzá al pago online.
          </p>
          <ActionButton
            href="/buy?mode=custom"
            variant="secondary"
            className="border-white bg-white text-neutral-900 hover:bg-neutral-100"
          >
            Diseñar y comprar online
          </ActionButton>
        </div>
      </section>
    </SmoothScroll>
  );
}
