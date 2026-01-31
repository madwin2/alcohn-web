import SectionTitle from '@/components/SectionTitle';
import LogoCloud from '@/components/LogoCloud';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import ClienteCard from '@/components/ClienteCard';
import { testimonials } from '@/data/testimonials';
import { getClientes } from '@/lib/clientes';

export const metadata = {
  title: 'Casos reales - Alcohn',
  description: 'Galería de sellos terminados y materiales marcados. Empresas, talleres y emprendedores que ya usan sellos Alcohn.',
};

export default function CasosRealesPage() {
  const clientes = getClientes();

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="Lo que ya hicimos"
          subtitle="Empresas, talleres y emprendedores de toda Argentina ya usan sellos Alcohn."
        />

        {/* Galería de clientes */}
        <section className="py-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Galería de sellos terminados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {clientes.map((cliente) => (
              <ClienteCard key={cliente.nombre} cliente={cliente} interval={4000} />
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

