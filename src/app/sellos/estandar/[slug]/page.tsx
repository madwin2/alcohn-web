'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getStandardDesignBySlug } from '@/lib/catalog';
import SectionHeader from '@/components/SectionHeader';
import ActionButton from '@/components/ActionButton';
import SpecChips from '@/components/SpecChips';
import SizeSelector from '@/components/SizeSelector';
import { useCart } from '@/contexts/CartContext';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function StandardDesignPage({ params }: PageProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const design = getStandardDesignBySlug(params.slug);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>(undefined);

  if (!design) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl text-center">
          <p className="text-neutral-600">Diseño no encontrado</p>
        </div>
      </div>
    );
  }

  // Definir medidas disponibles basadas en el precio base
  const availableSizes = [
    { size: '30x30mm', price: design.startingPrice },
    { size: '40x40mm', price: Math.round(design.startingPrice * 1.25) },
    { size: '50x50mm', price: Math.round(design.startingPrice * 1.5) },
  ];

  const handleSizeSelect = (size: string, price: number) => {
    setSelectedSize(size);
    setSelectedPrice(price);
  };

  const handleAddToCart = () => {
    if (selectedSize && selectedPrice) {
      const collectionLabels: Record<string, string> = {
        futbol: 'Fútbol',
        argentina: 'Argentina',
        cuero: 'Cuero',
        madera: 'Madera',
        oficios: 'Oficios',
      };

      addItem({
        title: design.title,
        collection: collectionLabels[design.collection] || design.collection,
        material: 'Bronce',
        process: 'CNC',
        variantSize: selectedSize,
        price: selectedPrice,
        image: design.image,
        designSlug: design.slug,
      });

      // Resetear selección después de agregar
      setSelectedSize(undefined);
      setSelectedPrice(undefined);
    }
  };

  const priceDisplay = selectedPrice
    ? `$${selectedPrice.toLocaleString('es-AR')}`
    : `Desde $${design.startingPrice.toLocaleString('es-AR')}`;

  const collectionLabels: Record<string, string> = {
    futbol: 'Fútbol',
    argentina: 'Argentina',
    cuero: 'Cuero',
    madera: 'Madera',
    oficios: 'Oficios',
  };

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-4">
            {collectionLabels[design.collection] || design.collection}
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-4 tracking-tight">
            {design.title}
          </h1>
          {design.description && (
            <p className="text-base text-neutral-700 max-w-2xl leading-relaxed">
              {design.description}
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-20">
          {/* Image */}
          <div className="aspect-square bg-neutral-50 relative overflow-hidden border border-neutral-200">
            {design.image ? (
              <Image
                src={design.image}
                alt={design.title}
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

          {/* Details */}
          <div className="space-y-8">
            {/* Spec Chips */}
            <SpecChips
              specs={[
                { label: 'Colección', value: collectionLabels[design.collection] || design.collection },
                { label: 'Material', value: 'Bronce' },
                { label: 'Proceso', value: 'CNC' },
              ]}
            />

            {/* Description */}
            {design.description && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-neutral-600 font-medium mb-3">
                  DESCRIPCIÓN
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {design.description}
                </p>
              </div>
            )}

            {/* Size Selector */}
            <div className="pt-6 border-t border-neutral-200">
              <SizeSelector
                sizes={availableSizes}
                selectedSize={selectedSize}
                onSelect={handleSizeSelect}
                basePrice={design.startingPrice}
              />
            </div>

            {/* Price */}
            <div className="pt-6 border-t border-neutral-200">
              <p className="text-lg text-neutral-600">
                {selectedPrice ? (
                  <>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-3">
                      Precio
                    </span>
                    {priceDisplay}
                  </>
                ) : (
                  <>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-3">
                      Desde
                    </span>
                    {priceDisplay}
                  </>
                )}
              </p>
            </div>

            {/* CTA Principal */}
            <div className="pt-6 border-t border-neutral-200">
              {selectedSize ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto border border-neutral-900 bg-neutral-900 text-white px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                >
                  Agregar al carrito
                </button>
              ) : (
                <ActionButton
                  href={`/buy?mode=standard&design=${design.slug}`}
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  Elegir medida
                </ActionButton>
              )}
            </div>

            {/* Especificaciones */}
            <div className="pt-6 border-t border-neutral-200 space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-neutral-600 font-medium mb-4">
                ESPECIFICACIONES
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium w-1/3">
                    Material
                  </span>
                  <span className="text-sm text-neutral-900 flex-1">
                    Bronce de alta calidad
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium w-1/3">
                    Proceso
                  </span>
                  <span className="text-sm text-neutral-900 flex-1">
                    CNC alta precisión
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium w-1/3">
                    Profundidad
                  </span>
                  <span className="text-sm text-neutral-900 flex-1">
                    1.5mm - 2mm
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium w-1/3">
                    Uso
                  </span>
                  <span className="text-sm text-neutral-900 flex-1">
                    Cuero y madera
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium w-1/3">
                    Tiempo
                  </span>
                  <span className="text-sm text-neutral-900 flex-1">
                    7-10 días hábiles
                  </span>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Volver a colección */}
        <div className="border-t border-neutral-300 pt-12">
          <ActionButton
            href="/sellos/estandar"
            variant="ghost"
          >
            ← Ver todos los diseños estándar
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

