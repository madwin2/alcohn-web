/**
 * Medidas para tarjetas Pequeño / Mediano / Grande.
 * Usa filas reales de `precios_sello_medida_grupo` (Supabase) y valida que la medida
 * mostrada del sello cotice en el mismo grupo que la tarjeta.
 */

import type { CotizadorCatalog, GrupoCodigo, MedidaGrupoFila } from './types';
import { resolveGrupoCodigoMm } from './quote';

export type SuggestedTierKey = 'pequeño' | 'mediano' | 'grande';

export type CatalogMeasureCm = { ancho: number; largo: number };

const areaCm = (m: CatalogMeasureCm) => m.ancho * m.largo;

function refAspectRatio(ref: CatalogMeasureCm): number {
  return ref.largo > 0 ? ref.ancho / ref.largo : 1;
}

/** Agrupa medidas del catálogo Supabase por `grupo_codigo`. */
export function catalogMeasuresByGrupo(
  filas: MedidaGrupoFila[]
): Record<GrupoCodigo, CatalogMeasureCm[]> {
  const acc: Record<GrupoCodigo, CatalogMeasureCm[]> = {
    chicos: [],
    medianos: [],
    grandes: [],
    xl: [],
  };
  const seen = new Set<string>();
  for (const f of filas) {
    const key = `${f.ancho}:${f.largo}`;
    if (seen.has(key)) continue;
    seen.add(key);
    acc[f.grupo_codigo].push({ ancho: f.ancho, largo: f.largo });
  }
  for (const g of Object.keys(acc) as GrupoCodigo[]) {
    acc[g].sort((a, b) => a.ancho - b.ancho || a.largo - b.largo);
  }
  return acc;
}

/** Logo casi cuadrado (ej. 60×58 mm). */
export function isSquareLogo(aspectWidthOverHeight: number): boolean {
  const ar = Math.max(0.05, Math.min(30, aspectWidthOverHeight));
  return Math.abs(ar - 1) <= 0.08;
}

function stampLongSideMm(widthMm: number, heightMm: number): number {
  return Math.max(widthMm, heightMm);
}

function stampResolvesToGrupo(
  catalog: CotizadorCatalog,
  widthMm: number,
  heightMm: number,
  expectedGrupo: GrupoCodigo
): boolean {
  const resolved = resolveGrupoCodigoMm(catalog, widthMm, heightMm);
  return resolved?.grupo === expectedGrupo;
}

function scoreRefs(
  rows: CatalogMeasureCm[],
  logoAspectRatio: number,
  options?: { maxLongCm?: number }
): CatalogMeasureCm[] {
  const ar = Math.max(0.05, Math.min(30, logoAspectRatio));
  const eligible =
    options?.maxLongCm != null
      ? rows.filter((r) => r.ancho <= options.maxLongCm + 0.001)
      : rows;
  const list = eligible.length > 0 ? eligible : rows;

  return [...list].sort((a, b) => {
    const aDist = Math.abs(Math.log(refAspectRatio(a)) - Math.log(ar));
    const bDist = Math.abs(Math.log(refAspectRatio(b)) - Math.log(ar));
    if (Math.abs(aDist - bDist) > 0.08) return aDist - bDist;
    return areaCm(b) - areaCm(a);
  });
}

/**
 * Elige una fila del catálogo cuyo sello (logo dentro del sobre) cotice en `expectedGrupo`.
 */
