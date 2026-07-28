import type { MarketCode } from './types';

const INTERNATIONAL_PRODUCT_SLUGS = new Set([
  'sello-personalizado-cuero',
  'sello-personalizado-madera',
  'sello-personalizado-universal',
  'sello-para-alimentos',
  'sello-personalizado-ceramica',
  'sello-personalizado-lacre',
  'abecedario-bronce-completo',
  'abecedario-bronce-numeros',
]);

const INTERNATIONAL_ACCESSORY_SLUGS = new Set(['mango-de-golpe']);

export function isProductSlugAvailableInMarket(slug: string, market: MarketCode): boolean {
  if (market === 'ar') return true;
  return INTERNATIONAL_PRODUCT_SLUGS.has(slug);
}

export function isAccessoryAvailableInMarket(slug: string, market: MarketCode): boolean {
  if (market === 'ar') return true;
  return INTERNATIONAL_ACCESSORY_SLUGS.has(slug);
}

export function isStampUseCaseAvailableInMarket(slug: string, market: MarketCode): boolean {
  if (market === 'ar') return true;
  return slug.startsWith('para-');
}
