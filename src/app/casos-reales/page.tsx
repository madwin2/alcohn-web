import PageIntro from '@/components/PageIntro';
import SectionHeader from '@/components/SectionHeader';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import ClienteGallery from '@/components/ClienteGallery';
import SalesCtaBand from '@/components/SalesCtaBand';
import { testimonials } from '@/data/testimonials';
import { getClientes } from '@/lib/clientes';

export const metadata = {
  title: 'Casos reales - Alcohn',
  description: 'Galería de sellos terminados y materiales marcados. Empresas, talleres y emprendedores que ya usan sellos Alcohn.',
};

export default function CasosRealesPage() {
  const clientes = getClientes();

  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="Prueba real"
          title="Sellos terminados en productos de verdad"
          description="La confianza no sale de promesas: sale de ver marcas aplicadas, materiales reales y clientes que ya usan Alcohn para profesionalizar sus productos."
          primaryCta={{
            label: 'Subir logo y ver precio',
            href: '/buy?mode=custom',
          }}
          secondaryCta={{
            label: 'Comprar estándar',
            href: '/sellos/estandar',
            variant: 'secondary',
          }}
          highlights={[
            'Trabajos reales de taller',
            'Marcas aplicadas en diferentes materiales',
            'Referencia visual para elegir medida y uso',
          ]}
        />

        <section className="mb-20">
          <SectionHeader
            title="Galería de sellos terminados"
            subtitle="Ejemplos para entender escala, lectura y resultado sobre productos reales."
            align="left"
          />
          <ClienteGallery clientes={clientes} interval={4000} />
        </section>

        <section className="mb-20">
          <div className="technical-sheet p-6 md:p-10">
            <div className="relative z-10">
              <SectionHeader
                title="Lo que dicen nuestros clientes"
                subtitle="Artesanos, emprendedores y profesionales que confiaron en Alcohn para darle distinción a su marca."
              />
              <TestimonialsCarousel testimonials={testimonials} />
            </div>
          </div>
        </section>

        <div className="mt-20">
          <SalesCtaBand
            title="Usá estos casos como referencia para tu sello"
            copy="Si ya tenés logo, el diseñador online te ayuda a llevarlo a una medida fabricable y a una muestra visual antes de pagar."
            primaryLabel="Subir logo y ver precio"
            primaryHref="/buy?mode=custom"
            secondaryLabel="Ver cómo funciona"
            secondaryHref="/proceso"
            dark
          />
        </div>
      </div>
    </div>
  );
}
