'use client';

import type { AccessoryVariant } from '@/data/accessories';

interface AccessoryVariantSelectorProps {
  label: string;
  variants: AccessoryVariant[];
  selectedVariantId?: string;
  onSelect: (variantId: string) => void;
}

export default function AccessoryVariantSelector({
  label,
  variants,
  selectedVariantId,
  onSelect,
}: AccessoryVariantSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="craft-label mb-3">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const isOutOfStock = Boolean(variant.outOfStock);

          return (
            <button
              key={variant.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelect(variant.id)}
              className={`inline-flex min-h-[44px] flex-col items-start justify-center px-4 py-2 border transition-all ${
                isOutOfStock
                  ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
                  : isSelected
                    ? 'border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] text-white'
                    : 'border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] hover:border-[var(--alcohn-bronze)]'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider font-medium">
                {variant.label}
              </span>
              {isOutOfStock ? (
                <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide">
                  Sin stock
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
