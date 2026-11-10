import { precioLinkDesdeTransferencia } from '@/lib/cotizador/utils';

/** Cuotas sin interés con tarjeta (Argentina). Mismo valor que usa el generador y el checkout. */
export const INSTALLMENTS_WITHOUT_INTEREST = 3;

/** Descuento por transferencia en Argentina, en %. El precio con tarjeta es el de transferencia + 15%. */
export const TRANSFER_DISCOUNT_PERCENT = 15;

/**
 * Tipo de precio que se muestra:
 * - 'transfer': precio por transferencia (ej. sellos "desde $76.000").
 * - 'link': precio con tarjeta / link de pago (ej. abecedarios).
 */
export type PriceKind = 'transfer' | 'link';

/** Precio con tarjeta (link de pago) en ARS a partir de un precio mostrado. */
export function cardPriceArs(amountArs: number, kind: PriceKind): number {
  return kind === 'transfer' ? precioLinkDesdeTransferencia(amountArs) : Math.round(amountArs);
}

/** Valor de cada cuota sin interés en ARS. */
export function installmentAmountArs(amountArs: number, kind: PriceKind): number {
  return Math.round(cardPriceArs(amountArs, kind) / INSTALLMENTS_WITHOUT_INTEREST);
}
