import type { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata, SITE_CONTACT, SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Política de privacidad | Alcohn Sellos de bronce',
  description:
    'Cómo recopilamos, usamos y protegemos tus datos personales en alcohnsellos.com. Cumplimos con la Ley 25.326 de Argentina.',
  path: '/privacidad',
});

const sections: Array<{ title: string; paragraphs: string[] }> = [
  {
    title: 'Responsable del tratamiento',
    paragraphs: [
      `Esta Política de Privacidad describe cómo ${SITE_NAME} recolecta, utiliza y protege los datos personales de quienes visitan o realizan pedidos en alcohnsellos.com.`,
      `Para consultas sobre el tratamiento de tus datos, podés contactarnos por email a ${SITE_CONTACT.email} o por WhatsApp al ${SITE_CONTACT.phoneDisplay}.`,
    ],
  },
  {
    title: 'Marco legal',
    paragraphs: [
      'Tratamos tus datos personales en cumplimiento de la Ley Nacional 25.326 de Protección de Datos Personales de la República Argentina y su normativa reglamentaria.',
      'La Agencia de Acceso a la Información Pública es el organismo de control en materia de protección de datos en Argentina.',
    ],
  },
  {
    title: 'Datos que recopilamos',
    paragraphs: [
      'Datos identificatorios y de contacto que cargás voluntariamente al hacer un pedido o usar el formulario de contacto: nombre, apellido, email, teléfono, dirección de envío y, si corresponde, DNI o CUIT para emisión de comprobantes.',
      'Información sobre tu pedido: producto elegido, medidas, uso, logo o diseño subido para personalización, método de envío y método de pago seleccionado.',
      'Datos técnicos de navegación: dirección IP, tipo de dispositivo, navegador, sistema operativo, páginas visitadas y referencia de origen, recopilados mediante cookies y herramientas de analítica.',
      'No almacenamos datos completos de tarjetas de crédito o débito; los pagos se procesan a través de pasarelas externas habilitadas que cumplen estándares PCI.',
    ],
  },
  {
    title: 'Finalidad del tratamiento',
    paragraphs: [
      'Procesar y gestionar tu pedido (fabricación, facturación, envío y postventa).',
      'Comunicarnos con vos respecto a tu compra, muestras digitales, consultas o reclamos.',
      'Cumplir con obligaciones legales, fiscales y contables.',
      'Mejorar el funcionamiento del sitio, la experiencia de usuario y las acciones de marketing propias, siempre dentro de los límites permitidos por la ley.',
      'Prevenir fraude o usos indebidos del servicio.',
    ],
  },
  {
    title: 'Base legal',
    paragraphs: [
      'Tratamos tus datos sobre la base de tu consentimiento al realizar un pedido o enviar un formulario, la ejecución del contrato de compraventa, el cumplimiento de obligaciones legales y el interés legítimo de Alcohn en mantener el sitio operativo y seguro.',
    ],
  },
  {
    title: 'Cookies y tecnologías similares',
    paragraphs: [
      'Utilizamos cookies propias y de terceros para recordar tus preferencias, mantener tu sesión, medir el uso del sitio y, eventualmente, mostrar publicidad relacionada con Alcohn en otras plataformas.',
      'Podés gestionar o eliminar las cookies desde la configuración de tu navegador. Bloquearlas puede afectar el funcionamiento de algunas partes del sitio (carrito, checkout, formularios).',
    ],
  },
  {
    title: 'Con quién compartimos tus datos',
    paragraphs: [
      'Compartimos los datos estrictamente necesarios con: la pasarela de pago elegida (para procesar el cobro), el operador logístico o correo (para entregar el pedido), el proveedor de hosting y servicios de infraestructura cloud, y las herramientas de analítica y marketing que usamos en el sitio.',
      'Estos terceros acceden a tus datos únicamente para prestar el servicio contratado y están obligados a tratarlos con la debida confidencialidad. No vendemos ni cedemos tus datos personales a terceros con fines comerciales ajenos a la operación de Alcohn.',
    ],
  },
  {
    title: 'Conservación de los datos',
    paragraphs: [
      'Conservamos tus datos mientras dure la relación comercial y, posteriormente, durante el plazo necesario para atender garantías, reclamos y obligaciones legales, fiscales o contables aplicables.',
      'Los logs técnicos de navegación se conservan por períodos más breves, salvo requerimiento legal en contrario.',
    ],
  },
  {
    title: 'Tus derechos',
    paragraphs: [
      'De acuerdo con la Ley 25.326, tenés derecho a acceder gratuitamente a tus datos personales en intervalos no menores a seis meses, salvo interés legítimo. También podés solicitar la rectificación, actualización, supresión o confidencialidad de tus datos cuando corresponda.',
      `Para ejercer estos derechos escribinos a ${SITE_CONTACT.email}. Te responderemos dentro de los plazos previstos por la normativa vigente.`,
      'Asimismo, el titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto, conforme lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326.',
      'La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.',
    ],
  },
  {
    title: 'Seguridad',
    paragraphs: [
      'Adoptamos medidas técnicas y organizativas razonables para proteger tus datos contra pérdida, acceso no autorizado, alteración o divulgación. Ningún sistema es 100% inviolable; en caso de incidente que pueda afectar tus datos, lo comunicaremos según corresponda a la normativa aplicable.',
    ],
  },
  {
    title: 'Menores de edad',
    paragraphs: [
      'El sitio está dirigido a personas mayores de 18 años con capacidad legal para contratar. Si sos menor, podés navegar el sitio, pero los pedidos deben ser realizados por un adulto responsable.',
    ],
  },
  {
    title: 'Cambios en esta política',
    paragraphs: [
      `Podemos actualizar esta Política de Privacidad. La versión vigente es la publicada en ${SITE_URL}/privacidad. Última actualización: junio de 2026.`,
    ],
  },
];

export default function PrivacidadPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">
        <p className="craft-label mb-3">Información legal</p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Política de privacidad
        </h1>
        <p className="mb-10 text-base leading-relaxed text-gray-700 md:text-lg">
          Cómo tratamos tus datos personales cuando navegás, comprás o nos consultás en
          alcohnsellos.com. Conforme a la Ley 25.326 de Argentina.
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
