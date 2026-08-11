import type { InternationalMarketCode } from './types';

export type MarketLocalCopy = {
  /** H1 del hero de la home. */
  heroTitle: string;
  /** Subtítulo del hero de la home (tuteo, terminología local). */
  heroSubtitle: string;
  /** Frase de moneda para CTAs: "paga en soles", etc. */
  currencyPhrase: string;
  /** Días hábiles estimados de tránsito DHL AR → país. [CONFIRMAR con historial DHL] */
  dhlDays: string;
  /** Métodos de pago locales visibles. [CONFIRMAR en panel dLocal antes de mostrar] */
  paymentMethods: string[];
  /** Término local principal del producto (para SEO y textos). */
  localTerm: string;
};

export const MARKET_LOCAL_COPY: Record<InternationalMarketCode, MarketLocalCopy> = {
  cl: {
    heroTitle: 'Cuños de bronce personalizados, hechos para durar toda la vida.',
    heroSubtitle:
      'Cuños (sellos) de bronce mecanizados en CNC para marcar cuero, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en pesos chilenos con envío DHL a Chile.',
    currencyPhrase: 'pagas en pesos chilenos',
    dhlDays: '4 a 7', // [CONFIRMAR]
    paymentMethods: ['Tarjeta de crédito o débito'], // [CONFIRMAR: ¿Webpay habilitado en dLocal?]
    localTerm: 'cuño de bronce',
  },
  pe: {
    heroTitle: 'Sellos de bronce personalizados, hechos para durar toda la vida.',
    heroSubtitle:
      'Sellos de bronce (también llamados cuños o clichés) mecanizados en CNC para marcar cuero, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en soles con envío DHL a Perú.',
    currencyPhrase: 'pagas en soles',
    dhlDays: '4 a 7', // [CONFIRMAR]
    paymentMethods: ['Tarjeta de crédito o débito'], // [CONFIRMAR: ¿Yape / PagoEfectivo habilitados en dLocal?]
    localTerm: 'sello de bronce',
  },
  co: {
    heroTitle: 'Sellos al calor de bronce personalizados, hechos para durar toda la vida.',
    heroSubtitle:
      'Sellos de bronce para marcar al calor, mecanizados en CNC: cuero, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en pesos colombianos con envío DHL a Colombia.',
    currencyPhrase: 'pagas en pesos colombianos',
    dhlDays: '4 a 7', // [CONFIRMAR]
    paymentMethods: ['Tarjeta de crédito o débito'], // [CONFIRMAR: ¿PSE / Nequi habilitados en dLocal?]
    localTerm: 'sello al calor',
  },
  mx: {
    heroTitle: 'Sellos a fuego de bronce personalizados, hechos para durar toda la vida.',
    heroSubtitle:
      'Sellos a fuego y hierros de marcar de bronce, mecanizados en CNC para marcar piel, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en pesos mexicanos con envío DHL a México.',
    currencyPhrase: 'pagas en pesos mexicanos',
    dhlDays: '3 a 6', // [CONFIRMAR]
    paymentMethods: ['Tarjeta de crédito o débito'], // [CONFIRMAR: ¿OXXO / SPEI habilitados en dLocal?]
    localTerm: 'sello a fuego',
  },
};

export function getMarketLocalCopy(market: InternationalMarketCode): MarketLocalCopy {
  return MARKET_LOCAL_COPY[market];
}
