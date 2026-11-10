/**
 * Especificaciones físicas del sello (datos de fabricación Alcohn).
 *
 * - Todos los sellos: 10 mm de espesor y desbaste general de 3 mm, para que la base del
 *   sello no toque la pieza que se marca.
 * - Estándar (cuero, madera, cerámica, jabón, packaging, lacre): grabado cónico de 1,7 mm.
 * - Usos especiales (alimentos, hielo, coctelería): grabado cónico de 3 mm, igual que el
 *   desbaste, más un mecanizado de contorno: la base se corta con la forma del diseño,
 *   porque con 3 mm en esos materiales la base llegaría a tocar.
 */
export type StampDepthSpec = {
  thicknessMm: number;
  reliefMm: number;
  engravingMm: number;
  contourCut: boolean;
  /** Resumen corto para fichas. */
  summary: string;
  /** Explicación de una línea. */
  detail: string;
};

export const STANDARD_STAMP_DEPTH: StampDepthSpec = {
  thicknessMm: 10,
  reliefMm: 3,
  engravingMm: 1.7,
  contourCut: false,
  summary: 'Grabado cónico de 1,7 mm + desbaste de 3 mm',
  detail:
    'El desbaste de 3 mm evita que la base del sello toque la pieza. Sello de 10 mm de espesor.',
};

export const SPECIAL_STAMP_DEPTH: StampDepthSpec = {
  thicknessMm: 10,
  reliefMm: 3,
  engravingMm: 3,
  contourCut: true,
  summary: 'Grabado cónico de 3 mm + corte de contorno',
  detail:
    'La base se corta con la forma del diseño para que no toque el alimento o el hielo. Sello de 10 mm de espesor.',
};

/** Landings /sellos/{slug} que usan el sello especial (alimentos, hielo, coctelería). */
const SPECIAL_USE_CASE_SLUGS = new Set(['para-pan', 'para-hielo', 'para-fruta']);

export function getStampDepthSpec(useCaseSlug: string): StampDepthSpec {
  return SPECIAL_USE_CASE_SLUGS.has(useCaseSlug) ? SPECIAL_STAMP_DEPTH : STANDARD_STAMP_DEPTH;
}
