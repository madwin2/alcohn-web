import { NextRequest, NextResponse } from 'next/server';
import {
  createOpenpayCheckoutOrder,
  getOpenpayTestAmountArs,
  isOpenpaySimulateSuccessEnabled,
  linesForOpenpayCharge,
  sumLinesSubtotal,
  type OpenpayCartLine,
} from '@/lib/openpayArgentina';

export const runtime = 'nodejs';

/** Indica si Openpay cobrará un monto fijo de prueba (OPENPAY_TEST_AMOUNT_ARS). */
export async function GET() {
  const testAmountArs = getOpenpayTestAmountArs();
  const simulateSuccess = isOpenpaySimulateSuccessEnabled();
  return NextResponse.json({ testAmountArs, simulateSuccess });
}

type Body = {
  items?: OpenpayCartLine[];
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

  const items = Array.isArray(body.items) ? body.items.filter(isValidLine) : [];
  if (items.length === 0) {
    return NextResponse.json({ error: 'Se requiere al menos un ítem válido' }, { status: 400 });
  }

  const chargeLines = linesForOpenpayCharge(items);
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
    const { checkoutUrl } = await createOpenpayCheckoutOrder({
      lines: chargeLines,
      ordenId,
    });
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
