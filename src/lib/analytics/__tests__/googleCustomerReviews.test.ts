import { describe, expect, it } from 'vitest';
import { estimatedDeliveryDate } from '../googleCustomerReviews';

describe('Reseñas de Clientes en Google', () => {
  it('formatea la fecha estimada de entrega como YYYY-MM-DD', () => {
    expect(estimatedDeliveryDate(10, new Date(2026, 10, 7))).toBe('2026-11-17');
    expect(estimatedDeliveryDate(14, new Date(2026, 11, 25))).toBe('2027-01-08');
  });
});
