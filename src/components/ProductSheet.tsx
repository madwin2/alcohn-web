import Image from 'next/image';
import { Product } from '@/data/products';
import ProductCode from './ProductCode';
import SpecChips from './SpecChips';
import ActionButton from './ActionButton';

interface ProductSheetProps {
  product: Product;
}

// Generar código de producto
function generateProductCode(product: Product): string {
  const prefix = 'ALC';
  const categoryCode = product.category === 'sello' ? 'SEL' : 'ABC';
  const number = String(product.id.split('-').pop() || '001').padStart(3, '0');
  return `${prefix}-${categoryCode}-${number}`;
}

export default function ProductSheet({ product }: ProductSheetProps) {
  const priceDisplay =
    typeof product.price === 'number'
      ? `$${product.price.toLocaleString('es-AR')}`
      : `$${product.price.desde.toLocaleString('es-AR')}`;

  const productCode = generateProductCode(product);
  const materialLabel = product.materials.map(m => m.toUpperCase()).join(' / ');

  // Key specs para el bloque antes de la tabla
  const keySpecs = [
    { label: 'Material', value: product.specs.material },
    { label: 'Proceso', value: product.specs.proceso },
    product.specs.profundidad && { label: 'Profundidad', value: product.specs.profundidad },
    { label: 'Uso', value: product.specs.uso },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  // Spec chips para el header
  const specChips = [
    product.specs.profundidad && { label: 'Prof.', value: product.specs.profundidad },
    { label: 'Ø', value: '30–50mm' },
    { label: 'Material', value: 'Bronce' },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="space-y-20">
      {/* Main Product Info - Sheet Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Images Column */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-white relative overflow-hidden border border-neutral-200">
            {product.images.default ? (
              <Image
                src={product.images.default}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-4">
            {product.images.default && (
              <div className="aspect-square bg-white relative overflow-hidden border border-neutral-200">
                <Image
                  src={product.images.default}
                  alt={`${product.name} - Vista general`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {product.images.onLeather && (
              <div className="aspect-square bg-white relative overflow-hidden border border-neutral-200">
                <Image
                  src={product.images.onLeather}
                  alt={`${product.name} - En cuero`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {product.images.onWood && (
              <div className="aspect-square bg-white relative overflow-hidden border border-neutral-200">
                <Image
                  src={product.images.onWood}
                  alt={`${product.name} - En madera`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Sheet Column */}
        <div className="space-y-8">
          {/* Código + Meta */}
          <div className="space-y-3 pb-6 border-b border-neutral-200">
            <ProductCode code={productCode} />
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
              BRONCE · CNC · USO: {materialLabel}
            </div>
          </div>

          {/* Name */}
          <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900 tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Spec Chips */}
          <SpecChips specs={specChips} />

          {/* Description */}
          <p className="text-lg text-neutral-700 leading-relaxed max-w-lg">
            {product.description}
          </p>

          {/* Key Specs Block */}
          <div className="pt-6 border-t border-neutral-200 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-neutral-600 font-medium mb-4">
              ESPECIFICACIONES CLAVE
            </h3>
            {keySpecs.map((spec, index) => (
              <div key={index} className="flex justify-between items-start">
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium w-1/3">
                  {spec.label}
                </span>
                <span className="text-sm text-neutral-900 flex-1">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="pt-6 border-t border-neutral-200">
            <p className="text-lg text-neutral-600">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-3">Desde</span>
              {priceDisplay}
            </p>
          </div>

          {/* CTAs - Botones industriales */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-neutral-200">
            <ActionButton
              href={`/buy?product=${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="flex-1"
            >
              Iniciar proceso
            </ActionButton>
            <ActionButton
              variant="secondary"
              className="flex-1"
            >
              Descargar ficha PDF
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Specifications Table - Mejorada */}
      <section className="border-t border-neutral-300 pt-16">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-12 tracking-tight">
          Especificaciones
        </h2>
        <div className="max-w-3xl">
          <dl className="divide-y divide-neutral-200">
            <div className="py-6">
              <dt className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
                Material
              </dt>
              <dd className="text-sm text-neutral-900">
                {product.specs.material}
              </dd>
            </div>
            <div className="py-6">
              <dt className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
                Uso
              </dt>
              <dd className="text-sm text-neutral-900">
                {product.specs.uso}
              </dd>
            </div>
            <div className="py-6">
              <dt className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
                Proceso
              </dt>
              <dd className="text-sm text-neutral-900">
                {product.specs.proceso}
              </dd>
            </div>
            {product.specs.profundidad && (
              <div className="py-6">
                <dt className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
                  Profundidad
                </dt>
                <dd className="text-sm text-neutral-900">
                  {product.specs.profundidad}
                </dd>
              </div>
            )}
            {product.specs.tiempoProduccion && (
              <div className="py-6">
                <dt className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
                  Tiempo de producción
                </dt>
                <dd className="text-sm text-neutral-900">
                  {product.specs.tiempoProduccion}
                </dd>
              </div>
            )}
            {product.specs.incluye && product.specs.incluye.length > 0 && (
              <div className="py-6">
                <dt className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
                  Componentes incluidos
                </dt>
                <dd className="text-sm text-neutral-900">
                  <ul className="list-none space-y-1">
                    {product.specs.incluye.map((item, index) => (
                      <li key={index}>· {item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* Technical Diagram - Frame técnico */}
      <section className="border-t border-neutral-300 pt-16">
        <div className="relative">
          <div className="absolute top-0 right-0 px-3 py-1 border-l border-b border-neutral-300 bg-white">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
              DIAGRAMA A
            </span>
          </div>
          <div className="border border-neutral-200 p-16 flex items-center justify-center min-h-[400px] bg-white">
            <div className="text-center text-neutral-400">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-neutral-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm">Diagrama técnico</p>
              <p className="text-xs mt-2 text-neutral-400">Se incluye en PDF</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-neutral-300 pt-16">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-12 tracking-tight">
          Preguntas frecuentes
        </h2>
        <div className="space-y-6 max-w-3xl">
          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between text-neutral-900 font-medium py-4 border-b border-neutral-200 hover:text-neutral-700 transition-colors">
              <span>¿Qué formato de logo necesito para el sello?</span>
              <span className="text-neutral-400 group-open:rotate-180 transition-transform ml-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="pt-4 pb-6 text-neutral-700 text-sm leading-relaxed">
              Aceptamos archivos en formato PNG, JPG o SVG. Para mejores resultados, recomendamos logos vectoriales (SVG) o imágenes de alta resolución (mínimo 300 DPI). El logo debe tener fondo transparente o ser fácilmente recortable.
            </div>
          </details>

          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between text-neutral-900 font-medium py-4 border-b border-neutral-200 hover:text-neutral-700 transition-colors">
              <span>¿Cuánto tiempo tarda la producción?</span>
              <span className="text-neutral-400 group-open:rotate-180 transition-transform ml-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="pt-4 pb-6 text-neutral-700 text-sm leading-relaxed">
              El tiempo de producción varía según el producto. Los sellos personalizados suelen tardar entre 7 y 10 días hábiles, mientras que los abecedarios completos pueden tardar entre 10 y 14 días hábiles. Una vez confirmado el pedido, te enviaremos un seguimiento del proceso.
            </div>
          </details>

          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between text-neutral-900 font-medium py-4 border-b border-neutral-200 hover:text-neutral-700 transition-colors">
              <span>¿Puedo usar el mismo sello para cuero y madera?</span>
              <span className="text-neutral-400 group-open:rotate-180 transition-transform ml-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="pt-4 pb-6 text-neutral-700 text-sm leading-relaxed">
              Sí, nuestros sellos universales están diseñados para funcionar tanto en cuero como en madera. Sin embargo, si tu uso es exclusivo para un material, recomendamos elegir el sello específico para obtener mejores resultados y mayor durabilidad.
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