function pickCatalogRefForTier(
  catalog: CotizadorCatalog,
  rows: CatalogMeasureCm[],
  logoAr: number,
  expectedGrupo: GrupoCodigo,
  options?: { maxLongCm?: number; minStampLongMm?: number }
): CatalogMeasureCm | null {
  if (rows.length === 0) return null;

  const ranked = scoreRefs(rows, logoAr, options);

  for (const ref of ranked) {
    const fit = fitLogoInCatalogEnvelope(ref, logoAr);
    if (
      options?.minStampLongMm != null &&
      stampLongSideMm(fit.widthMm, fit.heightMm) < options.minStampLongMm
    ) {
      continue;
    }
    if (stampResolvesToGrupo(catalog, fit.widthMm, fit.heightMm, expectedGrupo)) {
      return ref;
    }
  }

  const byArea = [...rows].sort((a, b) => areaCm(b) - areaCm(a));
  for (const ref of byArea) {
    const fit = fitLogoInCatalogEnvelope(ref, logoAr);
    if (stampResolvesToGrupo(catalog, fit.widthMm, fit.heightMm, expectedGrupo)) {
      return ref;
    }
  }

  return ranked[0] ?? rows[0];
}

export function catalogRefToDisplayMm(ref: CatalogMeasureCm): {
  widthMm: number;
  heightMm: number;
  ratio: number;
} {
  const widthMm = Math.round(ref.ancho * 10);
  const heightMm = Math.round(ref.largo * 10);
  const ratio = heightMm > 0 ? widthMm / heightMm : 1;
  return { widthMm, heightMm, ratio };
}

/** Etiqueta de medida para UI (ej. 40×38mm). */
export function formatStampSizeMm(widthMm: number, heightMm: number): string {
  return `${widthMm}×${heightMm}mm`;
}

/**
 * Medida del sello en mm: el dibujo del logo encajado en el sobre de la fila del catálogo
 * (lado largo × lado corto), sin deformar la proporción.
 */
export function fitLogoInCatalogEnvelope(
  ref: CatalogMeasureCm,
  aspectRatio: number
): { widthMm: number; heightMm: number; ratio: number } {
  const longMm = Math.round(ref.ancho * 10);
  const shortMm = Math.round(ref.largo * 10);
  const ar = Math.max(0.05, Math.min(30, aspectRatio));

  if (ar >= 1) {
    let widthMm = longMm;
    let heightMm = Math.round(widthMm / ar);
    if (heightMm > shortMm) {
      heightMm = shortMm;
      widthMm = Math.round(heightMm * ar);
    }
    return { widthMm, heightMm, ratio: heightMm > 0 ? widthMm / heightMm : ar };
  }

  let heightMm = longMm;
  let widthMm = Math.round(heightMm * ar);
  if (widthMm > shortMm) {
    widthMm = shortMm;
    heightMm = Math.round(widthMm / ar);
  }
  return { widthMm, heightMm, ratio: heightMm > 0 ? widthMm / heightMm : ar };
}

type BuiltTier = {
  tier: SuggestedTierKey;
  grupo: GrupoCodigo;
  ref: CatalogMeasureCm;
  recommended: boolean;
  widthMm: number;
  heightMm: number;
  ratio: number;
};

type TierPresetMm = {
  tier: SuggestedTierKey;
  candidates: Array<{ widthMm: number; heightMm: number }>;
  allowedGroups: GrupoCodigo[];
};

const SQUARE_TIER_PRESETS: TierPresetMm[] = [
  {
    tier: 'pequeño',
    candidates: [{ widthMm: 25, heightMm: 25 }],
    allowedGroups: ['chicos'],
  },
  {
    tier: 'mediano',
    candidates: [{ widthMm: 40, heightMm: 40 }],
    allowedGroups: ['medianos'],
  },
  {
    tier: 'grande',
    candidates: [{ widthMm: 60, heightMm: 60 }],
    allowedGroups: ['grandes', 'xl'],
  },
];

/**
 * Límites del sello mostrado (mm).
 * Pequeño/mediano acotados; grande usa solo referencias de catálogo ~6–10 cm de largo.
 */
const TIER_STAMP_LIMITS: Record<
  SuggestedTierKey,
  {
    maxLongMm?: number;
    preferLongMm?: number;
    maxLongCm?: number;
    preferLargerEnvelope?: boolean;
  }
