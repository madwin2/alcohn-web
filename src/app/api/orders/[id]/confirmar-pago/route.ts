/**
 * POST /api/orders/[id]/confirmar-pago
 *
 * Opción A: inserta los `sellos` desde `ordenes.carrito_json` y marca la orden
 * como pagada (`estado_pago_web='pagado'`, `estado_orden='Señado'`).
 *
 * Idempotente: reclama el pago con un UPDATE atómico para evitar sellos duplicados
 * si el navegador llama dos veces (React Strict Mode / refresh).
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';
import { buildSellosInsertsFromCart } from '@/lib/supabase/sellosFromCart';
import { publishMockupLogoToBaseBucket } from '@/lib/supabase/publishMockupToBase';
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

function readEnvioCosto(notasWeb: unknown): number {
  if (!notasWeb || typeof notasWeb !== 'object') return 0;
  const n = (notasWeb as { envio_costo?: unknown }).envio_costo;
  const v = typeof n === 'number' ? n : typeof n === 'string' ? Number(n) : 0;
  return Number.isFinite(v) && v > 0 ? v : 0;
}

interface RouteContext {
  params: { id: string };
}

type OrdenRow = {
  id: string;
  estado_pago_web: string | null;
  carrito_json: unknown;
  mockup_solicitud_id: string | null;
  notas_web: unknown;
};

export async function POST(_req: Request, { params }: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: claimed, error: claimErr } = await supabase
    .from('ordenes')
    .update({
      estado_pago_web: 'pagado',
      estado_orden: 'Señado',
      pago_confirmado_at: now,
    } as never)
    .eq('id', params.id)
    .neq('estado_pago_web', 'pagado')
    .select('id, estado_pago_web, carrito_json, mockup_solicitud_id, notas_web')
    .maybeSingle();

  if (claimErr) {
    return NextResponse.json({ error: claimErr.message }, { status: 500 });
  }

  let orden: OrdenRow | null = claimed as OrdenRow | null;

  if (!orden) {
    const { data: existing, error: exErr } = await supabase
      .from('ordenes')
      .select('id, estado_pago_web, carrito_json, mockup_solicitud_id, notas_web')
      .eq('id', params.id)
      .maybeSingle();

    if (exErr) {
      return NextResponse.json({ error: exErr.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }
    orden = existing as OrdenRow;

    const { count, error: countErr } = await supabase
      .from('sellos')
      .select('id', { count: 'exact', head: true })
      .eq('orden_id', params.id);

    if (countErr) {
      return NextResponse.json({ error: countErr.message }, { status: 500 });
    }
    if (count && count > 0) {
      return NextResponse.json({ ok: true, already_paid: true, sellos_existed: true });
    }
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

  const envioCosto = readEnvioCosto(orden.notas_web);

  const sellosToInsert = buildSellosInsertsFromCart(params.id, items, {
    mockup_solicitud_id: orden.mockup_solicitud_id,
    envio_costo: envioCosto,
  });

  if (sellosToInsert.length === 0) {
    return NextResponse.json(
      { error: 'No hay ítems de sello en el carrito' },
      { status: 400 }
    );
  }

  const { data: insertedSellos, error: insErr } = await supabase
    .from('sellos')
    .insert(sellosToInsert as never)
    .select('id, mockup_solicitud_id');

  if (insErr) {
    if (insErr.code === '23505') {
      return NextResponse.json({ ok: true, sellos_existed: true });
    }
    return NextResponse.json(
      { error: 'No se pudieron crear los sellos', detail: insErr.message },
      { status: 500 }
    );
  }

  const mockupId = orden.mockup_solicitud_id;
  if (mockupId && insertedSellos?.length) {
    const published = await publishMockupLogoToBaseBucket(supabase, mockupId, params.id);
    if (published) {
      const target = (insertedSellos as { id: string; mockup_solicitud_id: string | null }[]).find(
        (s) => s.mockup_solicitud_id === mockupId
      );
      if (target) {
        await supabase
          .from('sellos')
          .update({ archivo_base: published.path } as never)
          .eq('id', target.id);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    sellos_created: sellosToInsert.length,
    envio_incluido_en_valor: envioCosto > 0,
    archivo_base_publicado: Boolean(mockupId),
  });
}
