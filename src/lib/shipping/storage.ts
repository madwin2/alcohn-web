import type { ShippingMetodoUi, ShippingSelectionStored } from './types';

export const CHECKOUT_SHIPPING_STORAGE_KEY = 'alcohn_checkout_shipping';

const MAX_AGE_MS = 48 * 60 * 60 * 1000;

export function saveCheckoutShipping(metodo: ShippingMetodoUi, costo: number): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: ShippingSelectionStored = { metodo, costo, ts: Date.now() };
    sessionStorage.setItem(CHECKOUT_SHIPPING_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function peekCheckoutShipping(): ShippingSelectionStored | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_SHIPPING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ShippingSelectionStored>;
    if (
      parsed.metodo !== 'domicilio' &&
      parsed.metodo !== 'sucursal' &&
      parsed.metodo !== 'retiro'
    ) {
      return null;
    }
    const ts = typeof parsed.ts === 'number' ? parsed.ts : 0;
    if (!ts || Date.now() - ts > MAX_AGE_MS) return null;
    return {
      metodo: parsed.metodo,
      costo: typeof parsed.costo === 'number' ? parsed.costo : 0,
      ts,
    };
  } catch {
    return null;
  }
}

export function consumeCheckoutShipping(): ShippingSelectionStored | null {
  const p = peekCheckoutShipping();
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(CHECKOUT_SHIPPING_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  return p;
}
