import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase/admin';
import { fetchShippingCostServer } from '@/lib/shipping/saveShippingServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FALLBACK: Record<string, number> = {
  Domicilio: config.shipping.domicilio,
  Sucursal: config.shipping.sucursal,
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipoRaw = searchParams.get('tipo');
  if (tipoRaw !== 'Domicilio' && tipoRaw !== 'Sucursal') {
    return NextResponse.json(
      { error: 'tipo debe ser Domicilio o Sucursal' },
      { status: 400 }
    );
  }

  let costo: number | null = null;
  if (isSupabaseConfigured()) {
    try {
      costo = await fetchShippingCostServer(getSupabaseAdmin(), tipoRaw);
    } catch (e) {
      console.error('[api/shipping/cost]', e);
    }
  }

  const resolved = costo ?? FALLBACK[tipoRaw] ?? 0;
  return NextResponse.json({ tipo: tipoRaw, costo: resolved, source: costo != null ? 'supabase' : 'fallback' });
}