> = {
  pequeño: { maxLongMm: 50, preferLongMm: 50, maxLongCm: 5 },
  mediano: { maxLongMm: 60, preferLongMm: 60, maxLongCm: 6 },
  grande: { maxLongMm: 100, preferLongMm: 80, maxLongCm: 10, preferLargerEnvelope: false },
};

/** Sobres de referencia por tier (cm en catálogo). La UI muestra el logo encajado, misma proporción en los 3. */
const RECTANGULAR_TIER_PRESETS: TierPresetMm[] = [
  {
    tier: 'pequeño',
    candidates: [
      { widthMm: 50, heightMm: 10 },
      { widthMm: 30, heightMm: 20 },
      { widthMm: 40, heightMm: 20 },
    ],
    allowedGroups: ['chicos'],
  },
  {
    tier: 'mediano',
    // Priorizar sobres ~5–6 cm de ancho; sin 70×40 ni 80×40 en este tier.
    candidates: [
      { widthMm: 50, heightMm: 30 },
      { widthMm: 50, heightMm: 25 },
      { widthMm: 50, heightMm: 20 },
      { widthMm: 40, heightMm: 30 },
      { widthMm: 40, heightMm: 25 },
      { widthMm: 60, heightMm: 30 },
      { widthMm: 50, heightMm: 40 },
    ],
    allowedGroups: ['medianos'],
  },
  {
    tier: 'grande',
    // Referencias "Sellos grandes" (cm→mm): 6×4 … 10×2, 7×3, 8×3, etc. Sin sobres gigantes.
    candidates: [
      { widthMm: 60, heightMm: 40 },
      { widthMm: 70, heightMm: 40 },
      { widthMm: 80, heightMm: 40 },
      { widthMm: 70, heightMm: 50 },
      { widthMm: 70, heightMm: 30 },
      { widthMm: 80, heightMm: 30 },
      { widthMm: 90, heightMm: 20 },
      { widthMm: 80, heightMm: 25 },
      { widthMm: 90, heightMm: 25 },
      { widthMm: 100, heightMm: 25 },
      { widthMm: 100, heightMm: 20 },
    ],
    allowedGroups: ['grandes', 'xl'],
  },
];

/** Convierte medida de referencia (mm) a fila de catálogo (cm, largo × corto). */
function referenceMmToCatalogRef(widthMm: number, heightMm: number): CatalogMeasureCm {
  const longMm = Math.max(widthMm, heightMm);
  const shortMm = Math.min(widthMm, heightMm);
  return { ancho: longMm / 10, largo: shortMm / 10 };
}

function presetCandidatesToRefs(preset: TierPresetMm): CatalogMeasureCm[] {
  return preset.candidates.map((c) => referenceMmToCatalogRef(c.widthMm, c.heightMm));
}

type PresetPickOptions = {
  maxLongCm?: number;
  minStampLongMm?: number;
  maxStampLongMm?: number;
  /** Lado largo deseado del sello (ej. 50 mm chico, 60 mm mediano). */
  preferStampLongMm?: number;
  /** En grande: priorizar sobres más grandes (70–80 mm). */
  preferLargerEnvelope?: boolean;
  tier?: SuggestedTierKey;
};

