/**
 * POST /api/orders/[id]/confirmar-pago
 *
 * Opción A: inserta los `sellos` desde `ordenes.carrito_json` y marca la orden
 * como pagada (`estado_pago_web='pagado'`, `estado_orden='Señado'`).
 *
 * Llamar desde Openpay success o cuando la app valide transferencia
 * (desde la app interna podrían hacerlo directo; la web lo usa en success).
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';
import { buildSellosInsertsFromCart } from '@/lib/supabase/sellosFromCart';
import type { CartItem } from '@/lib/cart';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function isCartItem(x: unknown): x is CartItem {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.title === 'string' &&
    typeof o.price === 'number' &&
    typeof o.qty === 'number' &&
    typeof o.designSlug === 'string'
  );
}

interface RouteContext {
  params: { id: string };
}

export async function POST(_req: Request, { params }: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: orden, error: ordErr } = await supabase
    .from('ordenes')
    .select('id, origen, estado_pago_web, carrito_json, mockup_solicitud_id')
    .eq('id', params.id)
    .maybeSingle();

  if (ordErr) {
    return NextResponse.json({ error: ordErr.message }, { status: 500 });
  }
  if (!orden) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
  }
  if (orden.estado_pago_web === 'pagado') {
    return NextResponse.json({ ok: true, already_paid: true });
  }

  const rawItems = orden.carrito_json;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return NextResponse.json(
      { error: 'La orden no tiene carrito_json para crear sellos' },
      { status: 400 }
    );
  }

  const items: CartItem[] = [];
  for (const row of rawItems) {
    if (!isCartItem(row)) {
      return NextResponse.json({ error: 'carrito_json corrupto' }, { status: 400 });
    }
    items.push(row as CartItem);
  }

  const { count, error: countErr } = await supabase
    .from('sellos')
    .select('id', { count: 'exact', head: true })
    .eq('orden_id', params.id);

  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }
  if (count && count > 0) {
    const { error: updOnly } = await supabase
      .from('ordenes')
      .update({
        estado_pago_web: 'pagado',
        estado_orden: 'Señado',
        pago_confirmado_at: new Date().toISOString(),
      })
      .eq('id', params.id);
    if (updOnly) {
      return NextResponse.json({ error: updOnly.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, sellos_existed: true });
  }

  const sellosToInsert = buildSellosInsertsFromCart(params.id, items, {
    mockup_solicitud_id: orden.mockup_solicitud_id,
  });

  const { error: insErr } = await supabase.from('sellos').insert(sellosToInsert);
  if (insErr) {
    return NextResponse.json(
      { error: 'No se pudieron crear los sellos', detail: insErr.message },
      { status: 500 }
    );
  }

  const now = new Date().toISOString();
  const { error: updErr } = await supabase
    .from('ordenes')
    .update({
      estado_pago_web: 'pagado',
      estado_orden: 'Señado',
      pago_confirmado_at: now,
    })
    .eq('id', params.id);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sellos_created: sellosToInsert.length });
}
