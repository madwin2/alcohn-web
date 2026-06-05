export type AccessoryCode = 'soldador' | 'mango_golpe' | 'base_remachadora';

export interface Accessory {
  slug: string;
  code: AccessoryCode;
  title: string;
  description: string;
  image: string;
  price: number;
  includes: string[];
}

export const accessories: Accessory[] = [
  {
    slug: 'calentador-electrico',
    code: 'soldador',
    title: 'Calentador Eléctrico',
    description:
      'Calentador eléctrico para sellos de bronce. Alternativa práctica al calentado por hornalla o soplete, ideal para uso frecuente en taller.',
    image: '/images/accesorios/calentador electrico/calentador-electrico.png',
    price: 75000,
    includes: ['Calentador eléctrico', 'Cable de alimentación', 'Guía de uso y seguridad'],
  },
  {
    slug: 'mango-de-golpe',
    code: 'mango_golpe',
    title: 'Mango de Golpe',
    description:
      'Mango de madera para martillar sellos en frío. Complementa el mango a rosca que viene con cada sello cuando necesitás impacto directo.',
    image: '/images/sello/kit-sello-pieza-02-mango.png',
    price: 25000,
    includes: ['Mango de golpe en madera', 'Adaptación a rosca estándar Alcohn'],
  },
  {
    slug: 'base-aluminio-remachadora',
    code: 'base_remachadora',
    title: 'Base de Aluminio para Remachadora',
    description:
      'Base plana de aluminio para montar el sello en remachadora o prensa. Presión uniforme para marcar en frío sobre cuero y otros materiales.',
    image: '/images/sello/kit-sello-pieza-04-accesorios.png',
    price: 40000,
    includes: ['Base de aluminio', 'Adaptación a rosca estándar Alcohn'],
  },
];

export function getAccessoryBySlug(slug: string): Accessory | undefined {
  return accessories.find((a) => a.slug === slug);
}

export function getAccessoryMinPrice(): number {
  return Math.min(...accessories.map((a) => a.price));
}
