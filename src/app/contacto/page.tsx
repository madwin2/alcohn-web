import SectionTitle from '@/components/SectionTitle';
import ContactForm from '@/components/ContactForm';
import WhatsappButton from '@/components/WhatsappButton';

export const metadata = {
  title: 'Contacto - Alcohn',
  description: 'Contactanos para resolver tus dudas o cotizar tu sello de bronce personalizado.',
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="Contacto"
          subtitle="Estamos acá para ayudarte. Tu consulta es importante para nosotros."
        />

        <div className="max-w-2xl mx-auto space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-6">Envianos un mensaje</h2>
            <ContactForm />
          </section>

          <section className="text-center">
            <h2 className="text-2xl font-semibold mb-4">O hablá por WhatsApp</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Respondemos rápido y podemos resolver todas tus dudas. Preferimos la conversación directa cuando hace falta.
            </p>
            <WhatsappButton className="text-lg px-8 py-4">
              Abrir WhatsApp
            </WhatsappButton>
          </section>
        </div>
      </div>
    </div>
  );
}

