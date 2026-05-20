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
      <h3 className="craft-label mb-3">
        MEDIDAS DISPONIBLES
      </h3>
      <div className="flex flex-wrap gap-2">
        {sizes.map((sizeOption) => {
          const isSelected = selectedSize === sizeOption.size;
          return (
            <button
              key={sizeOption.size}
              onClick={() => onSelect(sizeOption.size, sizeOption.price)}
              className={`inline-flex min-h-[44px] items-center px-4 py-2 border transition-all ${
                isSelected
                  ? 'border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] text-white'
                  : 'border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] hover:border-[var(--alcohn-bronze)]'
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


