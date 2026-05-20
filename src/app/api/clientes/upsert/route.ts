/**
 * POST /api/clientes/upsert
 *
 * Crea o actualiza un registro en `public.clientes` desde formularios web
 * (wizard ContactStep, formulario de contacto, checkout). Pensado para llamarse
 * varias veces durante la misma sesión sin duplicar filas.
 *
 * Estrategia de deduplicación:
 *   1. Buscar por teléfono normalizado (E.164-ish AR).
 *   2. Si no hay match y vino un mail, buscar por mail (UNIQUE).
 *   3. Si nada matchea → INSERT con `medio_contacto = 'Web'`.
 *   4. Si matchea → UPDATE solo de los campos provistos, sin pisar con NULL.
 *
 * `mail` se setea como NULL cuando viene vacío o inválido para no chocar con
 * el UNIQUE constraint cuando el formulario no pide email.
 *
 * Body esperado (JSON):
 *   {
 *     nombre: string                       // obligatorio (puede ser nombre completo)
 *     apellido?: string                    // opcional, si no viene se infiere
 *     telefono: string                     // obligatorio (cualquier formato AR)
 *     mail?: string | null                 // opcional
 *     medio_contacto?: 'Web' | ...         // default 'Web'
 *   }
 *
 * Respuesta 200:
 *   { id: string, created: boolean }
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';
import { normalizePhoneAR } from '@/lib/supabase/phone';
import { normalizeEmail, splitName } from '@/lib/supabase/contact';
import type { MedioContacto } from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface UpsertBody {
  nombre?: unknown;
  apellido?: unknown;
  telefono?: unknown;
  mail?: unknown;
  email?: unknown;
  medio_contacto?: unknown;
}

const VALID_MEDIOS: ReadonlyArray<MedioContacto> = [
  'Whatsapp',
  'Facebook',
  'Instagram',
  'Mail',
  'Web',
];

function parseMedioContacto(value: unknown): MedioContacto {
  if (typeof value === 'string' && (VALID_MEDIOS as ReadonlyArray<string>).includes(value)) {
    return value as MedioContacto;
  }
  return 'Web';
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase no configurado en el servidor' },
      { status: 500 }
    );
  }

  let body: UpsertBody;
  try {
    body = (await req.json()) as UpsertBody;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const telefono = normalizePhoneAR(asString(body.telefono));
  if (!telefono) {
    return NextResponse.json(
      { error: 'Teléfono inválido o ausente' },
      { status: 400 }
    );
  }

  const splitted = splitName(asString(body.nombre), asString(body.apellido));
  if (!splitted) {
    return NextResponse.json(
      { error: 'Nombre inválido o ausente' },
      { status: 400 }
    );
  }

  const mail = normalizeEmail(
    asString(body.mail) ?? asString(body.email)
  );
  const medioContacto = parseMedioContacto(body.medio_contacto);

  const supabase = getSupabaseAdmin();

  const { data: byPhone, error: phoneErr } = await supabase
    .from('clientes')
    .select('id, mail')
    .eq('telefono', telefono)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (phoneErr) {
    return NextResponse.json(
      { error: 'Error consultando clientes', detail: phoneErr.message },
      { status: 500 }
    );
  }

  let existing: { id: string; mail: string | null } | null = byPhone ?? null;

  if (!existing && mail) {
    const { data: byMail, error: mailErr } = await supabase
      .from('clientes')
      .select('id, mail')
      .eq('mail', mail)
      .maybeSingle();
    if (mailErr) {
      return NextResponse.json(
        { error: 'Error consultando clientes', detail: mailErr.message },
        { status: 500 }
      );
    }
    existing = byMail ?? null;
  }

  if (existing) {
    const update: Record<string, unknown> = {
      nombre: splitted.nombre,
      apellido: splitted.apellido,
      telefono,
    };

    // Solo setear mail si no rompe el UNIQUE con otro cliente.
    if (mail && existing.mail !== mail) {
      const { data: clash, error: clashErr } = await supabase
        .from('clientes')
        .select('id')
        .eq('mail', mail)
        .neq('id', existing.id)
        .maybeSingle();
      if (clashErr) {
        return NextResponse.json(
          { error: 'Error consultando mail', detail: clashErr.message },
          { status: 500 }
        );
      }
      if (!clash) {
        update.mail = mail;
      }
    }

    // No bajar de Web → otro medio explícito si la app ya marcó algo distinto;
    // pero sí setear Web cuando viene vacío.
    update.medio_contacto = medioContacto;

    const { error: updErr } = await supabase
      .from('clientes')
      .update(update)
      .eq('id', existing.id);
    if (updErr) {
      return NextResponse.json(
        { error: 'No se pudo actualizar el cliente', detail: updErr.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ id: existing.id, created: false });
  }

  const { data: inserted, error: insErr } = await supabase
    .from('clientes')
    .insert({
      nombre: splitted.nombre,
      apellido: splitted.apellido,
      telefono,
      mail,
      medio_contacto: medioContacto,
    })
    .select('id')
    .single();

  if (insErr || !inserted) {
    return NextResponse.json(
      { error: 'No se pudo crear el cliente', detail: insErr?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: inserted.id, created: true });
}
