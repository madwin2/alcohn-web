'use client';

import { useState, useMemo } from 'react';
import { Product, MaterialType, ProductCategory, filterProducts } from '@/data/products';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import SpecStrip from './SpecStrip';
import MobileCarousel from './MobileCarousel';

interface ProductsGridProps {
  products: Product[];
}

export default function ProductsGrid({ products: initialProducts }: ProductsGridProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType | 'todos'>('todos');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'todos'>('todos');
  const [selectedSort, setSelectedSort] = useState<'destacados' | 'menor-precio' | 'mayor-precio'>('destacados');

  const filteredProducts = useMemo(() => {
    let filtered = initialProducts;

    if (selectedCategory !== 'todos') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedMaterial !== 'todos') {
      filtered = filtered.filter((p) => p.materials.includes(selectedMaterial));
    }

    filtered = [...filtered].sort((a, b) => {
      const priceA = typeof a.price === 'number' ? a.price : a.price.desde;
      const priceB = typeof b.price === 'number' ? b.price : b.price.desde;

      switch (selectedSort) {
        case 'menor-precio':
          return priceA - priceB;
        case 'mayor-precio':
          return priceB - priceA;
        case 'destacados':
        default:
          return 0;
      }
    });

    return filtered;
  }, [initialProducts, selectedCategory, selectedMaterial, selectedSort]);

  const materialFilterForCards: MaterialType | 'todos' = selectedMaterial === 'todos' ? 'todos' : selectedMaterial;

  return (
    <div>
      <SpecStrip />
      
      <ProductFilters
        selectedMaterial={selectedMaterial}
        selectedCategory={selectedCategory}
        selectedSort={selectedSort}
        onMaterialChange={setSelectedMaterial}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSelectedSort}
      />

      {filteredProducts.length > 0 ? (
        <MobileCarousel rowClassName="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-16 lg:gap-20" hint="Deslizá productos">
          {filteredProducts.map((product, index) => (
            <div key={product.id} className="mobile-snap-card md:min-w-0">
              <ProductCard
                product={product}
                materialFilter={materialFilterForCards}
                index={index}
              />
            </div>
          ))}
        </MobileCarousel>
      ) : (
        <div className="text-center py-24 border-t border-neutral-300 pt-24">
          <p className="text-sm uppercase tracking-wider text-neutral-500">
            No se encontraron productos con los filtros seleccionados.
          </p>
        </div>
      )}
    </div>
  );
}
