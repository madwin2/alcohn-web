'use client';

import { useState } from 'react';
import PageIntro from '@/components/PageIntro';
import CollectionTabs from '@/components/CollectionTabs';
import StandardDesignCard from '@/components/StandardDesignCard';
import SalesCtaBand from '@/components/SalesCtaBand';
import { CollectionType, getStandardDesignsByCollection } from '@/lib/catalog';
import { getStandardStampMinPrice } from '@/lib/pricing';

const standardMinPrice = getStandardStampMinPrice();

export default function SellosEstandarPage() {
  const [selectedCollection, setSelectedCollection] = useState<CollectionType>('todos');
  const filteredDesigns = getStandardDesignsByCollection(selectedCollection);

  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="Compra directa"
          title="Sellos estándar listos para personalizar"
          description="Para quien quiere comprar rápido: elegís el motivo, seleccionás medida, agregás al carrito y completás checkout. Ideal para regalos, series chicas, motivos de oficio o marcas decorativas."
          primaryCta={{
            label: 'Ver diseños',
            href: '#catalogo-estandar',
          }}
          secondaryCta={{
            label: 'Subir mi logo',
            href: '/buy?mode=custom',
            variant: 'secondary',
          }}
          priceFrom={standardMinPrice}
          highlights={[
            'Diseños listos para elegir',
            'Medidas simples con precio visible',
            'Carrito y checkout sin consulta previa',
          ]}
        />

        <section id="catalogo-estandar">
          <CollectionTabs
            selectedCollection={selectedCollection}
            onCollectionChange={setSelectedCollection}
          />

          {filteredDesigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {filteredDesigns.map((design) => (
                <StandardDesignCard key={design.slug} design={design} />
              ))}
            </div>
          ) : (
            <div className="technical-sheet text-center py-24">
              <p className="relative z-10 craft-label">
                No se encontraron diseños en esta colección.
              </p>
            </div>
          )}
        </section>

        <div className="mt-20">
          <SalesCtaBand
            title="¿No encontraste el motivo justo?"
            copy="Si el sello necesita tu logo o una pieza propia, el flujo personalizado te lleva directo a muestra, medida y precio."
            primaryLabel="Subir logo y ver precio"
            primaryHref="/buy?mode=custom"
            secondaryLabel="Ver productos"
            secondaryHref="/productos"
          />
        </div>
      </div>
    </div>
  );
}
