import PageIntro from '@/components/PageIntro';
import ContactForm from '@/components/ContactForm';
import WhatsappButton from '@/components/WhatsappButton';
import ActionButton from '@/components/ActionButton';

export const metadata = {
  title: 'Contacto - Alcohn',
  description: 'Contactanos para resolver dudas puntuales o avanzar con tu sello de bronce personalizado.',
};

export default function ContactoPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="Contacto"
          title="Si tenes dudas, contactanos"
          description="La web está pensada para resolver la mayoría de los pedidos sin esperar respuesta: subís logo, elegís uso, ves muestra, precio y pagás. Pero si hay algo que no te quedo claro o necesitas alguna ayuda especifica, contactanos por whtasapp."
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
            'Compra online como camino principal',
            'WhatsApp para casos especiales',
            'Datos claros para seguimiento',
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[0.44fr_0.56fr] gap-8 lg:gap-12">
          <aside className="space-y-6">
            <section className="technical-sheet p-6 md:p-8">
              <div className="relative z-10">
                <p className="craft-label mb-4">Atajos de compra</p>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-950 mb-4">
                  Evitá esperar una respuesta si ya sabés qué querés
                </h2>
                <p className="text-sm leading-relaxed text-neutral-700 mb-6">
                  Para logo propio, usá el diseñador. Para motivos listos, entrá a estándar. Para dudas técnicas, revisá FAQ o proceso antes de escribir.
                </p>
                <div className="flex flex-col gap-3">
                  <ActionButton href="/buy?mode=custom" variant="primary">
                    Subir logo y ver precio
                  </ActionButton>
                  <ActionButton href="/sellos/estandar" variant="secondary">
                    Comprar estándar
                  </ActionButton>
                  <ActionButton href="/faq" variant="ghost">
                    Ver preguntas frecuentes
                  </ActionButton>
                </div>
              </div>
            </section>

            <section className="dark-system-panel p-6 md:p-8 text-white">
              <div className="relative z-10">
                <p className="text-[10px] font-semibold uppercase text-white/56 mb-4">WhatsApp</p>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
                  Escribinos y nuestro equipo te ayuda con lo que necesites
                </h2>
                <p className="text-sm leading-relaxed text-white/62 mb-6">
                  Es útil para pedidos fuera de medida, materiales raros, urgencias o cuando el logo necesita revisión manual.
                </p>
                <WhatsappButton variant="light">
                  Abrir WhatsApp
                </WhatsappButton>
              </div>
            </section>
          </aside>

          <section className="technical-sheet p-6 md:p-8">
            <div className="relative z-10">
              <p className="craft-label mb-4">Consulta puntual</p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-950 mb-6">
                Dejanos el contexto para responder mejor
              </h2>
              <ContactForm />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
