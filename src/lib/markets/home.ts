import { getMarketConfig, isInternationalMarket } from './config';
import { getMarketLocalCopy } from './localCopy';
import { formatMarketMoney } from './money';
import { marketBuyPath, marketPath } from './paths';
import { convertPublicArsToMarketPrice } from './pricing';
import { marketAbsoluteUrl } from './seo';
import type { MarketCode } from './types';

export function homePriceFromLabel(publicArs: number, market: MarketCode): string {
  const amount = convertPublicArsToMarketPrice(publicArs, market);
  return `Desde ${formatMarketMoney(amount, market)}`;
}

export function getHomeHeroTitle(market: MarketCode): string {
  if (!isInternationalMarket(market)) {
    return 'Más que una herramienta, una forma de contar tu historia.';
  }
  return getMarketLocalCopy(market).heroTitle;
}

export function getHomeHeroSubtitle(market: MarketCode): string {
  if (market === 'ar') {
    return 'Sellos de bronce personalizados para marcar cuero, madera, alimentos y packaging. Subí tu logo, elegí cómo lo vas a usar y recibí muestra, medida y precio antes de fabricar.';
  }
  return getMarketLocalCopy(market).heroSubtitle;
}

export function getHomePrimaryCta(market: MarketCode) {
  return {
    text: 'Subir logo y ver precio',
    mobileText: 'Subir logo',
    href: marketBuyPath(market),
  };
}

export function getHomeSecondaryCta(market: MarketCode) {
  if (market === 'ar') {
    return {
      text: 'Comprar diseño estándar',
      mobileText: 'Diseño estándar',
      href: '/sellos/estandar',
    };
  }

  return {
    text: 'Cómo funciona',
    mobileText: 'Proceso',
    href: marketPath(market, '/proceso'),
  };
}

export function getHomeDesignCtaHref(market: MarketCode): string {
  return marketBuyPath(market);
}

export function getHomeDesignCtaLabel(market: MarketCode): string {
  return 'Probar con mi logo';
}

export function getHomeFinalCta(market: MarketCode) {
  if (market === 'ar') {
    return {
      href: marketBuyPath(market),
      label: 'Diseñar y comprar online',
      description: 'Subí tu logo, mirá una muestra, confirmá medida y avanzá al pago online.',
      descriptionMobile: 'Subí tu logo, revisá la muestra y avanzá al pago.',
    };
  }

  const copy = getMarketLocalCopy(market);
  return {
    href: marketBuyPath(market),
    label: 'Diseñar y comprar online',
    description: `Sube tu logo, mira la muestra, confirma la medida y ${copy.currencyPhrase}, con envío DHL incluido.`,
    descriptionMobile: `Sube tu logo, revisa la muestra y ${copy.currencyPhrase}.`,
  };
}

export function buildHomeWebsiteJsonLd(market: MarketCode) {
  const config = getMarketConfig(market);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Alcohn',
    url: marketAbsoluteUrl(market, '/'),
    inLanguage: config.locale,
    description:
      market === 'ar'
        ? 'Sellos de bronce personalizados para cuero, madera, alimentos y packaging.'
        : `Sellos de bronce personalizados con envío DHL a ${config.countryName}.`,
  };
}
