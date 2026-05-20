import PageIntro from '@/components/PageIntro';
import FaqList from '@/components/FaqList';
import SalesCtaBand from '@/components/SalesCtaBand';
import { faqs } from '@/data/faq';

export const metadata = {
  title: 'Preguntas frecuentes - Alcohn',
  description: 'Respuestas a las preguntas más comunes sobre nuestros sellos de bronce personalizados.',
};

export default function FaqPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="FAQ de compra"
          title="Respuestas a preguntas comunes"
          description="Reunimos las dudas que suelen repetirse comunmente. Para que tengas toda la informacion de la manera mas rapida y simple posible."
          primaryCta={{
            label: 'Diseñar mi sello',
            href: '/buy?mode=custom',
          }}
          secondaryCta={{
            label: 'Comprar estándar',
            href: '/sellos/estandar',
            variant: 'secondary',
          }}
          highlights={[
            'Materiales compatibles explicados',
            'Medidas y muestra antes de fabricar',
            'Pago y tiempos sin vueltas',
          ]}
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
