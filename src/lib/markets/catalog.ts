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

/** Rutas estáticas que existen igual en /{market}/... (ver src/app/[market]). */
const INTERNATIONAL_STATIC_PATHS = new Set([
  '/',
  '/abecedarios',
  '/casos-reales',
  '/como-usar-sellos',
  '/contacto',
  '/faq',
  '/politica-devoluciones',
  '/politica-envios',
  '/privacidad',
  '/proceso',
  '/productos',
  '/sobre-alcohn',
  '/terminos',
]);

/**
 * Indica si una ruta argentina tiene su equivalente en los mercados internacionales.
 * Se usa para declarar hreflang también desde la versión AR: Google solo respeta
 * hreflang cuando las páginas se referencian en ambos sentidos.
 */
export function hasInternationalEquivalent(path: string): boolean {
  if (INTERNATIONAL_STATIC_PATHS.has(path)) return true;

  const sellos = path.match(/^\/sellos\/([^/]+)$/);
  if (sellos) return isStampUseCaseAvailableInMarket(sellos[1], 'cl');

  const accesorio = path.match(/^\/accesorios\/([^/]+)$/);
  if (accesorio) return isAccessoryAvailableInMarket(accesorio[1], 'cl');

  return false;
}
