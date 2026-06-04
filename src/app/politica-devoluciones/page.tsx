import type { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Política de devoluciones y cambios | Alcohn',
    description:
      'Condiciones de devolución, cambios y garantía para sellos de bronce personalizados y estándar fabricados por Alcohn en Argentina.',
    path: '/politica-devoluciones',
  }),
  robots: {
    index: false,
    follow: false,
  },
};

const sections: Array<{ title: string; paragraphs: string[] }> = [
  {
    title: 'Alcance',
    paragraphs: [
      'Esta política aplica a compras realizadas en alcohnsellos.com y pedidos gestionados por Alcohn (sellos de bronce personalizados, sellos estándar y abecedarios).',
      'Los productos personalizados se fabrican según el logo, la medida y el uso que confirmás en el proceso de compra (incluida la muestra digital cuando corresponda).',
    ],
  },
  {
    title: 'Productos personalizados',
    paragraphs: [
      'Por tratarse de piezas hechas a pedido, no aceptamos devoluciones por arrepentimiento una vez iniciada la fabricación definitiva, salvo error imputable a Alcohn o defecto de fabricación.',
      'Antes de la fabricación final, podés solicitar revisión del diseño o de la muestra a través de los canales de contacto indicados abajo.',
    ],
  },
  {
    title: 'Defectos y errores de Alcohn',
    paragraphs: [
      'Si el sello presenta un defecto de fabricación o no coincide con lo aprobado en el pedido (medida, diseño o material acordados), contactanos dentro de los 10 días corridos desde que recibís el producto.',
      'Evaluaremos el caso con fotos o video del sello y del empaque. Si corresponde, ofrecemos reparación, reemplazo o devolución del importe abonado, según la situación.',
    ],
  },
  {
    title: 'Envíos dañados o incompletos',
    paragraphs: [
      'Si el paquete llega dañado o faltan piezas del kit (mango, varilla, cabezal, etc.), escribinos dentro de las 72 horas de recibido, con fotos del embalaje exterior e interior.',
      'Gestionamos el reclamo con el transporte cuando aplica y te indicamos el reenvío o la solución acordada.',
    ],
  },
  {
    title: 'Sellos estándar y abecedarios',
    paragraphs: [
      'Los diseños estándar del catálogo pueden admitir cambio o devolución si el producto está sin uso, en su estado original y dentro de los 10 días corridos desde la entrega, salvo disposición legal en contrario. Los gastos de envío de devolución pueden estar a cargo del comprador salvo error de Alcohn.',
    ],
  },
  {
    title: 'Reintegros',
    paragraphs: [
      'Los reintegros aprobados se realizan por el mismo medio de pago utilizado en la compra, cuando sea posible, o por transferencia bancaria a la cuenta indicada por el cliente. El plazo estimado de acreditación es de 5 a 15 días hábiles según el medio.',
    ],
  },
  {
    title: 'Cómo iniciar un reclamo',
    paragraphs: [
      'Escribinos por WhatsApp al +54 9 223 620-9554 o desde la página de contacto, indicando número de pedido (si lo tenés), fecha de compra y descripción del problema con imágenes.',
      'Te responderemos para confirmar los pasos a seguir. No envíes el producto sin coordinar previamente la autorización de devolución.',
    ],
  },
  {
    title: 'Actualizaciones',
    paragraphs: [
      'Podemos actualizar esta política. La versión vigente es la publicada en esta URL. Última actualización: junio de 2026.',
    ],
  },
];

export default function PoliticaDevolucionesPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">
        <p className="craft-label mb-3">Información legal</p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Política de devoluciones y cambios
        </h1>
        <p className="mb-10 text-base leading-relaxed text-gray-700 md:text-lg">
          Transparencia sobre qué podés esperar si hay un problema con tu pedido. Para compras en
          Argentina.
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-gray-900">
                {section.title}
              </h2>
              <div className="space-y-3 text-base leading-relaxed text-gray-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
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
