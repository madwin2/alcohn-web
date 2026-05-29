import type {
  CotizacionResult,
  CotizadorCatalog,
  FuentePrecio,
  GrupoCodigo,
} from './types';
import {
  aplicarReglasPlanchuela,
  claveMedida,
  orientarMedida,
  precioLinkDesdeTransferencia,
  round4,
} from './utils';

const GRUPOS: GrupoCodigo[] = ['chicos', 'medianos', 'grandes', 'xl'];

/** Línea de referencia del lado corto (misma tabla que inferencia de grupo). */
export function lineaReferenciaLargo(largo: number): number | null {
  if (largo < 1.35) return 1;
  if (largo < 2.25) return 2;
  if (largo < 2.75) return 2.5;
  if (largo < 3.5) return 3;
  if (largo < 4.5) return 4;
  if (largo < 5.5) return 5;
  if (largo <= 6.5) return 6;
  return null;
}

type MedidaFijaMatch = { ancho: number; largo: number; precio: number };

/**
 * Precio fijo: match exacto, luego misma Lref en el lado corto (ej. 12×5,9 → 12×6),
 * luego escalado por ancho en filas fijas de esa línea (como E2 pero en medida_fija).
 */
function buscarPrecioFijo(
  catalog: CotizadorCatalog,
  ancho: number,
  largo: number
): MedidaFijaMatch | null {
  const k = claveMedida(ancho, largo);
  const exacto = catalog.precioFijoPorMedida[k];
  if (exacto != null && Number.isFinite(exacto)) {
    return { ancho, largo, precio: exacto };
  }

  const lref = lineaReferenciaLargo(largo);
  if (lref != null) {
    const kLref = claveMedida(ancho, lref);
    const porLref = catalog.precioFijoPorMedida[kLref];
    if (porLref != null && Number.isFinite(porLref)) {
      return { ancho, largo: lref, precio: porLref };
    }

    const filas = catalog.medidaFijaFilas.filter((f) => Math.abs(f.largo - lref) < 0.001);
    const debajo = filas.filter((f) => f.ancho <= ancho + 0.001);
    if (debajo.length > 0) {
      const mejor = debajo.reduce((a, b) => (a.ancho >= b.ancho ? a : b));
      const dist = Math.abs(mejor.ancho - ancho) + Math.abs(mejor.largo - lref);
      if (dist <= 0.4) {
        return {
          ancho: mejor.ancho,
          largo: mejor.largo,
          precio: mejor.precio_transferencia,
        };
      }
    }
    const arriba = filas.filter((f) => f.ancho >= ancho - 0.001);
    if (arriba.length > 0) {
      const mejor = arriba.reduce((a, b) => (a.ancho <= b.ancho ? a : b));
      const dist = Math.abs(mejor.ancho - ancho) + Math.abs(mejor.largo - lref);
      if (dist <= 0.4) {
        return {
          ancho: mejor.ancho,
          largo: mejor.largo,
          precio: mejor.precio_transferencia,
        };
      }
    }
  }

  let best: (typeof catalog.medidaFijaFilas)[number] | null = null;
  let bestDist = Infinity;
  for (const f of catalog.medidaFijaFilas) {
    const dist = Math.abs(f.ancho - ancho) + Math.abs(f.largo - largo);
    if (dist < bestDist) {
      bestDist = dist;
      best = f;
    }
  }
  if (best && bestDist <= 0.4) {
    return {
      ancho: best.ancho,
      largo: best.largo,
      precio: best.precio_transferencia,
    };
  }

  return null;
}

function precioGrupo(
  catalog: CotizadorCatalog,
  grupo: GrupoCodigo
): { transferencia: number; link: number } | null {
  const transferencia = catalog.precioPorGrupo[grupo];
  if (!Number.isFinite(transferencia) || transferencia <= 0) return null;
  return {
    transferencia: Math.round(transferencia),
    link: precioLinkDesdeTransferencia(transferencia),
  };
}

function buildResult(
  ancho: number,
  largo: number,
  transferencia: number,
  fuente: FuentePrecio
): CotizacionResult {
  const t = Math.round(transferencia);
  return {
    ancho_cm: ancho,
    alto_cm: largo,
    precio_transferencia_ars: t,
    precio_link_ars: precioLinkDesdeTransferencia(t),
    fuente,
  };
}

function inferirGrupoPorLadoCorto(
  catalog: CotizadorCatalog,
  ancho: number,
  largo: number
): GrupoCodigo | null {
  const lref = lineaReferenciaLargo(largo);
  if (lref === null) return null;

  const filas = catalog.medidaGrupoFilas.filter((f) => Math.abs(f.largo - lref) < 0.001);
  if (filas.length === 0) return null;

  const debajo = filas.filter((f) => f.ancho <= ancho + 0.001);
  if (debajo.length > 0) {
    const mejor = debajo.reduce((a, b) => (a.ancho >= b.ancho ? a : b));
    return mejor.grupo_codigo;
  }

  const arriba = filas.filter((f) => f.ancho >= ancho - 0.001);
  if (arriba.length > 0) {
    const mejor = arriba.reduce((a, b) => (a.ancho <= b.ancho ? a : b));
    return mejor.grupo_codigo;
  }

  return null;
}

