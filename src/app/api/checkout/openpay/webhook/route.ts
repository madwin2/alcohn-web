/**
 * POST /api/checkout/openpay/webhook
 *
 * Openpay notifica acá cuando termina un pago (`webhookUrl` al crear la orden).
 * No se confía en el contenido: solo se usa el uuid para encontrar la orden y se
 * llama a `confirmar-pago`, que verifica el cobro contra la API de Openpay.
 * Cubre al cliente que paga y cierra la pestaña antes de volver al sitio.
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function readOpenpayOrderUuid(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const data = (body as { data?: Record<string, unknown> }).data;
  if (!data) return null;
  const attrs = (data.attributes ?? {}) as Record<string, unknown>;
  const order = (data.order ?? attrs.order) as { uuid?: unknown } | undefined;
  const uuid = order?.uuid;
  return typeof uuid === 'string' && uuid.length > 0 ? uuid : null;
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const openpayOrderId = readOpenpayOrderUuid(body);
  if (!openpayOrderId) {
    return NextResponse.json({ ok: true, ignored: 'sin uuid de orden' });
  }

  const { data: orden, error } = await getSupabaseAdmin()
    .from('ordenes')
    .select('id')
    .eq('openpay_order_id', openpayOrderId)
    .maybeSingle();

  if (error) {
    console.error('[openpay webhook] buscar orden', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!orden) {
    return NextResponse.json({ ok: true, ignored: 'orden no encontrada' });
  }

  const ordenId = (orden as { id: string }).id;
  const origin = new URL(req.url).origin;
  const res = await fetch(`${origin}/api/orders/${ordenId}/confirmar-pago`, {
    method: 'POST',
    cache: 'no-store',
  });
  const result = await res.json().catch(() => ({}));

  return NextResponse.json({ ok: res.ok, orden_id: ordenId, result }, { status: res.ok ? 200 : 502 });
}
