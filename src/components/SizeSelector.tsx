'use client';

interface SizeOption {
  size: string;
  price: number;
}

interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedSize?: string;
  onSelect: (size: string, price: number) => void;
  basePrice: number;
}

export default function SizeSelector({ sizes, selectedSize, onSelect, basePrice }: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-neutral-600 font-medium mb-3">
        MEDIDAS DISPONIBLES
      </h3>
      <div className="flex flex-wrap gap-2">
        {sizes.map((sizeOption) => {
          const isSelected = selectedSize === sizeOption.size;
          return (
            <button
              key={sizeOption.size}
              onClick={() => onSelect(sizeOption.size, sizeOption.price)}
              className={`inline-flex items-center px-3 py-1.5 border transition-all ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-300 bg-white hover:border-neutral-500'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider font-medium">
                {sizeOption.size}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


