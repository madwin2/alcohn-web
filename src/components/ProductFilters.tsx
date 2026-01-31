'use client';

import { MaterialType, ProductCategory } from '@/data/products';

interface ProductFiltersProps {
  selectedMaterial: MaterialType | 'todos';
  selectedCategory: ProductCategory | 'todos';
  selectedSort: 'destacados' | 'menor-precio' | 'mayor-precio';
  onMaterialChange: (material: MaterialType | 'todos') => void;
  onCategoryChange: (category: ProductCategory | 'todos') => void;
  onSortChange: (sort: 'destacados' | 'menor-precio' | 'mayor-precio') => void;
}

export default function ProductFilters({
  selectedMaterial,
  selectedCategory,
  selectedSort,
  onMaterialChange,
  onCategoryChange,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div className="mb-16 pb-8 border-t border-b border-neutral-300 pt-8">
      {/* Título de módulo */}
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-neutral-600 font-medium">
          CONFIGURAR VISTA
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-end">
        {/* Material Filter */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-3">
            Qué querés marcar
          </label>
          <div className="grid w-full grid-cols-2 sm:grid-cols-4 gap-px bg-neutral-300 p-px">
            {(['todos', 'cuero', 'madera', 'ambos'] as const).map((material) => (
              <button
                key={material}
                onClick={() => onMaterialChange(material)}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors whitespace-nowrap ${
                  selectedMaterial === material
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {material === 'todos' ? 'Todos' : material}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-3">
            Categoría
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as ProductCategory | 'todos')}
            className="w-full px-3 py-2 text-xs uppercase tracking-wider border border-neutral-300 bg-white text-neutral-700 font-medium focus:outline-none focus:border-neutral-900 transition-colors"
          >
            <option value="todos">Todos</option>
            <option value="sello">Sellos</option>
            <option value="abecedario">Abecedarios</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-3">
            Ordenar por
          </label>
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value as typeof selectedSort)}
            className="w-full px-3 py-2 text-xs uppercase tracking-wider border border-neutral-300 bg-white text-neutral-700 font-medium focus:outline-none focus:border-neutral-900 transition-colors"
          >
            <option value="destacados">Destacados</option>
            <option value="menor-precio">Menor precio</option>
            <option value="mayor-precio">Mayor precio</option>
          </select>
        </div>
      </div>
    </div>
  );
}
