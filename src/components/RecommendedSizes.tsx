'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RecommendedSize {
  title: string;
  subtitle: string;
  idealFor: string[];
  referenceRange: string;
  price: number;
  badge?: string;
  sizeKey?: string; // 'pequeño', 'medio', 'grande'
}

interface RecommendedSizesProps {
  sizes: RecommendedSize[];
  onSelect?: (index: number) => void;
  onUnsureClick?: () => void;
}

export default function RecommendedSizes({ sizes, onSelect, onUnsureClick }: RecommendedSizesProps) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleCardClick = (index: number, size: RecommendedSize) => {
    setSelectedIndex(index);
    onSelect?.(index);
    
    // Redirigir al flujo de compra con la medida seleccionada
    const sizeKey = size.sizeKey || size.title.toLowerCase();
    router.push(`/buy?size=${sizeKey}&price=${size.price}`);
  };

  const handleUnsureClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUnsureClick?.();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {sizes.map((size, index) => (
        <button
          key={index}
          onClick={() => handleCardClick(index, size)}
          className={`border bg-white p-6 relative text-left transition-all focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 ${
            selectedIndex === index
              ? 'border-neutral-900 border-2'
              : 'border-neutral-300 hover:border-neutral-500'
          }`}
          aria-label={`Seleccionar tamaño ${size.title}`}
        >
          {size.badge && (
            <div className="absolute top-4 right-4">
              <span className="text-[10px] uppercase tracking-wider text-neutral-900 font-medium px-2 py-1 border border-neutral-900 bg-white">
                {size.badge}
              </span>
            </div>
          )}
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
              RECOMENDADO
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-1 tracking-tight">
              {size.title}
            </h3>
            <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-3">
              {size.subtitle}
            </p>
            
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
                Ideal para:
              </p>
              <ul className="space-y-1.5">
                {size.idealFor.map((item, i) => (
                  <li key={i} className="text-sm text-neutral-700 leading-relaxed">
                    · {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[10px] text-neutral-400 font-medium mt-4">
              Referencia: {size.referenceRange}
            </p>
          </div>
          
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-lg text-neutral-900 mb-2">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-2">
                Desde
              </span>
              ${size.price.toLocaleString('es-AR')}
            </p>
            <p className="text-[10px] text-neutral-500 leading-tight mb-1">
              El tamaño final lo definimos con tu logo.
            </p>
            <p className="text-[10px] text-neutral-500 leading-tight">
              Si tu logo es rectangular, hacemos la proporción exacta.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-200">
            <span
              onClick={handleUnsureClick}
              className="text-[10px] text-neutral-500 hover:text-neutral-900 underline transition-colors cursor-pointer"
            >
              No estoy seguro → Elegir por mi logo
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

