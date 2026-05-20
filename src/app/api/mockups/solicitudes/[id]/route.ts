/**
 * PATCH /api/mockups/solicitudes/[id]
 * GET   /api/mockups/solicitudes/[id]
 *
 * Actualiza o lee una solicitud de mockup web.
 *
 * Campos que el wizard puede actualizar:
 *   - cliente_id          : enlazar a cliente cuando se complete el contacto
 *   - email               : agregar email si llega después
 *   - estado              : 'procesando' | 'pendiente_aprobacion' | 'completado' | 'error'
 *   - archivo_base_url / archivo_base_path
 *   - imagen_optimizada_url / imagen_optimizada_path
 *   - mockup_cuero_url / mockup_madera_url
 *   - metadata_web        : merge superficial con lo existente
 *   - medidas_cotizacion_json
 *   - checkout_iniciado_at / checkout_completado_at
 *   - carrito_json
 *   - orden_id            : se setea al crear la orden web
 *
 * No se permite cambiar `origen`, `nombre_slug` ni `material` (si hace falta
 * cambiar material → crear nueva solicitud).
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';
import { normalizeEmail } from '@/lib/supabase/contact';
import type {
  MockupEstado,
  MockupSolicitudUpdate,
} from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_ESTADOS: ReadonlyArray<MockupEstado> = [
  'procesando',
  'pendiente_aprobacion',
  'completado',
  'error',
];

interface PatchBody {
  cliente_id?: unknown;
  orden_id?: unknown;
  email?: unknown;
  estado?: unknown;
  archivo_base_url?: unknown;
  archivo_base_path?: unknown;
  imagen_optimizada_url?: unknown;
  imagen_optimizada_path?: unknown;
  mockup_cuero_url?: unknown;
  mockup_cuero_path?: unknown;
  mockup_madera_url?: unknown;
  mockup_madera_path?: unknown;
  metadata_web?: unknown;
  medidas_cotizacion_json?: unknown;
  checkout_iniciado_at?: unknown;
  checkout_completado_at?: unknown;
  carrito_json?: unknown;
}

function asString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asUuid(value: unknown): string | null | undefined {
  const s = asString(value);
  if (s === undefined) return undefined;
  if (s === null) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
    ? s
    : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function asTimestamp(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

function isValidUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase no configurado en el servidor' },
      { status: 500 }
    );
  }
  if (!isValidUuid(params.id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('mockup_solicitudes')
    .select(
      'id, estado, material, nombre_slug, cliente_id, orden_id, origen, ' +
        'archivo_base_url, imagen_optimizada_url, mockup_cuero_url, mockup_madera_url, ' +
        'metadata_web, medidas_cotizacion_json, ' +
        'checkout_iniciado_at, checkout_completado_at, carrito_json, ' +
        'created_at, updated_at'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: 'Error leyendo solicitud', detail: error.message },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json({ error: 'no encontrada' }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase no configurado en el servidor' },
      { status: 500 }
    );
  }
  if (!isValidUuid(params.id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Estado actual: para hacer merge de metadata_web sin pisar.
  const { data: current, error: curErr } = await supabase
    .from('mockup_solicitudes')
    .select('id, metadata_web, origen')
    .eq('id', params.id)
    .maybeSingle();

  if (curErr) {
    return NextResponse.json(
      { error: 'Error leyendo solicitud', detail: curErr.message },
      { status: 500 }
    );
  }
  if (!current) {
    return NextResponse.json({ error: 'no encontrada' }, { status: 404 });
  }

  const update: MockupSolicitudUpdate = {};

  if ('estado' in body) {
    const e = body.estado;
    if (typeof e !== 'string' || !(VALID_ESTADOS as ReadonlyArray<string>).includes(e)) {
      return NextResponse.json(
        { error: 'estado inválido', permitidos: VALID_ESTADOS },
        { status: 400 }
      );
    }
    update.estado = e as MockupEstado;
  }

  const clienteId = asUuid(body.cliente_id);
  if (clienteId !== undefined) update.cliente_id = clienteId;

  const ordenId = asUuid(body.orden_id);
  if (ordenId !== undefined) update.orden_id = ordenId;

  if ('email' in body) {
    const e = asString(body.email);
    update.email = e === undefined ? undefined : e === null ? null : normalizeEmail(e);
  }

  const stringFields: Array<keyof PatchBody & keyof MockupSolicitudUpdate> = [
    'archivo_base_url',
    'archivo_base_path',
    'imagen_optimizada_url',
    'imagen_optimizada_path',
    'mockup_cuero_url',
    'mockup_cuero_path',
    'mockup_madera_url',
    'mockup_madera_path',
  ];
  for (const key of stringFields) {
    if (key in body) {
      const v = asString(body[key]);
      if (v !== undefined) (update as Record<string, unknown>)[key] = v;
    }
  }

  if ('metadata_web' in body) {
    const incoming = asRecord(body.metadata_web);
    if (incoming) {
      const existing =
        (current.metadata_web as Record<string, unknown> | null) ?? {};
      update.metadata_web = { ...existing, ...incoming };
    }
  }

  if ('medidas_cotizacion_json' in body) {
    update.medidas_cotizacion_json = body.medidas_cotizacion_json ?? null;
  }

  if ('checkout_iniciado_at' in body) {
    const ts = asTimestamp(body.checkout_iniciado_at);
    if (ts !== undefined) update.checkout_iniciado_at = ts;
  }
  if ('checkout_completado_at' in body) {
    const ts = asTimestamp(body.checkout_completado_at);
    if (ts !== undefined) update.checkout_completado_at = ts;
  }
  if ('carrito_json' in body) {
    update.carrito_json = body.carrito_json ?? null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true, noop: true });
  }

  if (update.cliente_id) {
    const { data: cli, error: cliErr } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', update.cliente_id)
      .maybeSingle();
    if (cliErr) {
      return NextResponse.json(
        { error: 'Error verificando cliente', detail: cliErr.message },
        { status: 500 }
      );
    }
    if (!cli) {
      return NextResponse.json({ error: 'cliente_id no existe' }, { status: 400 });
    }
  }

  const { error: updErr } = await supabase
    .from('mockup_solicitudes')
    .update(update)
    .eq('id', params.id);

  if (updErr) {
    return NextResponse.json(
      { error: 'No se pudo actualizar la solicitud', detail: updErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
