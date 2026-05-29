export const SITE_URL = 'https://alcohncnc.com';
export const SITE_NAME = 'Alcohn';
export const DEFAULT_OG_IMAGE = '/og-default.jpg';

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl(DEFAULT_OG_IMAGE),
  description:
    'Sellos de bronce de alta precisión fabricados en CNC para cuero, madera, alimentos y packaging.',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      telephone: '+54-9-223-620-9554',
      areaServed: 'AR',
      availableLanguage: ['es'],
    },
  ],
};

export const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}#localbusiness`,
  name: SITE_NAME,
  url: SITE_URL,
  image: absoluteUrl(DEFAULT_OG_IMAGE),
  telephone: '+54-9-223-620-9554',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Mar del Plata',
    addressCountry: 'AR',
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Mar del Plata',
    },
    {
      '@type': 'Country',
      name: 'Argentina',
    },
  ],
};
