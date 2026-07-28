import { getMarketConfig } from './config';
import { formatMarketMoney } from './money';
import { marketBuyPath, marketPath } from './paths';
import { convertPublicArsToMarketPrice } from './pricing';
import { marketAbsoluteUrl } from './seo';
import type { MarketCode } from './types';

export function homePriceFromLabel(publicArs: number, market: MarketCode): string {
  const amount = convertPublicArsToMarketPrice(publicArs, market);
  return `Desde ${formatMarketMoney(amount, market)}`;
}

export function getHomeHeroSubtitle(market: MarketCode): string {
  if (market === 'ar') {
    return 'Sellos de bronce personalizados para marcar cuero, madera, alimentos y packaging. Subí tu logo, elegí cómo lo vas a usar y recibí muestra, medida y precio antes de fabricar.';
  }

  const country = getMarketConfig(market).countryName;
  return `Sellos de bronce personalizados para marcar cuero, madera, alimentos y packaging. Subí tu logo, elegí uso y medida, mirá la muestra y comprá con envío DHL a ${country}.`;
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
  return {
    href: marketBuyPath(market),
    label: 'Diseñar y comprar online',
    description:
      market === 'ar'
        ? 'Subí tu logo, mirá una muestra, confirmá medida y avanzá al pago online.'
        : 'Subí tu logo, mirá la muestra, confirmá medida y pagá en moneda local con envío DHL.',
    descriptionMobile:
      market === 'ar'
        ? 'Subí tu logo, revisá la muestra y avanzá al pago.'
        : 'Subí tu logo, revisá la muestra y comprá con envío DHL.',
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
