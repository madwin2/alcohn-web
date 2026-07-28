export type MarketCode = 'ar' | 'cl' | 'pe' | 'co' | 'mx';
export type InternationalMarketCode = Exclude<MarketCode, 'ar'>;
export type CurrencyCode = 'ARS' | 'CLP' | 'PEN' | 'COP' | 'MXN';

export interface MarketPricingConfig {
  /**
   * Fixed business rate from 1 ARS transfer-price peso to local currency.
   * Manually approved by Alcohn; not live FX.
   */
  arsToLocalRate: number;
  /** International margin over Argentina transfer price. Current business rule: 15%. */
  internationalMarkup: 1.15;
  /** Round final buyer-facing prices to this increment. */
  roundingIncrement: number;
}

export interface MarketConfig {
  code: MarketCode;
  countryName: string;
  countryIso2: 'AR' | 'CL' | 'PE' | 'CO' | 'MX';
  locale: 'es-AR' | 'es-CL' | 'es-PE' | 'es-CO' | 'es-MX';
  hreflang: 'es-AR' | 'es-CL' | 'es-PE' | 'es-CO' | 'es-MX';
  currency: CurrencyCode;
  basePath: '' | `/${InternationalMarketCode}`;
  dhlShippingAmount: number;
  pricing: MarketPricingConfig;
  phoneExample: string;
  addressLabels: {
    region: string;
    city: string;
    district?: string;
    postalCode: string;
    document: string;
  };
}
