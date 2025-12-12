export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  material: string;
  commonSizes: string[];
  priceFrom: number; // TODO: Confirmar precios exactos
  image?: string;
}

export const products: Product[] = [
  {
    id: "estandar",
    name: "Sello Estándar",
    slug: "sello-estandar",
    description: "Sellos de bronce para madera, cuero, cerámica, cartón y más. Versátiles y duraderos para múltiples materiales.",
    material: "varios",
    commonSizes: ["30x30mm", "40x40mm", "50x50mm"],
    priceFrom: 44000, // TODO: Confirmar precio exacto
  },
  {
    id: "alimentos",
    name: "Sello para alimentos",
    slug: "sello-para-alimentos",
    description: "Sellos con forma cortada para evitar marcar con la base el alimento, mejorando el resultado. Mayor profundidad para un marcado más definido.",
    material: "alimentos",
    commonSizes: ["30x30mm", "40x40mm", "50x50mm"],
    priceFrom: 44000, // TODO: Confirmar precio exacto
  },
  {
    id: "abecedarios",
    name: "Abecedarios",
    slug: "abecedarios",
    description: "Conjuntos de letras individuales de bronce para marcar textos personalizados en diferentes materiales.",
    material: "varios",
    commonSizes: ["Conjunto completo"],
    priceFrom: 44000, // TODO: Confirmar precio exacto
  },
];



