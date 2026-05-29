/** Redondea a 4 decimales (catálogo en cm). */
export function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function claveMedida(ancho: number, largo: number): string {
  return `${round4(ancho)}:${round4(largo)}`;
}

/** Lado largo × lado corto. */
export function orientarMedida(anchoCm: number, altoCm: number): { ancho: number; largo: number } {
  const ancho = Math.max(anchoCm, altoCm);
  const largo = Math.min(anchoCm, altoCm);
  return { ancho, largo };
}

/** Reglas de planchuela sobre medida ya orientada. */
export function aplicarReglasPlanchuela(ancho: number, largo: number): { ancho: number; largo: number } {
  let a = ancho;
  let l = largo;

  if (Math.abs(a - 5) <= 0.06) {
    if (l > 1 && l < 1.3) l = 1;
    else if (l >= 1.3 && l < 2) l = 2;
  }

  if (l > 2 && l < 2.5) l = 2.5;

  return { ancho: round4(a), largo: round4(l) };
}

export function precioLinkDesdeTransferencia(precioTransferencia: number): number {
  return Math.round(precioTransferencia * 1.15);
}

/**
 * Parsea medidas del usuario: `8×1.4`, `8x1.4`, `40` (cuadrado), coma decimal.
 * Devuelve cm o null si no se puede interpretar.
 */
export function parseMedidaUsuario(input: string): { anchoCm: number; altoCm: number } | null {
  const raw = input.trim().toLowerCase().replace(/,/g, '.');
  if (!raw) return null;

  const parts = raw.split(/[x×]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 1) {
    const n = Number(parts[0]);
    if (!Number.isFinite(n) || n <= 0) return null;
    return { anchoCm: n, altoCm: n };
  }
  if (parts.length === 2) {
    const ancho = Number(parts[0]);
    const alto = Number(parts[1]);
    if (!Number.isFinite(ancho) || !Number.isFinite(alto) || ancho <= 0 || alto <= 0) return null;
    return { anchoCm: ancho, altoCm: alto };
  }
  return null;
}
