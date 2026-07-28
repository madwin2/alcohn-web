import { describe, expect, it } from 'vitest';
import { formatMarketMoney, roundToIncrement } from '../money';

describe('market money', () => {
  it('rounds to configured increments', () => {
    expect(roundToIncrement(1234, 100)).toBe(1200);
    expect(roundToIncrement(1499, 1000)).toBe(1000);
    expect(roundToIncrement(1500, 1000)).toBe(2000);
  });

  it('formats local currency', () => {
    expect(formatMarketMoney(125000, 'cl')).toContain('$');
    expect(formatMarketMoney(125.5, 'pe')).toContain('S/');
    expect(formatMarketMoney(1250, 'mx')).toContain('$');
  });
});
