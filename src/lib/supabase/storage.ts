/**
 * Subida de archivos a buckets de Supabase Storage (web Alcohn).
 *
 * Buckets (privados): logos-web, mockups-web, comprobantes.
 * Solo usar desde server-side con service role.
 */

import { getSupabaseAdmin } from './admin';

export const WEB_BUCKETS = {
  logos: 'logos-web',
  mockups: 'mockups-web',
  comprobantes: 'comprobantes',
} as const;

export type WebBucket = (typeof WEB_BUCKETS)[keyof typeof WEB_BUCKETS];

export type UploadKind =
  | 'logo_original'
  | 'logo_optimizado'
  | 'mockup_cuero'
  | 'mockup_madera';

const KIND_TO_BUCKET: Record<UploadKind, WebBucket> = {
  logo_original: WEB_BUCKETS.logos,
  logo_optimizado: WEB_BUCKETS.logos,
  mockup_cuero: WEB_BUCKETS.mockups,
  mockup_madera: WEB_BUCKETS.mockups,
};

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB (límite bucket logos-web)

export interface ParsedImage {
  buffer: Buffer;
  mime: string;
  ext: string;
}

/**
 * Convierte data URL (base64) o raw base64 a Buffer.
 */
export function parseImageInput(
  dataUrlOrBase64: string
): ParsedImage | { error: string } {
  const trimmed = dataUrlOrBase64.trim();
  if (!trimmed) return { error: 'Imagen vacía' };

  let mime = 'image/png';
  let b64 = trimmed;

  if (trimmed.startsWith('data:')) {
    const match = /^data:([^;]+);base64,(.+)$/i.exec(trimmed);
    if (!match) return { error: 'Data URL inválida' };
    mime = match[1].toLowerCase();
    b64 = match[2];
  }

  const ext = ALLOWED_MIME[mime];
  if (!ext) {
    return { error: `Tipo de imagen no permitido: ${mime}` };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(b64, 'base64');
  } catch {
    return { error: 'Base64 inválido' };
  }

  if (buffer.length === 0) return { error: 'Imagen vacía' };
  if (buffer.length > MAX_BYTES) {
    return { error: `Imagen demasiado grande (máx ${MAX_BYTES / 1024 / 1024} MB)` };
  }

  return { buffer, mime, ext };
}

export async function parseFileInput(file: File): Promise<ParsedImage | { error: string }> {
  const mime = (file.type || 'image/png').toLowerCase();
  const ext = ALLOWED_MIME[mime];
  if (!ext) return { error: `Tipo de archivo no permitido: ${mime}` };

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.length === 0) return { error: 'Archivo vacío' };
  if (buffer.length > MAX_BYTES) {
    return { error: `Archivo demasiado grande (máx ${MAX_BYTES / 1024 / 1024} MB)` };
  }

  return { buffer, mime, ext };
}

export function buildObjectPath(
  solicitudId: string,
  kind: UploadKind,
  ext: string
): string {
  const stamp = Date.now();
  return `${solicitudId}/${kind}-${stamp}.${ext}`;
}

export interface UploadResult {
  bucket: WebBucket;
  path: string;
  signedUrl: string;
}

/** Sube un buffer y devuelve path + URL firmada (7 días). */
export async function uploadWebImage(
  solicitudId: string,
  kind: UploadKind,
  image: ParsedImage
): Promise<UploadResult | { error: string }> {
  const bucket = KIND_TO_BUCKET[kind];
  const path = buildObjectPath(solicitudId, kind, image.ext);
  const supabase = getSupabaseAdmin();

  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(path, image.buffer, {
      contentType: image.mime,
      upsert: false,
    });

  if (upErr) {
    return { error: upErr.message };
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  if (signErr || !signed?.signedUrl) {
    return { error: signErr?.message ?? 'No se pudo generar URL firmada' };
  }

  return { bucket, path, signedUrl: signed.signedUrl };
}

export type MockupFileColumnUpdate = {
  url: 'archivo_base_url' | 'imagen_optimizada_url' | 'mockup_cuero_url' | 'mockup_madera_url';
  path: 'archivo_base_path' | 'imagen_optimizada_path' | 'mockup_cuero_path' | 'mockup_madera_path';
};

export function mockupColumnsForKind(kind: UploadKind): MockupFileColumnUpdate {
  switch (kind) {
    case 'logo_original':
      return { url: 'archivo_base_url', path: 'archivo_base_path' };
    case 'logo_optimizado':
      return { url: 'imagen_optimizada_url', path: 'imagen_optimizada_path' };
    case 'mockup_cuero':
      return { url: 'mockup_cuero_url', path: 'mockup_cuero_path' };
    case 'mockup_madera':
      return { url: 'mockup_madera_url', path: 'mockup_madera_path' };
  }
}
