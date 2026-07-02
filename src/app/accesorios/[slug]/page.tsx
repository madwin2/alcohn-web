import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AccessoryProductPage from '@/components/accesorios/AccessoryProductPage';
import { accessories, getAccessoryBySlug } from '@/data/accessories';
import { buildBreadcrumbJsonLd, buildProductJsonLd, createPageMetadata } from '@/lib/seo';

interface AccessoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return accessories.map((accessory) => ({
    slug: accessory.slug,
  }));
}

export async function generateMetadata({ params }: AccessoryPageProps): Promise<Metadata> {
  const accessory = getAccessoryBySlug(params.slug);

  if (!accessory) {
    return {
      title: 'Accesorio no encontrado - Alcohn',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical = `/accesorios/${accessory.slug}`;

  return createPageMetadata({
    title: accessory.seoTitle ?? `${accessory.title} | Alcohn`,
    description: accessory.seoDescription ?? accessory.description,
    path: canonical,
    image: accessory.image,
  });
}

export default function AccessoryDetailPage({ params }: AccessoryPageProps) {
  const accessory = getAccessoryBySlug(params.slug);

  if (!accessory) {
    notFound();
  }

  const canonical = `/accesorios/${accessory.slug}`;
  const priceValue = accessory.variants?.[0]?.linkPrice ?? accessory.price;

  const productJsonLd = buildProductJsonLd({
    name: accessory.title,
    description: accessory.description,
    path: canonical,
    image: accessory.image,
    sku: accessory.code,
    category: 'Accesorios',
    price: priceValue,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Inicio', path: '/' },
    { name: 'Accesorios', path: '/accesorios' },
    { name: accessory.title, path: canonical },
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
      <AccessoryProductPage accessory={accessory} />
    </>
  );
}
