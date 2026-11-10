'use client';

import Image from 'next/image';
import type { WizardAddon } from '@/lib/wizardAddons';

type WizardAddonCardProps = {
  addon: WizardAddon;
  added: boolean;
  onToggle: () => void;
  /** Método elegido: muestra ese precio. Sin método, tarjeta y transferencia. */
  paymentMethod: 'card' | 'transfer' | null;
  /** Otra opción en una línea (cuero: mango de golpe ↔ base para remachadora). */
  alternative?: { addon: WizardAddon; onSwitch: () => void } | null;
};

const ars = (n: number) => `$${n.toLocaleString('es-AR')}`;

/** Complemento sugerido en el paso de pago (solo Argentina). Tarjeta chica con toggle. */
export default function WizardAddonCard({
  addon,
  added,
  onToggle,
  paymentMethod,
  alternative,
}: WizardAddonCardProps) {
  const price = paymentMethod === 'transfer' ? addon.transferPrice : addon.linkPrice;

  return (
    <div
      className={`border bg-[var(--alcohn-surface)] p-3 ${
        added
          ? 'border-[var(--alcohn-ink)] shadow-[inset_0_0_0_1px_var(--alcohn-ink)]'
          : 'border-[var(--alcohn-line)]'
      }`}
    >
      <p className="craft-label mb-2 text-[10px]">Suele sumarse con tu sello</p>
      <div className="flex items-center gap-3">
        <span className="relative block h-14 w-14 shrink-0 overflow-hidden border border-[var(--alcohn-line)] bg-white">
          <Image
            src={addon.accessory.image}
            alt={addon.accessory.title}
            fill
            sizes="56px"
            className="object-cover"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold leading-tight text-neutral-950">
            {addon.accessory.title}
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-neutral-600">{addon.pitch}</p>
          <p className="mt-1 text-[13px] font-semibold tabular-nums text-neutral-950">
            + {ars(price)}
            {paymentMethod === null && addon.transferPrice < addon.linkPrice && (
              <span className="ml-1.5 text-[11.5px] font-medium text-emerald-700">
                {ars(addon.transferPrice)} por transferencia
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={added}
          className={`inline-flex min-h-[44px] shrink-0 items-center justify-center border px-3 text-[12.5px] font-semibold transition-colors ${
            added
              ? 'border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] text-white'
              : 'border-[var(--alcohn-line-strong)] bg-white text-neutral-900 hover:border-neutral-500'
          }`}
        >
          {added ? 'Agregado ✓' : 'Agregar'}
        </button>
      </div>
      {alternative && (
        <button
          type="button"
          onClick={alternative.onSwitch}
          className="mt-2 min-h-[36px] text-left text-[12px] text-neutral-600 underline decoration-[var(--alcohn-bronze)] underline-offset-4"
        >
          {alternative.addon.switchPrompt} Ver {alternative.addon.accessory.title.toLowerCase()} (
          {ars(paymentMethod === 'transfer' ? alternative.addon.transferPrice : alternative.addon.linkPrice)})
        </button>
      )}
    </div>
  );
}
