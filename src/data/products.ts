export type MaterialType = 'cuero' | 'madera' | 'ambos';
export type ProductCategory = 'sello' | 'abecedario';

export interface ProductSpecs {
  material: string;
  proceso: string;
  profundidad?: string;
  tiempoProduccion?: string;
  incluye?: string[];
  uso: string;
}

export interface ProductImages {
  default: string;
  onLeather: string;
  onWood: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: ProductCategory;
  price: number | { desde: number };
  images: ProductImages;
  specs: ProductSpecs;
  materials: MaterialType[];
}

export const products: Product[] = [
  {
    id: 'sello-personalizado-cuero',
    name: 'Sello Personalizado - Cuero',
    slug: 'sello-personalizado-cuero',
    shortDescription: 'Sello de bronce para marcar cuero con precisión industrial.',
    description: 'Sellos de bronce personalizados diseñados específicamente para marcar cuero. Fabricados con precisión CNC, garantizan marcas profundas y duraderas en cuero genuino y sintético.',
    category: 'sello',
    price: { desde: 44000 },
    materials: ['cuero'],
    images: {
      default: '/images/sello/sellologo.webp',
      onLeather: '/images/sello/sellologo.webp',
      onWood: '/images/sello/sellologo.webp',
    },
    specs: {
      material: 'Bronce de alta calidad',
      proceso: 'CNC alta precisión',
      profundidad: '1.5mm - 2mm',
      tiempoProduccion: '7-10 días hábiles',
      incluye: ['Sello de bronce', 'Mango ergonómico', 'Adaptación para remachadora', 'Muestra digital', 'Revisión básica del logo', 'Guía rápida de uso'],
      uso: 'Cuero genuino y sintético',
    },
  },
  {
    id: 'sello-personalizado-madera',
    name: 'Sello Personalizado - Madera',
    slug: 'sello-personalizado-madera',
    shortDescription: 'Sello de bronce para marcar madera con precisión industrial.',
    description: 'Sellos de bronce personalizados diseñados específicamente para marcar madera. Fabricados con precisión CNC, garantizan marcas profundas y duraderas en todo tipo de maderas.',
    category: 'sello',
    price: { desde: 44000 },
    materials: ['madera'],
    images: {
      default: '/images/sello/sellologo.webp',
      onLeather: '/images/sello/sellologo.webp',
      onWood: '/images/sello/sellologo.webp',
    },
    specs: {
      material: 'Bronce de alta calidad',
      proceso: 'CNC alta precisión',
      profundidad: '2mm - 3mm',
      tiempoProduccion: '7-10 días hábiles',
      incluye: ['Sello de bronce', 'Mango ergonómico', 'Adaptación para remachadora', 'Muestra digital', 'Revisión básica del logo', 'Guía rápida de uso'],
      uso: 'Maderas duras y blandas',
    },
  },
  {
    id: 'sello-personalizado-universal',
    name: 'Sello Personalizado - Universal',
    slug: 'sello-personalizado-universal',
    shortDescription: 'Sello de bronce versátil para cuero y madera.',
    description: 'Sellos de bronce personalizados diseñados para marcar tanto cuero como madera. Versatilidad máxima sin comprometer la calidad. Ideal para talleres que trabajan con múltiples materiales.',
    category: 'sello',
    price: { desde: 48000 },
    materials: ['ambos'],
    images: {
      default: '/images/sello/sellologo.webp',
      onLeather: '/images/sello/sellologo.webp',
      onWood: '/images/sello/sellologo.webp',
    },
    specs: {
      material: 'Bronce de alta calidad',
      proceso: 'CNC alta precisión',
      profundidad: '1.5mm - 2.5mm',
      tiempoProduccion: '7-10 días hábiles',
      incluye: ['Sello de bronce', 'Mango ergonómico', 'Adaptación para remachadora', 'Muestra digital', 'Revisión básica del logo', 'Guía rápida de uso'],
      uso: 'Cuero y madera',
    },
  },
  {
    id: 'sello-alimentos',
    name: 'Sello para Alimentos',
    slug: 'sello-para-alimentos',
    shortDescription: 'Sello de bronce con forma cortada para alimentos.',
    description: 'Sellos con forma cortada para evitar marcar con la base el alimento, mejorando el resultado. Mayor profundidad para un marcado más definido en pan, queso, mantequilla y otros alimentos.',
    category: 'sello',
    price: { desde: 50000 },
    materials: ['ambos'],
    images: {
      default: '/images/sello/sellologo.webp',
      onLeather: '/images/sello/sellologo.webp',
      onWood: '/images/sello/sellologo.webp',
    },
    specs: {
      material: 'Bronce grado alimenticio',
      proceso: 'CNC alta precisión + pulido especial',
      profundidad: '2mm - 3mm',
      tiempoProduccion: '8-12 días hábiles',
      incluye: ['Sello de bronce', 'Mango ergonómico', 'Adaptación para remachadora', 'Muestra digital', 'Revisión básica del logo', 'Guía rápida de uso', 'Certificado alimenticio'],
      uso: 'Alimentos (pan, queso, mantequilla, etc.)',
    },
  },
  {
    id: 'abecedario-bronce-completo',
    name: 'Abecedario de Bronce - Completo',
    slug: 'abecedario-bronce-completo',
    shortDescription: 'Conjunto completo de letras individuales de bronce.',
    description: 'Conjunto completo de letras individuales de bronce para marcar textos personalizados. Cada letra es un sello independiente, permitiendo máxima flexibilidad en la composición de textos.',
    category: 'abecedario',
    price: { desde: 85000 },
    materials: ['ambos'],
    images: {
      default: '/images/sello/sellologo.webp',
      onLeather: '/images/sello/sellologo.webp',
      onWood: '/images/sello/sellologo.webp',
    },
    specs: {
      material: 'Bronce de alta calidad',
      proceso: 'CNC alta precisión',
      profundidad: '1.5mm - 2mm',
      tiempoProduccion: '10-14 días hábiles',
      incluye: ['Abecedario completo (A-Z, 0-9)', 'Caja organizadora', 'Guía de uso'],
      uso: 'Cuero y madera',
    },
  },
  {
    id: 'abecedario-bronce-numeros',
    name: 'Abecedario de Bronce - Números',
    slug: 'abecedario-bronce-numeros',
    shortDescription: 'Conjunto de números individuales de bronce.',
    description: 'Conjunto completo de números (0-9) individuales de bronce para marcar fechas, códigos y números de serie. Cada número es un sello independiente.',
    category: 'abecedario',
    price: { desde: 35000 },
    materials: ['ambos'],
    images: {
      default: '/images/sello/sellologo.webp',
      onLeather: '/images/sello/sellologo.webp',
      onWood: '/images/sello/sellologo.webp',
    },
    specs: {
      material: 'Bronce de alta calidad',
      proceso: 'CNC alta precisión',
      profundidad: '1.5mm - 2mm',
      tiempoProduccion: '7-10 días hábiles',
      incluye: ['Números 0-9', 'Caja organizadora', 'Guía de uso'],
      uso: 'Cuero y madera',
    },
  },
  {
    id: 'sello-personalizado-ceramica',
    name: 'Sello Personalizado - Cerámica',
    slug: 'sello-personalizado-ceramica',
    shortDescription: 'Sello de bronce para marcar cerámica antes de cocción.',
    description: 'Sellos de bronce diseñados específicamente para marcar cerámica en crudo antes de la cocción. Proporcionan marcas limpias y definidas que se mantienen después del proceso de horneado.',
    category: 'sello',
    price: { desde: 46000 },
    materials: ['ambos'],
    images: {
      default: '/images/sello/sellologo.webp',
      onLeather: '/images/sello/sellologo.webp',
      onWood: '/images/sello/sellologo.webp',
    },
    specs: {
      material: 'Bronce de alta calidad',
      proceso: 'CNC alta precisión',
      profundidad: '1mm - 1.5mm',
      tiempoProduccion: '7-10 días hábiles',
      incluye: ['Sello de bronce', 'Mango ergonómico', 'Adaptación para remachadora', 'Muestra digital', 'Revisión básica del logo', 'Guía rápida de uso'],
      uso: 'Cerámica en crudo',
    },
  },
  {
    id: 'sello-personalizado-lacre',
    name: 'Sello Personalizado - Lacre',
    slug: 'sello-personalizado-lacre',
    shortDescription: 'Sello de bronce para lacre, diseño elegante y clásico.',
    description: 'Sellos de bronce diseñados para marcar lacre caliente. Diseños elegantes y clásicos que crean impresiones perfectas en lacre, ideal para documentos importantes y correspondencia especial.',
    category: 'sello',
    price: { desde: 45000 },
    materials: ['ambos'],
    images: {
      default: '/images/sello/sellologo.webp',
      onLeather: '/images/sello/sellologo.webp',
      onWood: '/images/sello/sellologo.webp',
    },
    specs: {
      material: 'Bronce de alta calidad',
      proceso: 'CNC alta precisión + pulido espejo',
      profundidad: '0.5mm - 1mm',
      tiempoProduccion: '7-10 días hábiles',
      incluye: ['Sello de bronce', 'Mango ergonómico', 'Adaptación para remachadora', 'Muestra digital', 'Revisión básica del logo', 'Guía rápida de uso'],
      uso: 'Lacre caliente',
    },
  },
];

// Helper functions
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsByMaterial(material: MaterialType): Product[] {
  return products.filter((p) => p.materials.includes(material));
}

export function filterProducts(
  category?: ProductCategory,
  material?: MaterialType
): Product[] {
  let filtered = products;

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (material) {
    filtered = filtered.filter((p) => p.materials.includes(material));
  }

  return filtered;
}