/** Ordena sobres: proporción del logo, luego cercanía al ancho objetivo del tier. */
function scorePresetRefs(
  refs: CatalogMeasureCm[],
  logoAr: number,
  options?: PresetPickOptions
): CatalogMeasureCm[] {
  const ar = Math.max(0.05, Math.min(30, logoAr));
  const prefer = options?.preferStampLongMm;

  return [...refs]
    .map((ref) => {
      const fit = fitLogoInCatalogEnvelope(ref, logoAr);
      const fitLong = stampLongSideMm(fit.widthMm, fit.heightMm);
      const aspectDist = Math.abs(Math.log(refAspectRatio(ref)) - Math.log(ar));
      const widthDist = prefer != null ? Math.abs(fitLong - prefer) : 0;
      return { ref, aspectDist, widthDist, fitLong };
    })
    .filter(({ ref, fitLong }) => {
      if (options?.maxLongCm != null && ref.ancho > options.maxLongCm + 0.001) {
        return false;
      }
      if (options?.maxStampLongMm != null && fitLong > options.maxStampLongMm + 0.5) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (Math.abs(a.aspectDist - b.aspectDist) > 0.1) {
        return a.aspectDist - b.aspectDist;
      }
      if (prefer != null && Math.abs(a.widthDist - b.widthDist) > 0.5) {
        return a.widthDist - b.widthDist;
      }
      return options?.preferLargerEnvelope
        ? areaCm(b.ref) - areaCm(a.ref)
        : areaCm(a.ref) - areaCm(b.ref);
    })
    .map((row) => row.ref);
}

/**
 * Elige el sobre de referencia del tier (no la medida final del sello).
 * La medida mostrada sale de encajar el logo en ese sobre sin deformarlo.
 */
function pickPresetReference(
  catalog: CotizadorCatalog,
  refs: CatalogMeasureCm[],
  logoAr: number,
  allowedGroups: GrupoCodigo[],
  options?: PresetPickOptions
): CatalogMeasureCm | null {
  if (refs.length === 0) return null;

  const ranked = scorePresetRefs(refs, logoAr, options);
  const list = ranked.length > 0 ? ranked : refs;

  for (const ref of list) {
    const fit = fitLogoInCatalogEnvelope(ref, logoAr);
    const fitLong = stampLongSideMm(fit.widthMm, fit.heightMm);
    if (options?.minStampLongMm != null && fitLong < options.minStampLongMm) {
      continue;
    }
    if (options?.maxStampLongMm != null && fitLong > options.maxStampLongMm + 0.5) {
      continue;
    }
    const resolved = resolveGrupoCodigoMm(catalog, fit.widthMm, fit.heightMm);
    if (resolved && allowedGroups.includes(resolved.grupo)) {
      return ref;
    }
  }

  for (const ref of list) {
    const fit = fitLogoInCatalogEnvelope(ref, logoAr);
    const fitLong = stampLongSideMm(fit.widthMm, fit.heightMm);
    if (options?.minStampLongMm != null && fitLong < options.minStampLongMm) {
      continue;
    }
    if (options?.maxStampLongMm != null && fitLong > options.maxStampLongMm + 0.5) {
      continue;
    }
    const resolved = resolveGrupoCodigoMm(catalog, fit.widthMm, fit.heightMm);
    if (resolved && allowedGroups.includes(resolved.grupo)) {
      return ref;
    }
  }

  return null;
}

function isGrandeGrupo(grupo: GrupoCodigo): boolean {
  return grupo === 'grandes' || grupo === 'xl';
}

/**
 * Grande: solo las referencias del preset (sellos grandes reales).
 * Elige el menor sello que siga siendo "grande" en precio; si ninguno, el sobre más parecido (≤10 cm).
 */
