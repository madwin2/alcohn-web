import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';
import ContactForm from '@/components/ContactForm';
import WhatsappButton from '@/components/WhatsappButton';
import ActionButton from '@/components/ActionButton';
import { config } from '@/lib/config';
import { buildBreadcrumbJsonLd, createPageMetadata, SITE_CONTACT } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Contacto | Sellos de bronce personalizados Alcohn Argentina',
  description:
    'Escribinos por WhatsApp o formulario. Mar del Plata, envío a todo Argentina. Resolvemos dudas sobre tu sello de bronce CNC.',
  path: '/contacto',
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Contacto', path: '/contacto' },
]);

export default function ContactoPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
            label: 'Contactar por WhatsApp',
            href: `${SITE_CONTACT.whatsappUrl}?text=${encodeURIComponent(config.whatsapp.message.base)}`,
            variant: 'secondary',
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[0.44fr_0.56fr] gap-8 lg:gap-12">
          <aside className="space-y-6">
            <section className="technical-sheet hidden p-6 md:block md:p-8">
              <div className="relative z-10">
                <p className="craft-label mb-4">Atajos de compra</p>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-950 mb-4">
                  Evitá esperar una respuesta si ya sabés qué querés
                </h2>
                <p className="text-sm leading-relaxed text-neutral-700 mb-6">
                  Si tenes el logo y queres ver como quedaria podes usar el diseñador online. Para diseños estandar, podes entrar a sellos estándar. Para dudas técnicas, revisá FAQ.
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

            <section className="technical-sheet p-6 md:p-8">
              <div className="relative z-10">
                <p className="craft-label mb-4">Datos de contacto</p>
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-950 mb-5">
                  Toda la información para ubicarnos
                </h2>
                <dl className="space-y-4 text-sm leading-relaxed text-neutral-800">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                      Email
                    </dt>
                    <dd>
                      <a
                        href={`mailto:${SITE_CONTACT.email}`}
                        className="font-medium text-neutral-900 underline-offset-2 hover:underline"
                      >
                        {SITE_CONTACT.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                      Teléfono y WhatsApp
                    </dt>
                    <dd>
                      <a
                        href={`tel:${SITE_CONTACT.phoneTel}`}
                        className="font-medium text-neutral-900 underline-offset-2 hover:underline"
                      >
                        {SITE_CONTACT.phoneDisplay}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                      Dirección del taller
                    </dt>
                    <dd className="not-italic">
                      <address className="not-italic">
                        {SITE_CONTACT.streetAddress}
                        <br />
                        CP {SITE_CONTACT.postalCode}, {SITE_CONTACT.addressLocality}
                        <br />
                        {SITE_CONTACT.addressRegion}, {SITE_CONTACT.addressCountry}
                      </address>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                      Horario de atención
                    </dt>
                    <dd>Lunes a viernes, de 8:00 a 16:00hs. Respondemos por WhatsApp y email.</dd>
                  </div>
                </dl>
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
