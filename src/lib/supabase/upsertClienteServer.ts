import { getSupabaseAdmin } from './admin';
import { normalizePhoneAR } from './phone';
import { normalizeEmail, splitName } from './contact';
import type { MedioContacto } from './types';

export interface UpsertClienteInput {
  nombre: string;
  apellido?: string | null;
  telefono: string;
  mail?: string | null;
  email?: string | null;
  medio_contacto?: MedioContacto;
}

export type UpsertClienteResult =
  | { ok: true; id: string; created: boolean }
  | { ok: false; error: string; status: number };

export async function upsertClienteServer(
  input: UpsertClienteInput
): Promise<UpsertClienteResult> {
  const telefono = normalizePhoneAR(input.telefono);
  if (!telefono) {
    return { ok: false, error: 'Teléfono inválido o ausente', status: 400 };
  }

  const splitted = splitName(input.nombre, input.apellido ?? undefined);
  if (!splitted) {
    return { ok: false, error: 'Nombre inválido o ausente', status: 400 };
  }

  const mail =
    normalizeEmail(input.mail ?? undefined) ??
    normalizeEmail(input.email ?? undefined);
  const medioContacto = input.medio_contacto ?? 'Web';

  const supabase = getSupabaseAdmin();

  const { data: byPhone, error: phoneErr } = await supabase
    .from('clientes')
    .select('id, mail')
    .eq('telefono', telefono)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (phoneErr) {
    return { ok: false, error: phoneErr.message, status: 500 };
  }

  let existing: { id: string; mail: string | null } | null = byPhone ?? null;

  if (!existing && mail) {
    const { data: byMail, error: mailErr } = await supabase
      .from('clientes')
      .select('id, mail')
      .eq('mail', mail)
      .maybeSingle();
    if (mailErr) {
      return { ok: false, error: mailErr.message, status: 500 };
    }
    existing = byMail ?? null;
  }

  if (existing) {
    const update: Record<string, unknown> = {
      nombre: splitted.nombre,
      apellido: splitted.apellido,
      telefono,
      medio_contacto: medioContacto,
    };

    if (mail && existing.mail !== mail) {
      const { data: clash, error: clashErr } = await supabase
        .from('clientes')
        .select('id')
        .eq('mail', mail)
        .neq('id', existing.id)
        .maybeSingle();
      if (clashErr) {
        return { ok: false, error: clashErr.message, status: 500 };
      }
      if (!clash) update.mail = mail;
    }

    const { error: updErr } = await supabase
      .from('clientes')
      .update(update)
      .eq('id', existing.id);
    if (updErr) {
      return { ok: false, error: updErr.message, status: 500 };
    }
    return { ok: true, id: existing.id, created: false };
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
    return { ok: false, error: insErr?.message ?? 'Insert falló', status: 500 };
  }

  return { ok: true, id: inserted.id, created: true };
}