function pickGrandeReference(
  catalog: CotizadorCatalog,
  preset: TierPresetMm,
  logoAr: number,
  options?: PresetPickOptions
): CatalogMeasureCm | null {
  const lim = TIER_STAMP_LIMITS.grande;
  const refs = presetCandidatesToRefs(preset);
  const maxLong = options?.maxStampLongMm ?? lim.maxLongMm ?? 100;
  const minLong = options?.minStampLongMm;

  const ranked = scorePresetRefs(refs, logoAr, {
    ...options,
    tier: 'grande',
    maxLongCm: lim.maxLongCm,
    maxStampLongMm: maxLong,
    preferStampLongMm: lim.preferLongMm,
    preferLargerEnvelope: false,
  });

  type Row = {
    ref: CatalogMeasureCm;
    fitLong: number;
    aspectDist: number;
    isGrande: boolean;
  };

  const ar = Math.max(0.05, Math.min(30, logoAr));
  const rows: Row[] = [];

  for (const ref of ranked) {
    const fit = fitLogoInCatalogEnvelope(ref, logoAr);
    const fitLong = stampLongSideMm(fit.widthMm, fit.heightMm);
    if (minLong != null && fitLong < minLong) continue;
    if (fitLong > maxLong + 0.5) continue;
    const resolved = resolveGrupoCodigoMm(catalog, fit.widthMm, fit.heightMm);
    rows.push({
      ref,
      fitLong,
      aspectDist: Math.abs(Math.log(refAspectRatio(ref)) - Math.log(ar)),
      isGrande: Boolean(resolved && isGrandeGrupo(resolved.grupo)),
    });
  }

  const byAspect = (a: Row, b: Row) => a.aspectDist - b.aspectDist || a.fitLong - b.fitLong;

  const grandeRows = rows.filter((r) => r.isGrande).sort((a, b) => a.fitLong - b.fitLong || byAspect(a, b));
  if (grandeRows.length > 0) {
    return grandeRows[0].ref;
  }

  if (rows.length > 0) {
    return [...rows].sort(byAspect)[0].ref;
  }

  return ranked[0] ?? null;
}

function presetPickOptions(
  tier: SuggestedTierKey,
  extra?: PresetPickOptions
): PresetPickOptions {
  const lim = TIER_STAMP_LIMITS[tier];
  return {
    tier,
    maxLongCm: lim.maxLongCm,
    maxStampLongMm: lim.maxLongMm,
    preferStampLongMm: lim.preferLongMm,
    preferLargerEnvelope: lim.preferLargerEnvelope,
    ...extra,
  };
}

function buildPresetTier(
  catalog: CotizadorCatalog,
  preset: TierPresetMm,
  logoAr: number,
  extraOptions?: PresetPickOptions
): BuiltTier | null {
  const pickOpts = presetPickOptions(preset.tier, extraOptions);
  const ref =
    preset.tier === 'grande'
      ? pickGrandeReference(catalog, preset, logoAr, pickOpts)
      : pickPresetReference(
          catalog,
          presetCandidatesToRefs(preset),
          logoAr,
          preset.allowedGroups,
          pickOpts
        );
  if (!ref) return null;

  const fit = fitLogoInCatalogEnvelope(ref, logoAr);
  const resolved = resolveGrupoCodigoMm(catalog, fit.widthMm, fit.heightMm);
  if (!resolved) return null;
  // Pequeño/mediano deben cotizar en su grupo; grande usa solo referencias del preset (tamaño razonable).
  if (preset.tier !== 'grande' && !preset.allowedGroups.includes(resolved.grupo)) {
    return null;
  }

  return {
    tier: preset.tier,
    grupo: resolved.grupo,
    ref,
    recommended: preset.tier === 'mediano',
    widthMm: fit.widthMm,
    heightMm: fit.heightMm,
    ratio: fit.ratio,
  };
}

function bumpTierRef(
  catalog: CotizadorCatalog,
  tier: BuiltTier,
  rows: CatalogMeasureCm[],
  logoAr: number,
  expectedGrupo: GrupoCodigo,
  minStampLongMm: number
): BuiltTier {
  const ref = pickCatalogRefForTier(catalog, rows, logoAr, expectedGrupo, {
    minStampLongMm,
  });
  if (!ref) return tier;
  const fit = fitLogoInCatalogEnvelope(ref, logoAr);
  const resolved = resolveGrupoCodigoMm(catalog, fit.widthMm, fit.heightMm);
  return {
    ...tier,
    ref,
    grupo: resolved?.grupo ?? tier.grupo,
    widthMm: fit.widthMm,
    heightMm: fit.heightMm,
    ratio: fit.ratio,
  };
}

