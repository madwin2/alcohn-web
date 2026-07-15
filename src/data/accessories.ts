import { precioLinkDesdeTransferencia } from '@/lib/cotizador/utils';

export type AccessoryCode = 'soldador' | 'mango_golpe' | 'base_remachadora';

export type AccessoryVariant = {
  id: string;
  label: string;
  linkPrice: number;
  transferPrice: number;
  outOfStock?: boolean;
};

export type AccessorySpec = {
  label: string;
  value: string;
};

export type AccessoryInclusionItem = {
  title: string;
  copy: string;
};

export interface Accessory {
  slug: string;
  code: AccessoryCode;
  title: string;
  description: string;
  heroDescription?: string;
  image: string;
  /** Galería principal del producto (excluye ilustraciones de “qué incluye”). */
  galleryImages?: string[];
  price: number;
  includes: string[];
  seoTitle?: string;
  seoDescription?: string;
  specChips?: Array<{ label: string; value: string }>;
  specs?: AccessorySpec[];
  variants?: AccessoryVariant[];
  variantSelectorLabel?: string;
  note?: string;
  notes?: string[];
  inclusionItems?: AccessoryInclusionItem[];
  inclusionCopy?: string;
  inclusionIllustration?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  videoSrc?: string;
  videoPoster?: string;
  purchaseCtaLabel?: string;
  highlights?: string[];
}

