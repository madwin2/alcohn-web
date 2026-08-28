// Catálogo de productos - Sellos estándar y abecedarios

import {
  type CollectionFilter,
  type StandardStampDesign,
  COLLECTION_LABELS,
  getAllCollectionFilters,
  getStandardStampBySlug,
  getStandardStampsByCollection,
  standardStampDesigns,
} from '@/data/standardStamps';
import {
  ABECEDARIO_COMPLETO_PRECIO_DESDE,
  ABECEDARIO_PRECIOS_DESDE,
} from '@/lib/abecedarioConfigurator';

export type CollectionType = CollectionFilter;

export interface StandardDesign {
  slug: string;
  title: string;
  collection: CollectionType;
  image: string;
  hoverImage: string;
  startingPrice: number;
  description?: string;
  sizes: StandardStampDesign['sizes'];
}

export interface Abecedario {
  slug: string;
  title: string;
  description: string;
  price: number | { desde: number };
  images: string[];
  includes: string[];
}

/** Precio "desde" de referencia para listados (tamaño S, grupo chicos). */
export const STANDARD_STAMP_PRICE_FROM_ARS = 76000;

function toStandardDesign(design: StandardStampDesign): StandardDesign {
  return {
    slug: design.slug,
    title: design.title,
    collection: design.collection,
    image: design.image,
    hoverImage: design.hoverImage,
    startingPrice: STANDARD_STAMP_PRICE_FROM_ARS,
    description: design.description,
    sizes: design.sizes,
  };
}

export const standardDesigns: StandardDesign[] = standardStampDesigns.map(toStandardDesign);

// Abecedarios
export const abecedarios: Abecedario[] = [
  {
    slug: 'abecedario-completo',
    title: 'Abecedario Completo',
    description:
      'Conjunto completo de letras individuales de bronce (A-Z) y números (0-9) para marcar textos personalizados. Cada letra es un sello independiente, permitiendo máxima flexibilidad en la composición.',
    price: { desde: ABECEDARIO_COMPLETO_PRECIO_DESDE },
    images: ['/images/abecedario/abecedario.webp'],
    includes: [
      'Abecedario Mayúsculas',
      'Abecedario Minúsculas',
      'Números 0 al 9',
      'Caja Organizadora',
      'Soporte de Bronce',
      'Mango de uso manual',
    ],
  },
  {
    slug: 'abecedario-numeros',
    title: 'Abecedario - Solo Números',
    description:
      'Conjunto de números (0-9) individuales de bronce para marcar fechas, códigos y números de serie. Ideal para productos que requieren numeración secuencial.',
    price: { desde: ABECEDARIO_PRECIOS_DESDE.numero },
    images: ['/images/abecedario/abecedario.webp'],
    includes: ['Números 0-9', 'Caja organizadora', 'Guía de uso'],
  },
];

export function getStandardDesignBySlug(slug: string): StandardDesign | undefined {
  const design = getStandardStampBySlug(slug);
  return design ? toStandardDesign(design) : undefined;
}

export function getStandardDesignsByCollection(collection: CollectionType): StandardDesign[] {
  return getStandardStampsByCollection(collection).map(toStandardDesign);
}

export function getAbecedarioBySlug(slug: string): Abecedario | undefined {
  return abecedarios.find((a) => a.slug === slug);
}

export function getAllCollections(): CollectionType[] {
  return getAllCollectionFilters();
}

export { COLLECTION_LABELS };
