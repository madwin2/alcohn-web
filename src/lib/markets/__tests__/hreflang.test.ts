import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { hasInternationalEquivalent } from '../catalog';
import { createPageMetadata } from '../../seo';

const MARKET_APP_DIR = path.resolve(__dirname, '../../../app/[market]');

/** Rutas estáticas (sin segmentos dinámicos) que tienen page.tsx dentro de app/[market]. */
function staticMarketRoutes(dir = MARKET_APP_DIR, prefix = ''): string[] {
  const routes: string[] = [];
  if (fs.existsSync(path.join(dir, 'page.tsx'))) routes.push(prefix || '/');
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('[')) continue;
    routes.push(...staticMarketRoutes(path.join(dir, entry.name), `${prefix}/${entry.name}`));
  }
  return routes;
}

// Páginas transaccionales: existen en /[market] pero no se indexan ni llevan hreflang.
const NON_SEO_ROUTES = ['/buy', '/carrito', '/checkout'];

describe('hreflang desde páginas argentinas', () => {
  it('cubre todas las páginas estáticas que existen en /[market]', () => {
    const routes = staticMarketRoutes().filter(
      (route) => !NON_SEO_ROUTES.some((skip) => route === skip || route.startsWith(`${skip}/`))
    );
    expect(routes.length).toBeGreaterThan(5);
    for (const route of routes) {
      expect(hasInternationalEquivalent(route), route).toBe(true);
    }
  });

  it('incluye landings /sellos/para-* y el mango de golpe, no el resto', () => {
    expect(hasInternationalEquivalent('/sellos/para-cuero')).toBe(true);
    expect(hasInternationalEquivalent('/accesorios/mango-de-golpe')).toBe(true);
    expect(hasInternationalEquivalent('/sellos/estandar')).toBe(false);
    expect(hasInternationalEquivalent('/accesorios/calentador-electrico')).toBe(false);
    expect(hasInternationalEquivalent('/productos/sello-personalizado-cuero')).toBe(false);
  });

  it('la página AR de cuero declara hreflang a Colombia y al resto', () => {
    const meta = createPageMetadata({ title: 't', description: 'd', path: '/sellos/para-cuero' });
    const languages = meta.alternates?.languages as Record<string, string>;
    expect(languages['es-CO']).toBe('https://www.alcohnsellos.com/co/sellos/para-cuero');
    expect(languages['es-AR']).toBe('https://www.alcohnsellos.com/sellos/para-cuero');
    expect(languages['x-default']).toBe('https://www.alcohnsellos.com/sellos/para-cuero');
    expect(meta.alternates?.canonical).toBe('/sellos/para-cuero');
  });

  it('las páginas solo argentinas no declaran hreflang', () => {
    const meta = createPageMetadata({ title: 't', description: 'd', path: '/sellos/estandar' });
    expect(meta.alternates?.languages).toBeUndefined();
  });
});
