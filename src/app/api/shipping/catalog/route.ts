import { NextResponse } from 'next/server';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase/admin';
import { loadCorreoCatalog } from '@/lib/shipping/saveShippingServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let cachedCatalog: { data: unknown; at: number } | null = null;
const CACHE_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase no configurado', provinces: [], localitiesByProvince: {}, branchesByKey: {} },
      { status: 503 }
    );
  }

  const now = Date.now();
  if (cachedCatalog && now - cachedCatalog.at < CACHE_MS) {
    return NextResponse.json(cachedCatalog.data);
  }

  try {
    const catalog = await loadCorreoCatalog(getSupabaseAdmin());
    if (catalog.provinces.length === 0) {
      return NextResponse.json(
        { error: 'Catálogo de sucursales vacío', ...catalog },
        { status: 503 }
      );
    }
    cachedCatalog = { data: catalog, at: now };
    return NextResponse.json(catalog);
  } catch (e) {
    console.error('[api/shipping/catalog]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error cargando catálogo' },
      { status: 500 }
    );
  }
}
