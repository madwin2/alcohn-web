import Link from 'next/link';
import Hero from '@/components/Hero';
import Section from '@/components/Section';
import SectionHeader from '@/components/SectionHeader';
import Divider from '@/components/Divider';
import ActionButton from '@/components/ActionButton';
import LogoCloud from '@/components/LogoCloud';
import Timeline from '@/components/Timeline';
import { processSteps } from '@/data/process';
import { products } from '@/data/products';
import ProductsGrid from '@/components/ProductsGrid';
import ScrollImages from '@/components/ScrollImages';
import AutoImageCarousel from '@/components/AutoImageCarousel';
import HoverImage from '@/components/HoverImage';
import EqualHeightContainer from '@/components/EqualHeightContainer';
import SmoothScroll from '@/components/SmoothScroll';
import SquareCarouselContainer from '@/components/SquareCarouselContainer';

export default function Home() {
  return (
    <SmoothScroll>
      {/* Hero */}
      <Hero
        title="Más que una herramienta, una forma de contar tu historia."
        subtitle="Sellos de bronce fabricados con precisión para profesionales del oficio. Diseñados para revalorizar tu trabajo."
        primaryCta={{ text: 'Diseña el tuyo.', href: '/buy?mode=custom' }}
      />

      {/* Cita destacada */}
      <section 
        id="quote-section" 
        className="snap-start snap-always h-[calc(100vh-4rem)] flex items-center justify-center bg-white relative"
        data-snap-section
      >
        <div className="container mx-auto px-4 md:px-8 max-w-7xl relative w-full h-full flex items-center justify-center">
          {/* Texto centrado */}
          <div className="max-w-4xl text-center relative z-20 px-8">
            <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-8 md:p-12 shadow-lg">
              <span className="absolute -left-6 md:-left-8 top-0 text-2xl md:text-3xl lg:text-4xl leading-none font-thin italic font-abacaxi text-neutral-900">"</span>
              <blockquote className="font-abacaxi text-2xl md:text-3xl lg:text-4xl leading-relaxed text-neutral-900 italic">
                <span className="font-thin italic">Convertimos a los trabajadores del cuero y la madera en </span>
                <span className="font-semibold italic">profesionales</span>
                <span className="font-thin italic"> del oficio, revalorizando su trabajo y su </span>
                <span className="font-semibold italic">identidad</span>
                <span className="font-thin italic"> profesional.</span>
                <span className="inline-block text-2xl md:text-3xl lg:text-4xl leading-none font-thin italic ml-2">"</span>
              </blockquote>
            </div>
          </div>

          {/* Imágenes superpuestas en ambos lados */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full">
              <ScrollImages
                sectionId="quote-section"
                images={[
                  { id: 1, top: '5%', left: '15%', rotation: -5, src: '/images/scroll/motquero1.png', alt: 'Motoquero 1' },
                  { id: 2, top: '8%', right: '15%', rotation: 8, src: '/images/scroll/motoquero2.png', alt: 'Motoquero 2' },
                  { id: 3, top: '12%', left: '5%', rotation: -12, src: '/images/scroll/surfer.png', alt: 'Surfer' },
                  { id: 4, top: '15%', right: '5%', rotation: 6, src: '/images/scroll/viejo1.png', alt: 'Viejo 1' },
                  { id: 5, top: '28%', left: '2%', rotation: -8, src: '/images/scroll/viejo2.png', alt: 'Viejo 2' },
                  { id: 6, top: '30%', right: '2%', rotation: 10, src: '/images/scroll/Firefly_Gemini Flash_Un mate de cuero clarito con vir 725252 QFI (1).png', alt: 'Mate de cuero' },
                  { id: 7, top: '55%', left: '5%', rotation: -7, src: '/images/scroll/Firefly_Gemini Flash_Un mate imperial argentino de cu 551920 EIi (1).png', alt: 'Mate imperial' },
                  { id: 8, top: '58%', right: '8%', rotation: 9, src: '/images/scroll/Firefly_Gemini Flash_Una foto producto de una tote ba 586498 ViW (1).png', alt: 'Tote bag' },
                  { id: 9, top: '60%', left: '12%', rotation: -6, src: '/images/scroll/Firefly_Gemini Flash_Una foto de frente de una mujer -Argentina, de unos 45 años, sonriendo- brazando y pr 586498.png', alt: 'Mujer sonriendo' },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sección dividida: Imagen izquierda / Imagen fija derecha */}
      <Section>
        <div className="container mx-auto px-4 md:px-8 max-w-7xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-0 w-full h-full">
            {/* Carrusel izquierda - Ocupa el máximo espacio posible */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative w-full h-full max-h-[calc(100vh-4rem-3rem)] aspect-square lg:aspect-auto">
                <AutoImageCarousel
                  images={[
                    { id: 1, src: '/images/carousel/madera.png', alt: 'Sello marcado en tronco de árbol' },
                    { id: 2, src: '/images/carousel/cuero.png', alt: 'Sello marcado en cuero' },
                    { id: 3, src: '/images/carousel/pan.png', alt: 'Sello marcado en pan' },
                    { id: 4, src: '/images/carousel/ceramica.png', alt: 'Sello marcado en cerámica' },
                    { id: 5, src: '/images/carousel/fruta.png', alt: 'Sello marcado en fruta' },
                    { id: 6, src: '/images/carousel/hielo.png', alt: 'Sello marcado en hielo' },
                    { id: 7, src: '/images/carousel/jabon.png', alt: 'Sello marcado en jabón' },
                    { id: 8, src: '/images/carousel/lacre.png', alt: 'Sello marcado en lacre' },
                  ]}
                  interval={4000}
                />
              </div>
            </div>

            {/* Lado derecho - Se adapta al espacio disponible */}
            <div className="bg-white flex flex-col items-center justify-center p-6 md:p-8 lg:p-12 w-full h-full">
              <div className="flex flex-col items-center justify-center gap-6 md:gap-8 w-full h-full">
                {/* Imagen fija del sello - Se adapta al espacio */}
                <div className="w-full max-w-full aspect-square max-h-[40vh] lg:max-h-[50vh] flex-shrink-0">
                  <img 
                    src="/images/sello/sellologo.png" 
                    alt="Sello de bronce Alcohn" 
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Texto - Se adapta al espacio */}
                <div className="text-center w-full px-4">
                  <h2 className="font-abacaxi text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold mb-2 text-neutral-900 tracking-tight">
                    Un mismo sello.
                  </h2>
                  <h2 className="font-abacaxi text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold mb-4 md:mb-6 text-neutral-900 tracking-tight">
                    Todos los usos.
                  </h2>
                  <Link 
                    href="/sellos/personalizados"
                    className="font-abacaxi text-base md:text-lg lg:text-xl font-thin italic text-neutral-700 hover:text-neutral-900 transition-colors border-b border-transparent hover:border-neutral-700 inline-block"
                  >
                    Mira como usarlo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Cita destacada 2 */}
      <Section>
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="max-w-5xl">
            <div className="relative">
              <span className="absolute -left-6 md:-left-8 top-0 text-2xl md:text-3xl lg:text-4xl leading-none font-thin italic font-abacaxi text-neutral-900">"</span>
              <blockquote className="font-abacaxi text-2xl md:text-3xl lg:text-4xl leading-relaxed text-neutral-900 italic">
                <span className="font-thin italic">No solo fabricamos sellos de bronce personalizados</span>
                <br />
                <span className="font-thin italic">—diseñados con precisión para marcar cuero, madera,</span>
                <br />
                <span className="font-thin italic">papel o alimentos—, sino que ayudamos a los</span>
                <br />
                <span className="font-thin italic">emprendedores a </span>
                <span className="font-semibold italic">transformar</span>
                <span className="font-thin italic"> su trabajo en una marca</span>
                <br />
                <span className="font-thin italic">con </span>
                <span className="font-semibold italic">identidad propia</span>
                <span className="font-thin italic">.</span>
                <span className="inline-block text-2xl md:text-3xl lg:text-4xl leading-none font-thin italic ml-2">"</span>
              </blockquote>
            </div>
          </div>
        </div>
      </Section>

      {/* Sección: Un sello no decora tu producto */}
      <Section>
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          {/* Texto superior */}
          <SectionHeader
            title={
              <>
                <span className="font-thin italic">Un sello no decora tu producto. Lo </span>
                <span className="font-semibold not-italic">transforma.</span>
              </>
            }
          />

          {/* Cuatro imágenes en fila */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {/* Imagen 1 - Billetera */}
            <div className="aspect-square">
              <HoverImage
                defaultImage={{ alt: 'Billetera', src: '/images/hover/billetera.png' }}
                hoverImage={{ alt: 'Billetera marcada', src: '/images/hover/billetera_edit.png' }}
              />
            </div>

            {/* Imagen 2 - Mate */}
            <div className="aspect-square">
              <HoverImage
                defaultImage={{ alt: 'Mate', src: '/images/hover/mate.png' }}
                hoverImage={{ alt: 'Mate marcado', src: '/images/hover/mate_edit.png' }}
              />
            </div>

            {/* Imagen 3 - Tabla */}
            <div className="aspect-square">
              <HoverImage
                defaultImage={{ alt: 'Tabla', src: '/images/hover/tabla.png' }}
                hoverImage={{ alt: 'Tabla marcada', src: '/images/hover/tabla_edit.png' }}
              />
            </div>

            {/* Imagen 4 - Placeholder */}
            <div className="aspect-square">
              <HoverImage
                defaultImage={{ alt: 'Producto', bgColor: '#000000' }}
                hoverImage={{ alt: 'Producto marcado', bgColor: '#1a1a1a' }}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Marcas que confían */}
      <LogoCloud />

      {/* Cómo funciona (resumen) */}
      <Section bg="neutral" padding="small">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <SectionHeader
            title="Cómo funciona"
            subtitle="Proceso simple y transparente"
          />
          <Timeline steps={processSteps.slice(0, 4)} />
          <div className="text-center mt-12">
            <Link
              href="/proceso"
              className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors border-b border-transparent hover:border-neutral-900"
            >
              Ver proceso completo →
            </Link>
          </div>
        </div>
      </Section>

      {/* CTA final */}
      <Section bg="white" padding="small" className="bg-neutral-900 text-white">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
            ¿Listo para contar tu historia?
          </h2>
          <p className="text-base text-neutral-300 mb-8 max-w-2xl mx-auto">
            Cada sello es más que una herramienta. Es tu firma, tu marca, tu legado.
          </p>
          <ActionButton
            href="/buy?mode=custom"
            variant="secondary"
            className="bg-white text-neutral-900 border-white hover:bg-neutral-100"
          >
            Cotizar ahora
          </ActionButton>
        </div>
      </Section>
    </SmoothScroll>
  );
}
