import type { CartItem } from '@/lib/cart';
import { getAccessoryBySlug } from '@/data/accessories';
import { resolveCartLineCategory } from '@/lib/stampSizeCategories';
import { getWizardAddonSuggestion, resolveWizardAddon, type WizardAddon } from '@/lib/wizardAddons';

/** Medida en mm de una línea "30x20mm" (para elegir mango o base en cuero). */
function lineStampMm(item: CartItem): { width: number; height: number } | null {
  const m = /^(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*mm$/i.exec(item.variantSize.trim());
  if (!m) return null;
  return { width: Number(m[1].replace(',', '.')), height: Number(m[2].replace(',', '.')) };
}

/** Tamaño grande por categoría (sin medida exacta): en cuero conviene la base. */
function categoryStampMm(item: CartItem): { width: number; height: number } | null {
  const cat = resolveCartLineCategory(item);
  if (!cat) return null;
  return cat.key === 'chico' ? { width: 25, height: 25 } : { width: 50, height: 40 };
}

/** Material del generador deducido del uso, para reutilizar la misma regla de sugerencia. */
function materialFromUso(usoSlug: string): string | undefined {
  if (usoSlug === 'para-cuero') return 'cuero';
  if (usoSlug === 'para-madera') return 'madera';
  return undefined;
}

/**
 * Accesorio a sugerir en el panel del carrito: según el uso del último sello agregado
 * (o del más reciente del carrito). No sugiere nada que ya esté en el carrito.
 */
export function getCartAddonSuggestion(
  items: CartItem[],
  lastAddedId: string | null
): WizardAddon | null {
  const stamps = items.filter((i) => i.usoSlug && !getAccessoryBySlug(i.designSlug));
  if (stamps.length === 0) return null;
  const ref = stamps.find((i) => i.id === lastAddedId) ?? stamps[stamps.length - 1];
  const usoSlug = ref.usoSlug!;
  const suggestion = getWizardAddonSuggestion(
    materialFromUso(usoSlug),
    lineStampMm(ref) ?? categoryStampMm(ref),
    usoSlug
  );
  if (!suggestion) return null;

  // Si ya tiene el accesorio (o la alternativa: base en lugar de mango), no insistimos.
  const inCart = new Set(items.map((i) => i.designSlug));
  if (inCart.has(suggestion.primary)) return null;
  if (suggestion.alternative && inCart.has(suggestion.alternative)) return null;
  return resolveWizardAddon(suggestion.primary, usoSlug);
}
