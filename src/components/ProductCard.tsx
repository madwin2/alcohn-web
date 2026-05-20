import Image from 'next/image';
import { Product, MaterialType } from '@/data/products';
import ProductCode from './ProductCode';
import SpecChips from './SpecChips';
import ActionButton from './ActionButton';

interface ProductCardProps {
  product: Product;
  materialFilter?: MaterialType | 'todos';
  index?: number;
}

// Generar código de producto
function generateProductCode(product: Product, index: number): string {
  const prefix = 'ALC';
  const categoryCode = product.category === 'sello' ? 'SEL' : 'ABC';
  const number = String(index + 1).padStart(3, '0');
  return `${prefix}-${categoryCode}-${number}`;
}

export default function ProductCard({ product, materialFilter = 'todos', index = 0 }: ProductCardProps) {
  
  const getImageSrc = () => {
    if (materialFilter === 'cuero' && product.images.onLeather) {
      return product.images.onLeather;
    }
    if (materialFilter === 'madera' && product.images.onWood) {
      return product.images.onWood;
    }
    return product.images.default;
  };

  const priceDisplay =
    typeof product.price === 'number'
      ? `$${product.price.toLocaleString('es-AR')}`
      : `$${product.price.desde.toLocaleString('es-AR')}`;

  const materialLabel = product.materials.map(m => m.toUpperCase()).join(' / ');
  const productCode = generateProductCode(product, index);

  // Spec chips basados en specs del producto
  const specChips = [
    product.specs.profundidad && { label: 'Prof.', value: product.specs.profundidad },
    { label: 'Ø', value: '30–50mm' },
    { label: 'Material', value: 'Bronce' },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <article className="group material-card">
      {/* Imagen más grande */}
      <div className="p-3 pb-0 md:p-4 md:pb-0">
        <div className="material-frame aspect-[3/2] relative overflow-hidden">
          {getImageSrc() ? (
            <Image
              src={getImageSrc()}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Contenido con líneas separadoras */}
      <div className="space-y-4 p-5 md:p-6">
        {/* Código + Meta */}
        <div className="space-y-2 pb-4 border-b border-[var(--alcohn-line)]">
          <ProductCode code={productCode} />
          <div className="craft-label">
            BRONCE · CNC · USO: {materialLabel}
          </div>
        </div>

        {/* Nombre */}
        <h3 className="text-xl font-semibold text-neutral-900 tracking-tight leading-tight">
          {product.name}
        </h3>

        {/* Spec Chips */}
        <SpecChips specs={specChips} />

        {/* Uso / Aplicación */}
        <p className="text-sm text-neutral-600 leading-relaxed">
          {product.shortDescription}
        </p>

        {/* Separador */}
        <div className="border-t border-[var(--alcohn-line)] pt-4">
          {/* Precio */}
          <div className="mb-4">
            <p className="text-sm text-neutral-600">
              <span className="craft-label mr-2">Desde</span>
              {priceDisplay}
            </p>
          </div>

          {/* CTAs - Botones industriales */}
          <div className="flex flex-col sm:flex-row gap-2">
            <ActionButton
              href={`/productos/${product.slug}`}
              variant="secondary"
              className="flex-1"
            >
              Ver ficha
            </ActionButton>
            <ActionButton
              href={`/buy?product=${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="flex-1"
            >
              Iniciar compra
            </ActionButton>
          </div>
        </div>
      </div>
    </article>
  );
}
