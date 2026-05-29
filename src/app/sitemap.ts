import type { MetadataRoute } from 'next';
import { products } from '@/data/products';
import { stampUseCases } from '@/data/stampUseCases';
import { standardDesigns } from '@/lib/catalog';
import { SITE_URL } from '@/lib/seo';

const staticRoutes = [
  '/',
  '/productos',
  '/sellos/estandar',
  '/abecedarios',
  '/proceso',
  '/como-usar-sellos',
  '/faq',
  '/casos-reales',
  '/sobre-alcohn',
  '/contacto',
  '/cotizar',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
  }));

  const productEntries = products.map((product) => ({
    url: `${SITE_URL}/productos/${product.slug}`,
    lastModified: now,
  }));

  const useCaseEntries = stampUseCases.map((useCase) => ({
    url: `${SITE_URL}/sellos/${useCase.slug}`,
    lastModified: now,
  }));

  const standardEntries = standardDesigns.map((design) => ({
    url: `${SITE_URL}/sellos/estandar/${design.slug}`,
    lastModified: now,
  }));

  return [...staticEntries, ...productEntries, ...useCaseEntries, ...standardEntries];
}
