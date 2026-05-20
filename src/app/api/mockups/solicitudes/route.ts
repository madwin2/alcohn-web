/**
 * POST /api/mockups/solicitudes
 *
 * Crea un registro en `public.mockup_solicitudes` con `origen = 'web'`.
 * Pensado para llamarse desde el wizard al iniciar una muestra (después de
 * tener `cliente_id` por `/api/clientes/upsert`).
 *
 * Para actualizar (estado, URLs de logo/mockups, enlace al cliente o a la
 * orden, checkout_*) usar `PATCH /api/mockups/solicitudes/[id]`.
 *
 * Body esperado (JSON):
 *   {
 *     cliente_id?: string                // FK opcional (uuid)
 *     nombre_muestra?: string            // texto visible en la app interna
 *     nombre_slug?: string               // si no viene, se genera
 *     whatsapp?: string                  // se normaliza con normalizePhoneAR
 *     email?: string
 *     material: 'cuero' | 'madera' | 'ambos' | 'ceramica' | 'alimentos' | 'otros'
 *     metadata_web?: Record<string, unknown>
 *     web_session_id?: string
 *     medidas_cotizacion_json?: unknown
 *   }
 *
 * Respuesta 200:
 *   { id: string, nombre_slug: string }
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';
import { normalizePhoneAR } from '@/lib/supabase/phone';
import { normalizeEmail, toSlug } from '@/lib/supabase/contact';
import type { MockupMaterial } from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_MATERIALS: ReadonlyArray<MockupMaterial> = [
  'cuero',
  'madera',
  'ambos',
  'ceramica',
  'alimentos',
  'otros',
];

interface CreateBody {
  cliente_id?: unknown;
  nombre_muestra?: unknown;
  nombre_slug?: unknown;
  whatsapp?: unknown;
  email?: unknown;
  material?: unknown;
  metadata_web?: unknown;
  web_session_id?: unknown;
  medidas_cotizacion_json?: unknown;
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asUuid(value: unknown): string | null {
  const s = asString(value);
  if (!s) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
    ? s
    : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function generateSlug(seed: string | null): string {
  const base = seed ? toSlug(seed) : '';
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${stamp}-${rand}` : `web-${stamp}-${rand}`;
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase no configurado en el servidor' },
      { status: 500 }
    );
  }

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const materialRaw = asString(body.material);
  if (
    !materialRaw ||
    !(VALID_MATERIALS as ReadonlyArray<string>).includes(materialRaw)
  ) {
    return NextResponse.json(
      {
        error: 'Material inválido',
        permitidos: VALID_MATERIALS,
      },
      { status: 400 }
    );
  }
  const material = materialRaw as MockupMaterial;

  const nombreMuestra = asString(body.nombre_muestra);
  const slug = asString(body.nombre_slug) ?? generateSlug(nombreMuestra);
  const whatsapp = normalizePhoneAR(asString(body.whatsapp));
  const email = normalizeEmail(asString(body.email));
  const clienteId = asUuid(body.cliente_id);
  const metadataWeb = asRecord(body.metadata_web) ?? {};
  const webSessionId = asString(body.web_session_id);
  const medidasCotizacion = body.medidas_cotizacion_json ?? null;

  if (clienteId) {
    const supabaseCheck = getSupabaseAdmin();
    const { data: cli, error: cliErr } = await supabaseCheck
      .from('clientes')
      .select('id')
      .eq('id', clienteId)
      .maybeSingle();
    if (cliErr) {
      return NextResponse.json(
        { error: 'Error verificando cliente', detail: cliErr.message },
        { status: 500 }
      );
    }
    if (!cli) {
      return NextResponse.json(
        { error: 'cliente_id no existe' },
        { status: 400 }
      );
    }
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('mockup_solicitudes')
    .insert({
      cliente_id: clienteId,
      nombre_muestra: nombreMuestra,
      nombre_slug: slug,
      whatsapp,
      email,
      material,
      origen: 'web',
      estado: 'procesando',
      metadata_web: metadataWeb,
      web_session_id: webSessionId,
      medidas_cotizacion_json: medidasCotizacion,
    })
    .select('id, nombre_slug')
    .single();

  if (error || !data) {
    return NextResponse.json(
      {
        error: 'No se pudo crear la solicitud de mockup',
        detail: error?.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id, nombre_slug: data.nombre_slug });
}
