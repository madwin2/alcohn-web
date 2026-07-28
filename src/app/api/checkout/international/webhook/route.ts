import { NextResponse } from 'next/server';
import { getInternationalPaymentProvider } from '@/lib/payments/international/provider';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  let result;
  try {
    const provider = getInternationalPaymentProvider();
    result = await provider.verifyWebhook(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook inválido';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!result.orderId) {
    return NextResponse.json({ error: 'orderId ausente' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: orden } = await supabase
    .from('ordenes')
    .select('id, notas_web, estado_pago_web')
    .eq('id', result.orderId)
    .maybeSingle();

  if (!orden) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
  }

  const row = orden as { id: string; notas_web: Record<string, unknown> | null; estado_pago_web: string | null };
  const notasWeb = {
    ...(row.notas_web ?? {}),
    internationalPayment: {
      ...((row.notas_web?.internationalPayment as Record<string, unknown> | undefined) ?? {}),
      provider: result.provider,
      providerPaymentId: result.providerPaymentId,
      webhookAt: new Date().toISOString(),
      paid: result.paid,
      raw: result.raw ?? null,
    },
  };

  if (result.paid) {
    await supabase
      .from('ordenes')
      .update({
        estado_pago_web: 'pagado',
        pago_confirmado_at: new Date().toISOString(),
        notas_web: notasWeb,
      } as never)
      .eq('id', result.orderId);
  } else {
    await supabase
      .from('ordenes')
      .update({
        estado_pago_web: row.estado_pago_web === 'pagado' ? 'pagado' : 'pago_fallido',
        notas_web: notasWeb,
      } as never)
      .eq('id', result.orderId);
  }

  return NextResponse.json({ ok: true, paid: result.paid });
}
