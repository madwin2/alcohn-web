/** Cliente HTTP para POST /api/cotizador (usable en componentes cliente). */

export type CotizacionApiResponse = {
  cotizable: boolean;
  ancho_cm: number;
  alto_cm: number;
  precio_transferencia_ars: number;
  precio_link_ars: number;
  fuente?: string;
  error?: string;
};

export async function cotizarMm(
  anchoMm: number,
  altoMm: number
): Promise<CotizacionApiResponse | null> {
  try {
    const res = await fetch('/api/cotizador', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ancho_mm: anchoMm, alto_mm: altoMm }),
    });
    const json = (await res.json()) as CotizacionApiResponse & { error?: string };
    if (!res.ok || !json.cotizable) return null;
    return json;
  } catch {
    return null;
  }
}

/** Parsea `40×30mm` o `40x30mm` → { width: 40, height: 30 }. */
export function parseSizeMm(size: string): { width: number; height: number } | null {
  const m = size.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*mm$/i);
  if (!m) return null;
  const width = Number(m[1]);
  const height = Number(m[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  return { width, height };
}
