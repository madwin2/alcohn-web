import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MARKET,
  FX_REFERENCE_DATE,
  INTERNATIONAL_MARKETS,
  MARKETS,
  getMarketConfig,
  isInternationalMarket,
  isMarketCode,
} from '../config';

describe('market config', () => {
  it('keeps Argentina as the default market', () => {
    expect(DEFAULT_MARKET).toBe('ar');
    expect(getMarketConfig('ar').currency).toBe('ARS');
    expect(getMarketConfig('ar').basePath).toBe('');
  });

  it('supports Chile, Peru, Colombia, and Mexico as international markets', () => {
    expect(INTERNATIONAL_MARKETS).toEqual(['cl', 'pe', 'co', 'mx']);
    expect(INTERNATIONAL_MARKETS.every(isInternationalMarket)).toBe(true);
  });

  it('rejects unknown market segments', () => {
    expect(isMarketCode('cl')).toBe(true);
    expect(isMarketCode('productos')).toBe(false);
    expect(isMarketCode('us')).toBe(false);
  });

  it('has local currency and DHL shipping values for each international market', () => {
    for (const code of INTERNATIONAL_MARKETS) {
      const market = MARKETS[code];
      expect(market.currency).not.toBe('ARS');
      expect(market.dhlShippingAmount).toBeGreaterThan(0);
      expect(market.pricing.arsToLocalRate).toBeGreaterThan(0);
      expect(market.pricing.internationalMarkup).toBe(1.15);
    }
  });

  it('documents FX reference date', () => {
    expect(FX_REFERENCE_DATE).toBe('2026-07-10');
  });

  it('uses 40 USD DHL shipping converted to local currency (2026-07-10 rates)', () => {
    expect(MARKETS.cl.dhlShippingAmount).toBe(37000);
    expect(MARKETS.pe.dhlShippingAmount).toBe(136);
    expect(MARKETS.co.dhlShippingAmount).toBe(133000);
    expect(MARKETS.mx.dhlShippingAmount).toBe(700);
  });
});
