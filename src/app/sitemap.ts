import type { MetadataRoute } from 'next';
import { accessories } from '@/data/accessories';
import { stampUseCases } from '@/data/stampUseCases';
import { standardDesigns } from '@/lib/catalog';
import { INTERNATIONAL_MARKETS } from '@/lib/markets/config';
import { isStampUseCaseAvailableInMarket } from '@/lib/markets/catalog';
import { marketPath } from '@/lib/markets/paths';
import { SITE_URL } from '@/lib/seo';

const staticRoutes = [
  '/',
  '/productos',
  '/sellos/estandar',
  '/abecedarios',
  '/accesorios',
  '/proceso',
  '/como-usar-sellos',
  '/faq',
  '/casos-reales',
  '/sobre-alcohn',
  '/contacto',
  '/cotizar',
  '/politica-envios',
  '/politica-devoluciones',
  '/terminos',
  '/privacidad',
];

const internationalStaticRoutes = [
  '/',
  '/productos',
  '/abecedarios',
  '/accesorios/mango-de-golpe',
  '/proceso',
  '/como-usar-sellos',
  '/casos-reales',
  '/faq',
  '/sobre-alcohn',
  '/contacto',
  '/buy',
  '/politica-envios',
  '/politica-devoluciones',
  '/terminos',
  '/privacidad',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
  }));

  const useCaseEntries = stampUseCases.map((useCase) => ({
    url: `${SITE_URL}/sellos/${useCase.slug}`,
  }));

  const standardEntries = standardDesigns.map((design) => ({
    url: `${SITE_URL}/sellos/estandar/${design.slug}`,
  }));

  const accessoryEntries = accessories.map((accessory) => ({
    url: `${SITE_URL}/accesorios/${accessory.slug}`,
  }));

  const internationalEntries = INTERNATIONAL_MARKETS.flatMap((market) => {
    const marketRoutes = internationalStaticRoutes.map((route) => ({
      url: `${SITE_URL}${marketPath(market, route)}`,
    }));

    const marketUseCases = stampUseCases
      .filter((useCase) => isStampUseCaseAvailableInMarket(useCase.slug, market))
      .map((useCase) => ({
        url: `${SITE_URL}${marketPath(market, `/sellos/${useCase.slug}`)}`,
      }));

    return [...marketRoutes, ...marketUseCases];
  });

  return [
    ...staticEntries,
    ...useCaseEntries,
    ...standardEntries,
    ...accessoryEntries,
    ...internationalEntries,
  ];
}
