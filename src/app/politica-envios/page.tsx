import type { Metadata } from 'next';
import Link from 'next/link';
import { RETIRO_OFICINA_LABEL } from '@/lib/shipping/types';
import { createPageMetadata, SITE_CONTACT } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Política de envíos | Alcohn Sellos de bronce',
  description:
    'Envíos a todo Argentina por Correo Argentino, retiro en Mar del Plata y plazos de entrega para sellos de bronce Alcohn.',
  path: '/politica-envios',
});

const sections: Array<{ title: string; paragraphs: string[] }> = [
  {
    title: 'Cobertura',
    paragraphs: [
      'Enviamos sellos de bronce personalizados, estándar y abecedarios a todo el territorio argentino.',
      'La fabricación se realiza en nuestro taller en Mar del Plata; el tiempo de tránsito se suma al plazo de producción indicado en cada pedido.',
    ],
  },
  {
    title: 'Plazo de producción',
    paragraphs: [
      'El plazo habitual de fabricación es de 72 horas hábiles desde que la muestra digital y el pago quedan confirmados, salvo que en el pedido se indique otro tiempo por complejidad o volumen.',
      'Te avisamos por WhatsApp cuando el sello está listo para despacho o retiro.',
    ],
  },
  {
    title: 'Formas de entrega',
    paragraphs: [
      `Retiro sin cargo en ${RETIRO_OFICINA_LABEL}: ${SITE_CONTACT.streetAddress}, ${SITE_CONTACT.addressLocality} (CP ${SITE_CONTACT.postalCode}). Coordinamos día y horario por WhatsApp.`,
      'Envío por Correo Argentino a sucursal: elegís provincia, localidad y sucursal en el checkout. El paquete queda disponible para retirar con tu DNI cuando Correo lo notifica.',
      'Envío por Correo Argentino a domicilio: entrega en la dirección que cargás en el checkout (calle, número, localidad, provincia y código postal).',
    ],
  },
  {
    title: 'Costos de envío',
    paragraphs: [
      'El costo de envío se calcula y muestra en el checkout antes de pagar, según el método elegido (retiro, sucursal o domicilio).',
      'Los valores pueden actualizarse; el importe definitivo es el que ves al confirmar tu pedido en alcohnsellos.com.',
      'Si preferís otra empresa de transporte, contactanos antes de comprar para cotizar un envío alternativo.',
    ],
  },
  {
    title: 'Seguimiento y recepción',
    paragraphs: [
      'Cuando despachamos por correo, te compartimos la información de seguimiento por WhatsApp o email según los datos del pedido.',
      'Revisá el paquete al recibirlo. Si llega dañado o incompleto, escribinos dentro de las 72 horas con fotos del embalaje y del contenido (ver política de devoluciones).',
    ],
  },
  {
    title: 'Consultas',
    paragraphs: [
      `WhatsApp ${SITE_CONTACT.phoneDisplay} o la página de contacto. Horario de respuesta habitual: días hábiles.`,
    ],
  },
  {
    title: 'Actualizaciones',
    paragraphs: [
      'Podemos actualizar esta política. La versión vigente es la publicada en esta URL. Última actualización: junio de 2026.',
    ],
  },
];

export default function PoliticaEnviosPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">
        <p className="craft-label mb-3">Información legal</p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Política de envíos
        </h1>
        <p className="mb-10 text-base leading-relaxed text-gray-700 md:text-lg">
          Cómo recibís tu sello en Argentina: plazos, métodos y costos transparentes antes de pagar.
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-gray-900">
                {section.title}
              </h2>
              <div className="space-y-3 text-base leading-relaxed text-gray-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
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
