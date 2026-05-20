/**
 * Normalización de teléfonos argentinos para upsertear clientes sin duplicar.
 *
 * Reglas:
 *  - Quita espacios, guiones, paréntesis y puntos.
 *  - Si arranca con 00 → reemplaza por +.
 *  - Si arranca con + → respeta el código de país tal cual.
 *  - Si no tiene prefijo y empieza con 54 → le antepone +.
 *  - Si empieza con 0 (formato local de larga distancia) → quita el 0 y antepone +54.
 *  - En cualquier otro caso → antepone +54.
 *
 * Esto no garantiza validación E.164 perfecta; alcanza para deduplicar y para
 * abrir wa.me. La validación estricta queda en el lado del formulario.
 */
export function normalizePhoneAR(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let cleaned = trimmed.replace(/[\s\-().·_]/g, '');

  if (cleaned.startsWith('00')) {
    cleaned = `+${cleaned.slice(2)}`;
  }

  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1).replace(/\D/g, '');
    if (!digits) return null;
    return `+${digits}`;
  }

  const digits = cleaned.replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('54')) {
    return `+${digits}`;
  }

  if (digits.startsWith('0')) {
    return `+54${digits.replace(/^0+/, '')}`;
  }

  return `+54${digits}`;
}

/**
 * Versión sin "+", útil para construir URLs de wa.me.
 */
export function toWaNumber(raw: string | null | undefined): string | null {
  const e164 = normalizePhoneAR(raw);
  return e164 ? e164.replace(/^\+/, '') : null;
}
