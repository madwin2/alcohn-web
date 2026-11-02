import { NextRequest, NextResponse } from 'next/server';
import {
  createOpenpayCheckoutOrder,
  getOpenpayTestAmountArs,
  isOpenpaySimulateSuccessEnabled,
  linesForOpenpayCharge,
  sumLinesSubtotal,
  type OpenpayCartLine,
} from '@/lib/openpayArgentina';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';
import { SHIPPING_METODO_LABELS } from '@/lib/shipping/types';

export const runtime = 'nodejs';

/** Indica si Openpay cobrará un monto fijo de prueba (OPENPAY_TEST_AMOUNT_ARS). */
export async function GET() {
  const testAmountArs = getOpenpayTestAmountArs();
  const simulateSuccess = isOpenpaySimulateSuccessEnabled();
  return NextResponse.json({ testAmountArs, simulateSuccess });
}

type Body = {
  /** Se ignora: el cobro se arma con la orden guardada (ver `loadChargeLinesFromOrder`). */
  items?: unknown;
  orden_id?: string;
};

function isValidLine(x: unknown): x is OpenpayCartLine {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.title === 'string' &&
    typeof o.price === 'number' &&
    Number.isFinite(o.price) &&
    typeof o.qty === 'number' &&
    Number.isFinite(o.qty) &&
    o.price >= 0 &&
    o.qty >= 1 &&
    o.qty <= 999
  );
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

type ChargeLinesResult =
  | { ok: true; lines: OpenpayCartLine[] }
  | { ok: false; status: number; error: string };

/**
 * Líneas a cobrar desde `ordenes.carrito_json` (ya re-cotizado por `/api/checkout/intent`)
 * más el envío calculado en el servidor. Así el navegador no puede cambiar el monto.
 */
async function loadChargeLinesFromOrder(ordenId: string): Promise<ChargeLinesResult> {
  const { data, error } = await getSupabaseAdmin()
    .from('ordenes')
    .select('metodo_pago, estado_pago_web, carrito_json, notas_web')
    .eq('id', ordenId)
    .maybeSingle();

  if (error) return { ok: false, status: 500, error: error.message };
  if (!data) return { ok: false, status: 404, error: 'Orden no encontrada' };

  const orden = data as {
    metodo_pago: string | null;
    estado_pago_web: string | null;
    carrito_json: unknown;
    notas_web: unknown;
  };
  if (orden.metodo_pago !== 'Openpay') {
    return { ok: false, status: 400, error: 'La orden no es de pago con tarjeta' };
  }
  if (orden.estado_pago_web === 'pagado') {
    return { ok: false, status: 409, error: 'La orden ya está pagada' };
  }

  const cart = Array.isArray(orden.carrito_json) ? orden.carrito_json : [];
  const lines: OpenpayCartLine[] = [];
  for (const row of cart) {
    if (!isValidLine(row)) {
      return { ok: false, status: 400, error: 'El carrito de la orden es inválido' };
    }
    lines.push({ id: row.id, title: row.title, price: row.price, qty: row.qty });
  }
  if (lines.length === 0) {
    return { ok: false, status: 400, error: 'La orden no tiene productos' };
  }

  const notas = (orden.notas_web ?? {}) as { envio_costo?: unknown; envio_metodo?: unknown };
  const envio = Number(notas.envio_costo);
  if (Number.isFinite(envio) && envio > 0) {
    const metodo = notas.envio_metodo === 'sucursal' ? 'sucursal' : 'domicilio';
    lines.push({
      id: 'envio-correo',
      title: `Envío (${SHIPPING_METODO_LABELS[metodo]})`,
      price: envio,
      qty: 1,
    });
  }

  return { ok: true, lines };
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const ordenId =
    typeof body.orden_id === 'string' && body.orden_id.trim().length > 0
      ? body.orden_id.trim()
      : undefined;

  if (isOpenpaySimulateSuccessEnabled()) {
    return NextResponse.json({
      simulateSuccess: true,
      orden_id: ordenId,
    });
  }

  if (!ordenId || !isUuid(ordenId)) {
    return NextResponse.json({ error: 'orden_id requerido' }, { status: 400 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  const order = await loadChargeLinesFromOrder(ordenId);
  if (!order.ok) {
    return NextResponse.json({ error: order.error }, { status: order.status });
  }

  const chargeLines = linesForOpenpayCharge(order.lines);
  const subtotal = sumLinesSubtotal(chargeLines);
  if (subtotal <= 0 || subtotal > 50_000_000) {
    return NextResponse.json({ error: 'Subtotal inválido' }, { status: 400 });
  }
  const testAmountArs = getOpenpayTestAmountArs();

  const hasCreds =
    (process.env.OPENPAY_CLIENT_ID || process.env.CLIENT_ID)?.trim() &&
    (process.env.OPENPAY_CLIENT_SECRET || process.env.CLIENT_SECRET)?.trim();
  if (!hasCreds) {
    return NextResponse.json(
      {
        error:
          'Pago con tarjeta no configurado (OPENPAY_CLIENT_ID / OPENPAY_CLIENT_SECRET o CLIENT_ID / CLIENT_SECRET)',
      },
      { status: 503 }
    );
  }

  try {
    const { checkoutUrl, openpayOrderId } = await createOpenpayCheckoutOrder({
      lines: chargeLines,
      ordenId,
    });

    // Sin este id, `confirmar-pago` no puede verificar el cobro y la orden queda pendiente.
    if (openpayOrderId) {
      const { error: saveErr } = await getSupabaseAdmin()
        .from('ordenes')
        .update({ openpay_order_id: openpayOrderId } as never)
        .eq('id', ordenId)
        .neq('estado_pago_web', 'pagado');
      if (saveErr) console.error('[openpay checkout] guardar openpay_order_id', saveErr.message);
    } else {
      console.error('[openpay checkout] la respuesta de Openpay no trae uuid de orden');
    }
    return NextResponse.json({
      checkoutUrl,
      ...(testAmountArs != null ? { testAmountArs } : {}),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    console.error('[openpay checkout]', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
