import type { Metadata } from 'next';

export const SITE_URL = 'https://alcohnsellos.com';
export const SITE_NAME = 'Alcohn';
export const DEFAULT_OG_IMAGE = '/og-default.jpg';

/** Title y description por defecto (home + layout fallback). */
export const SITE_DEFAULT_TITLE =
  'Sellos de bronce CNC | Logo a sello en 72hs | Alcohn';
export const SITE_DEFAULT_DESCRIPTION =
  'Comprá sellos de bronce personalizados con tu logo. Fabricación CNC en 72hs hábiles. Cuero, madera, pan y packaging. Envío a todo Argentina.';

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  robots?: Metadata['robots'];
};

/** Metadata on-page consistente (title, description, canonical, OG, Twitter). */
export function createPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  robots,
}: PageMetadataOptions): Metadata {
  const ogImages =
    image === DEFAULT_OG_IMAGE
      ? [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title,
          },
        ]
      : [image];

  return {
    title,
    description,
    ...(robots ? { robots } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      url: path,
      siteName: SITE_NAME,
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

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

export const ORGANIZATION_ID = `${SITE_URL}#organization`;
export const LOCAL_BUSINESS_ID = `${SITE_URL}#localbusiness`;

export const SITE_SOCIAL = {
  instagram: 'https://www.instagram.com/alcohn.cnc/',
} as const;

const organizationNode = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: absoluteUrl(DEFAULT_OG_IMAGE),
  },
  image: absoluteUrl(DEFAULT_OG_IMAGE),
  description:
    'Sellos de bronce de alta precisión fabricados en CNC para cuero, madera, alimentos y packaging.',
  sameAs: [SITE_SOCIAL.instagram],
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

const localBusinessNode = {
  '@type': 'LocalBusiness',
  '@id': LOCAL_BUSINESS_ID,
  name: SITE_NAME,
  url: SITE_URL,
  image: absoluteUrl(DEFAULT_OG_IMAGE),
  telephone: '+54-9-223-620-9554',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Alberti y Martín Miguel de Güemes',
    postalCode: '7600',
    addressLocality: 'Mar del Plata',
    addressRegion: 'Provincia de Buenos Aires',
    addressCountry: 'AR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -38.0055,
    longitude: -57.5426,
  },
  areaServed: [
    { '@type': 'City', name: 'Mar del Plata' },
    { '@type': 'Country', name: 'Argentina' },
  ],
  parentOrganization: { '@id': ORGANIZATION_ID },
};

/** Organization + LocalBusiness en todas las páginas (layout raíz). */
export function buildGlobalSchemaGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationNode, localBusinessNode],
  };
};

/** @deprecated Usar buildGlobalSchemaGraph — se mantiene por compatibilidad puntual. */
export const organizationJsonLd = {
  '@context': 'https://schema.org',
  ...organizationNode,
};

/** @deprecated Usar buildGlobalSchemaGraph — se mantiene por compatibilidad puntual. */
export const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  ...localBusinessNode,
};

export type ProductJsonLdInput = {
  name: string;
  description: string;
  path: string;
  image: string | string[];
  sku?: string;
  category?: string;
  price?: number;
  additionalProperty?: Array<{ name: string; value: string }>;
};

export function buildProductJsonLd(input: ProductJsonLdInput) {
  const images = (Array.isArray(input.image) ? input.image : [input.image]).map((src) =>
    src.startsWith('http') ? src : absoluteUrl(src)
  );

  const product: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    image: images,
    url: absoluteUrl(input.path),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
  };

  if (input.sku) product.sku = input.sku;
  if (input.category) product.category = input.category;

  if (input.additionalProperty?.length) {
    product.additionalProperty = input.additionalProperty.map((prop) => ({
      '@type': 'PropertyValue',
      name: prop.name,
      value: prop.value,
    }));
  }

  if (input.price != null) {
    product.offers = {
      '@type': 'Offer',
      priceCurrency: 'ARS',
      price: input.price,
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(input.path),
      seller: { '@id': ORGANIZATION_ID },
    };
  }

  return product;
}

export type ReviewJsonLdInput = {
  authorName: string;
  reviewBody: string;
};

/** Reseñas visibles en /casos-reales (origen Google Business Profile). */
export function buildGoogleReviewsSchemaGraph(reviews: ReviewJsonLdInput[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { ...localBusinessNode },
      ...reviews.map((review, index) => ({
        '@type': 'Review',
        '@id': `${SITE_URL}/casos-reales#review-${index + 1}`,
        itemReviewed: { '@id': LOCAL_BUSINESS_ID },
        author: {
          '@type': 'Person',
          name: review.authorName,
        },
        reviewBody: review.reviewBody,
        publisher: {
          '@type': 'Organization',
          name: 'Google',
        },
      })),
    ],
  };
}
