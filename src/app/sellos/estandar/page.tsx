'use client';

import { useState } from 'react';
import SectionHeader from '@/components/SectionHeader';
import CollectionTabs from '@/components/CollectionTabs';
import StandardDesignCard from '@/components/StandardDesignCard';
import { CollectionType, getStandardDesignsByCollection } from '@/lib/catalog';

export default function SellosEstandarPage() {
  const [selectedCollection, setSelectedCollection] = useState<CollectionType>('todos');
  
  const filteredDesigns = getStandardDesignsByCollection(selectedCollection);

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <SectionHeader
            title="Sellos estándar"
            subtitle="Diseños listos para usar. Elegí un diseño y personalizamos la medida."
            align="left"
          />
        </div>

        {/* Filtros por colección */}
        <CollectionTabs
          selectedCollection={selectedCollection}
          onCollectionChange={setSelectedCollection}
        />

        {/* Grid de diseños */}
        {filteredDesigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {filteredDesigns.map((design) => (
              <StandardDesignCard key={design.slug} design={design} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-t border-neutral-300 pt-24">
            <p className="text-sm uppercase tracking-wider text-neutral-500">
              No se encontraron diseños en esta colección.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

