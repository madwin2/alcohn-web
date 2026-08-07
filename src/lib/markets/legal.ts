import type { InternationalMarketCode } from './types';
import { SITE_CONTACT } from '@/lib/seo';

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export function getInternationalShippingPolicySections(countryName: string): LegalSection[] {
  return [
    {
      title: 'Envío internacional DHL',
      paragraphs: [
        `El precio de envío internacional corresponde a DHL y se muestra antes de pagar. El envío se realiza desde Argentina a ${countryName}.`,
        'El precio pagado en Alcohn incluye producto y envío DHL, pero no incluye impuestos, aranceles ni gastos de importación del país de destino. Si corresponden, DHL contactará al comprador por email o teléfono y el comprador los pagará directamente a DHL.',
      ],
    },
    {
      title: 'Plazo de producción',
      paragraphs: [
        'El plazo habitual de fabricación es de 72 horas hábiles desde la confirmación del pago, salvo que el pedido indique otro tiempo por complejidad o volumen.',
        'Te contactamos por email o WhatsApp para coordinar la muestra cuando corresponda y avisar el despacho internacional.',
      ],
    },
    {
      title: 'Seguimiento',
      paragraphs: [
        'Cuando despachamos por DHL, compartimos la información de seguimiento por email o WhatsApp.',
        'Revisá el paquete al recibirlo. Si llega dañado o incompleto, escribinos con fotos del embalaje, del contenido y del número de pedido.',
      ],
    },
    {
      title: 'Consultas',
      paragraphs: [
        `WhatsApp ${SITE_CONTACT.phoneDisplay}, email ${SITE_CONTACT.email} o la página de contacto.`,
      ],
    },
  ];
}

export function getInternationalReturnsPolicySections(): LegalSection[] {
  return [
    {
      title: 'Productos personalizados',
      paragraphs: [
        'Los sellos personalizados se fabrican a pedido con el logo, medida o configuración elegida por el comprador. Por ese motivo no admiten devolución por arrepentimiento una vez aprobada la muestra o iniciada la fabricación.',
      ],
    },
    {
      title: 'Defectos o errores de Alcohn',
      paragraphs: [
        'Si el producto llega dañado o hay un error atribuible a Alcohn, revisaremos el caso con fotos, número de pedido y constancia de DHL.',
        'Si corresponde, ofrecemos reparación, reemplazo o devolución del importe abonado según la situación.',
      ],
    },
    {
      title: 'Plazos',
      paragraphs: [
        'Contactanos dentro de los 10 días corridos desde la recepción del paquete para reportar defectos de fabricación.',
        'Para envíos dañados, escribinos dentro de las 72 horas de recibido con evidencia del embalaje.',
      ],
    },
  ];
}

export function getInternationalTermsSections(countryName: string): LegalSection[] {
  return [
    {
      title: 'Vendedor y comprador',
      paragraphs: [
        'Alcohn opera desde Mar del Plata, Argentina. El comprador elige el mercado internacional y paga en moneda local a través del proveedor de pagos habilitado.',
      ],
    },
    {
      title: 'Precio y envío',
      paragraphs: [
        `El precio del producto y el envío DHL a ${countryName} se pagan en el checkout de Alcohn.`,
        'Los impuestos, aranceles y gastos de importación del país de destino no están incluidos y, si corresponden, se pagan directamente a DHL.',
      ],
    },
    {
      title: 'Responsabilidades del comprador',
      paragraphs: [
        'El comprador es responsable de cargar correctamente dirección, email y teléfono para DHL.',
        'Si DHL no puede entregar por datos incorrectos o por falta de pago de importación cuando corresponda, Alcohn revisará costos de reenvío caso por caso.',
      ],
    },
    {
      title: 'Fabricación',
      paragraphs: [
        'Los productos personalizados se fabrican después del pago y de la aprobación de muestra cuando aplique.',
      ],
    },
  ];
}

export function getInternationalPrivacySections(market: InternationalMarketCode): LegalSection[] {
  return [
    {
      title: '1. Información que recopilamos',
      paragraphs: [
        'Podemos recopilar nombre, teléfono, email, domicilio de envío internacional, datos de facturación, mensajes, imágenes, logotipos, diseños y otros archivos enviados para presupuestos o pedidos.',
        'También podemos recibir información relacionada con las comunicaciones realizadas a través de WhatsApp.',
      ],
    },
    {
      title: '2. Cómo utilizamos la información',
      paragraphs: [
        'Utilizamos estos datos para responder consultas, elaborar presupuestos, gestionar pedidos, fabricar productos personalizados, procesar pagos, coordinar envíos DHL, brindar atención al cliente y realizar comunicaciones relacionadas con nuestros productos y servicios.',
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
        'Compartimos datos solo con proveedores necesarios para completar la compra y la entrega, como el proveedor de pago internacional, DHL, hosting e infraestructura tecnológica.',
        'Estos proveedores pueden procesar únicamente la información necesaria para prestar dichos servicios.',
      ],
    },
    {
      title: '5. Conservación, seguridad y derechos',
      paragraphs: [
        'Conservamos los datos el tiempo necesario para las finalidades indicadas y obligaciones legales. Adoptamos medidas razonables de seguridad.',
        `Los usuarios pueden solicitar acceso, rectificación, actualización o eliminación de sus datos escribiendo a ${SITE_CONTACT.email}.`,
        `Esta versión aplica al mercado ${market.toUpperCase()} del sitio internacional de Alcohn.`,
      ],
    },
    {
      title: '6. Contacto',
      paragraphs: [
        'Alcohn Sellos · alcohnsellos.com · Argentina',
        `Email: ${SITE_CONTACT.email}`,
      ],
    },
  ];
}
