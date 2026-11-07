import { describe, expect, it } from 'vitest';
import {
  alternateLanguages,
  marketAbsoluteUrl,
  marketProductDescription,
  marketSeoDescription,
  marketSeoTitle,
} from '../seo';

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

  it('quita "Alcohn Argentina" y no duplica el país en títulos internacionales', () => {
    expect(marketSeoTitle('Sello para cuero | Alcohn Argentina', 'co')).toBe(
      'Sello para cuero | Alcohn | Envío DHL a Colombia'
    );
    expect(marketSeoTitle('Envíos DHL a Colombia | Alcohn', 'co')).toBe('Envíos DHL a Colombia | Alcohn');
    expect(marketSeoTitle('Sello | Alcohn Argentina', 'ar')).toBe('Sello | Alcohn Argentina');
  });

  it('saca las promesas de envío nacional en descripciones internacionales', () => {
    const cases: Array<[string, string]> = [
      ['Marroquinería con marca CNC. Envío a todo Argentina.', 'Marroquinería con marca CNC.'],
      ['Marcá madera. Fabricación en Argentina, envío a todo el país.', 'Marca madera. Fabricación en Argentina.'],
      ['Marcá cubos con tu logo. Envío a todo el país.', 'Marca cubos con tu logo.'],
      ['Marcá masas. Fabricación CNC, envío nacional.', 'Marca masas. Fabricación CNC.'],
    ];
    for (const [input, expected] of cases) {
      expect(marketProductDescription(input, 'pe')).toBe(expected);
      expect(marketSeoDescription(input, 'pe')).toBe(`${expected} Envío internacional DHL a Perú.`);
    }
  });

  it('no repite el envío DHL en descripciones internacionales', () => {
    expect(marketSeoDescription('CNC propia. Envío internacional DHL.', 'mx')).toBe(
      'CNC propia. Envío internacional DHL a México.'
    );
    expect(marketSeoDescription('Envío DHL desde Argentina a Chile, plazos.', 'cl')).toBe(
      'Envío DHL desde Argentina a Chile, plazos.'
    );
    expect(marketSeoDescription('Envío a todo Argentina.', 'ar')).toBe('Envío a todo Argentina.');
  });
});
