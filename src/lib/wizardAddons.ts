import {
  getAccessoryBySlug,
  getAccessoryLinkPrice,
  getAccessoryTransferPrice,
  getDefaultAccessoryVariant,
  type Accessory,
} from '@/data/accessories';

/**
 * Complemento sugerido en el paso de pago del generador (solo Argentina).
 * Un solo accesorio según el material: madera → calentador; cuero → mango de golpe
 * (o la base para remachadora si el sello pasa los 3×3 cm, donde el golpe no rinde).
 */

const CALENTADOR_SLUG = 'calentador-electrico';
const MANGO_GOLPE_SLUG = 'mango-de-golpe';
const BASE_REMACHADORA_SLUG = 'base-aluminio-remachadora';

/** El mango de golpe se recomienda en sellos de hasta 3×3 cm (ver ficha del accesorio). */
export const MANGO_GOLPE_MAX_MM = 30;

/** Para qué sirve, en una línea, dentro del generador. */
const ADDON_PITCH: Record<string, string> = {
  [CALENTADOR_SLUG]: 'Calienta el sello sin fuego directo: marcás madera parejo y más rápido.',
  [MANGO_GOLPE_SLUG]: 'Para marcar cuero a golpe de martillo. Ideal en sellos de hasta 3×3 cm.',
  [BASE_REMACHADORA_SLUG]: 'Montá el sello en una remachadora o prensa y marcá con presión pareja.',
};

/** Pregunta para ofrecerlo como alternativa ("¿Marcás con remachadora…? Ver la base"). */
const ADDON_SWITCH_PROMPT: Record<string, string> = {
  [MANGO_GOLPE_SLUG]: '¿Marcás a golpe de martillo?',
  [BASE_REMACHADORA_SLUG]: '¿Marcás con remachadora o prensa?',
};

export type WizardAddonSuggestion = {
  /** Accesorio que se muestra primero. */
  primary: string;
  /** Alternativa que se ofrece en una línea (cuero: la base para remachadora). */
  alternative?: string;
};

export function getWizardAddonSuggestion(
  material: string | undefined,
  stampMm?: { width: number; height: number } | null
): WizardAddonSuggestion | null {
  if (material === 'madera') return { primary: CALENTADOR_SLUG };
  if (material === 'cuero') {
    const big =
      stampMm != null &&
      (stampMm.width > MANGO_GOLPE_MAX_MM || stampMm.height > MANGO_GOLPE_MAX_MM);
    return big
      ? { primary: BASE_REMACHADORA_SLUG }
      : { primary: MANGO_GOLPE_SLUG, alternative: BASE_REMACHADORA_SLUG };
  }
  return null;
}

export type WizardAddon = {
  accessory: Accessory;
  pitch: string;
  switchPrompt: string;
  /** Precio con tarjeta (link), igual que la ficha del accesorio. */
  linkPrice: number;
  transferPrice: number;
  /** Mismo `variantSize` que arma la ficha: el servidor recotiza por slug + variante. */
  variantLabel: string;
};

export function resolveWizardAddon(slug: string): WizardAddon | null {
  const accessory = getAccessoryBySlug(slug);
  if (!accessory) return null;
  const variant = getDefaultAccessoryVariant(accessory);
  if (accessory.variants?.length && !variant) return null; // todo sin stock
  const linkPrice = variant?.linkPrice ?? getAccessoryLinkPrice(accessory);
  const transferPrice = variant?.transferPrice ?? getAccessoryTransferPrice(accessory);
  if (!(linkPrice > 0) || !(transferPrice > 0)) return null;
  return {
    accessory,
    pitch: ADDON_PITCH[slug] ?? accessory.description,
    switchPrompt: ADDON_SWITCH_PROMPT[slug] ?? '¿Preferís otra opción?',
    linkPrice,
    transferPrice,
    variantLabel: variant?.label ?? 'Único',
  };
}

/**
 * Línea de carrito con la misma forma que `AccessoryProductPage` / `AccessoryCard`
 * (designSlug = slug del accesorio, así lo reconocen el checkout y `sellosFromCart`).
 * El precio sigue el método elegido, igual que la línea del sello del generador.
 */
export function buildWizardAddonCartLine(
  addon: WizardAddon,
  metodo: 'Openpay' | 'Transferencia'
) {
  return {
    title: addon.accessory.title,
    collection: 'Accesorios',
    material: 'Accesorio',
    process: '—',
    variantSize: addon.variantLabel,
    price: metodo === 'Transferencia' ? addon.transferPrice : addon.linkPrice,
    image: addon.accessory.image,
    designSlug: addon.accessory.slug,
  };
}
