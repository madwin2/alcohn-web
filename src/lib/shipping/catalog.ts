import type { CorreoSucursalRow, ShippingCatalog, SucursalCatalogEntry } from './types';
import { buildSucursalDomicilio, canonicalizeProvince, normalizeKey } from './normalize';

export function buildShippingCatalog(rows: CorreoSucursalRow[]): ShippingCatalog {
  const provinceSet = new Set<string>();
  const localitiesMap = new Map<string, Set<string>>();
  const branchesMap = new Map<string, SucursalCatalogEntry[]>();

  for (const row of rows) {
    if (row.activa === false) continue;
    const provinciaRaw = row.provincia?.trim();
    if (!provinciaRaw) continue;
    const provincia = canonicalizeProvince(provinciaRaw) ?? provinciaRaw;
    const localidad = row.localidad?.trim() || '';
    if (!localidad) continue;

    provinceSet.add(provincia);
    if (!localitiesMap.has(provincia)) {
      localitiesMap.set(provincia, new Set());
    }
    localitiesMap.get(provincia)!.add(localidad);

    const codigo = row.codigo?.trim();
    if (!codigo) continue;
    const domicilio = buildSucursalDomicilio(row.calle ?? '', row.numero ?? '');
    const entry: SucursalCatalogEntry = {
      codigo_sucursal: codigo,
      provincia,
      localidad,
      domicilio,
    };
    const key = `${normalizeKey(provincia)}|${normalizeKey(localidad)}`;
    if (!branchesMap.has(key)) branchesMap.set(key, []);
    const list = branchesMap.get(key)!;
    if (!list.some((b) => b.codigo_sucursal === codigo)) {
      list.push(entry);
    }
  }

  const provinces = [...provinceSet].sort((a, b) => a.localeCompare(b, 'es'));
  const localitiesByProvince: Record<string, string[]> = {};
  for (const [prov, locs] of localitiesMap) {
    localitiesByProvince[prov] = [...locs].sort((a, b) => a.localeCompare(b, 'es'));
  }
  const branchesByKey: Record<string, SucursalCatalogEntry[]> = {};
  for (const [key, branches] of branchesMap) {
    branchesByKey[key] = branches.sort((a, b) =>
      a.domicilio.localeCompare(b.domicilio, 'es')
    );
  }

  return { provinces, localitiesByProvince, branchesByKey };
}

export function catalogKey(provincia: string, localidad: string): string {
  return `${normalizeKey(provincia)}|${normalizeKey(localidad)}`;
}

export function getBranchesFor(
  catalog: ShippingCatalog,
  provincia: string,
  localidad: string
): SucursalCatalogEntry[] {
  return catalog.branchesByKey[catalogKey(provincia, localidad)] ?? [];
}
