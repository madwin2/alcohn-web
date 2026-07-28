import { INTERNATIONAL_MARKETS, MARKETS, getMarketConfig } from './config';
import { marketPath } from './paths';
import type { MarketCode } from './types';
import { SITE_URL } from '@/lib/seo';

export function marketAbsoluteUrl(market: MarketCode, path: string): string {
  return `${SITE_URL}${encodeURI(marketPath(market, path))}`;
}

export function alternateLanguages(path: string) {
  const languages: Record<string, string> = {
    'es-AR': marketAbsoluteUrl('ar', path),
    'x-default': marketAbsoluteUrl('ar', path),
  };

  for (const market of INTERNATIONAL_MARKETS) {
    const config = getMarketConfig(market);
    languages[config.hreflang] = marketAbsoluteUrl(market, path);
  }

  return languages;
}

export function marketSeoTitle(baseTitle: string, market: MarketCode): string {
  if (market === 'ar') return baseTitle;
  return `${baseTitle} | Envío DHL a ${MARKETS[market].countryName}`;
}

export function marketSeoDescription(baseDescription: string, market: MarketCode): string {
  if (market === 'ar') return baseDescription;
  const country = MARKETS[market].countryName;
  return `${baseDescription} Envío internacional DHL a ${country}.`;
}
