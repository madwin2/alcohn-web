import type { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata, SITE_CONTACT, SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Términos y condiciones | Alcohn Sellos de bronce',
  description:
    'Condiciones generales de uso, compra y contratación en alcohnsellos.com. Sellos de bronce CNC personalizados y estándar para Argentina.',
  path: '/terminos',
});

const sections: Array<{ title: string; paragraphs: string[] }> = [
  {
    title: 'Identidad del titular',
    paragraphs: [
      `Este sitio web (alcohnsellos.com) es operado por ${SITE_NAME}, emprendimiento dedicado a la fabricación y venta de sellos de bronce de alta precisión mediante mecanizado CNC, con taller ubicado en ${SITE_CONTACT.addressSingleLine}.`,
      `Para consultas comerciales, postventa o reclamos podés escribirnos por WhatsApp al ${SITE_CONTACT.phoneDisplay} o por email a ${SITE_CONTACT.email}.`,
    ],
  },
  {
    title: 'Aceptación de los términos',
    paragraphs: [
      'El uso de este sitio y la realización de pedidos a través suyo implican la aceptación plena de los presentes Términos y Condiciones, junto con la Política de Privacidad, la Política de Envíos y la Política de Devoluciones publicadas en el mismo sitio.',
      'Si no estás de acuerdo con alguna de estas condiciones, te pedimos que no utilices el sitio ni realices compras.',
    ],
  },
  {
    title: 'Productos ofrecidos',
    paragraphs: [
      'Comercializamos sellos de bronce personalizados, sellos estándar, abecedarios y accesorios relacionados (mangos, varillas, cabezales). Los productos personalizados se fabrican a pedido según el diseño, medida y uso confirmados por el comprador.',
      'Las imágenes, muestras digitales y descripciones publicadas son ilustrativas. Pueden existir variaciones mínimas en color, terminación o tono naturales al proceso artesanal y al material bronce.',
    ],
  },
  {
    title: 'Proceso de compra',
    paragraphs: [
      'El proceso de compra incluye: selección del producto o subida del logo, elección de medida y uso, visualización de la muestra digital y precio, confirmación de los datos del comprador y elección del método de pago y envío.',
      'El pedido se considera confirmado una vez acreditado el pago. Hasta ese momento, Alcohn puede rechazar o modificar el pedido por errores tipográficos, indisponibilidad de stock o cuestiones técnicas vinculadas al diseño solicitado.',
      'Antes de iniciar la fabricación final de productos personalizados, podés solicitar ajustes a la muestra digital a través de los canales de contacto.',
    ],
  },
  {
    title: 'Precios y moneda',
    paragraphs: [
      'Todos los precios publicados están expresados en pesos argentinos (ARS) e incluyen los impuestos correspondientes salvo indicación en contrario.',
      'El costo de envío se calcula y muestra en el checkout antes de confirmar el pago, según el método elegido (retiro en taller, sucursal de correo o entrega a domicilio).',
      'Los precios pueden actualizarse sin previo aviso; el importe vigente es el que aparece al confirmar el pedido.',
    ],
  },
  {
    title: 'Medios de pago',
    paragraphs: [
      'Aceptamos pagos con tarjetas de crédito y débito (Visa y Mastercard) procesados a través de pasarelas de pago habilitadas, y transferencia bancaria cuando esté disponible. Los datos de pago no son almacenados en nuestros servidores; los gestiona la pasarela elegida.',
      'En caso de pago fallido, rechazo bancario o falta de acreditación dentro de las 72 horas, el pedido podrá ser cancelado automáticamente.',
    ],
  },
  {
    title: 'Envíos y entrega',
    paragraphs: [
      'Las condiciones de envío, plazos de producción, formas de entrega y costos se detallan en la Política de Envíos. El plazo habitual de fabricación es de 72 horas hábiles desde la confirmación de la muestra y el pago.',
      'El tiempo de tránsito del correo o transporte se suma al plazo de fabricación y depende del destino y método elegido.',
    ],
  },
  {
    title: 'Devoluciones, cambios y garantía',
    paragraphs: [
      'Por tratarse de productos hechos a medida, los sellos personalizados no admiten devolución por arrepentimiento una vez iniciada la fabricación final, salvo error imputable a Alcohn o defecto de fabricación.',
      'Para sellos estándar, abecedarios y productos sin personalización aplica el derecho de revocación previsto por la Ley 24.240 de Defensa del Consumidor: podés solicitar la devolución dentro de los 10 días corridos desde la recepción, siempre que el producto esté sin uso y en su estado original. Los gastos de envío de devolución pueden estar a tu cargo, salvo error de Alcohn.',
      'Las condiciones específicas, garantías y procedimientos de reclamo están descriptos en la Política de Devoluciones.',
    ],
  },
  {
    title: 'Propiedad intelectual',
    paragraphs: [
      'Al cargar un logo, diseño o imagen para fabricar un sello, declarás ser titular de los derechos o contar con autorización expresa para reproducirlo. Alcohn no realiza verificaciones de titularidad; la responsabilidad por cualquier reclamo de terceros recae sobre el comprador.',
      'Los contenidos del sitio (textos, fotografías, ilustraciones, marcas y logos de Alcohn) son propiedad de Alcohn o se utilizan bajo licencia, y no pueden reproducirse sin autorización previa por escrito.',
    ],
  },
  {
    title: 'Responsabilidad',
    paragraphs: [
      'Alcohn se compromete a entregar productos conformes al pedido aprobado. No asume responsabilidad por usos indebidos del sello (presiones excesivas, aplicación sobre superficies no recomendadas, exposición a químicos agresivos, etc.) ni por daños indirectos derivados.',
      'El sitio puede presentar interrupciones por mantenimiento, actualizaciones o causas ajenas. Alcohn no garantiza la disponibilidad permanente del servicio.',
    ],
  },
  {
    title: 'Datos personales',
    paragraphs: [
      `Los datos personales que recopilamos para gestionar pedidos, envíos y atención al cliente se tratan conforme a nuestra Política de Privacidad y a la Ley 25.326 de Protección de Datos Personales.`,
    ],
  },
  {
    title: 'Defensa del consumidor',
    paragraphs: [
      'Cualquier reclamo vinculado a un pedido puede iniciarse directamente con Alcohn por los canales indicados arriba. En su defecto, podés acudir a Defensa al Consumidor del municipio o provincia correspondiente, o a la Ventanilla Única Federal (https://autogestion.produccion.gob.ar/consumidores).',
    ],
  },
  {
    title: 'Ley aplicable y jurisdicción',
    paragraphs: [
      'Estos Términos y Condiciones se rigen por las leyes de la República Argentina. Cualquier controversia se someterá a los tribunales ordinarios competentes en Mar del Plata, Provincia de Buenos Aires, sin perjuicio del derecho del consumidor a accionar en su propio domicilio según la normativa vigente.',
    ],
  },
  {
    title: 'Actualizaciones',
    paragraphs: [
      `Podemos modificar estos Términos y Condiciones. La versión vigente es la publicada en ${SITE_URL}/terminos. Última actualización: junio de 2026.`,
    ],
  },
];

export default function TerminosPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">
        <p className="craft-label mb-3">Información legal</p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Términos y condiciones
        </h1>
        <p className="mb-10 text-base leading-relaxed text-gray-700 md:text-lg">
          Condiciones generales de uso y compra en alcohnsellos.com. Aplican a todos los pedidos
          realizados desde Argentina.
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
            href="/privacidad"
            className="font-medium text-gray-900 underline-offset-2 hover:underline"
          >
            Privacidad
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
