/** Límites de medida para sellos rectangulares (alineados al catálogo Alcohn). */

/** Lado largo mínimo (mm). */
export const STAMP_MM_MIN_LONG = 10;

/** Lado corto mínimo (mm), p. ej. sellos muy anchos. */
export const STAMP_MM_MIN_SHORT = 5;

/** Lado largo máximo: 15 cm. */
export const STAMP_MM_MAX_LONG = 150;

/** Lado corto máximo: 6 cm. */
export const STAMP_MM_MAX_SHORT = 60;

export function stampSidesMm(widthMm: number, heightMm: number): { long: number; short: number } {
  return {
    long: Math.max(widthMm, heightMm),
    short: Math.min(widthMm, heightMm),
  };
}

export function isValidStampSizeMm(widthMm: number, heightMm: number): boolean {
  if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm)) return false;
  const { long, short } = stampSidesMm(widthMm, heightMm);
  return (
    long >= STAMP_MM_MIN_LONG &&
    short >= STAMP_MM_MIN_SHORT &&
    long <= STAMP_MM_MAX_LONG &&
    short <= STAMP_MM_MAX_SHORT
  );
}

/** Texto para UI (milímetros). */
export const STAMP_SIZE_RANGE_LABEL =
  'Rango: lado largo 10–150 mm, lado corto 5–60 mm (hasta 15×6 cm). Rectangulares incluidos.';

/**
 * Ajusta un par ancho×alto para entrar en el rango válido manteniendo la proporción lo más posible.
 */
export function fitProportionalStampSize(
  widthMm: number,
  heightMm: number
): { width: number; height: number } {
  let w = Math.round(widthMm);
  let h = Math.round(heightMm);
  if (w <= 0 || h <= 0) return { width: w, height: h };
  if (isValidStampSizeMm(w, h)) return { width: w, height: h };

  const ar = w / h;
  for (let i = 0; i < 8 && !isValidStampSizeMm(w, h); i++) {
    const { long, short } = stampSidesMm(w, h);
    if (long > STAMP_MM_MAX_LONG) {
      const s = STAMP_MM_MAX_LONG / long;
      w = Math.round(w * s);
      h = Math.round(h * s);
      continue;
    }
    if (short > STAMP_MM_MAX_SHORT) {
      const s = STAMP_MM_MAX_SHORT / short;
      w = Math.round(w * s);
      h = Math.round(h * s);
      continue;
    }
    if (short < STAMP_MM_MIN_SHORT) {
      const s = STAMP_MM_MIN_SHORT / short;
      w = Math.round(w * s);
      h = Math.round(h * s);
      continue;
    }
    if (long < STAMP_MM_MIN_LONG) {
      const s = STAMP_MM_MIN_LONG / long;
      w = Math.round(w * s);
      h = Math.round(h * s);
      continue;
    }
    break;
  }

  if (!isValidStampSizeMm(w, h)) {
    w = Math.min(STAMP_MM_MAX_LONG, Math.max(STAMP_MM_MIN_LONG, w));
    h = Math.round(w / ar);
    if (!isValidStampSizeMm(w, h)) {
      h = Math.min(STAMP_MM_MAX_SHORT, Math.max(STAMP_MM_MIN_SHORT, h));
      w = Math.round(h * ar);
    }
  }

  return { width: w, height: h };
}
