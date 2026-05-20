/**
 * POST /api/orders/[id]/comprobante
 *
 * Sube comprobante de transferencia al bucket `comprobantes` y actualiza la orden.
 * NO inserta sellos (Opción A: la app interna valida y confirma pago).
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

interface RouteContext {
  params: { id: string };
}

function extFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'application/pdf':
      return 'pdf';
    default:
      return 'bin';
  }
}

export async function POST(req: Request, { params }: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: orden, error: ordErr } = await supabase
    .from('ordenes')
    .select('id, metodo_pago, estado_pago_web')
    .eq('id', params.id)
    .maybeSingle();

  if (ordErr) {
    return NextResponse.json({ error: ordErr.message }, { status: 500 });
  }
  if (!orden) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'FormData inválido' }, { status: 400 });
  }

  const file = formData.get('file') ?? formData.get('receipt');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
  }

  const mime = (file.type || 'application/octet-stream').toLowerCase();
  if (!ALLOWED.has(mime)) {
    return NextResponse.json(
      { error: 'Tipo no permitido', permitidos: [...ALLOWED] },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: 'Archivo demasiado grande (máx 10 MB)' }, { status: 400 });
  }

  const ext = extFromMime(mime);
  const path = `${params.id}/${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from('comprobantes')
    .upload(path, buffer, { contentType: mime, upsert: false });

  if (upErr) {
    return NextResponse.json(
      { error: 'Error subiendo comprobante', detail: upErr.message },
      { status: 500 }
    );
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from('comprobantes')
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json(
      { error: signErr?.message ?? 'No se pudo firmar URL' },
      { status: 500 }
    );
  }

  const now = new Date().toISOString();
  const { error: updErr } = await supabase
    .from('ordenes')
    .update({
      comprobante_path: path,
      comprobante_url: signed.signedUrl,
      comprobante_subido_at: now,
      metodo_pago: 'Transferencia',
      estado_pago_web: 'esperando_comprobante',
    })
    .eq('id', params.id);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    path,
    url: signed.signedUrl,
    comprobante_subido_at: now,
  });
}
