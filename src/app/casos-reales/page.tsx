import SectionTitle from '@/components/SectionTitle';
import LogoCloud from '@/components/LogoCloud';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import { testimonials } from '@/data/testimonials';

export const metadata = {
  title: 'Casos reales - Alcohn',
  description: 'Galería de sellos terminados y materiales marcados. Empresas, talleres y emprendedores que ya usan sellos Alcohn.',
};

export default function CasosRealesPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="Lo que ya hicimos"
          subtitle="Empresas, talleres y emprendedores de toda Argentina ya usan sellos Alcohn."
        />

        {/* Galería de fotos */}
        <section className="py-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Galería de sellos terminados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-secondary rounded-lg flex items-center justify-center"
              >
                <p className="text-gray-400 text-sm">
                  {/* TODO: Agregar imágenes reales cuando estén disponibles */}
                  Imagen del sello {i}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonios */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6 text-center">Lo que dicen nuestros clientes</h2>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
              Artesanos, emprendedores y profesionales que confiaron en Alcohn para darle distinción a su marca.
            </p>
            <div className="max-w-5xl mx-auto">
              <TestimonialsCarousel testimonials={testimonials} />
            </div>
          </div>
        </section>

        {/* Marcas que confían */}
        <LogoCloud />
      </div>
    </div>
  );
}

