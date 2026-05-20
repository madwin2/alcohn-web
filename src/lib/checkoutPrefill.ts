/** Datos del wizard de compra / buy para rellenar el checkout (sessionStorage, misma pestaña). */

export const CHECKOUT_PREFILL_STORAGE_KEY = 'alcohn_checkout_prefill';

const MAX_AGE_MS = 48 * 60 * 60 * 1000;

export type CheckoutPrefillPayload = {
  nombre: string;
  whatsapp: string;
  email: string;
  provincia: string;
  ciudad: string;
  notas: string;
  ts: number;
};

function parseStoredPrefill(raw: string | null): CheckoutPrefillPayload | null {
  if (!raw) return null;
  let parsed: Partial<CheckoutPrefillPayload>;
  try {
    parsed = JSON.parse(raw) as Partial<CheckoutPrefillPayload>;
  } catch {
    return null;
  }
  if (typeof parsed.nombre !== 'string' || typeof parsed.whatsapp !== 'string') return null;
  const ts = typeof parsed.ts === 'number' ? parsed.ts : 0;
  if (!ts || Date.now() - ts > MAX_AGE_MS) return null;
  return {
    nombre: parsed.nombre,
    whatsapp: parsed.whatsapp,
    email: typeof parsed.email === 'string' ? parsed.email : '',
    provincia: typeof parsed.provincia === 'string' ? parsed.provincia : '',
    ciudad: typeof parsed.ciudad === 'string' ? parsed.ciudad : '',
    notas: typeof parsed.notas === 'string' ? parsed.notas : '',
    ts,
  };
}

export function saveCheckoutPrefill(
  partial: Partial<Omit<CheckoutPrefillPayload, 'ts'>> & Pick<CheckoutPrefillPayload, 'nombre' | 'whatsapp' | 'email'>
): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: CheckoutPrefillPayload = {
      nombre: partial.nombre.trim(),
      whatsapp: partial.whatsapp.trim(),
      email: partial.email.trim(),
      provincia: (partial.provincia ?? '').trim(),
      ciudad: (partial.ciudad ?? '').trim(),
      notas: (partial.notas ?? '').trim(),
      ts: Date.now(),
    };
    sessionStorage.setItem(CHECKOUT_PREFILL_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // cuota llena o modo privado
  }
}

/** Lee sin borrar (útil para decidir si el carrito corresponde al prefill). */
export function peekCheckoutPrefill(): CheckoutPrefillPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_PREFILL_STORAGE_KEY);
    if (!raw) return null;
    return parseStoredPrefill(raw);
  } catch {
    sessionStorage.removeItem(CHECKOUT_PREFILL_STORAGE_KEY);
    return null;
  }
}

export function consumeCheckoutPrefill(): CheckoutPrefillPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_PREFILL_STORAGE_KEY);
    if (!raw) return null;
    const p = parseStoredPrefill(raw);
    sessionStorage.removeItem(CHECKOUT_PREFILL_STORAGE_KEY);
    return p;
  } catch {
    sessionStorage.removeItem(CHECKOUT_PREFILL_STORAGE_KEY);
    return null;
  }
}

export function cartLooksLikeWizardPersonalizado(items: {
  collection: string;
  designSlug: string;
}[]): boolean {
  return items.some(
    (i) =>
      i.collection === 'Personalizado' ||
      (typeof i.designSlug === 'string' && i.designSlug.startsWith('personalizado-'))
  );
}
