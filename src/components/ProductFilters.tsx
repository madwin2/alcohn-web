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
    <div className="mb-16 pb-8 border-t border-b border-[var(--alcohn-line)] pt-8">
      {/* Título de módulo */}
      <div className="mb-6">
        <h2 className="craft-label">
          CONFIGURAR VISTA
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-end">
        {/* Material Filter */}
        <div>
          <label className="block craft-label mb-3">
            Qué querés marcar
          </label>
          <div className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2">
            {(['todos', 'cuero', 'madera', 'ambos'] as const).map((material) => (
              <button
                key={material}
                onClick={() => onMaterialChange(material)}
                className={`min-h-[40px] px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-colors whitespace-nowrap border ${
                  selectedMaterial === material
                    ? 'bg-[var(--alcohn-ink)] text-white border-[var(--alcohn-ink)]'
                    : 'bg-[var(--alcohn-surface)] text-neutral-700 border-[var(--alcohn-line)] hover:border-[var(--alcohn-bronze)] hover:bg-white'
                }`}
              >
                {material === 'todos' ? 'Todos' : material}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block craft-label mb-3">
            Categoría
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as ProductCategory | 'todos')}
            className="w-full min-h-[40px] px-3 py-2 text-xs uppercase tracking-wider border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] text-neutral-700 font-semibold focus:outline-none focus:border-[var(--alcohn-bronze)] transition-colors"
          >
            <option value="todos">Todos</option>
            <option value="sello">Sellos</option>
            <option value="abecedario">Abecedarios</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="block craft-label mb-3">
            Ordenar por
          </label>
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value as typeof selectedSort)}
            className="w-full min-h-[40px] px-3 py-2 text-xs uppercase tracking-wider border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] text-neutral-700 font-semibold focus:outline-none focus:border-[var(--alcohn-bronze)] transition-colors"
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
