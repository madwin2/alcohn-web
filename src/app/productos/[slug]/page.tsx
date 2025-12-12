import { notFound } from 'next/navigation';
import Link from 'next/link';
import { products } from '@/data/products';

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
  const product = products.find((p) => p.slug === params.slug);
  
  if (!product) {
    return {
      title: 'Producto no encontrado - Alcohn',
    };
  }

  return {
    title: `${product.name} - Alcohn`,
    description: product.description,
  };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <p className="text-gray-400">
                  {/* TODO: Agregar imagen real cuando esté disponible */}
                  Imagen del sello
                </p>
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-lg text-gray-700 mb-6">{product.description}</p>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Medidas más usadas</h2>
                <ul className="space-y-2">
                  {product.commonSizes.map((size, index) => (
                    <li key={index} className="text-gray-700">
                      • {size}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-bold">Desde ${product.priceFrom.toLocaleString('es-AR')}</p>
                <p className="text-sm text-gray-500 mt-1">Precio puede variar según medida y complejidad</p>
              </div>

              <Link
                href={`/cotizar?tipo=${product.id}`}
                className="block w-full bg-accent text-primary px-8 py-4 rounded-md font-semibold text-center hover:bg-accent-light transition-colors mb-4"
              >
                Quiero este sello con mi logo
              </Link>

              <Link
                href="/productos"
                className="block w-full text-center text-gray-600 hover:text-primary"
              >
                ← Volver a productos
              </Link>
            </div>
          </div>

          <section className="bg-secondary rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Información adicional</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Material:</strong> {product.material}
              </p>
              <p>
                Todos nuestros sellos son fabricados en bronce con precisión CNC. El precio puede
                variar según la medida final y la complejidad del diseño.
              </p>
              <p>
                Una vez que subas tu logo en la página de cotización, te sugeriremos las medidas
                más adecuadas basadas en las proporciones de tu diseño.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