function bumpPresetTier(
  catalog: CotizadorCatalog,
  tier: BuiltTier,
  preset: TierPresetMm,
  logoAr: number,
  minStampLongMm: number
): BuiltTier {
  const pickOpts = presetPickOptions(preset.tier, { minStampLongMm });
  const ref =
    preset.tier === 'grande'
      ? pickGrandeReference(catalog, preset, logoAr, pickOpts)
      : pickPresetReference(
          catalog,
          presetCandidatesToRefs(preset),
          logoAr,
          preset.allowedGroups,
          pickOpts
        );
  if (!ref) return tier;
  const fit = fitLogoInCatalogEnvelope(ref, logoAr);
  const resolved = resolveGrupoCodigoMm(catalog, fit.widthMm, fit.heightMm);
  return {
    ...tier,
    ref,
    grupo: resolved?.grupo ?? tier.grupo,
    widthMm: fit.widthMm,
    heightMm: fit.heightMm,
    ratio: fit.ratio,
  };
}

function enforceTierOrder(
  catalog: CotizadorCatalog,
  tiers: BuiltTier[],
  logoAr: number,
  presets?: TierPresetMm[]
): BuiltTier[] {
  const byGrupo = catalogMeasuresByGrupo(catalog.medidaGrupoFilas);
  const presetByTier = presets
    ? Object.fromEntries(presets.map((p) => [p.tier, p])) as Partial<
        Record<SuggestedTierKey, TierPresetMm>
      >
    : null;

  let peque = tiers.find((t) => t.tier === 'pequeño')!;
  let medio = tiers.find((t) => t.tier === 'mediano')!;
  let grande = tiers.find((t) => t.tier === 'grande')!;

  const pequeLong = stampLongSideMm(peque.widthMm, peque.heightMm);
  let medioLong = stampLongSideMm(medio.widthMm, medio.heightMm);

  if (medioLong <= pequeLong) {
    const medPreset = presetByTier?.mediano;
    medio = medPreset
      ? bumpPresetTier(catalog, medio, medPreset, logoAr, pequeLong + 1)
      : bumpTierRef(catalog, medio, byGrupo.medianos, logoAr, 'medianos', pequeLong + 1);
    medioLong = stampLongSideMm(medio.widthMm, medio.heightMm);
  }

  let grandeLong = stampLongSideMm(grande.widthMm, grande.heightMm);
  if (grandeLong <= medioLong) {
    const grandePreset = presetByTier?.grande;
    if (grandePreset) {
      grande = bumpPresetTier(catalog, grande, grandePreset, logoAr, medioLong + 1);
      const resolved = resolveGrupoCodigoMm(catalog, grande.widthMm, grande.heightMm);
      if (resolved) grande.grupo = resolved.grupo;
    } else {
      const grandeRows = isSquareLogo(logoAr) ? byGrupo.xl : byGrupo.grandes;
      const grandeGrupo: GrupoCodigo = isSquareLogo(logoAr) ? 'xl' : 'grandes';
      grande = bumpTierRef(catalog, grande, grandeRows, logoAr, grandeGrupo, medioLong + 1);
      grande.grupo = grandeGrupo;
    }
  }

  return [peque, medio, grande];
}

function buildLegacyTierDimensions(aspectRatio: number, catalog: CotizadorCatalog): BuiltTier[] | null {
  const ar = Math.max(0.05, Math.min(30, aspectRatio));
  const square = isSquareLogo(ar);
  const byGrupo = catalogMeasuresByGrupo(catalog.medidaGrupoFilas);

  const pequeRef = pickCatalogRefForTier(catalog, byGrupo.chicos, ar, 'chicos', {
    maxLongCm: 5,
  });
  const medioRef = pickCatalogRefForTier(catalog, byGrupo.medianos, ar, 'medianos', {
    maxLongCm: 6,
  });
  const grandeRows = square ? byGrupo.xl : byGrupo.grandes;
  const grandeGrupo: GrupoCodigo = square ? 'xl' : 'grandes';
  const grandeRef = pickCatalogRefForTier(catalog, grandeRows, ar, grandeGrupo);

  if (!pequeRef || !medioRef || !grandeRef) {
    return null;
  }

  let built: BuiltTier[] = [
    {
      tier: 'pequeño',
      grupo: 'chicos',
      ref: pequeRef,
      recommended: false,
      ...fitLogoInCatalogEnvelope(pequeRef, ar),
    },
    {
      tier: 'mediano',
      grupo: 'medianos',
      ref: medioRef,
      recommended: true,
      ...fitLogoInCatalogEnvelope(medioRef, ar),
    },
    {
      tier: 'grande',
      grupo: grandeGrupo,
      ref: grandeRef,
      recommended: false,
      ...fitLogoInCatalogEnvelope(grandeRef, ar),
    },
  ];

  built = enforceTierOrder(catalog, built, ar);
  return built;
}

