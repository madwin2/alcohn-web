import { describe, expect, it } from 'vitest';
import {
  getGeoRedirectTarget,
  marketFromCountryIso2,
  readMarketPrefCookie,
  resolveGeoRedirectPath,
} from '../geo';

describe('market geo', () => {
  it('maps supported country ISO codes to markets', () => {
    expect(marketFromCountryIso2('MX')).toBe('mx');
    expect(marketFromCountryIso2('CL')).toBe('cl');
    expect(marketFromCountryIso2('PE')).toBe('pe');
    expect(marketFromCountryIso2('CO')).toBe('co');
    expect(marketFromCountryIso2('AR')).toBe('ar');
    expect(marketFromCountryIso2('US')).toBeNull();
  });

  it('redirects international visitors away from Argentina URLs', () => {
    expect(
      getGeoRedirectTarget({
        pathname: '/buy',
        countryIso2: 'MX',
        marketPref: null,
      })
    ).toBe('/mx/buy');

    expect(
      getGeoRedirectTarget({
        pathname: '/productos',
        countryIso2: 'CL',
        marketPref: null,
      })
    ).toBe('/cl/productos');
  });

  it('redirects visitors on the wrong international market', () => {
    expect(
      getGeoRedirectTarget({
        pathname: '/mx/sellos/para-cuero',
        countryIso2: 'CL',
        marketPref: null,
      })
    ).toBe('/cl/sellos/para-cuero');
  });

  it('respects explicit market preference cookie', () => {
    expect(readMarketPrefCookie('alcohn_market_pref=ar; other=1')).toBe('ar');
    expect(
      getGeoRedirectTarget({
        pathname: '/productos',
        countryIso2: 'MX',
        marketPref: 'ar',
      })
    ).toBeNull();
  });

  it('remaps Argentina-only routes to international equivalents', () => {
    expect(resolveGeoRedirectPath('/sellos/estandar', 'mx')).toBe('/mx/productos');
    expect(resolveGeoRedirectPath('/cotizar', 'pe')).toBe('/pe/buy?mode=custom');
    expect(resolveGeoRedirectPath('/productos/sello-personalizado-cuero', 'co')).toBe(
      '/co/sellos/para-cuero'
    );
  });

  it('keeps query string handling to middleware and preserves path when already correct', () => {
    expect(
      getGeoRedirectTarget({
        pathname: '/mx/buy',
        countryIso2: 'MX',
        marketPref: null,
      })
    ).toBeNull();
  });
});
