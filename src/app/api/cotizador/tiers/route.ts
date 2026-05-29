/**
 * POST /api/cotizador/tiers
 * Body: { aspect_ratio?: number }
 * Devuelve Pequeño / Mediano / Grande con medidas y precios alineados al catálogo Supabase.
 */

import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/admin';
import {
  buildSuggestedTierDimensions,
  cotizarRectangularMm,
  getCotizadorCatalog,
} from '@/lib/cotizador';
import { parseSizeMm } from '@/lib/cotizador/fetchCotizacion';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = { aspect_ratio?: unknown };

function num(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Cotizador no disponible (Supabase sin configurar).' },
      { status: 503 }
    );
  }

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    /* body vacío → ratio 1 */
  }

  const catalog = await getCotizadorCatalog();
  if (!catalog) {
    return NextResponse.json(
      { error: 'No se pudo cargar el catálogo de precios.' },
      { status: 503 }
    );
  }

  const aspectRatio = num(body.aspect_ratio) ?? 1;
  const tiers = buildSuggestedTierDimensions(aspectRatio, catalog);

  if (tiers.length === 0) {
    return NextResponse.json(
      { error: 'No hay medidas sugeridas para esa proporción.' },
      { status: 422 }
    );
  }

  const withPrices = await Promise.all(
    tiers.map(async (t) => {
      const dim = parseSizeMm(t.size);
      let price = 0;
      let transferPrice = 0;
      if (dim) {
        const q = cotizarRectangularMm(catalog, dim.width, dim.height);
        if (q) {
          price = q.precio_link_ars;
          transferPrice = q.precio_transferencia_ars;
        }
      }
      return {
        tier: t.tier,
        grupo: t.grupo,
        size: t.size,
        recommended: t.recommended,
        ratio: t.ratio,
        refCm: t.refCm,
        price,
        transferPrice,
      };
    })
  );

  return NextResponse.json({ tiers: withPrices });
}
