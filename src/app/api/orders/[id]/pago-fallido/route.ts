/**
 * PATCH /api/orders/[id]/pago-fallido
 *
 * Marca una orden web como pago fallido (Openpay / error de red).
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

interface RouteContext {
  params: { id: string };
}

interface Body {
  pago_error_codigo?: unknown;
  pago_error_mensaje?: unknown;
  openpay_order_id?: unknown;
}

export async function PATCH(req: Request, { params }: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    // body opcional
  }

  const codigo =
    typeof body.pago_error_codigo === 'string' ? body.pago_error_codigo.trim() : null;
  const mensaje =
    typeof body.pago_error_mensaje === 'string' ? body.pago_error_mensaje.trim() : null;
  const openpayId =
    typeof body.openpay_order_id === 'string' ? body.openpay_order_id.trim() : null;

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('ordenes')
    .update({
      estado_pago_web: 'pago_fallido',
      pago_error_codigo: codigo,
      pago_error_mensaje: mensaje,
      openpay_order_id: openpayId,
      ultimo_intento_pago_at: now,
    })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
