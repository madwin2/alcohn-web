import type { InternationalMarketCode, MarketCode, MarketConfig } from './types';

/**
 * FX reference date: 2026-07-10
 * USD/ARS mayorista BCRA: 1.488
 * USD/CLP: 925 | USD/PEN: 3.401 | USD/COP: 3.335 | USD/MXN FIX Banxico: 17.535
 * arsToLocalRate = USD_local / USD_ARS
 * dhlShippingAmount = 40 USD × USD_local (rounded to market increment)
 */
export const FX_REFERENCE_DATE = '2026-07-10';

export const DEFAULT_MARKET: MarketCode = 'ar';

export const INTERNATIONAL_MARKETS: InternationalMarketCode[] = ['cl', 'pe', 'co', 'mx'];

export const MARKETS: Record<MarketCode, MarketConfig> = {
  ar: {
    code: 'ar',
    countryName: 'Argentina',
    countryIso2: 'AR',
    locale: 'es-AR',
    hreflang: 'es-AR',
    currency: 'ARS',
    basePath: '',
    dhlShippingAmount: 0,
    pricing: {
      arsToLocalRate: 1,
      internationalMarkup: 1.15,
      roundingIncrement: 100,
    },
    phoneExample: '+54 9 223 620 9554',
    addressLabels: {
      region: 'Provincia',
      city: 'Localidad',
      postalCode: 'Codigo postal',
      document: 'DNI o CUIT',
    },
  },
  cl: {
    code: 'cl',
    countryName: 'Chile',
    countryIso2: 'CL',
    locale: 'es-CL',
    hreflang: 'es-CL',
    currency: 'CLP',
    basePath: '/cl',
    dhlShippingAmount: 37000,
    pricing: {
      arsToLocalRate: 925 / 1488,
      internationalMarkup: 1.15,
      roundingIncrement: 1000,
    },
    phoneExample: '+56 9 1234 5678',
    addressLabels: {
      region: 'Region',
      city: 'Comuna / ciudad',
      postalCode: 'Codigo postal',
      document: 'RUT o documento',
    },
  },
  pe: {
    code: 'pe',
    countryName: 'Peru',
    countryIso2: 'PE',
    locale: 'es-PE',
    hreflang: 'es-PE',
    currency: 'PEN',
    basePath: '/pe',
    dhlShippingAmount: 136,
    pricing: {
      arsToLocalRate: 3.401 / 1488,
      internationalMarkup: 1.15,
      roundingIncrement: 1,
    },
    phoneExample: '+51 912 345 678',
    addressLabels: {
      region: 'Departamento',
      city: 'Provincia / ciudad',
      district: 'Distrito',
      postalCode: 'Codigo postal',
      document: 'DNI, RUC o documento',
    },
  },
  co: {
    code: 'co',
    countryName: 'Colombia',
    countryIso2: 'CO',
    locale: 'es-CO',
    hreflang: 'es-CO',
    currency: 'COP',
    basePath: '/co',
    dhlShippingAmount: 133000,
    pricing: {
      arsToLocalRate: 3335 / 1488,
      internationalMarkup: 1.15,
      roundingIncrement: 1000,
    },
    phoneExample: '+57 300 123 4567',
    addressLabels: {
      region: 'Departamento',
      city: 'Ciudad / municipio',
      postalCode: 'Codigo postal',
      document: 'Cedula, NIT o documento',
    },
  },
  mx: {
    code: 'mx',
    countryName: 'Mexico',
    countryIso2: 'MX',
    locale: 'es-MX',
    hreflang: 'es-MX',
    currency: 'MXN',
    basePath: '/mx',
    dhlShippingAmount: 700,
    pricing: {
      arsToLocalRate: 17.535 / 1488,
      internationalMarkup: 1.15,
      roundingIncrement: 10,
    },
    phoneExample: '+52 55 1234 5678',
    addressLabels: {
      region: 'Estado',
      city: 'Ciudad / municipio',
      district: 'Colonia',
      postalCode: 'Codigo postal',
      document: 'RFC o documento',
    },
  },
};

export function isMarketCode(value: string): value is MarketCode {
  return value === 'ar' || value === 'cl' || value === 'pe' || value === 'co' || value === 'mx';
}

export function isInternationalMarket(value: string): value is InternationalMarketCode {
  return value === 'cl' || value === 'pe' || value === 'co' || value === 'mx';
}

export function getMarketConfig(market: MarketCode): MarketConfig {
  return MARKETS[market];
}
