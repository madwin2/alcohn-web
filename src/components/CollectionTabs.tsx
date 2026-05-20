'use client';

import { CollectionType } from '@/lib/catalog';

interface CollectionTabsProps {
  selectedCollection: CollectionType;
  onCollectionChange: (collection: CollectionType) => void;
}

const collectionLabels: Record<CollectionType, string> = {
  todos: 'Todos',
  futbol: 'Fútbol',
  argentina: 'Argentina',
  cuero: 'Cuero',
  madera: 'Madera',
  oficios: 'Oficios',
};

export default function CollectionTabs({
  selectedCollection,
  onCollectionChange,
}: CollectionTabsProps) {
  const collections: CollectionType[] = ['todos', 'futbol', 'argentina', 'cuero', 'madera', 'oficios'];

  return (
    <div className="mb-12 pb-8 border-b border-[var(--alcohn-line)]">
      <div className="mb-6">
        <h2 className="craft-label">
          COLECCIÓN
        </h2>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {collections.map((collection) => (
          <button
            key={collection}
            onClick={() => onCollectionChange(collection)}
            className={`min-h-[40px] px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-colors whitespace-nowrap border ${
              selectedCollection === collection
                ? 'bg-[var(--alcohn-ink)] text-white border-[var(--alcohn-ink)]'
                : 'bg-[var(--alcohn-surface)] text-neutral-700 border-[var(--alcohn-line)] hover:border-[var(--alcohn-bronze)] hover:bg-white'
            }`}
          >
            {collectionLabels[collection]}
          </button>
        ))}
      </div>
    </div>
  );
}



