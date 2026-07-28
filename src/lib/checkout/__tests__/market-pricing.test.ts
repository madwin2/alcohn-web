import { describe, expect, it } from 'vitest';
import type { CartItem } from '@/lib/cart';
import { computeMarketCheckoutPricing } from '../pricing';

const item: CartItem = {
  id: 'abecedario-5mm',
  title: 'Abecedario',
  collection: 'Abecedarios',
  material: 'Bronce',
  process: 'CNC',
  variantSize: '5 mm',
  price: 115000,
  qty: 1,
  image: '/images/abecedario/abecedario.webp',
  designSlug: 'abecedario-bronce-completo',
};

describe('market checkout pricing', () => {
  it('keeps Argentina link and transfer subtotals', () => {
    const result = computeMarketCheckoutPricing([item], null, 'ar');
    expect(result.currency).toBe('ARS');
    expect(result.marketSubtotal).toBeGreaterThan(0);
  });

  it('returns local currency market line items outside Argentina', () => {
    const result = computeMarketCheckoutPricing([item], null, 'mx');
    expect(result.currency).toBe('MXN');
    expect(result.marketItems[0].currency).toBe('MXN');
    expect(result.marketItems[0].market).toBe('mx');
    expect(result.marketSubtotal).toBeGreaterThan(0);
  });
});
