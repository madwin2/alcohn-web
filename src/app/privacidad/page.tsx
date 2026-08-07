import type { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata, SITE_CONTACT } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Política de privacidad | Alcohn Sellos de bronce',
  description:
    'Cómo recopilamos, usamos y protegemos tus datos personales en alcohnsellos.com. Incluye el uso de WhatsApp Business.',
  path: '/privacidad',
});

const sections: Array<{ title: string; paragraphs: string[] }> = [
  {
    title: '1. Información que recopilamos',
    paragraphs: [
      'Podemos recopilar información proporcionada directamente por nuestros clientes, incluyendo nombre, número de teléfono, dirección de correo electrónico, domicilio, información necesaria para facturación y envíos, así como mensajes, imágenes, logotipos, diseños y otros archivos enviados para solicitar presupuestos o realizar pedidos.',
      'También podemos recibir información relacionada con las comunicaciones realizadas a través de WhatsApp.',
    ],
  },
  {
    title: '2. Cómo utilizamos la información',
    paragraphs: [
      'Utilizamos estos datos para responder consultas, elaborar presupuestos, gestionar pedidos, fabricar productos personalizados, procesar pagos y facturación, coordinar envíos, brindar atención al cliente y realizar comunicaciones relacionadas con nuestros productos y servicios.',
    ],
  },
  {
    title: '3. WhatsApp Business',
    paragraphs: [
      'Alcohn Sellos utiliza WhatsApp Business y la WhatsApp Business Platform de Meta para comunicarse con clientes.',
      'Cuando un usuario se comunica con nosotros a través de WhatsApp, podemos procesar su número de teléfono, nombre, contenido de los mensajes y archivos enviados con el objetivo de atender su consulta o gestionar su pedido.',
      'El uso de WhatsApp también está sujeto a las políticas y condiciones de Meta y WhatsApp.',
    ],
  },
  {
    title: '4. Proveedores de servicios',
    paragraphs: [
      'Podemos utilizar proveedores externos para prestar determinados servicios, como infraestructura tecnológica, alojamiento de servidores, procesamiento de pagos, facturación, logística y herramientas de comunicación.',
      'Estos proveedores pueden procesar únicamente la información necesaria para prestar dichos servicios.',
    ],
  },
  {
    title: '5. Conservación de la información',
    paragraphs: [
      'Conservamos los datos personales únicamente durante el tiempo necesario para cumplir con las finalidades para las que fueron recopilados, atender obligaciones administrativas o legales y mantener el historial necesario para brindar soporte a nuestros clientes.',
    ],
  },
  {
    title: '6. Seguridad',
    paragraphs: [
      'Adoptamos medidas razonables de seguridad para proteger la información contra accesos no autorizados, pérdida, modificación o divulgación indebida.',
    ],
  },
  {
    title: '7. Derechos del usuario',
    paragraphs: [
      'Los usuarios pueden solicitar acceso, rectificación, actualización o eliminación de sus datos personales comunicándose con nosotros.',
    ],
  },
  {
    title: '8. Eliminación de datos',
    paragraphs: [
      'Para solicitar la eliminación de información personal asociada a una conversación, consulta o pedido, el usuario puede contactarnos a:',
      SITE_CONTACT.email,
      'Indicando los datos necesarios para identificar la información que desea eliminar.',
    ],
  },
  {
    title: '9. Contacto',
    paragraphs: [
      'Para consultas relacionadas con esta Política de Privacidad:',
      'Alcohn Sellos',
      'Sitio web: alcohnsellos.com',
      `Email: ${SITE_CONTACT.email}`,
      'Argentina',
    ],
  },
  {
    title: '10. Cambios en esta política',
    paragraphs: [
      'Podemos actualizar esta Política de Privacidad cuando sea necesario. Las modificaciones serán publicadas en esta misma página junto con la fecha de última actualización.',
    ],
  },
];

export default function PrivacidadPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">
        <p className="craft-label mb-3">Información legal</p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Política de Privacidad
        </h1>
        <p className="mb-2 text-sm text-gray-500">Última actualización: agosto de 2026</p>
        <p className="mb-10 text-base leading-relaxed text-gray-700 md:text-lg">
          En Alcohn Sellos respetamos la privacidad de nuestros clientes y usuarios. Esta Política
          de Privacidad explica qué información recopilamos, cómo la utilizamos y qué opciones
          tienen los usuarios respecto de sus datos personales.
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-gray-900">
                {section.title}
              </h2>
              <div className="space-y-3 text-base leading-relaxed text-gray-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={`${section.title}-${paragraph.slice(0, 48)}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-neutral-200 pt-8 text-sm text-gray-600">
          <Link href="/" className="font-medium text-gray-900 underline-offset-2 hover:underline">
            Volver al inicio
          </Link>
          {' · '}
          <Link
            href="/terminos"
            className="font-medium text-gray-900 underline-offset-2 hover:underline"
          >
            Términos
          </Link>
          {' · '}
          <Link
            href="/politica-envios"
            className="font-medium text-gray-900 underline-offset-2 hover:underline"
          >
            Envíos
          </Link>
          {' · '}
          <Link
            href="/politica-devoluciones"
            className="font-medium text-gray-900 underline-offset-2 hover:underline"
          >
            Devoluciones
          </Link>
          {' · '}
          <Link
            href="/contacto"
            className="font-medium text-gray-900 underline-offset-2 hover:underline"
          >
            Contacto
          </Link>
        </p>
      </div>
    </div>
  );
}
