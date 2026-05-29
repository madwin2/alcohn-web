import 'server-only';
import type { CotizadorCatalog } from './types';
import { loadCotizadorCatalog } from './catalog';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { catalogoTieneGrupos } from './quote';

const TTL_MS = 8 * 60 * 1000; // 8 minutos

let cached: CotizadorCatalog | null = null;
let cachedAt = 0;
let inflight: Promise<CotizadorCatalog | null> | null = null;

export async function getCotizadorCatalog(): Promise<CotizadorCatalog | null> {
  const now = Date.now();
  if (cached && now - cachedAt < TTL_MS && catalogoTieneGrupos(cached)) {
    return cached;
  }

  if (!inflight) {
    inflight = (async () => {
      try {
        const catalog = await loadCotizadorCatalog(getSupabaseAdmin());
        if (catalog && catalogoTieneGrupos(catalog)) {
          cached = catalog;
          cachedAt = Date.now();
          return catalog;
        }
        return null;
      } finally {
        inflight = null;
      }
    })();
  }

  return inflight;
}
