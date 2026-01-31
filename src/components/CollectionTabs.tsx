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
    <div className="mb-12 pb-8 border-b border-neutral-300">
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-neutral-600 font-medium">
          COLECCIÓN
        </h2>
      </div>
      
      <div className="flex flex-wrap gap-px bg-neutral-300 p-px">
        {collections.map((collection) => (
          <button
            key={collection}
            onClick={() => onCollectionChange(collection)}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors whitespace-nowrap ${
              selectedCollection === collection
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {collectionLabels[collection]}
          </button>
        ))}
      </div>
    </div>
  );
}