function aproximarGrupoManhattan(
  catalog: CotizadorCatalog,
  ancho: number,
  largo: number
): GrupoCodigo | null {
  let best: (typeof catalog.medidaGrupoFilas)[number] | null = null;
  let bestDist = Infinity;

  for (const f of catalog.medidaGrupoFilas) {
    const dist = Math.abs(f.ancho - ancho) + Math.abs(f.largo - largo);
    if (dist < bestDist) {
      bestDist = dist;
      best = f;
    }
  }

  if (!best || bestDist > 0.4) return null;
  return best.grupo_codigo;
}

/**
 * Resuelve el grupo de precio (chicos / medianos / grandes / xl) para una medida en cm.
 * Usa la misma normalización que `cotizarRectangular`. Devuelve null si solo aplica precio fijo o no hay grupo.
 */
export function resolveGrupoCodigo(
  catalog: CotizadorCatalog,
  anchoCm: number,
  altoCm: number
): { grupo: GrupoCodigo; ancho_cm: number; alto_cm: number; fuente: FuentePrecio } | null {
  if (!Number.isFinite(anchoCm) || !Number.isFinite(altoCm) || anchoCm <= 0 || altoCm <= 0) {
    return null;
  }

  const oriented = orientarMedida(anchoCm, altoCm);
  const planchuela = aplicarReglasPlanchuela(oriented.ancho, oriented.largo);
  const ancho = planchuela.ancho;
  const largo = planchuela.largo;
  const k = claveMedida(ancho, largo);

  if (buscarPrecioFijo(catalog, ancho, largo)) {
    return null;
  }

  const grupoExacto = catalog.medidaAGrupo[k];
  if (grupoExacto) {
    return { grupo: grupoExacto, ancho_cm: ancho, alto_cm: largo, fuente: 'grupo_exacto' };
  }

  const inferido = inferirGrupoPorLadoCorto(catalog, ancho, largo);
  if (inferido) {
    return { grupo: inferido, ancho_cm: ancho, alto_cm: largo, fuente: 'grupo_inferido' };
  }

  const aprox = aproximarGrupoManhattan(catalog, ancho, largo);
  if (aprox) {
    return { grupo: aprox, ancho_cm: ancho, alto_cm: largo, fuente: 'grupo_aproximado' };
  }

  return null;
}

/** Resuelve grupo desde milímetros (UI del wizard). */
export function resolveGrupoCodigoMm(
  catalog: CotizadorCatalog,
  anchoMm: number,
  altoMm: number
): ReturnType<typeof resolveGrupoCodigo> {
  return resolveGrupoCodigo(catalog, anchoMm / 10, altoMm / 10);
}

/**
 * Cotiza un sello rectangular clásico (cm).
 * @returns null si la medida queda fuera de rango inferible.
 */
export function cotizarRectangular(
  catalog: CotizadorCatalog,
  anchoCm: number,
  altoCm: number
): CotizacionResult | null {
  if (!Number.isFinite(anchoCm) || !Number.isFinite(altoCm) || anchoCm <= 0 || altoCm <= 0) {
    return null;
  }

  const oriented = orientarMedida(anchoCm, altoCm);
  const planchuela = aplicarReglasPlanchuela(oriented.ancho, oriented.largo);
  const ancho = planchuela.ancho;
  const largo = planchuela.largo;
  const k = claveMedida(ancho, largo);

  const fijo = buscarPrecioFijo(catalog, ancho, largo);
  if (fijo) {
    return buildResult(fijo.ancho, fijo.largo, fijo.precio, 'medida_fija');
  }

  const grupoExacto = catalog.medidaAGrupo[k];
  if (grupoExacto) {
    const precio = precioGrupo(catalog, grupoExacto);
    if (!precio) return null;
    return buildResult(ancho, largo, precio.transferencia, 'grupo_exacto');
  }

  const inferido = inferirGrupoPorLadoCorto(catalog, ancho, largo);
  if (inferido) {
    const precio = precioGrupo(catalog, inferido);
    if (!precio) return null;
    return buildResult(ancho, largo, precio.transferencia, 'grupo_inferido');
  }

  const aprox = aproximarGrupoManhattan(catalog, ancho, largo);
  if (aprox) {
    const precio = precioGrupo(catalog, aprox);
    if (!precio) return null;
    return buildResult(ancho, largo, precio.transferencia, 'grupo_aproximado');
  }

  return null;
}

/** Cotiza desde milímetros (UI del wizard). */
export function cotizarRectangularMm(
  catalog: CotizadorCatalog,
  anchoMm: number,
  altoMm: number
): CotizacionResult | null {
  return cotizarRectangular(catalog, anchoMm / 10, altoMm / 10);
}

export function isGrupoCodigo(s: string): s is GrupoCodigo {
  return (GRUPOS as string[]).includes(s);
}

/** Valida que el catálogo cargado tenga los cuatro grupos. */
export function catalogoTieneGrupos(catalog: CotizadorCatalog): boolean {
  return GRUPOS.every((g) => Number.isFinite(catalog.precioPorGrupo[g]) && catalog.precioPorGrupo[g] > 0);
}
