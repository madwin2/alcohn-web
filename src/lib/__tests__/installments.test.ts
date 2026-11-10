import { describe, expect, it } from 'vitest';
import { cardPriceArs, installmentAmountArs } from '../installments';

describe('cuotas sin interés', () => {
  it('calcula la cuota sobre el precio con tarjeta (transferencia + 15%)', () => {
    expect(cardPriceArs(76000, 'transfer')).toBe(87400);
    expect(installmentAmountArs(76000, 'transfer')).toBe(29133);
  });

  it('usa el precio tal cual cuando ya es precio con tarjeta', () => {
    expect(cardPriceArs(35000, 'link')).toBe(35000);
    expect(installmentAmountArs(35000, 'link')).toBe(11667);
  });
});
