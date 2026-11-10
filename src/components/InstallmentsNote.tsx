'use client';

import { useMarket } from '@/contexts/MarketContext';
import {
  INSTALLMENTS_WITHOUT_INTEREST,
  TRANSFER_DISCOUNT_PERCENT,
  installmentAmountArs,
  type PriceKind,
} from '@/lib/installments';

type InstallmentsNoteProps = {
  /** Precio en ARS tal como se muestra al lado. */
  amount: number;
  /** Si el precio mostrado es el de transferencia o el de tarjeta. */
  kind?: PriceKind;
  className?: string;
  /** Texto claro sobre fondo oscuro. */
  inverted?: boolean;
};

/**
 * Línea de cuotas y descuento junto a un precio. Solo Argentina: afuera se paga con
 * tarjeta en moneda local, sin cuotas sin interés ni descuento por transferencia.
 */
export default function InstallmentsNote({
  amount,
  kind = 'transfer',
  className = '',
  inverted = false,
}: InstallmentsNoteProps) {
  const { market } = useMarket();
  if (market !== 'ar' || !Number.isFinite(amount) || amount <= 0) return null;

  const cuota = `$${installmentAmountArs(amount, kind).toLocaleString('es-AR')}`;
  const tone = inverted ? 'text-white/80' : 'text-neutral-600';

  return (
    <p className={`text-xs md:text-sm ${tone} ${className}`.trim()}>
      {kind === 'transfer' ? (
        <>
          Precio por transferencia · o {INSTALLMENTS_WITHOUT_INTEREST} cuotas sin interés de{' '}
          {cuota}
        </>
      ) : (
        <>
          {INSTALLMENTS_WITHOUT_INTEREST} cuotas sin interés de {cuota} ·{' '}
          {TRANSFER_DISCOUNT_PERCENT}% off por transferencia
        </>
      )}
    </p>
  );
}