export const accessories: Accessory[] = [
  {
    slug: 'calentador-electrico',
    code: 'soldador',
    title: 'Calentador Eléctrico',
    description:
      'Calentador eléctrico para sellos de bronce. Alternativa práctica al calentado por hornalla o soplete, ideal para uso frecuente en taller.',
    heroDescription:
      'Calentador eléctrico para poder hacer marcas por calor, sin la necesidad de exponer el sello a fuego directo.',
    image: '/images/accesorios/calentador electrico/ChatGPT Image 4 jun 2026, 18_10_05.png',
    galleryImages: [
      '/images/accesorios/calentador electrico/calentador-electrico.png',
      '/images/accesorios/calentador electrico/ChatGPT Image 4 jun 2026, 18_10_05.png',
      '/images/accesorios/calentador electrico/ChatGPT Image 4 jun 2026, 18_10_10.png',
      '/images/accesorios/calentador electrico/ChatGPT Image 4 jun 2026, 18_10_12.png',
      '/images/accesorios/calentador electrico/ChatGPT Image 4 jun 2026, 18_10_15.png',
      '/images/accesorios/calentador electrico/ChatGPT Image 4 jun 2026, 18_10_17.png',
      '/images/accesorios/calentador electrico/ChatGPT Image 4 jun 2026, 18_10_19.png',
    ],
    price: 75000,
    includes: ['Calentador eléctrico', 'Cable de alimentación', 'Soporte metálico', 'Guía de uso y seguridad'],
    seoTitle: 'Calentador eléctrico para sellos de bronce | Alcohn',
    seoDescription:
      'Calentador eléctrico para marcar cuero, madera, alimentos y packaging con sellos de bronce. Compra online con precio visible.',
    specChips: [
      { label: 'Colección', value: 'Accesorios' },
      { label: 'Material', value: 'Eléctrico' },
      { label: 'Proceso', value: 'Calor controlado' },
    ],
    specs: [
      { label: 'Material', value: 'Componentes de alta calidad' },
      { label: 'Proceso', value: 'Calentado por electricidad' },
      { label: 'Potencia', value: '200 W' },
      { label: 'Uso', value: 'Cuero, madera, alimentos, plásticos reciclados' },
    ],
    variants: [
      {
        id: 'sin-regulador',
        label: 'Sin regulador',
        linkPrice: 86250,
        transferPrice: 75000,
      },
      {
        id: 'con-regulador',
        label: 'Con regulador',
        linkPrice: 0,
        transferPrice: 0,
        outOfStock: true,
      },
    ],
    variantSelectorLabel: 'Elige tu calentador',
    note: 'El calentador eléctrico no incluye sello de bronce.',
    inclusionItems: [
      {
        title: 'Calentador eléctrico',
        copy: 'Herramienta lista para calentar el sello de forma segura y constante, sin fuego directo.',
      },
      {
        title: 'Cable de alimentación',
        copy: 'Incluye cable con enchufe estándar para conectarlo directo a la toma de corriente.',
      },
      {
        title: 'Soporte metálico',
        copy: 'Base para apoyar el calentador mientras se calienta el sello, sin riesgo de quemaduras.',
      },
      {
        title: 'Guía de uso y seguridad',
        copy: 'Indicaciones para calentar, marcar y cuidar la herramienta desde el primer uso.',
      },
    ],
    inclusionCopy:
      'Cada compra incluye todo lo necesario para calentar y usar tu sello con mayor control: calentador, cable, soporte y guía.',
    inclusionIllustration: {
      src: '/images/accesorios/calentador electrico/que incluye.jpeg',
      alt: 'Ilustración del calentador eléctrico con cable, enchufe y soporte metálico',
      width: 1122,
      height: 1402,
    },
    videoSrc: '/videos/Soldador/Soldador%20Cuero.mp4',
    videoPoster: '/images/accesorios/calentador electrico/calentador-electrico.png',
    purchaseCtaLabel: 'Encargá tu calentador eléctrico',
    highlights: [
      'Diseño listo para comprar',
      'Medidas con precio visible',
      'Checkout online y seguimiento',
    ],
  },
  {
    slug: 'mango-de-golpe',
    code: 'mango_golpe',
    title: 'Mango Metálico',
    description:
      'Mango metálico para marcar por golpe. Complementa el mango a rosca que viene con cada sello cuando necesitás impacto directo sobre el material.',
    heroDescription:
      'El mango metálico es una herramienta que ayuda al marcado a través de golpe. Se recomienda utilizarlo en sellos hasta un máximo de 3×3 cm.',
    image: '/images/accesorios/mango de golpe/mango-de-golpe-acero-rosca-encastre.png',
    galleryImages: [
      '/images/accesorios/mango de golpe/mango-de-golpe-de-acero-para-cuero.png',
      '/images/accesorios/mango de golpe/mango-de-golpe-acero-rosca-encastre.png',
      '/images/accesorios/mango de golpe/mango-de-golpe-acero-con-sello-bronce.png',
      '/images/accesorios/mango de golpe/mango-de-golpe-acero-con-martillo.png',
      '/images/accesorios/mango de golpe/mango-de-golpe-marcado-en-cuero.png',
      '/images/accesorios/mango de golpe/mango-de-golpe-uso-con-martillo-cuero.png',
      '/images/accesorios/mango de golpe/mango-de-golpe-estampado-cuero.png',
    ],
    price: 25000,
    includes: ['Mango metálico', 'Encastre por rosca estándar Alcohn'],
    seoTitle: 'Mango metálico de golpe para sellos de bronce | Alcohn',
    seoDescription:
      'Mango metálico para martillar sellos en frío. Ideal para marcar cuero en sellos de hasta 3×3 cm.',
    specChips: [
      { label: 'Colección', value: 'Accesorios' },
      { label: 'Material', value: 'Acero' },
      { label: 'Proceso', value: 'Marcado por golpe' },
    ],
    specs: [
      { label: 'Material', value: 'Acero' },
      { label: 'Proceso', value: 'Marcado por golpe' },
      { label: 'Profundidad', value: 'Encastre por rosca' },
      { label: 'Uso', value: 'Cuero' },
    ],
    notes: [
      'El mango de golpe no incluye sello de bronce ni martillo.',
      'El mango de golpe se recomienda usar hasta una medida máxima de 3×3 cm.',
    ],
    inclusionItems: [
      {
        title: 'Mango metálico',
        copy: 'Mango con textura antideslizante para aplicar impacto directo sobre el sello en frío.',
      },
      {
        title: 'Encastre por rosca estándar',
        copy: 'Compatible con la rosca Alcohn para montar el sello de forma rápida y segura.',
      },
    ],
    inclusionCopy:
      'Incluye el mango metálico listo para enroscar tu sello y marcar por golpe con mayor control.',
    inclusionIllustration: {
      src: '/images/accesorios/mango de golpe/mango-de-golpe-que-incluye.jpeg',
      alt: 'Ilustración del mango metálico con encastre por rosca',
      width: 1122,
      height: 1402,
    },
    videoSrc: '/videos/Manual/Cuero%20Golpe.mp4',
    videoPoster: '/images/accesorios/mango de golpe/mango-de-golpe-de-acero-para-cuero.png',
    purchaseCtaLabel: 'Encargá tu mango de golpe',
    highlights: [
      'Diseño listo para comprar',
      'Medidas con precio visible',
      'Checkout online y seguimiento',
    ],
  },
  {
    slug: 'base-aluminio-remachadora',
    code: 'base_remachadora',
    title: 'Base de Aluminio para Remachadora',
    description:
      'Base plana de aluminio para montar el sello en remachadora o prensa. Presión uniforme para marcar en frío sobre cuero y otros materiales.',
    heroDescription:
      'Base plana de aluminio para montar el sello en remachadora o prensa y lograr presión uniforme en cada marca.',
    image: '/images/accesorios/base remachadora/base 2.jpeg',
    galleryImages: [
      '/images/accesorios/base remachadora/base 2.jpeg',
      '/images/accesorios/base remachadora/base 1.jpeg',
    ],
    price: 40000,
    includes: ['Base de aluminio', 'Adaptación a rosca estándar Alcohn'],
    seoTitle: 'Base de aluminio para remachadora | Sellos de bronce | Alcohn',
    seoDescription:
      'Base de aluminio para montar sellos de bronce en remachadora o prensa. Presión uniforme para marcar en frío.',
    specChips: [
      { label: 'Colección', value: 'Accesorios' },
      { label: 'Material', value: 'Aluminio' },
      { label: 'Proceso', value: 'Presión pareja' },
    ],
    specs: [
      { label: 'Material', value: 'Aluminio' },
      { label: 'Proceso', value: 'Montaje en remachadora o prensa' },
      { label: 'Rosca', value: 'Estándar Alcohn M6' },
      { label: 'Uso', value: 'Cuero, madera y materiales en frío' },
    ],
    inclusionItems: [
      {
        title: 'Base de aluminio',
        copy: 'Placa plana para distribuir la presión de forma uniforme en cada marcado.',
      },
      {
        title: 'Adaptación a rosca estándar',
        copy: 'Compatible con la rosca Alcohn para fijar el sello de forma estable.',
      },
    ],
    inclusionCopy: 'Incluye la base lista para montar tu sello en remachadora o prensa con presión pareja.',
    inclusionIllustration: {
      src: '/images/accesorios/base remachadora/base 2.jpeg',
      alt: 'Base de aluminio para remachadora',
      width: 1200,
      height: 1200,
    },
    purchaseCtaLabel: 'Encargá tu base de aluminio',
    highlights: [
      'Presión uniforme en cada marca',
      'Precio visible al comprar',
      'Checkout online y seguimiento',
    ],
  },
];

export function getAccessoryBySlug(slug: string): Accessory | undefined {
  return accessories.find((a) => a.slug === slug);
}

export function getAccessoryMinPrice(): number {
  return Math.min(...accessories.map((a) => a.price));
}

export function getAccessoryLinkPrice(accessory: Accessory): number {
  const variant =
    accessory.variants?.find((item) => !item.outOfStock) ?? accessory.variants?.[0];
  if (variant && !variant.outOfStock) return variant.linkPrice;
  return precioLinkDesdeTransferencia(accessory.price);
}

export function getAccessoryTransferPrice(accessory: Accessory): number {
  const variant =
    accessory.variants?.find((item) => !item.outOfStock) ?? accessory.variants?.[0];
  if (variant && !variant.outOfStock) return variant.transferPrice;
  return accessory.price;
}

export function getDefaultAccessoryVariant(accessory: Accessory): AccessoryVariant | undefined {
  return accessory.variants?.find((item) => !item.outOfStock);
}
