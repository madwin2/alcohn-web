import { describe, expect, it } from 'vitest';
import { alternateLanguages, marketAbsoluteUrl, marketSeoTitle } from '../seo';

describe('market seo', () => {
  it('builds absolute URLs per market', () => {
    expect(marketAbsoluteUrl('cl', '/productos')).toBe(
      'https://www.alcohnsellos.com/cl/productos'
    );
    expect(marketAbsoluteUrl('ar', '/productos')).toBe(
      'https://www.alcohnsellos.com/productos'
    );
  });

  it('includes hreflang alternates for all markets', () => {
    const languages = alternateLanguages('/productos');
    expect(languages['es-AR']).toContain('/productos');
    expect(languages['es-CL']).toContain('/cl/productos');
    expect(languages['es-MX']).toContain('/mx/productos');
    expect(languages['x-default']).toContain('/productos');
  });

  it('adds country suffix to international titles', () => {
    expect(marketSeoTitle('Sellos de bronce', 'cl')).toContain('Chile');
    expect(marketSeoTitle('Sellos de bronce', 'ar')).toBe('Sellos de bronce');
  });
});
