import { DEFAULT_MARKET, getMarketConfig, isInternationalMarket } from './config';
import type { MarketCode } from './types';

function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

export function marketPath(market: MarketCode, path: string): string {
  const normalized = normalizePath(path);
  const basePath = getMarketConfig(market).basePath;
  if (!basePath) return normalized;
  if (normalized === '/') return basePath;
  return `${basePath}${normalized}`;
}

export function marketFromPathname(pathname: string): MarketCode {
  const first = pathname.split('/').filter(Boolean)[0] ?? '';
  return isInternationalMarket(first) ? first : DEFAULT_MARKET;
}

export function stripMarketFromPathname(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return '/';
  if (!isInternationalMarket(parts[0])) return normalizePath(pathname);
  const rest = parts.slice(1).join('/');
  return rest ? `/${rest}` : '/';
}

export function marketBuyPath(market: MarketCode, query?: string): string {
  const base = marketPath(market, '/buy');
  if (!query) return `${base}?mode=custom`;
  return query.startsWith('?') ? `${base}${query}` : `${base}?${query}`;
}
