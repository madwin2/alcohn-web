// Catálogo de productos - Datos mock para sellos estándar y abecedarios

export type CollectionType = 'todos' | 'futbol' | 'argentina' | 'cuero' | 'madera' | 'oficios';

export interface StandardDesign {
  slug: string;
  title: string;
  collection: CollectionType;
  image: string;
  startingPrice: number;
  description?: string;
}

export interface Abecedario {
  slug: string;
  title: string;
  description: string;
  price: number | { desde: number };
  images: string[];
  includes: string[];
}

// Sellos estándar - Diseños listos
export const standardDesigns: StandardDesign[] = [
  {
    slug: 'bandera-argentina',
    title: 'Bandera Argentina',
    collection: 'argentina',
    image: '/images/sello/sello-personalizado-logo.webp',
    startingPrice: 45000,
    description: 'Diseño clásico de la bandera argentina para marcar productos nacionales.',
  },
  {
    slug: 'sol-de-mayo',
    title: 'Sol de Mayo',
    collection: 'argentina',
    image: '/images/sello/sello-personalizado-logo.webp',
    startingPrice: 45000,
    description: 'Sol de Mayo, símbolo patrio en bronce.',
  },
  {
    slug: 'escudo-argentina',
    title: 'Escudo Nacional',
    collection: 'argentina',
    image: '/images/sello/sello-personalizado-logo.webp',
    startingPrice: 48000,
    description: 'Escudo nacional argentino para marcar productos premium.',
  },
  {
    slug: 'pelota-futbol',
    title: 'Pelota de Fútbol',
    collection: 'futbol',
    image: '/images/sello/sello-personalizado-logo.webp',
    startingPrice: 42000,
    description: 'Diseño de pelota de fútbol clásica.',
  },
  {
    slug: 'camiseta-argentina',
    title: 'Camiseta Argentina',
    collection: 'futbol',
    image: '/images/sello/sello-personalizado-logo.webp',
    startingPrice: 46000,
    description: 'Silueta de camiseta de la selección argentina.',
  },
  {
    slug: 'trophy-copa',
    title: 'Trofeo / Copa',
    collection: 'futbol',
    image: '/images/sello/sello-personalizado-logo.webp',
    startingPrice: 44000,
    description: 'Trofeo o copa para marcar productos deportivos.',
  },
  {
    slug: 'cuero-textura',
    title: 'Textura de Cuero',
    collection: 'cuero',
    image: '/images/sello/sello-personalizado-logo.webp',
    startingPrice: 40000,
    description: 'Patrón texturizado inspirado en cuero.',
  },
  {
    slug: 'herradura',
    title: 'Herradura',
    collection: 'cuero',
    image: '/images/sello/sello-personalizado-logo.webp',
    startingPrice: 42000,
    description: 'Herradura clásica para marcar productos de cuero.',
  },
  {
    slug: 'vaca-silueta',
    title: 'Silueta de Vaca',
    collection: 'cuero',
    image: '/images/sello/sello-personalizado-logo.webp',
    startingPrice: 44000,
    description: 'Silueta de vaca para productos de cuero genuino.',
  },
  {
    slug: 'madera-nudos',
    title: 'Nudos de Madera',
    collection: 'madera',
    image: '/images/sello/sello-personalizado-logo.webp',
    startingPrice: 40000,
    description: 'Patrón de nudos de madera natural.',
  },
  {
    slug: 'hoja-arce',
    title: 'Hoja de Arce',
    collection: 'madera',
    image: '/images/sello/sello-personalizado-logo.webp',
    startingPrice: 42000,
    description: 'Hoja de arce para marcar productos de madera.',
  },
  {
    slug: 'martillo',
    title: 'Martillo',
    collection: 'oficios',
    image: '/images/sello/sello-personalizado-logo.webp',
    startingPrice: 40000,
    description: 'Herramienta clásica para marcar productos artesanales.',
  },
  {
    slug: 'llave-inglesa',
    title: 'Llave Inglesa',
    collection: 'oficios',
    image: '/images/sello/sello-personalizado-logo.webp',
    startingPrice: 40000,
    description: 'Llave inglesa para productos técnicos.',
  },
];

// Abecedarios
export const abecedarios: Abecedario[] = [
  {
    slug: 'abecedario-completo',
    title: 'Abecedario Completo',
    description: 'Conjunto completo de letras individuales de bronce (A-Z) y números (0-9) para marcar textos personalizados. Cada letra es un sello independiente, permitiendo máxima flexibilidad en la composición.',
    price: { desde: 85000 },
    images: ['/images/sello/sello-personalizado-logo.webp'],
    includes: [
      'Abecedario completo (A-Z)',
      'Números (0-9)',
      'Caja organizadora con separadores',
      'Guía de uso y espaciado',
    ],
  },
  {
    slug: 'abecedario-numeros',
    title: 'Abecedario - Solo Números',
    description: 'Conjunto de números (0-9) individuales de bronce para marcar fechas, códigos y números de serie. Ideal para productos que requieren numeración secuencial.',
    price: { desde: 35000 },
    images: ['/images/sello/sello-personalizado-logo.webp'],
    includes: [
      'Números 0-9',
      'Caja organizadora',
      'Guía de uso',
    ],
  },
];

// Helper functions
export function getStandardDesignBySlug(slug: string): StandardDesign | undefined {
  return standardDesigns.find((d) => d.slug === slug);
}

export function getStandardDesignsByCollection(collection: CollectionType): StandardDesign[] {
  if (collection === 'todos') {
    return standardDesigns;
  }
  return standardDesigns.filter((d) => d.collection === collection);
}

export function getAbecedarioBySlug(slug: string): Abecedario | undefined {
  return abecedarios.find((a) => a.slug === slug);
}

export function getAllCollections(): CollectionType[] {
  return ['todos', 'futbol', 'argentina', 'cuero', 'madera', 'oficios'];
}



