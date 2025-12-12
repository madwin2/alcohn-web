import Link from 'next/link';
import Hero from '@/components/Hero';
import SectionTitle from '@/components/SectionTitle';
import LogoCloud from '@/components/LogoCloud';
import Timeline from '@/components/Timeline';
import { processSteps } from '@/data/process';
import { products } from '@/data/products';
import ProductsGrid from '@/components/ProductsGrid';
import ScrollImages from '@/components/ScrollImages';
import AutoImageCarousel from '@/components/AutoImageCarousel';
import HoverImage from '@/components/HoverImage';

export default function Home() {
  const benefits = [
    { title: 'Marcado profundo y limpio', icon: '✓' },
    { title: 'Envíos a todo el país', icon: '🚚' },
    { title: 'Hecho por diseñadores industriales', icon: '🎨' },
  ];


  return (
    <div>
      {/* Hero */}
      <Hero
        title="Más que una herramienta, una forma de contar tu historia."
        subtitle="Sellos de bronce fabricados con precisión para profesionales del oficio. Diseñados para revalorizar tu trabajo."
        primaryCta={{ text: 'Diseña el tuyo.', href: '/cotizar' }}
      />

      {/* Cita destacada */}
      <section id="quote-section" className="py-24 bg-white relative min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Texto a la izquierda */}
            <div className="max-w-2xl">
              <div className="relative">
                <span className="absolute -left-6 md:-left-8 top-0 text-2xl md:text-3xl lg:text-4xl leading-none font-thin italic font-abacaxi text-primary">"</span>
                <blockquote className="font-abacaxi text-2xl md:text-3xl lg:text-4xl leading-relaxed text-primary italic">
                  <span className="font-thin italic">Convertimos a los trabajadores del cuero y la madera en </span>
                  <span className="font-semibold italic">profesionales</span>
                  <span className="font-thin italic"> del oficio, revalorizando su trabajo y su </span>
                  <span className="font-semibold italic">identidad</span>
                  <span className="font-thin italic"> profesional.</span>
                  <span className="inline-block text-2xl md:text-3xl lg:text-4xl leading-none font-thin italic ml-2">"</span>
                </blockquote>
              </div>
            </div>

            {/* Imágenes superpuestas a la derecha */}
            <div className="hidden lg:block relative">
              <div className="sticky top-24">
                <ScrollImages
                  sectionId="quote-section"
                  images={[
                    { id: 1, top: '0', right: '0', src: '/images/scroll/motquero1.png', alt: 'Motoquero 1' },
                    { id: 2, top: '8rem', right: '2rem', src: '/images/scroll/motoquero2.png', alt: 'Motoquero 2' },
                    { id: 3, top: '16rem', right: '4rem', src: '/images/scroll/surfer.png', alt: 'Surfer' },
                    { id: 4, top: '18rem', right: '10rem', src: '/images/scroll/viejo1.png', alt: 'Viejo 1' },
                    { id: 5, top: '14rem', right: '12rem', src: '/images/scroll/viejo2.png', alt: 'Viejo 2' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección dividida: Carrusel izquierda / Imagen fija derecha */}
      <section className="py-24 bg-white min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-screen lg:h-[80vh]">
            {/* Mitad izquierda - Carrusel automático */}
            <div className="w-full h-full">
              <AutoImageCarousel
                images={[
                  { id: 1, alt: 'Sello en pan', src: '/images/carousel/pan.png' },
                  { id: 2, alt: 'Sello en cuero', src: '/images/carousel/cuero.png' },
                  { id: 3, alt: 'Sello en madera', src: '/images/carousel/madera.png' },
                  { id: 4, alt: 'Sello en cerámica', src: '/images/carousel/ceramica.png' },
                  { id: 5, alt: 'Sello en fruta', src: '/images/carousel/fruta.png' },
                  { id: 6, alt: 'Sello en hielo', src: '/images/carousel/hielo.png' },
                  { id: 7, alt: 'Sello en jabón', src: '/images/carousel/jabon.png' },
                  { id: 8, alt: 'Sello en lacre', src: '/images/carousel/lacre.png' },
                ]}
                interval={4000}
              />
            </div>

            {/* Mitad derecha - Imagen fija y texto */}
            <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8 lg:p-12">
              {/* Imagen fija del sello */}
              <div className="w-[25rem] h-[25rem] md:w-[30rem] md:h-[30rem] lg:w-[35rem] lg:h-[35rem] mb-8 overflow-hidden">
                <img 
                  src="/images/sello/sellologo.png" 
                  alt="Sello de bronce Alcohn" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Texto */}
              <div className="text-center w-full max-w-md">
                <h2 className="font-abacaxi text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 text-primary">
                  Un mismo sello.
                </h2>
                <h2 className="font-abacaxi text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 text-primary">
                  Todos los usos.
                </h2>
                <p className="font-abacaxi text-lg md:text-xl font-thin italic text-primary">
                  Mira como usarlo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cita destacada 2 */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-5xl">
            <div className="relative">
              <span className="absolute -left-6 md:-left-8 top-0 text-2xl md:text-3xl lg:text-4xl leading-none font-thin italic font-abacaxi text-primary">"</span>
              <blockquote className="font-abacaxi text-2xl md:text-3xl lg:text-4xl leading-relaxed text-primary italic">
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
      </section>

      {/* Sección: Un sello no decora tu producto */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          {/* Texto superior */}
          <div className="text-center mb-16">
            <h2 className="font-abacaxi text-4xl md:text-5xl lg:text-6xl text-primary">
              <span className="font-thin italic">Un sello no decora tu producto. Lo </span>
              <span className="font-semibold not-italic">transforma.</span>
            </h2>
          </div>

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
      </section>

      {/* Beneficios rápidos */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-semibold">{benefit.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marcas que confían */}
      <LogoCloud />

      {/* Cómo funciona (resumen) */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Cómo funciona"
            subtitle="Proceso simple y transparente"
          />
          <Timeline steps={processSteps.slice(0, 4)} />
          <div className="text-center mt-8">
            <Link
              href="/proceso"
              className="text-bronce font-semibold hover:underline"
            >
              Ver proceso completo →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para contar tu historia?
          </h2>
          <p className="text-xl text-secondary-dark mb-6 max-w-2xl mx-auto">
            Cada sello es más que una herramienta. Es tu firma, tu marca, tu legado.
          </p>
          <Link
            href="/cotizar"
            className="inline-block bg-accent text-primary px-8 py-4 rounded-md font-semibold hover:bg-accent-light transition-colors"
          >
            Cotizar ahora
          </Link>
        </div>
      </section>
    </div>
  );
}

