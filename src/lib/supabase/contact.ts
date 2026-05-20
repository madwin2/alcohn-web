/**
 * Helpers para los inputs de contacto que llegan desde formularios web.
 * El objetivo es producir filas válidas para `clientes` sin romper los
 * NOT NULL y los UNIQUE de la tabla.
 */

const APELLIDO_PLACEHOLDER = '-';

export interface SplitName {
  nombre: string;
  apellido: string;
}

/**
 * Parte un nombre completo en `nombre` / `apellido`.
 *
 * - Si vienen ambos por separado y son no vacíos, se respetan.
 * - Si solo viene `nombre` con varias palabras, la primera queda como nombre
 *   y el resto como apellido.
 * - Si solo viene una palabra, apellido = '-' (la app interna usa este
 *   placeholder para clientes sin apellido conocido).
 */
export function splitName(
  rawNombre: string | null | undefined,
  rawApellido?: string | null | undefined
): SplitName | null {
  const nombre = (rawNombre ?? '').trim();
  const apellido = (rawApellido ?? '').trim();

  if (apellido && nombre) {
    return { nombre, apellido };
  }

  if (!nombre) return null;

  const parts = nombre.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) {
    return { nombre: parts[0], apellido: apellido || APELLIDO_PLACEHOLDER };
  }

  const [firstName, ...rest] = parts;
  return {
    nombre: firstName,
    apellido: apellido || rest.join(' '),
  };
}

/**
 * Normaliza el email: trim + lowercase. Devuelve NULL si está vacío o no
 * pasa una validación mínima (la tabla `clientes.mail` es UNIQUE, conviene
 * NULL antes que strings vacíos).
 */
export function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * Limpia un slug: a-z 0-9 y guiones. Usado para `mockup_solicitudes.nombre_slug`.
 * Devuelve string vacío si no queda nada útil; el caller decide qué hacer.
 */
export function toSlug(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
