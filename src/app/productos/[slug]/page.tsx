import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { products, getProductBySlug } from '@/data/products';
import ProductSheet from '@/components/ProductSheet';
import { buildBreadcrumbJsonLd, buildProductJsonLd, createPageMetadata } from '@/lib/seo';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = getProductBySlug(params.slug);
  
  if (!product) {
    return {
      title: 'Producto no encontrado - Alcohn',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical = `/productos/${product.slug}`;

  return createPageMetadata({
    title: product.seoTitle,
    description: product.seoDescription,
    path: canonical,
    image: product.images.default,
  });
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const canonical = `/productos/${product.slug}`;
  const priceValue =
    typeof product.price === 'number' ? product.price : product.price.desde;

  const productJsonLd = buildProductJsonLd({
    name: product.name,
    description: product.shortDescription,
    path: canonical,
    image: product.images.default,
    sku: product.id,
    category: product.category,
    price: priceValue,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/productos' },
    { name: product.name, path: canonical },
  ]);

  return (
    <div className="atelier-page min-h-screen py-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Back Link editorial */}
        <div className="mb-5 md:mb-12">
          <Link
            href="/productos"
            className="inline-flex min-h-[44px] items-center text-sm text-neutral-600 hover:text-neutral-900 hover:border-[var(--alcohn-bronze)] border-b border-transparent transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a productos
          </Link>
        </div>

        {/* Product Sheet */}
        <ProductSheet product={product} />
      </div>
    </div>
  );
}
