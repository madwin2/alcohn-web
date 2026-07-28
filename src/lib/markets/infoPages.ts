import { buildBreadcrumbJsonLd } from '@/lib/seo';
import { marketBuyPath, marketPath } from './paths';
import type { MarketCode } from './types';

export function marketBreadcrumbJsonLd(
  market: MarketCode,
  items: Array<{ name: string; path: string }>
) {
  return buildBreadcrumbJsonLd(
    items.map((item) => ({
      name: item.name,
      path: marketPath(market, item.path),
    }))
  );
}

export function marketBuyCta(market: MarketCode, label: string) {
  return { label, href: marketBuyPath(market) };
}

export function marketStandardSecondaryCta(market: MarketCode) {
  if (market === 'ar') {
    return {
      label: 'Comprar estándar',
      href: '/sellos/estandar',
      variant: 'secondary' as const,
    };
  }

  return {
    label: 'Ver catálogo',
    href: marketPath(market, '/productos'),
    variant: 'secondary' as const,
  };
}
