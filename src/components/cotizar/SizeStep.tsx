'use client';

import { SizeOption } from '@/types';

interface SizeStepProps {
  sizes: SizeOption[];
  selected: string | null;
  onSelect: (size: string) => void;
}

export default function SizeStep({ sizes, selected, onSelect }: SizeStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">3. Elegí una medida sugerida</h3>
      <p className="text-sm text-gray-600 mb-4">
        Basado en las proporciones de tu logo, te sugerimos estas medidas:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sizes.map((size) => (
          <button
            key={size.size}
            onClick={() => onSelect(size.size)}
            className={`p-6 border-2 rounded-lg text-center transition-all ${
              selected === size.size
                ? 'border-accent bg-accent/10'
                : 'border-secondary-dark hover:border-accent'
            }`}
          >
            <div className="text-2xl font-bold mb-2">{size.size}</div>
            <div className="text-lg font-semibold text-gray-700">
              ${size.price.toLocaleString('es-AR')}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}





