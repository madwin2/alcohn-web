/**
 * POST /api/checkout/intent
 *
 * Crea cliente (upsert) + orden web SIN sellos (Opción A).
 * Enlaza mockup_solicitud si corresponde.
 *
 * Body:
 *   {
 *     metodo_pago: 'Openpay' | 'Transferencia',
 *     cliente: { nombre, apellido?, telefono, email? },
 *     cliente_id?: string,              // si ya se upserteó antes
 *     items: CartItem[],
 *     mockup_solicitud_id?: string,
 *     provincia?: string,
 *     ciudad?: string,
 *     notas?: string
 *   }
 *
 * Respuesta:
 *   { orden_id, cliente_id, web_checkout_ref, estado_pago_web }
 */

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase/admin';
import { upsertClienteServer } from '@/lib/supabase/upsertClienteServer';
import { parseCartItemsFromBody } from '@/lib/supabase/cartItems';
import type { EstadoPagoWeb, MetodoPago } from '@/lib/supabase/types';
import { saveShippingForOrder } from '@/lib/shipping/saveShippingServer';
import type { ShippingFormData, ShippingMetodoUi } from '@/lib/shipping/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_METODOS: ReadonlyArray<MetodoPago> = ['Openpay', 'Transferencia'];

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function estadoPagoForMetodo(metodo: MetodoPago): EstadoPagoWeb {
  return metodo === 'Transferencia' ? 'esperando_comprobante' : 'pendiente';
}

interface IntentBody {
  metodo_pago?: unknown;
  cliente?: {
    nombre?: unknown;
    apellido?: unknown;
    telefono?: unknown;
    email?: unknown;
    mail?: unknown;
  };
  cliente_id?: unknown;
  items?: unknown;
  mockup_solicitud_id?: unknown;
  provincia?: unknown;
  ciudad?: unknown;
  notas?: unknown;
  envio?: {
    metodo?: unknown;
    form?: unknown;
  };
  envio_costo?: unknown;
  envio_metodo?: unknown;
}

function parseEnvioMetodo(v: unknown): ShippingMetodoUi | null {
  if (v === 'domicilio' || v === 'sucursal' || v === 'retiro') return v;
  return null;
}

