import { NextResponse } from 'next/server';
import { marketPath } from '@/lib/markets/paths';
import { isInternationalMarket } from '@/lib/markets/config';
import type { CurrencyCode, InternationalMarketCode } from '@/lib/markets/types';
import { getInternationalPaymentProvider } from '@/lib/payments/international/provider';
import { getSiteBaseUrl } from '@/lib/openpayArgentina';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

interface InternationalNotas {
  market?: string;
  currency?: string;
  total?: number;
  subtotal?: number;
  shipping?: number;
  shippingForm?: {
    nombreCompleto?: string;
    email?: string;
    telefono?: string;
  };
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  let body: { orden_id?: unknown };
  try {
    body = (await req.json()) as { orden_id?: unknown };
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const ordenId = typeof body.orden_id === 'string' && isUuid(body.orden_id) ? body.orden_id : null;
  if (!ordenId) {
    return NextResponse.json({ error: 'orden_id inválido' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: orden, error } = await supabase
    .from('ordenes')
    .select('id, metodo_pago, estado_pago_web, carrito_json, notas_web')
    .eq('id', ordenId)
    .maybeSingle();

  if (error || !orden) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
  }

  const row = orden as {
    id: string;
    metodo_pago: string | null;
    notas_web: Record<string, unknown> | null;
    carrito_json: unknown;
  };

  if (row.metodo_pago !== 'Internacional') {
    return NextResponse.json({ error: 'La orden no es internacional' }, { status: 400 });
  }

  const international = (row.notas_web?.international ?? null) as InternationalNotas | null;
  const market = international?.market;
  if (!market || !isInternationalMarket(market)) {
    return NextResponse.json({ error: 'Mercado internacional inválido en la orden' }, { status: 400 });
  }

  const currency = international.currency;
  const total = international.total;
  const shippingForm = international.shippingForm;

  if (!currency || !total || total <= 0 || !shippingForm?.email || !shippingForm.nombreCompleto) {
    return NextResponse.json({ error: 'Datos de pago incompletos en la orden' }, { status: 400 });
  }

  const cartItems = Array.isArray(row.carrito_json) ? row.carrito_json : [];
  const lines = cartItems
    .filter((item): item is { id: string; title: string; price: number; qty: number } => {
      if (!item || typeof item !== 'object') return false;
      const o = item as Record<string, unknown>;
      return (
        typeof o.id === 'string' &&
        typeof o.title === 'string' &&
        typeof o.price === 'number' &&
        typeof o.qty === 'number'
      );
    })
    .map((item) => ({
      id: item.id,
      title: item.title,
      unitPrice: item.price,
      qty: item.qty,
    }));

  const marketCode = market as InternationalMarketCode;
  const siteBaseUrl = getSiteBaseUrl();
  const successUrl = `${siteBaseUrl}${marketPath(marketCode, '/checkout/success')}?orden_id=${ordenId}`;
  const failureUrl = `${siteBaseUrl}${marketPath(marketCode, '/checkout/failed')}?orden_id=${ordenId}`;
  const notificationUrl = `${siteBaseUrl}/api/checkout/international/webhook`;

  let provider;
  try {
    provider = getInternationalPaymentProvider();
  } catch (providerError) {
    const message = providerError instanceof Error ? providerError.message : 'Proveedor no disponible';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  let payment;
  try {
    payment = await provider.createCheckout({
    orderId: ordenId,
    market: marketCode,
    currency: currency as CurrencyCode,
    amount: total,
    buyer: {
      name: shippingForm.nombreCompleto,
      email: shippingForm.email,
      phone: shippingForm.telefono ?? '',
    },
    lines,
    successUrl,
    failureUrl,
    notificationUrl,
    });
  } catch (paymentError) {
    const message =
      paymentError instanceof Error ? paymentError.message : 'No se pudo crear el pago';
    return NextResponse.json({ error: message }, { status: 502 });
  }


  const notasWeb = {
    ...(row.notas_web ?? {}),
    internationalPayment: {
      provider: payment.provider,
      providerPaymentId: payment.providerPaymentId,
      createdAt: new Date().toISOString(),
      raw: payment.raw ?? null,
    },
  };

  await supabase.from('ordenes').update({ notas_web: notasWeb } as never).eq('id', ordenId);

  return NextResponse.json({ checkoutUrl: payment.checkoutUrl });
}
