import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CotizadorCatalog, GrupoCodigo, MedidaFijaFila, MedidaGrupoFila } from './types';
import { isGrupoCodigo } from './quote';
import { round4 } from './utils';

type GrupoRow = { user_id: string; codigo: string; precio_transferencia: number };
type MedidaGrupoRow = { ancho: number; largo: number; grupo_codigo: string };
type MedidaFijaRow = { ancho: number; largo: number; precio_transferencia: number };

const GRUPOS_INICIAL: Record<GrupoCodigo, number> = {
  chicos: 0,
  medianos: 0,
  grandes: 0,
  xl: 0,
};

export async function loadCotizadorCatalog(
  supabase: SupabaseClient
): Promise<CotizadorCatalog | null> {
  const { data: grupoSample, error: ownerErr } = await supabase
    .from('precios_sello_grupo')
    .select('user_id')
    .limit(1)
    .maybeSingle();

  if (ownerErr || !grupoSample?.user_id) {
    console.error('[cotizador] no se pudo resolver catalog user_id', ownerErr?.message);
    return null;
  }

  const catalogUserId = grupoSample.user_id;

  const [gruposRes, medidaGrupoRes, medidaFijaRes] = await Promise.all([
    supabase
      .from('precios_sello_grupo')
      .select('codigo,precio_transferencia')
      .eq('user_id', catalogUserId),
    supabase
      .from('precios_sello_medida_grupo')
      .select('ancho,largo,grupo_codigo')
      .eq('user_id', catalogUserId),
    supabase
      .from('precios_sello_medida_fija')
      .select('ancho,largo,precio_transferencia')
      .eq('user_id', catalogUserId),
  ]);

  if (gruposRes.error || medidaGrupoRes.error || medidaFijaRes.error) {
    console.error('[cotizador] error cargando tablas', {
      grupos: gruposRes.error?.message,
      medidaGrupo: medidaGrupoRes.error?.message,
      medidaFija: medidaFijaRes.error?.message,
    });
    return null;
  }

  const precioPorGrupo = { ...GRUPOS_INICIAL };
  for (const row of (gruposRes.data ?? []) as GrupoRow[]) {
    if (!isGrupoCodigo(row.codigo)) continue;
    precioPorGrupo[row.codigo] = Math.round(Number(row.precio_transferencia));
  }

  const medidaAGrupo: Record<string, GrupoCodigo> = {};
  const medidaGrupoFilas: MedidaGrupoFila[] = [];

  for (const row of (medidaGrupoRes.data ?? []) as MedidaGrupoRow[]) {
    if (!isGrupoCodigo(row.grupo_codigo)) continue;
    const ancho = round4(Number(row.ancho));
    const largo = round4(Number(row.largo));
    const k = `${ancho}:${largo}`;
    medidaAGrupo[k] = row.grupo_codigo;
    medidaGrupoFilas.push({ ancho, largo, grupo_codigo: row.grupo_codigo });
  }

  const precioFijoPorMedida: Record<string, number> = {};
  const medidaFijaFilas: MedidaFijaFila[] = [];
  for (const row of (medidaFijaRes.data ?? []) as MedidaFijaRow[]) {
    const ancho = round4(Number(row.ancho));
    const largo = round4(Number(row.largo));
    const k = `${ancho}:${largo}`;
    const precio = Math.round(Number(row.precio_transferencia));
    precioFijoPorMedida[k] = precio;
    medidaFijaFilas.push({ ancho, largo, precio_transferencia: precio });
  }

  return {
    catalogUserId,
    precioPorGrupo,
    medidaAGrupo,
    precioFijoPorMedida,
    medidaGrupoFilas,
    medidaFijaFilas,
  };
}
