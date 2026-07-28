'use client';

import StampSizeScalePreview from '@/components/buy/StampSizeScalePreview';
import WizardSizeCompareScale from '@/components/buy/WizardSizeCompareScale';

export type WizardSizeTierOption = {
  key: string;
  label: string;
  size: string;
  price: number;
  transferPrice?: number;
  recommended?: boolean;
};

type SummaryState = {
  summarySizeLabel: string;
  summaryLabel: string;
  price: number;
  transfer: number;
  cuota: number;
  showRecommended: boolean;
};

function resolveSummaryState(
  options: WizardSizeTierOption[],
  selectedSize?: string,
  selectedPrice?: number,
  selectedTransferPrice?: number,
  customSize?: { width: number; height: number }
): SummaryState | null {
  const usingCustom =
    customSize && customSize.width > 0 && customSize.height > 0;

  const activeStandard = !usingCustom
    ? options.find((o) => o.size === selectedSize)
    : undefined;

  const summarySizeLabel = usingCustom
    ? `${customSize!.width}×${customSize!.height}mm`
    : activeStandard?.size ?? selectedSize ?? options[0]?.size ?? '';

  if (!summarySizeLabel) return null;

  const summaryLabel = usingCustom
    ? 'Personalizada'
    : activeStandard?.label ?? 'Mediano';

  const price = selectedPrice ?? activeStandard?.price ?? 0;
  const transfer = selectedTransferPrice ?? activeStandard?.transferPrice ?? 0;

  return {
    summarySizeLabel,
    summaryLabel,
    price,
    transfer,
    cuota: price > 0 ? Math.round(price / 3) : 0,
    showRecommended: Boolean(!usingCustom && activeStandard?.recommended),
  };
}

type WizardSizePickerRowProps = {
  options: WizardSizeTierOption[];
  selectedSize?: string;
  customSize?: { width: number; height: number };
  onSelect: (option: WizardSizeTierOption) => void;
};

export function WizardSizePickerRow({
  options,
  selectedSize,
  customSize,
  onSelect,
}: WizardSizePickerRowProps) {
  const usingCustom =
    customSize && customSize.width > 0 && customSize.height > 0;

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => {
        const isSelected = !usingCustom && selectedSize === option.size;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect(option)}
            className={`relative flex min-h-[80px] flex-col items-center justify-center gap-0.5 border px-1.5 py-2.5 text-center transition-all active:scale-[0.98] ${
              isSelected
                ? 'border-[var(--alcohn-ink)] bg-[var(--alcohn-surface)] shadow-[inset_0_0_0_1px_var(--alcohn-ink)]'
                : 'border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] hover:border-neutral-400'
            }`}
          >
            {option.recommended && (
              <span className="absolute -top-2 left-1/2 z-[1] -translate-x-1/2 whitespace-nowrap bg-[var(--alcohn-bronze)] px-1.5 py-px font-mono text-[8px] font-semibold uppercase tracking-wide text-white">
                Recomendado
              </span>
            )}
            <span className="font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-neutral-500">
              {option.label}
            </span>
            <span className="text-[12px] font-semibold leading-tight text-neutral-900">
              {option.size.replace(/mm$/i, ' mm')}
            </span>
            <span className="mt-0.5 text-[13.5px] font-bold tabular-nums text-neutral-950">
              ${option.price.toLocaleString('es-AR')}
            </span>
          </button>
        );
      })}
    </div>
  );
}

type WizardSizeSummaryPanelProps = {
  options: WizardSizeTierOption[];
  selectedSize?: string;
  selectedPrice?: number;
  selectedTransferPrice?: number;
  customSize?: { width: number; height: number };
  logoUrl?: string | null;
  className?: string;
  /** En mobile del rediseño: filas de resumen sin la moneda lateral (va en la comparación). */
  compactRows?: boolean;
};

export function WizardSizeSummaryPanel({
  options,
  selectedSize,
  selectedPrice,
  selectedTransferPrice,
  customSize,
  logoUrl,
  className = '',
  compactRows = false,
}: WizardSizeSummaryPanelProps) {
  const summary = resolveSummaryState(
    options,
    selectedSize,
    selectedPrice,
    selectedTransferPrice,
    customSize
  );

  if (!summary) return null;

  const sizeDisplay = summary.summarySizeLabel.replace(
    /(\d+)\s*[x×]\s*(\d+)/i,
    '$1×$2'
  );

  if (compactRows) {
    return (
      <div className={`px-4 py-3 ${className}`}>
        <div className="flex items-baseline justify-between gap-2 py-1 text-[13.5px]">
          <span className="text-neutral-600">Medida</span>
          <span className="font-semibold tabular-nums text-neutral-950">{sizeDisplay}</span>
        </div>
        {summary.price > 0 && (
          <div className="flex items-baseline justify-between gap-2 py-1 text-[13.5px]">
            <span className="text-neutral-600">3 cuotas sin interés</span>
            <span className="font-semibold tabular-nums text-neutral-950">
              ${summary.cuota.toLocaleString('es-AR')}
            </span>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-2 py-1 text-[13.5px] text-emerald-700">
          <span>Pagando por transferencia</span>
          <span className="font-semibold tabular-nums">
            ${summary.transfer.toLocaleString('es-AR')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`px-3 py-3 ${className}`}>
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="craft-label text-[10px] text-neutral-500">Tu selección</p>
            {summary.showRecommended && (
              <span className="shrink-0 rounded-md bg-[var(--alcohn-ink)] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white">
                Recomendado
              </span>
            )}
          </div>
          <p className="text-lg font-bold leading-tight text-neutral-950">
            {summary.summaryLabel}
          </p>
          <p className="mb-3 text-base text-neutral-500">{sizeDisplay}</p>

          <dl className="space-y-1.5 text-sm">
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-neutral-600">Precio</dt>
                <dd className="font-bold tabular-nums text-neutral-950">
                  ${summary.price.toLocaleString('es-AR')}
                </dd>
              </div>
              {summary.price > 0 && (
                <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
                  (3 cuotas s/interés ${summary.cuota.toLocaleString('es-AR')})
                </p>
              )}
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-emerald-800">Transferencia</dt>
              <dd className="font-semibold tabular-nums text-emerald-700">
                ${summary.transfer.toLocaleString('es-AR')}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex w-[min(42%,9.5rem)] shrink-0 flex-col items-center justify-end self-stretch">
          <StampSizeScalePreview
            sizeLabel={summary.summarySizeLabel}
            logoUrl={logoUrl}
            viewport="summary"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default function WizardSizeStepMobile({
  options,
  selectedSize,
  selectedPrice,
  selectedTransferPrice,
  customSize,
  logoUrl,
  onSelect,
}: WizardSizePickerRowProps &
  Omit<WizardSizeSummaryPanelProps, 'options'> & {
    options: WizardSizeTierOption[];
    onSelect: (option: WizardSizeTierOption) => void;
  }) {
  return (
    <div className="space-y-3">
      <WizardSizePickerRow
        options={options}
        selectedSize={selectedSize}
        customSize={customSize}
        onSelect={onSelect}
      />
      <WizardSizeCompareScale
        options={options}
        selectedSize={selectedSize}
        logoUrl={logoUrl}
      />
      <WizardSizeSummaryPanel
        options={options}
        selectedSize={selectedSize}
        selectedPrice={selectedPrice}
        selectedTransferPrice={selectedTransferPrice}
        customSize={customSize}
        logoUrl={logoUrl}
        compactRows
        className="border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)]"
      />
    </div>
  );
}
