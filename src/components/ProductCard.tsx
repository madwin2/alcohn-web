import Link from 'next/link';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border border-secondary-dark rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-secondary flex items-center justify-center">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-400 text-center p-8">
            <p className="text-sm">Imagen del sello</p>
            {/* TODO: Agregar imagen real cuando esté disponible */}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4 text-sm">{product.description}</p>
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Medidas más usadas:</p>
          <p className="text-sm font-medium">{product.commonSizes.join(', ')}</p>
        </div>
        <div className="mb-4">
          <p className="text-2xl font-bold">Desde ${product.priceFrom.toLocaleString('es-AR')}</p>
        </div>
        <Link
          href={`/cotizar?tipo=${product.id}`}
          className="block w-full bg-accent text-primary text-center py-3 rounded-md font-semibold hover:bg-accent-light transition-colors"
        >
          Quiero este sello con mi logo
        </Link>
      </div>
    </div>
  );
}

