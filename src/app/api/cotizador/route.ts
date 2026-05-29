/**
 * POST /api/cotizador
 *
 * Cotiza sellos rectangulares clásicos según catálogo Supabase (Alcohn interno).
 *
 * Body (una de las formas):
 *   { ancho_mm: number, alto_mm: number }
 *   { ancho_cm: number, alto_cm: number }
 *   { medida: string }   // ej. "8×1.4", "40"
 */

import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/admin';
import {
  cotizarRectangular,
  cotizarRectangularMm,
  getCotizadorCatalog,
  parseMedidaUsuario,
} from '@/lib/cotizador';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  ancho_mm?: unknown;
  alto_mm?: unknown;
  ancho_cm?: unknown;
  alto_cm?: unknown;
  medida?: unknown;
};

function num(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Cotizador no disponible (Supabase sin configurar).' },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const catalog = await getCotizadorCatalog();
  if (!catalog) {
    return NextResponse.json(
      { error: 'No se pudo cargar el catálogo de precios.' },
      { status: 503 }
    );
  }

  let result = null;

  const anchoMm = num(body.ancho_mm);
  const altoMm = num(body.alto_mm);
  if (anchoMm != null && altoMm != null) {
    result = cotizarRectangularMm(catalog, anchoMm, altoMm);
  } else {
    const anchoCm = num(body.ancho_cm);
    const altoCm = num(body.alto_cm);
    if (anchoCm != null && altoCm != null) {
      result = cotizarRectangular(catalog, anchoCm, altoCm);
    } else if (typeof body.medida === 'string') {
      const parsed = parseMedidaUsuario(body.medida);
      if (!parsed) {
        return NextResponse.json({ error: 'Medida no reconocida.' }, { status: 400 });
      }
      result = cotizarRectangular(catalog, parsed.anchoCm, parsed.altoCm);
    }
  }

  if (anchoMm == null && num(body.ancho_cm) == null && typeof body.medida !== 'string') {
    return NextResponse.json(
      { error: 'Enviá ancho_mm/alto_mm, ancho_cm/alto_cm o medida (texto).' },
      { status: 400 }
    );
  }

  if (!result) {
    return NextResponse.json(
      {
        error:
          'No hay precio para esa medida. Contactanos por WhatsApp para una cotización manual.',
        cotizable: false,
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ cotizable: true, ...result });
}
