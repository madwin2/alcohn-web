/**
 * POST /api/mockups/solicitudes/[id]/upload
 *
 * Sube una imagen del wizard a Storage y actualiza las columnas URL/path en
 * `mockup_solicitudes`.
 *
 * Acepta:
 *   A) multipart/form-data
 *        - file: File (obligatorio si no hay data_url)
 *        - kind: logo_original | logo_optimizado | mockup_cuero | mockup_madera
 *
 *   B) application/json
 *        - data_url: string (base64 o data URL)
 *        - kind: mismo enum
 *
 * Respuesta 200:
 *   {
 *     bucket: string,
 *     path: string,
 *     url: string,          // signed URL (7 días)
 *     kind: string
 *   }
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';
import {
  mockupColumnsForKind,
  parseFileInput,
  parseImageInput,
  uploadWebImage,
  type UploadKind,
} from '@/lib/supabase/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_KINDS: ReadonlyArray<UploadKind> = [
  'logo_original',
  'logo_optimizado',
  'mockup_cuero',
  'mockup_madera',
];

function isValidUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function parseKind(value: unknown): UploadKind | null {
  if (typeof value !== 'string') return null;
  return (VALID_KINDS as ReadonlyArray<string>).includes(value)
    ? (value as UploadKind)
    : null;
}

interface RouteContext {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteContext) {
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
  const { data: solicitud, error: solErr } = await supabase
    .from('mockup_solicitudes')
    .select('id, origen')
    .eq('id', params.id)
    .maybeSingle();

  if (solErr) {
    return NextResponse.json(
      { error: 'Error leyendo solicitud', detail: solErr.message },
      { status: 500 }
    );
  }
  if (!solicitud) {
    return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
  }

  const contentType = req.headers.get('content-type') ?? '';
  let kind: UploadKind | null = null;
  let parsed: Awaited<ReturnType<typeof parseFileInput>> | ReturnType<typeof parseImageInput> | null =
    null;

  if (contentType.includes('multipart/form-data')) {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: 'FormData inválido' }, { status: 400 });
    }

    kind = parseKind(formData.get('kind'));
    const file = formData.get('file');
    const dataUrlField = formData.get('data_url');

    if (!kind) {
      return NextResponse.json(
        { error: 'kind inválido', permitidos: VALID_KINDS },
        { status: 400 }
      );
    }

    if (file instanceof File && file.size > 0) {
      parsed = await parseFileInput(file);
    } else if (typeof dataUrlField === 'string' && dataUrlField.trim()) {
      parsed = parseImageInput(dataUrlField);
    } else {
      return NextResponse.json(
        { error: 'Enviá file o data_url en el formulario' },
        { status: 400 }
      );
    }
  } else {
    let body: { kind?: unknown; data_url?: unknown };
    try {
      body = (await req.json()) as { kind?: unknown; data_url?: unknown };
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    kind = parseKind(body.kind);
    if (!kind) {
      return NextResponse.json(
        { error: 'kind inválido', permitidos: VALID_KINDS },
        { status: 400 }
      );
    }
    if (typeof body.data_url !== 'string') {
      return NextResponse.json({ error: 'data_url requerido' }, { status: 400 });
    }
    parsed = parseImageInput(body.data_url);
  }

  if (!parsed || 'error' in parsed) {
    return NextResponse.json(
      { error: 'error' in (parsed ?? {}) ? (parsed as { error: string }).error : 'Imagen inválida' },
      { status: 400 }
    );
  }

  const uploaded = await uploadWebImage(params.id, kind, parsed);
  if ('error' in uploaded) {
    return NextResponse.json(
      { error: 'Error subiendo archivo', detail: uploaded.error },
      { status: 500 }
    );
  }

  const cols = mockupColumnsForKind(kind);
  const update: Record<string, string> = {
    [cols.url]: uploaded.signedUrl,
    [cols.path]: uploaded.path,
  };

  const { error: updErr } = await supabase
    .from('mockup_solicitudes')
    .update(update)
    .eq('id', params.id);

  if (updErr) {
    return NextResponse.json(
      {
        error: 'Archivo subido pero no se pudo actualizar la solicitud',
        detail: updErr.message,
        bucket: uploaded.bucket,
        path: uploaded.path,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    bucket: uploaded.bucket,
    path: uploaded.path,
    url: uploaded.signedUrl,
    kind,
  });
}
