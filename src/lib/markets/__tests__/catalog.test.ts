import { describe, expect, it } from 'vitest';
import {
  isAccessoryAvailableInMarket,
  isProductSlugAvailableInMarket,
  isStampUseCaseAvailableInMarket,
} from '../catalog';

describe('market catalog', () => {
  it('keeps all current products available in Argentina', () => {
    expect(isProductSlugAvailableInMarket('sello-personalizado-cuero', 'ar')).toBe(true);
    expect(isAccessoryAvailableInMarket('calentador-electrico', 'ar')).toBe(true);
  });

  it('allows only international catalog products outside Argentina', () => {
    expect(isProductSlugAvailableInMarket('sello-personalizado-cuero', 'cl')).toBe(true);
    expect(isProductSlugAvailableInMarket('abecedario-bronce-completo', 'mx')).toBe(true);
    expect(isAccessoryAvailableInMarket('mango-de-golpe', 'co')).toBe(true);
    expect(isAccessoryAvailableInMarket('calentador-electrico', 'co')).toBe(false);
    expect(isAccessoryAvailableInMarket('base-aluminio-remachadora', 'pe')).toBe(false);
  });

  it('allows all stamp use-case landing pages internationally', () => {
    expect(isStampUseCaseAvailableInMarket('para-cuero', 'cl')).toBe(true);
    expect(isStampUseCaseAvailableInMarket('para-madera', 'mx')).toBe(true);
  });
});
