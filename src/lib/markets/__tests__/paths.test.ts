import { describe, expect, it } from 'vitest';
import { marketFromPathname, marketPath, stripMarketFromPathname } from '../paths';

describe('market paths', () => {
  it('keeps Argentina URLs unchanged', () => {
    expect(marketPath('ar', '/productos')).toBe('/productos');
    expect(marketPath('ar', '/')).toBe('/');
  });

  it('prefixes international URLs', () => {
    expect(marketPath('cl', '/productos')).toBe('/cl/productos');
    expect(marketPath('mx', '/sellos/para-cuero')).toBe('/mx/sellos/para-cuero');
  });

  it('detects market from pathname', () => {
    expect(marketFromPathname('/cl/productos')).toBe('cl');
    expect(marketFromPathname('/productos')).toBe('ar');
    expect(marketFromPathname('/unknown')).toBe('ar');
  });

  it('strips market prefix', () => {
    expect(stripMarketFromPathname('/cl/productos')).toBe('/productos');
    expect(stripMarketFromPathname('/productos')).toBe('/productos');
    expect(stripMarketFromPathname('/cl')).toBe('/');
  });
});
