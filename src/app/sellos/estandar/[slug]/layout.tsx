import type { Metadata } from 'next';
import { getStandardDesignBySlug } from '@/lib/catalog';
import { buildBreadcrumbJsonLd, buildProductJsonLd, createPageMetadata } from '@/lib/seo';

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
  const title = `${design.title} | Sello estándar de bronce | Alcohn`;
  const description =
    design.description ||
    `Sello estándar de bronce "${design.title}". Elegí medida, personalizá y comprá online con envío a todo el país.`;

  return createPageMetadata({
    title,
    description,
    path: canonical,
    image: design.image,
  });
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

  const productJsonLd = buildProductJsonLd({
    name: design.title,
    description,
    path: canonical,
    image: design.image,
    category: 'Sellos estándar de bronce',
    price: design.startingPrice,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Inicio', path: '/' },
    { name: 'Sellos estándar', path: '/sellos/estandar' },
    { name: design.title, path: canonical },
  ]);

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
