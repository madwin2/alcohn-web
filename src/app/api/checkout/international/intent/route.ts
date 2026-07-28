import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { computeMarketCheckoutPricing } from '@/lib/checkout/pricing';
import { getCotizadorCatalog } from '@/lib/cotizador';
import { getMarketConfig, isInternationalMarket } from '@/lib/markets/config';
import { getDhlShippingAmount } from '@/lib/shipping/international';
import type { InternationalShippingFormData } from '@/lib/shipping/international';
import { validateInternationalShippingForm } from '@/lib/shipping/international';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase/admin';
import { parseCartItemsFromBody, sanitizeCartItemsForDb } from '@/lib/supabase/cartItems';
import { upsertClienteServer } from '@/lib/supabase/upsertClienteServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseShippingForm(raw: unknown): InternationalShippingFormData | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  return {
    nombreCompleto: typeof o.nombreCompleto === 'string' ? o.nombreCompleto : '',
    email: typeof o.email === 'string' ? o.email : '',
    telefono: typeof o.telefono === 'string' ? o.telefono : '',
    documento: typeof o.documento === 'string' ? o.documento : '',
    direccion1: typeof o.direccion1 === 'string' ? o.direccion1 : '',
    direccion2: typeof o.direccion2 === 'string' ? o.direccion2 : '',
    region: typeof o.region === 'string' ? o.region : '',
    ciudad: typeof o.ciudad === 'string' ? o.ciudad : '',
    distrito: typeof o.distrito === 'string' ? o.distrito : '',
    codigoPostal: typeof o.codigoPostal === 'string' ? o.codigoPostal : '',
    notasDhl: typeof o.notasDhl === 'string' ? o.notasDhl : '',
  };
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado en el servidor' }, { status: 500 });
  }

  let body: {
    market?: unknown;
    items?: unknown;
    shippingForm?: unknown;
    customsAccepted?: unknown;
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (typeof body.market !== 'string' || !isInternationalMarket(body.market)) {
    return NextResponse.json({ error: 'País internacional inválido' }, { status: 400 });
  }

  const market = body.market;
  const shippingForm = parseShippingForm(body.shippingForm);
  if (!shippingForm) {
    return NextResponse.json({ error: 'Datos de envío inválidos' }, { status: 400 });
  }

  const formErrors = validateInternationalShippingForm(market, shippingForm);
  if (Object.keys(formErrors).length > 0) {
    return NextResponse.json({ error: 'Datos de envío incompletos', fields: formErrors }, { status: 400 });
  }

  if (body.customsAccepted !== true) {
    return NextResponse.json({ error: 'Debés aceptar el aviso de importación' }, { status: 400 });
  }

  const parsedItems = parseCartItemsFromBody(body.items);
  if (!parsedItems) {
    return NextResponse.json({ error: 'Carrito vacío o inválido' }, { status: 400 });
  }

  const catalog = await getCotizadorCatalog();
  const pricing = computeMarketCheckoutPricing(parsedItems, catalog, market);
  const dhlShipping = getDhlShippingAmount(market);
  const total = pricing.marketSubtotal + dhlShipping;
  const marketConfig = getMarketConfig(market);

  const upsert = await upsertClienteServer({
    nombre: shippingForm.nombreCompleto,
    telefono: shippingForm.telefono,
    email: shippingForm.email,
    mail: shippingForm.email,
  });

  if (!upsert.ok) {
    return NextResponse.json({ error: upsert.error }, { status: upsert.status });
  }

  const cartForDb = sanitizeCartItemsForDb(
    pricing.marketItems.map((item) => ({
      ...item,
      market,
      currency: marketConfig.currency,
    }))
  );

  const webCheckoutRef = randomUUID().replace(/-/g, '').slice(0, 32);
  const customsNoticeAcceptedAt = new Date().toISOString();

  const notasWeb: Record<string, unknown> = {
    international: {
      market,
      country: marketConfig.countryName,
      countryIso2: marketConfig.countryIso2,
      currency: pricing.currency,
      subtotal: pricing.marketSubtotal,
      shipping: dhlShipping,
      total,
      carrier: 'DHL',
      customsDutiesPaidByBuyer: true,
      customsNoticeAcceptedAt,
      shippingForm,
    },
    subtotal_carrito: pricing.marketSubtotal,
    items_count: pricing.marketItems.reduce((n, i) => n + i.qty, 0),
    envio_costo: dhlShipping,
    envio_metodo: 'DHL Internacional',
  };

  const supabase = getSupabaseAdmin();
  const { data: orden, error: ordErr } = await supabase
    .from('ordenes')
    .insert({
      cliente_id: upsert.id,
      origen: 'Web',
      metodo_pago: 'Internacional',
      estado_pago_web: 'pendiente',
      estado_orden: null,
      mockup_solicitud_id: null,
      web_checkout_ref: webCheckoutRef,
      carrito_json: cartForDb,
      notas_web: notasWeb,
    } as never)
    .select('id')
    .single();

  if (ordErr || !orden) {
    console.error('[checkout/international/intent]', ordErr?.message);
    return NextResponse.json(
      { error: 'No se pudo crear la orden', detail: ordErr?.message },
      { status: 500 }
    );
  }

  const ordenId = (orden as { id: string }).id;

  return NextResponse.json({
    orden_id: ordenId,
    cliente_id: upsert.id,
    web_checkout_ref: webCheckoutRef,
    estado_pago_web: 'pendiente',
    metodo_pago: 'Internacional',
    market,
    currency: pricing.currency,
    total,
  });
}
