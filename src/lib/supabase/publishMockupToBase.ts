import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { WEB_BUCKETS } from './storage';

/** Bucket que usa la app interna de gestión para el archivo base del sello. */
export const GESTION_BUCKET_BASE = 'base';

type AdminClient = SupabaseClient<unknown>;

function resolveStorageLocation(
  path: string | null | undefined,
  kind: 'logo' | 'mockup'
): { bucket: string; objectPath: string } | null {
  if (!path?.trim()) return null;
  const p = path.trim();
  if (p.startsWith(`${WEB_BUCKETS.logos}/`)) {
    return { bucket: WEB_BUCKETS.logos, objectPath: p.slice(WEB_BUCKETS.logos.length + 1) };
  }
  if (p.startsWith(`${WEB_BUCKETS.mockups}/`)) {
    return { bucket: WEB_BUCKETS.mockups, objectPath: p.slice(WEB_BUCKETS.mockups.length + 1) };
  }
  const bucket = kind === 'mockup' ? WEB_BUCKETS.mockups : WEB_BUCKETS.logos;
  return { bucket, objectPath: p };
}

function extFromPath(path: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(path);
  return m ? m[1].toLowerCase() : 'png';
}

function mimeForExt(ext: string): string {
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'pdf') return 'application/pdf';
  return 'image/png';
}

/**
 * Copia el logo del mockup (optimizado u original) al bucket `base` y devuelve
 * la ruta para `sellos.archivo_base` (la app de gestión lee ese bucket).
 */
export async function publishMockupLogoToBaseBucket(
  supabase: AdminClient,
  mockupSolicitudId: string,
  ordenId: string
): Promise<{ path: string; publicUrl: string | null } | null> {
  const { data: mockup, error } = await supabase
    .from('mockup_solicitudes')
    .select(
      'imagen_optimizada_path, archivo_base_path, imagen_optimizada_url, archivo_base_url'
    )
    .eq('id', mockupSolicitudId)
    .maybeSingle();

  if (error || !mockup) {
    console.error('[publishMockupToBase] mockup', error?.message);
    return null;
  }

  const row = mockup as {
    imagen_optimizada_path?: string | null;
    archivo_base_path?: string | null;
  };

  const optimPath = row.imagen_optimizada_path?.trim();
  const basePath = row.archivo_base_path?.trim();
  const located =
    resolveStorageLocation(optimPath, 'logo') ||
    resolveStorageLocation(basePath, 'logo');
  if (!located) return null;

  const { data: blob, error: dlErr } = await supabase.storage
    .from(located.bucket)
    .download(located.objectPath);

  if (dlErr || !blob) {
    console.error('[publishMockupToBase] download', dlErr?.message);
    return null;
  }

  const ext = extFromPath(located.objectPath);
  const destPath = `${ordenId}/${mockupSolicitudId}-logo.${ext}`;
  const buffer = Buffer.from(await blob.arrayBuffer());

  const { error: upErr } = await supabase.storage.from(GESTION_BUCKET_BASE).upload(destPath, buffer, {
    contentType: mimeForExt(ext),
    upsert: true,
  });

  if (upErr) {
    console.error('[publishMockupToBase] upload base', upErr.message);
    return null;
  }

  const { data: pub } = supabase.storage.from(GESTION_BUCKET_BASE).getPublicUrl(destPath);

  return { path: destPath, publicUrl: pub?.publicUrl ?? null };
}
