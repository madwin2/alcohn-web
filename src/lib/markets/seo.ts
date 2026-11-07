import { INTERNATIONAL_MARKETS, MARKETS, getMarketConfig } from './config';
import { marketPath } from './paths';
import { toTuteo } from './localizeText';
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

/** True si el texto ya promete el envío DHL a ese país (ej. "DHL a Chile", "DHL desde Argentina a Chile"). */
function mentionsDhlTo(text: string, country: string): boolean {
  return new RegExp(`DHL[^.|]* ${country}(?![A-Za-zÀ-ÿ])`).test(text);
}

/**
 * Quita de un texto SEO pensado para Argentina las promesas de envío nacional
 * ("Envío a todo Argentina", "envío a todo el país", "envío nacional"), que afuera son falsas.
 * "Fabricación en Argentina" se mantiene: es cierto y suma confianza.
 */
export function stripArgentinaShipping(text: string): string {
  return text
    .replace(/,\s*env[ií]o (?:a todo (?:Argentina|el pa[ií]s)|nacional)(?=[.,])/gi, '')
    .replace(/\s*Env[ií]o (?:a todo (?:Argentina|el pa[ií]s)|nacional)\.\s*/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function marketSeoTitle(baseTitle: string, market: MarketCode): string {
  if (market === 'ar') return baseTitle;
  const country = MARKETS[market].countryName;
  const title = toTuteo(baseTitle.replace(/\bAlcohn Argentina\b/g, 'Alcohn'));
  if (mentionsDhlTo(title, country)) return title;
  return `${title} | Envío DHL a ${country}`;
}

/** Texto de producto (JSON-LD) para mercados internacionales, sin promesas de envío nacional. */
export function marketProductDescription(baseDescription: string, market: MarketCode): string {
  if (market === 'ar') return baseDescription;
  return toTuteo(stripArgentinaShipping(baseDescription));
}

export function marketSeoDescription(baseDescription: string, market: MarketCode): string {
  if (market === 'ar') return baseDescription;
  const country = MARKETS[market].countryName;
  const description = toTuteo(stripArgentinaShipping(baseDescription))
    // Evita "Envío internacional DHL. Envío internacional DHL a Colombia."
    .replace(/\s*Env[ií]o internacional DHL\.\s*$/i, '')
    .trim();
  if (mentionsDhlTo(description, country)) return description;
  return `${description} Envío internacional DHL a ${country}.`;
}
