import { getAccessoryMinPrice } from '@/data/accessories';
import { products } from '@/data/products';
import { STANDARD_STAMP_PRICE_FROM_ARS } from '@/lib/catalog';

/** Precio público "desde" para sellos personalizados con logo (referencia en web). */
export const CUSTOM_STAMP_PRICE_FROM_ARS = 69500;

export function getCustomStampMinPrice(): number {
  return CUSTOM_STAMP_PRICE_FROM_ARS;
}

export function getStandardStampMinPrice(): number {
  return STANDARD_STAMP_PRICE_FROM_ARS;
}

export function getAccessoryMinPriceFrom(): number {
  return getAccessoryMinPrice();
}

export function getAbecedarioMinPrice(): number {
  const abecedarioPrices = products
    .filter((product) => product.category === 'abecedario')
    .map((product) => (typeof product.price === 'number' ? product.price : product.price.desde));

  return Math.min(...abecedarioPrices);
}
