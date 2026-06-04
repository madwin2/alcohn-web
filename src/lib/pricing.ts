import { products } from '@/data/products';
import { standardDesigns } from '@/lib/catalog';

export function getCustomStampMinPrice(): number {
  const selloPrices = products
    .filter((product) => product.category === 'sello')
    .map((product) => (typeof product.price === 'number' ? product.price : product.price.desde));

  return Math.min(...selloPrices);
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
