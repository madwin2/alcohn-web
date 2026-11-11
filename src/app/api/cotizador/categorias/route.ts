/**
 * GET /api/cotizador/categorias
 *
 * Precio y medidas de cada tamaño de sello (chico / mediano / grande) para la compra
 * directa desde la ficha. Sale del mismo catálogo Supabase que usa el generador.
 */

import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/admin';
import { getCotizadorCatalog } from '@/lib/cotizador';
import { cotizarGrupo } from '@/lib/cotizador/quote';
import { catalogMeasuresByGrupo } from '@/lib/cotizador/suggestedTierSizes';
import { STAMP_SIZE_CATEGORIES } from '@/lib/stampSizeCategories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Cotizador no disponible.' }, { status: 503 });
  }

  const catalog = await getCotizadorCatalog();
  if (!catalog) {
    return NextResponse.json({ error: 'No se pudo cargar el catálogo de precios.' }, { status: 503 });
  }

  const measures = catalogMeasuresByGrupo(catalog.medidaGrupoFilas);

  const categories = STAMP_SIZE_CATEGORIES.map((cat) => {
    const price = cotizarGrupo(catalog, cat.grupo);
    return {
      key: cat.key,
      grupo: cat.grupo,
      price: price?.link ?? 0,
      transferPrice: price?.transferencia ?? 0,
      // Medidas en cm (ancho × largo), de la más chica a la más grande.
      measures: [...measures[cat.grupo]].sort(
        (a, b) => a.ancho * a.largo - b.ancho * b.largo || a.largo - b.largo
      ),
    };
  });

  return NextResponse.json(
    { categories },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
  );
}
