import Link from 'next/link';
import SectionTitle from '@/components/SectionTitle';
import FaqList from '@/components/FaqList';
import { faqs } from '@/data/faq';

export const metadata = {
  title: 'Preguntas frecuentes - Alcohn',
  description: 'Respuestas a las preguntas más comunes sobre nuestros sellos de bronce personalizados.',
};

export default function FaqPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="Preguntas frecuentes"
          subtitle="Respondemos lo que más nos preguntan. Si no encontrás tu respuesta, hablamos."
        />

        <FaqList faqs={faqs} />

        <section className="text-center py-12">
          <p className="text-lg text-gray-600 mb-4">
            ¿No encontraste tu respuesta?
          </p>
          <Link
            href="/contacto"
            className="inline-block bg-accent text-primary px-8 py-4 rounded-md font-semibold hover:bg-accent-light transition-colors"
          >
            Hablar por WhatsApp
          </Link>
        </section>
      </div>
    </div>
  );
}

