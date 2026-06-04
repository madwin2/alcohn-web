import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';
import FaqList from '@/components/FaqList';
import SalesCtaBand from '@/components/SalesCtaBand';
import { faqs } from '@/data/faq';
import { buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Preguntas frecuentes sobre sellos de bronce personalizados | Alcohn',
  description:
    'Dudas sobre medidas, materiales, tiempos de fabricación, envíos y compra de sellos de bronce CNC en Argentina.',
  path: '/faq',
});

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Preguntas frecuentes', path: '/faq' },
]);

export default function FaqPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="FAQ de compra"
          title="Respuestas a preguntas comunes"
          description="Reunimos las dudas que suelen repetirse comunmente. Para que tengas toda la informacion de la manera mas rapida y simple posible."
          mobileDescription="Respuestas rápidas sobre materiales, medidas, tiempos y compra."
          primaryCta={{
            label: 'Diseñar mi sello',
            href: '/buy?mode=custom',
          }}
          secondaryCta={{
            label: 'Comprar estándar',
            href: '/sellos/estandar',
            variant: 'secondary',
          }}
        />

        <section className="mb-20">
          <FaqList faqs={faqs} />
        </section>

        <SalesCtaBand
          title="Cuando ya entendés el producto, el mejor paso es probar tu logo"
          copy="El diseñador online te guía por uso, medida, muestra y precio. Si algo necesita revisión, queda registrado para que Alcohn pueda seguirlo."
          primaryLabel="Diseñar mi sello"
          primaryHref="/buy?mode=custom"
          secondaryLabel="Ver proceso"
          secondaryHref="/proceso"
          dark
        />
      </div>
    </div>
  );
}
