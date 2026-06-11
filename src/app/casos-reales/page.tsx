import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';
import SectionHeader from '@/components/SectionHeader';
import TestimonialsColumnsSection from '@/components/TestimonialsColumnsSection';
import RecognizedBrandsMarquee from '@/components/RecognizedBrandsMarquee';
import ClienteGallery from '@/components/ClienteGallery';
import SalesCtaBand from '@/components/SalesCtaBand';
import { getClientes } from '@/lib/clientes';
import { testimonials, toReviewJsonLdInputs } from '@/data/testimonials';
import {
  buildBreadcrumbJsonLd,
  buildGoogleReviewsSchemaGraph,
  createPageMetadata,
} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title:
    'Casos reales: marcas que usan sellos Alcohn (Brooksfield, Tucci, Mistral, Lee) | Alcohn',
  description:
    'Galería de sellos terminados y trabajos reales. Marcas, talleres y emprendedores que marcan con bronce CNC Alcohn.',
  path: '/casos-reales',
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Casos reales', path: '/casos-reales' },
]);

const googleReviewsJsonLd = buildGoogleReviewsSchemaGraph(
  toReviewJsonLdInputs(testimonials)
);

export default function CasosRealesPage() {
  const clientes = getClientes();

  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(googleReviewsJsonLd) }}
      />
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="Prueba real"
          title="Clientes que confiaron en Alcohn"
          description="La confianza no sale de promesas: sale de ver marcas aplicadas, materiales reales y clientes que ya usan Alcohn para profesionalizar sus productos."
          mobileDescription="Casos reales para ver resultado, escala y lectura antes de elegir tu sello."
          primaryCta={{
            label: 'Subir logo y ver precio',
            href: '/buy?mode=custom',
          }}
          secondaryCta={{
            label: 'Comprar estándar',
            href: '/sellos/estandar',
            variant: 'secondary',
          }}
        />

        <section className="mb-14 md:mb-20">
          <SectionHeader
            title="Galería de sellos terminados"
            subtitle="Ejemplos para entender escala, lectura y resultado sobre productos reales."
            className="mb-6 md:mb-12"
          />
          <ClienteGallery clientes={clientes} interval={4000} />
        </section>

        <RecognizedBrandsMarquee />

        <section className="mb-14 md:mb-20">
          <SectionHeader
            title="Lo que dicen nuestros clientes"
            subtitle="Artesanos, emprendedores y profesionales que confiaron en Alcohn para darle distinción a su marca."
            className="mb-6 md:mb-10"
          />
          <TestimonialsColumnsSection />
        </section>

        <div className="mt-14 md:mt-20">
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
