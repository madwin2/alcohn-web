import { products } from '@/data/products';
import { standardDesigns } from '@/lib/catalog';

/** Precio público "desde" para sellos personalizados con logo (referencia en web). */
export const CUSTOM_STAMP_PRICE_FROM_ARS = 69500;

export function getCustomStampMinPrice(): number {
  return CUSTOM_STAMP_PRICE_FROM_ARS;
}

export function getStandardStampMinPrice(): number {
  return Math.min(...standardDesigns.map((design) => design.startingPrice));
}

export function getAbecedarioMinPrice(): number {
  const abecedarioPrices = products
    .filter((product) => product.category === 'abecedario')
    .map((product) => (typeof product.price === 'number' ? product.price : product.price.desde));

  return Math.min(...abecedarioPrices);
}
