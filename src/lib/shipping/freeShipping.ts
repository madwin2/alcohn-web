import type { CartItem } from '@/lib/cart';
import { getAccessoryBySlug } from '@/data/accessories';
import type { MarketCode } from '@/lib/markets/types';

/** Desde cuántos sellos en un mismo pedido el envío es gratis (solo Argentina). */
export const FREE_SHIPPING_MIN_STAMPS = 3;

type CartLineLike = Pick<CartItem, 'id' | 'designSlug' | 'collection' | 'variantSize' | 'qty'>;

/** Línea de envío que arma Openpay, no un producto. */
function isShippingLine(item: CartLineLike): boolean {
  return item.id.startsWith('envio-') || item.designSlug.startsWith('envio-');
}

/** Accesorios (soldador, mango, base): no cuentan como sello para el envío gratis. */
function isAccessoryLine(item: CartLineLike): boolean {
  if (getAccessoryBySlug(item.designSlug)) return true;
  const collection = (item.collection ?? '').toLowerCase();
  const size = (item.variantSize ?? '').toLowerCase();
  return collection === 'accesorios' || size === 'único' || size === 'unico';
}

/** Unidades de sellos del carrito (personalizados, estándar y abecedarios). */
export function countStampUnits(items: CartLineLike[]): number {
  return items.reduce((sum, item) => {
    if (isShippingLine(item) || isAccessoryLine(item)) return sum;
    const qty = Number.isFinite(item.qty) && item.qty > 0 ? Math.floor(item.qty) : 1;
    return sum + qty;
  }, 0);
}

export function qualifiesForFreeShipping(items: CartLineLike[], market: MarketCode = 'ar'): boolean {
  if (market !== 'ar') return false;
  return countStampUnits(items) >= FREE_SHIPPING_MIN_STAMPS;
}

/** Cuántos sellos faltan para el envío gratis (0 si ya lo tiene). */
export function stampsMissingForFreeShipping(items: CartLineLike[]): number {
  return Math.max(0, FREE_SHIPPING_MIN_STAMPS - countStampUnits(items));
}
