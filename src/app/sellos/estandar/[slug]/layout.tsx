import type { Metadata } from 'next';
import { getStandardDesignBySlug } from '@/lib/catalog';
import { SITE_NAME, absoluteUrl } from '@/lib/seo';

type LayoutProps = {
  children: React.ReactNode;
  params: {
    slug: string;
  };
};

export function generateMetadata({ params }: LayoutProps): Metadata {
  const design = getStandardDesignBySlug(params.slug);

  if (!design) {
    return {
      title: 'Diseño estándar no encontrado - Alcohn',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical = `/sellos/estandar/${design.slug}`;
  const description =
    design.description ||
    'Diseño estándar listo para personalizar en bronce. Elegí medida, precio y comprá online.';

  return {
    title: `${design.title} - Sellos estándar | Alcohn`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      url: canonical,
      siteName: SITE_NAME,
      title: `${design.title} - Sellos estándar | Alcohn`,
      description,
      images: [design.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${design.title} - Sellos estándar | Alcohn`,
      description,
      images: [design.image],
    },
  };
}

export default function StandardDesignLayout({ children, params }: LayoutProps) {
  const design = getStandardDesignBySlug(params.slug);

  if (!design) {
    return children;
  }

  const canonical = `/sellos/estandar/${design.slug}`;
  const description =
    design.description ||
    'Diseño estándar listo para personalizar en bronce. Elegí medida, precio y comprá online.';

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: design.title,
    description,
    image: [absoluteUrl(design.image)],
    category: 'Sellos estándar de bronce',
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ARS',
      price: design.startingPrice,
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(canonical),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Sellos estándar',
        item: absoluteUrl('/sellos/estandar'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: design.title,
        item: absoluteUrl(canonical),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
