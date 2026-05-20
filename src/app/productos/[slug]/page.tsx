import { notFound } from 'next/navigation';
import Link from 'next/link';
import { products, getProductBySlug } from '@/data/products';
import ProductSheet from '@/components/ProductSheet';

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

export async function generateMetadata({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);
  
  if (!product) {
    return {
      title: 'Producto no encontrado - Alcohn',
    };
  }

  return {
    title: `${product.name} - Alcohn`,
    description: product.shortDescription,
  };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="atelier-page min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Back Link editorial */}
        <div className="mb-12">
          <Link
            href="/productos"
            className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 hover:border-[var(--alcohn-bronze)] border-b border-transparent transition-colors"
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