export type SuggestedTierDimension = {
  tier: SuggestedTierKey;
  grupo: GrupoCodigo;
  size: string;
  recommended?: boolean;
  ratio: number;
  refCm: CatalogMeasureCm;
};

/**
 * Tres opciones Pequeño / Mediano / Grande desde el catálogo Supabase.
 * La medida mostrada es el sello real; el cotizador debe clasificarla en el grupo de la tarjeta.
 */
export function buildSuggestedTierDimensions(
  aspectRatio: number,
  catalog: CotizadorCatalog
): SuggestedTierDimension[] {
  const ar = Math.max(0.05, Math.min(30, aspectRatio));
  const square = isSquareLogo(ar);
  const presets = square ? SQUARE_TIER_PRESETS : RECTANGULAR_TIER_PRESETS;
  let built: BuiltTier[] = presets
    .map((preset) => buildPresetTier(catalog, preset, ar))
    .filter((tier): tier is BuiltTier => Boolean(tier));

  const have = new Set(built.map((t) => t.tier));
  const grandePreset = presets.find((p) => p.tier === 'grande');

  if (!have.has('grande') && grandePreset) {
    const medio = built.find((t) => t.tier === 'mediano');
    const minLong = medio
      ? stampLongSideMm(medio.widthMm, medio.heightMm) + 1
      : undefined;
    const grande = buildPresetTier(catalog, grandePreset, ar, { minStampLongMm: minLong });
    if (grande) {
      built.push(grande);
      have.add('grande');
    }
  }

  if (built.length === 3) {
    built = enforceTierOrder(catalog, built, ar, presets);
    const grandeIdx = built.findIndex((t) => t.tier === 'grande');
    const grandeRow = grandeIdx >= 0 ? built[grandeIdx] : undefined;
    if (grandeRow && !isGrandeGrupo(grandeRow.grupo) && grandePreset) {
      const medio = built.find((t) => t.tier === 'mediano');
      const minLong = medio
        ? stampLongSideMm(medio.widthMm, medio.heightMm) + 1
        : undefined;
      const fixed = buildPresetTier(catalog, grandePreset, ar, { minStampLongMm: minLong });
      if (fixed) {
        built[grandeIdx] = fixed;
      }
    }
  } else if (built.length === 0) {
    built = buildLegacyTierDimensions(ar, catalog) ?? [];
  } else if (!have.has('grande') && grandePreset) {
    const medio = built.find((t) => t.tier === 'mediano');
    const minLong = medio
      ? stampLongSideMm(medio.widthMm, medio.heightMm) + 1
      : undefined;
    const grande = buildPresetTier(catalog, grandePreset, ar, { minStampLongMm: minLong });
    if (grande) {
      built.push(grande);
      built = enforceTierOrder(catalog, built, ar, presets);
    }
  }

  if (built.length === 0) return [];

  return built.map(({ tier, grupo, ref, recommended, widthMm, heightMm, ratio }) => ({
    tier,
    grupo,
    size: formatStampSizeMm(widthMm, heightMm),
    recommended,
    ratio,
    refCm: ref,
  }));
}
