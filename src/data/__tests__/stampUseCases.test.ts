import { describe, expect, it } from 'vitest';
import {
  getStampUseCaseBuyHref,
  getStampUseCaseBySlug,
  wizardMaterialOptions,
  wizardStampProcess,
} from '../stampUseCases';
import { hasInternationalEquivalent, isStampUseCaseAvailableInMarket } from '@/lib/markets/catalog';

describe('landings de nicho (chocolate y colmenas)', () => {
  it('compran con el uso equivalente para que el taller los fabrique bien', () => {
    const chocolate = getStampUseCaseBySlug('para-chocolate')!;
    const colmenas = getStampUseCaseBySlug('para-colmenas')!;
    expect(getStampUseCaseBuyHref(chocolate)).toContain('uso=para-lacre');
    expect(getStampUseCaseBuyHref(colmenas)).toContain('uso=para-madera');
    expect(wizardStampProcess('para-lacre', 'otros')).toBe('Lacre');
  });

  it('no aparecen como opciones del generador', () => {
    const slugs = wizardMaterialOptions.map((o) => o.slug);
    expect(slugs).not.toContain('para-chocolate');
    expect(slugs).not.toContain('para-colmenas');
    expect(slugs).toContain('para-lacre');
  });

  it('colmenas (RENAPA) es solo Argentina; chocolate está en todos los países', () => {
    expect(isStampUseCaseAvailableInMarket('para-colmenas', 'ar')).toBe(true);
    expect(isStampUseCaseAvailableInMarket('para-colmenas', 'cl')).toBe(false);
    expect(hasInternationalEquivalent('/sellos/para-colmenas')).toBe(false);
    expect(isStampUseCaseAvailableInMarket('para-chocolate', 'mx')).toBe(true);
  });
});
