'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getStandardDesignBySlug } from '@/lib/catalog';
import ActionButton from '@/components/ActionButton';
import PageIntro from '@/components/PageIntro';
import SpecChips from '@/components/SpecChips';
import SizeSelector from '@/components/SizeSelector';
import PurchaseInclusions from '@/components/PurchaseInclusions';
import { useCart } from '@/contexts/CartContext';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function StandardDesignPage({ params }: PageProps) {
  const { addItem } = useCart();
  const design = getStandardDesignBySlug(params.slug);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>(undefined);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!design) {
    return (
      <div className="atelier-page min-h-screen py-16">
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
    setAddedToCart(false);
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
      setAddedToCart(true);
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
    <div className="atelier-page min-h-screen py-8 md:py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label={collectionLabels[design.collection] || design.collection}
          title={design.title}
          description={design.description || 'Elegí medida, agregá al carrito y completá checkout sin esperar una consulta manual.'}
          primaryCta={{
            label: 'Elegir medida',
            href: '#medidas',
          }}
          secondaryCta={{
            label: 'Ver otros diseños',
            href: '/sellos/estandar',
            variant: 'secondary',
          }}
          highlights={[
            'Diseño listo para comprar',
            'Medidas con precio visible',
            'Checkout online y seguimiento',
          ]}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-16 lg:gap-24 mb-12 md:mb-20">
          {/* Image */}
          <div className="material-frame aspect-square relative overflow-hidden">
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
          <div className="space-y-5 md:space-y-8">
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
                <h3 className="craft-label mb-3">
                  DESCRIPCIÓN
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {design.description}
                </p>
              </div>
            )}

            {/* Size Selector */}
            <div id="medidas" className="pt-6 border-t border-[var(--alcohn-line)] space-y-4 scroll-mt-24">
              <div className="atelier-panel p-4">
                <h3 className="craft-label mb-2">
                  Guía rápida de medida
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  30x30mm funciona bien para etiquetas, piezas chicas o marcas simples.
                  40x40mm es la opción recomendada para la mayoría de usos. 50x50mm conviene
                  cuando querés más presencia o mejor lectura en piezas grandes.
                </p>
              </div>
              <SizeSelector
                sizes={availableSizes}
                selectedSize={selectedSize}
                onSelect={handleSizeSelect}
                basePrice={design.startingPrice}
              />
            </div>

            <PurchaseInclusions
              variant="estandar"
              compact
              title="Incluido en este diseño"
            />

            {/* Price */}
            <div className="pt-6 border-t border-[var(--alcohn-line)]">
              <p className="text-lg text-neutral-600">
                {selectedPrice ? (
                  <>
                    <span className="craft-label mr-3">
                      Precio
                    </span>
                    {priceDisplay}
                  </>
                ) : (
                  <>
                    <span className="craft-label mr-3">
                      Desde
                    </span>
                    {priceDisplay}
                  </>
                )}
              </p>
            </div>

            {/* CTA Principal */}
            <div className="pt-6 border-t border-[var(--alcohn-line)]">
              {selectedSize ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto min-h-[44px] border border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[var(--alcohn-ink-soft)] hover:border-[var(--alcohn-bronze)] transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                >
                  Agregar al carrito
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto min-h-[44px] border border-neutral-300 bg-neutral-100 text-neutral-500 px-6 py-3 text-sm font-medium uppercase tracking-wider cursor-not-allowed"
                >
                  Eleg&iacute; una medida para comprar
                </button>
              )}
              {addedToCart && (
                <div className="mt-4 border border-[var(--alcohn-bronze)] bg-[var(--alcohn-paper)] p-4">
                  <p className="text-sm font-medium text-neutral-900">
                    Agregado al carrito. Pod&eacute;s finalizar la compra ahora o seguir mirando dise&ntilde;os.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <ActionButton href="/checkout" variant="primary" className="flex-1">
                      Finalizar compra
                    </ActionButton>
                    <ActionButton href="/sellos/estandar" variant="secondary" className="flex-1">
                      Seguir comprando
                    </ActionButton>
                  </div>
                </div>
              )}
            </div>

            {/* Especificaciones */}
            <div className="pt-6 border-t border-[var(--alcohn-line)] space-y-4">
              <h3 className="craft-label mb-4">
                ESPECIFICACIONES
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="craft-label w-1/3">
                    Material
                  </span>
                  <span className="text-sm text-neutral-900 flex-1">
                    Bronce de alta calidad
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="craft-label w-1/3">
                    Proceso
                  </span>
                  <span className="text-sm text-neutral-900 flex-1">
                    CNC alta precisión
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="craft-label w-1/3">
                    Profundidad
                  </span>
                  <span className="text-sm text-neutral-900 flex-1">
                    1.5mm - 2mm
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="craft-label w-1/3">
                    Uso
                  </span>
                  <span className="text-sm text-neutral-900 flex-1">
                    Cuero y madera
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="craft-label w-1/3">
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
        <div className="border-t border-[var(--alcohn-line)] pt-12">
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

