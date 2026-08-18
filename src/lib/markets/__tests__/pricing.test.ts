import { describe, expect, it } from 'vitest';
import {
  convertTransferArsToMarketPrice,
  displayCatalogPriceFromLinkArs,
  formatCatalogPriceFromLinkArs,
} from '../pricing';

describe('international pricing', () => {
  it('does not convert Argentina prices', () => {
    expect(convertTransferArsToMarketPrice(100000, 'ar')).toBe(100000);
  });

  it('applies market rate, 15 percent margin, and rounding', () => {
    const price = convertTransferArsToMarketPrice(100000, 'mx', {
      arsToLocalRate: 0.02,
      internationalMarkup: 1.15,
      roundingIncrement: 10,
    });
    expect(price).toBe(2300);
  });

  it('converts a sample transfer price for Chile using 2026-07-10 config', () => {
    const price = convertTransferArsToMarketPrice(115000, 'cl');
    expect(price).toBeGreaterThan(0);
    expect(price % 1000).toBe(0);
  });

  it('converts catalog link prices for international display', () => {
    expect(displayCatalogPriceFromLinkArs(115000, 'ar')).toBe(115000);
    const mx = displayCatalogPriceFromLinkArs(115000, 'mx');
    expect(mx).toBeGreaterThan(0);
    expect(formatCatalogPriceFromLinkArs(115000, 'mx')).toContain('MXN');
  });
});