function parseShippingForm(raw: unknown): ShippingFormData | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  return {
    nombreCompleto: typeof o.nombreCompleto === 'string' ? o.nombreCompleto : '',
    email: typeof o.email === 'string' ? o.email : '',
    telefono: typeof o.telefono === 'string' ? o.telefono : '',
    provincia: typeof o.provincia === 'string' ? o.provincia : '',
    localidad: typeof o.localidad === 'string' ? o.localidad : '',
    domicilio: typeof o.domicilio === 'string' ? o.domicilio : '',
    codigoPostal: typeof o.codigoPostal === 'string' ? o.codigoPostal : '',
    codigoSucursal: typeof o.codigoSucursal === 'string' ? o.codigoSucursal : '',
  };
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase no configurado en el servidor' },
      { status: 500 }
    );
  }

  let body: IntentBody;
  try {
    body = (await req.json()) as IntentBody;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const metodoRaw = body.metodo_pago;
  if (
    typeof metodoRaw !== 'string' ||
    !(VALID_METODOS as ReadonlyArray<string>).includes(metodoRaw)
  ) {
    return NextResponse.json(
      { error: 'metodo_pago inválido', permitidos: VALID_METODOS },
      { status: 400 }
    );
  }
  const metodoPago = metodoRaw as MetodoPago;

  const items = parseCartItemsFromBody(body.items);
  if (!items) {
    return NextResponse.json(
      { error: 'El carrito está vacío o tiene ítems con formato inválido' },
      { status: 400 }
    );
  }

  const c = body.cliente;
  const hasClienteForm =
    c && typeof c.nombre === 'string' && typeof c.telefono === 'string';

  let clienteId =
    typeof body.cliente_id === 'string' && isUuid(body.cliente_id)
      ? body.cliente_id
      : null;

  const supabase = getSupabaseAdmin();

  if (clienteId) {
    const { data: cli, error: cliErr } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', clienteId)
      .maybeSingle();
    if (cliErr) {
      console.error('[checkout/intent] verificar cliente_id', cliErr.message);
      return NextResponse.json(
        { error: 'Error verificando cliente', detail: cliErr.message },
        { status: 500 }
      );
    }
    if (!cli) {
      clienteId = null;
    }
  }

  if (!clienteId) {
    if (!hasClienteForm) {
      return NextResponse.json(
        { error: 'cliente (nombre, telefono) o cliente_id válido requerido' },
        { status: 400 }
      );
    }
    const upsert = await upsertClienteServer({
      nombre: c!.nombre as string,
      apellido: typeof c!.apellido === 'string' ? c!.apellido : undefined,
      telefono: c!.telefono as string,
      mail: typeof c!.mail === 'string' ? c!.mail : undefined,
      email: typeof c!.email === 'string' ? c!.email : undefined,
    });
    if (!upsert.ok) {
      console.error('[checkout/intent] upsert cliente', upsert.error);
      return NextResponse.json(
        { error: upsert.error, detail: upsert.error },
        { status: upsert.status }
      );
    }
    clienteId = upsert.id;
  } else if (hasClienteForm) {
    const upsert = await upsertClienteServer({
      nombre: c!.nombre as string,
      apellido: typeof c!.apellido === 'string' ? c!.apellido : undefined,
      telefono: c!.telefono as string,
      mail: typeof c!.mail === 'string' ? c!.mail : undefined,
      email: typeof c!.email === 'string' ? c!.email : undefined,
    });
    if (upsert.ok) {
      clienteId = upsert.id;
    }
  }

  let mockupId =
    typeof body.mockup_solicitud_id === 'string' && isUuid(body.mockup_solicitud_id)
      ? body.mockup_solicitud_id
      : null;

  if (mockupId) {
    const { data: mockup, error: mockErr } = await supabase
      .from('mockup_solicitudes')
      .select('id')
      .eq('id', mockupId)
      .maybeSingle();
    if (mockErr) {
      console.error('[checkout/intent] verificar mockup', mockErr.message);
      return NextResponse.json(
        { error: 'Error verificando mockup', detail: mockErr.message },
        { status: 500 }
      );
    }
    if (!mockup) {
      console.warn('[checkout/intent] mockup_solicitud_id inexistente, se omite enlace', mockupId);
      mockupId = null;
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const webCheckoutRef = randomUUID().replace(/-/g, '').slice(0, 32);

  const envioCostoRaw = body.envio_costo;
  const envioCosto =
    typeof envioCostoRaw === 'number' && envioCostoRaw > 0
      ? envioCostoRaw
      : typeof envioCostoRaw === 'string'
        ? Number(envioCostoRaw)
        : 0;
  const envioMetodoRaw =
    typeof body.envio_metodo === 'string' ? body.envio_metodo.trim() : '';

  const notasWeb: Record<string, unknown> = {
    provincia: typeof body.provincia === 'string' ? body.provincia.trim() : '',
    ciudad: typeof body.ciudad === 'string' ? body.ciudad.trim() : '',
    notas: typeof body.notas === 'string' ? body.notas.trim() : '',
    subtotal_carrito: subtotal,
    items_count: items.reduce((n, i) => n + i.qty, 0),
    envio_costo: Number.isFinite(envioCosto) && envioCosto > 0 ? envioCosto : 0,
    envio_metodo: envioMetodoRaw || undefined,
  };

  const estadoPagoWeb = estadoPagoForMetodo(metodoPago);

  const { data: orden, error: ordErr } = await supabase
    .from('ordenes')
    // Tipado Supabase del proyecto resuelve Insert como never en esta tabla
    .insert({
      cliente_id: clienteId,
      origen: 'Web',
      metodo_pago: metodoPago,
      estado_pago_web: estadoPagoWeb,
      estado_orden: null,
      mockup_solicitud_id: mockupId,
      web_checkout_ref: webCheckoutRef,
      carrito_json: items,
      notas_web: notasWeb,
    } as never)
    .select('id')
    .single();

  if (ordErr || !orden) {
    console.error('[checkout/intent] insert orden', ordErr?.message, ordErr?.code, ordErr?.details);
    return NextResponse.json(
      {
        error: 'No se pudo crear la orden',
        detail: ordErr?.message ?? 'Error desconocido',
        code: ordErr?.code,
      },
      { status: 500 }
    );
  }

  const ordenId = (orden as { id: string }).id;

  if (mockupId) {
    const now = new Date().toISOString();
    await supabase
      .from('mockup_solicitudes')
      .update({
        orden_id: ordenId,
        cliente_id: clienteId,
        checkout_completado_at: now,
        checkout_iniciado_at: now,
        carrito_json: items,
      } as never)
      .eq('id', mockupId);
  }

  const envioBlock = body.envio;
  const envioMetodo = parseEnvioMetodo(envioBlock?.metodo);
  const envioForm = parseShippingForm(envioBlock?.form);
  if (envioMetodo && envioForm) {
    try {
      const nombreFallback =
        hasClienteForm && typeof c!.nombre === 'string' ? (c!.nombre as string) : undefined;
      await saveShippingForOrder(supabase, {
        ordenId,
        clienteId: clienteId!,
        metodo: envioMetodo,
        form: envioForm,
        nombreCompletoFallback: nombreFallback,
      });
      const envioNotas = {
        ...notasWeb,
        envio_metodo: envioMetodo,
      };
      await supabase
        .from('ordenes')
        .update({ notas_web: envioNotas } as never)
        .eq('id', ordenId);
    } catch (shipErr) {
      console.error('[checkout/intent] envio', shipErr);
      await supabase.from('ordenes').delete().eq('id', ordenId);
      return NextResponse.json(
        {
          error:
            shipErr instanceof Error
              ? shipErr.message
              : 'No se pudieron validar los datos de envío',
        },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({
    orden_id: ordenId,
    cliente_id: clienteId,
    web_checkout_ref: webCheckoutRef,
    estado_pago_web: estadoPagoWeb,
    metodo_pago: metodoPago,
  });
}
