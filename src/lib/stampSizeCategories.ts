import type { StampSizeCategoryKey } from '@/lib/cart';
import type { GrupoCodigo } from '@/lib/cotizador/types';

export type { StampSizeCategoryKey };

export interface StampSizeCategory {
  key: StampSizeCategoryKey;
  /** Grupo de precio del catálogo Supabase. */
  grupo: Exclude<GrupoCodigo, 'xl'>;
  label: string;
  /** Para qué suele usarse: ayuda a elegir sin saber de medidas. */
  idealFor: string;
}

export const STAMP_SIZE_CATEGORIES: readonly StampSizeCategory[] = [
  {
    key: 'chico',
    grupo: 'chicos',
    label: 'Sello chico',
    idealFor: 'Etiquetas, llaveros, cuero chico, hielo y firmas.',
  },
  {
    key: 'mediano',
    grupo: 'medianos',
    label: 'Sello mediano',
    idealFor: 'Billeteras, bolsos, tablas, pan y cerámica.',
  },
  {
    key: 'grande',
    grupo: 'grandes',
    label: 'Sello grande',
    idealFor: 'Muebles, cajones, tablas grandes y packaging.',
  },
] as const;

const VARIANT_SUFFIX = 'medida según tu logo';

export function getStampSizeCategory(key: string | null | undefined): StampSizeCategory | undefined {
  return STAMP_SIZE_CATEGORIES.find((c) => c.key === key);
}

/** Texto de la línea del carrito/pedido: "Sello chico · medida según tu logo". */
export function stampCategoryVariantLabel(key: StampSizeCategoryKey): string {
  const cat = getStampSizeCategory(key);
  return `${cat?.label ?? key} · ${VARIANT_SUFFIX}`;
}

/** Inversa de `stampCategoryVariantLabel` (para carritos que llegan sin `sizeCategory`). */
export function stampCategoryFromVariantLabel(variantSize: string): StampSizeCategoryKey | null {
  const v = variantSize.trim().toLowerCase();
  if (!v.endsWith(VARIANT_SUFFIX)) return null;
  const found = STAMP_SIZE_CATEGORIES.find((c) => v.startsWith(c.label.toLowerCase()));
  return found?.key ?? null;
}

/** Categoría de una línea del carrito, por campo o por texto de la variante. */
export function resolveCartLineCategory(item: {
  sizeCategory?: string | null;
  variantSize?: string | null;
}): StampSizeCategory | undefined {
  return (
    getStampSizeCategory(item.sizeCategory) ??
    getStampSizeCategory(stampCategoryFromVariantLabel(item.variantSize ?? ''))
  );
}

/** "3 × 2 cm" (coma decimal, sin ceros de más). */
export function formatMeasureCm(ancho: number, largo: number): string {
  const f = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');
  return `${f(ancho)} × ${f(largo)} cm`;
}
