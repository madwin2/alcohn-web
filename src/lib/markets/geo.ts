import {
  DEFAULT_MARKET,
  getMarketConfig,
  INTERNATIONAL_MARKETS,
  isMarketCode,
} from './config';
import { marketBuyPath, marketFromPathname, marketPath, stripMarketFromPathname } from './paths';
import type { MarketCode } from './types';

/** Cookie set when the visitor explicitly picks a country in the header switcher. */
export const MARKET_PREF_COOKIE = 'alcohn_market_pref';

const MARKET_PREF_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

const PRODUCT_SLUG_TO_SELLOS: Record<string, string> = {
  '/productos/sello-personalizado-cuero': '/sellos/para-cuero',
  '/productos/sello-personalizado-madera': '/sellos/para-madera',
  '/productos/sello-para-alimentos': '/sellos/para-pan',
  '/productos/sello-personalizado-ceramica': '/sellos/para-ceramica',
  '/productos/sello-personalizado-lacre': '/sellos/para-lacre',
};

const BOT_USER_AGENT =
  /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|linkedinbot|slackbot|whatsapp|applebot|semrushbot|ahrefsbot|petalbot|duckduckbot/i;

export function marketPrefCookieOptions(market: MarketCode): {
  name: string;
  value: string;
  maxAge: number;
  path: string;
  sameSite: 'lax';
} {
  return {
    name: MARKET_PREF_COOKIE,
    value: market,
    maxAge: MARKET_PREF_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
  };
}

export function readMarketPrefCookie(cookieHeader: string | null | undefined): MarketCode | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${MARKET_PREF_COOKIE}=([^;]+)`));
  const value = match?.[1]?.trim().toLowerCase();
  return value && isMarketCode(value) ? value : null;
}

export function countryIso2FromHeaders(headers: Headers): string | null {
  const raw =
    headers.get('x-vercel-ip-country') ??
    headers.get('cf-ipcountry') ??
    headers.get('x-country-code');

  if (!raw || raw === 'XX' || raw === 'T1') return null;
  return raw.toUpperCase();
}

export function marketFromCountryIso2(countryIso2: string | null | undefined): MarketCode | null {
  if (!countryIso2) return null;

  for (const market of [...INTERNATIONAL_MARKETS, DEFAULT_MARKET] as MarketCode[]) {
    if (getMarketConfig(market).countryIso2 === countryIso2.toUpperCase()) {
      return market;
    }
  }

  return null;
}

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_USER_AGENT.test(userAgent);
}

export function shouldSkipGeoRedirect(pathname: string): boolean {
  if (pathname.startsWith('/api')) return true;
  if (pathname.startsWith('/_next')) return true;

  const stripped = stripMarketFromPathname(pathname);
  return (
    stripped.startsWith('/checkout/openpay') ||
    stripped.startsWith('/checkout/transferencia')
  );
}

function normalizeComparablePath(pathname: string): string {
  const stripped = stripMarketFromPathname(pathname);
  if (stripped.length > 1 && stripped.endsWith('/')) {
    return stripped.slice(0, -1);
  }
  return stripped;
}

function remapArOnlyPath(strippedPath: string, targetMarket: MarketCode): string | null {
  if (targetMarket === 'ar') return null;

  if (strippedPath === '/cotizar') {
    return marketBuyPath(targetMarket);
  }

  if (strippedPath === '/sellos/personalizados') {
    return marketPath(targetMarket, '/productos');
  }

  if (strippedPath.startsWith('/sellos/estandar')) {
    return marketPath(targetMarket, '/productos');
  }

  if (strippedPath === '/accesorios' || strippedPath.startsWith('/accesorios/')) {
    if (strippedPath === '/accesorios/mango-de-golpe') {
      return marketPath(targetMarket, '/accesorios/mango-de-golpe');
    }
    return marketPath(targetMarket, '/accesorios/mango-de-golpe');
  }

  const mappedSellos = PRODUCT_SLUG_TO_SELLOS[strippedPath];
  if (mappedSellos) {
    return marketPath(targetMarket, mappedSellos);
  }

  if (strippedPath.startsWith('/productos/')) {
    return marketPath(targetMarket, '/productos');
  }

  if (strippedPath.startsWith('/checkout/transferencia') || strippedPath.startsWith('/checkout/openpay')) {
    return null;
  }

  return null;
}

export function resolveGeoRedirectPath(
  pathname: string,
  targetMarket: MarketCode
): string {
  const stripped = normalizeComparablePath(pathname);
  const remapped = remapArOnlyPath(stripped, targetMarket);
  if (remapped) return remapped;
  return marketPath(targetMarket, stripped === '/' ? '/' : stripped);
}

export function getGeoRedirectTarget(input: {
  pathname: string;
  countryIso2: string | null;
  marketPref: MarketCode | null;
}): string | null {
  if (input.marketPref) return null;

  const geoMarket = marketFromCountryIso2(input.countryIso2);
  if (!geoMarket) return null;

  const currentMarket = marketFromPathname(input.pathname);
  if (geoMarket === currentMarket) return null;

  return resolveGeoRedirectPath(input.pathname, geoMarket);
}
