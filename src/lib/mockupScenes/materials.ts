/**
 * Efecto de cada material sobre la región de la foto donde va el sello.
 *
 * Todos reciben la máscara del logo ya proyectada sobre la superficie y con el
 * contacto aplicado (0 = no toca, 1 = marca completa) y devuelven el RGB nuevo
 * de la región. La mezcla final con la foto y el grano los hace `render.ts`.
 */
import {
  blur,
  clamp,
  clamp01,
  gradient,
  luminance,
  mix,
  pixelNoise,
  sample1,
  sampleRgb,
  smoothstep,
  valueNoise,
} from './raster';
import type { SceneMaterial } from './scenes';

/**
 * Cómo “apoya” el sello en cada material (lo que hace que la marca no sea perfecta):
 * - wobble: el borde del trazo se corre un poco (fibras, miga, poros), en mm.
 * - tilt: el sello nunca entra 100% derecho; un lado marca más que el otro.
 * - pressureNoise: zonas de la pieza más altas o más bajas (presión despareja).
 * - reliefK: lo alto de la textura de la foto (miga, poros, arcilla) toca más.
 * - fade: rango de presión en el que la marca pasa de no verse a verse completa.
 */
export const MATERIAL_FEEL: Record<
  SceneMaterial,
  {
    wobbleMm: number;
    wobbleScaleMm: number;
    tilt: number;
    pressureNoise: number;
    pressureScaleMm: number;
    reliefK: number;
    fade: [number, number];
  }
> = {
  pan: { wobbleMm: 0.2, wobbleScaleMm: 0.9, tilt: 0.28, pressureNoise: 0.25, pressureScaleMm: 7, reliefK: 2.2, fade: [0.22, 0.88] },
  fruta: { wobbleMm: 0.14, wobbleScaleMm: 0.6, tilt: 0.28, pressureNoise: 0.28, pressureScaleMm: 4, reliefK: 2.8, fade: [0.22, 0.88] },
  hielo: { wobbleMm: 0.08, wobbleScaleMm: 1.2, tilt: 0.08, pressureNoise: 0.1, pressureScaleMm: 8, reliefK: 0, fade: [0.1, 0.7] },
  ceramica: { wobbleMm: 0.05, wobbleScaleMm: 0.45, tilt: 0.22, pressureNoise: 0.14, pressureScaleMm: 8, reliefK: 1.2, fade: [0.25, 0.95] },
};

export interface MaterialCtx {
  w: number;
  h: number;
  /** RGB original de la región (0-255), intercalado. No se modifica. */
  rgb: Float32Array;
  /** Máscara del logo con contacto aplicado (0-1). */
  mask: Float32Array;
  /** Píxeles por mm. */
  ppm: number;
  /** Dirección hacia la luz (normalizada, plano de la imagen). */
  light: [number, number];
  /** Origen de la región dentro de la foto (para que el ruido no dependa del recorte). */
  ox: number;
  oy: number;
  seed: number;
  /** Textura real de quemado (pan, piel): color en el punto (x, y) de la región. */
  burnTex?: (x: number, y: number, out: [number, number, number]) => void;
  /**
   * Seno del ángulo entre la cámara y la normal de la superficie (0 = vista desde arriba).
   * Con la pieza inclinada se ve la pared del fondo del hueco y no la de adelante.
   */
  viewTiltSin?: number;
}

/**
 * Aplica luz/sombra sin saturar: las sombras multiplican (oscurecen el color), pero las luces
 * aclaran hacia un blanco cálido neutro, como un reflejo real. Multiplicar un color ya saturado
 * (naranja) por más de 1 lo vuelve “neón”.
 */
function shadeNatural(rgb: [number, number, number], s: number, highlightStrength = 0.55): void {
  if (s <= 1) {
    rgb[0] *= s;
    rgb[1] *= s;
    rgb[2] *= s;
    return;
  }
  const t = clamp01((s - 1) * highlightStrength);
  rgb[0] = mix(rgb[0], 246, t);
  rgb[1] = mix(rgb[1], 236, t);
  rgb[2] = mix(rgb[2], 222, t);
}

type Relief = {
  /** Altura en mm (negativa dentro del hundimiento). */
  z: Float32Array;
  /** Cambio de iluminación por la pendiente (≈ -1..1). */
  shade: Float32Array;
  /** Pendientes en mm/mm (para refracción). */
  sx: Float32Array;
  sy: Float32Array;
};

/** Relieve hundido a partir de la máscara: perfil del borde, profundidad y reborde opcional. */
function debossRelief(
  ctx: MaterialCtx,
  opts: { profileMm: number; depthMm: number; rimMm?: number; rimHeightMm?: number },
): Relief {
  const { w, h, mask, ppm, light } = ctx;
  const n = w * h;
  const prof = blur(mask, w, h, opts.profileMm * ppm);
  const z = new Float32Array(n);
  for (let p = 0; p < n; p++) {
    const t = prof[p];
    z[p] = -opts.depthMm * (t * t * (3 - 2 * t));
  }
  if (opts.rimMm && opts.rimHeightMm) {
    const wide = blur(mask, w, h, opts.rimMm * ppm);
    for (let p = 0; p < n; p++) {
      const rim = clamp01(wide[p] * 1.6 - prof[p] * 1.4);
      z[p] += rim * opts.rimHeightMm;
    }
  }
  const { gx, gy } = gradient(z, w, h);
  const shade = new Float32Array(n);
  const sx = new Float32Array(n);
  const sy = new Float32Array(n);
  for (let p = 0; p < n; p++) {
    sx[p] = gx[p] * ppm;
    sy[p] = gy[p] * ppm;
    shade[p] = -(sx[p] * light[0] + sy[p] * light[1]);
  }
  return { z, shade, sx, sy };
}

/**
 * Sombra que la pared del hundimiento proyecta sobre el fondo: la parte del fondo
 * pegada a la pared del lado de la luz queda a la sombra. Es lo que da profundidad.
 */
function castShadow(ctx: MaterialCtx, floor: Float32Array, lengthMm: number, softMm: number): Float32Array {
  const { w, h, ppm, light } = ctx;
  const d = lengthMm * ppm;
  const sh = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const f = floor[p];
      if (f < 0.01) continue;
      // Si hacia la luz, a esta distancia, ya no hay hueco, una pared tapa la luz.
      let blocked = 0;
      for (let k = 1; k <= 3; k++) {
        const t = (d * k) / 3;
        const q = sample1(floor, w, h, x + light[0] * t, y + light[1] * t, 0);
        blocked = Math.max(blocked, (1 - q) * (1 - (k - 1) * 0.25));
      }
      sh[p] = f * blocked;
    }
  }
  return blur(sh, w, h, softMm * ppm);
}

/** Detalle fino de la foto (luminancia / luminancia suavizada). */
function photoDetail(ctx: MaterialCtx, sigmaMm: number): { lum: Float32Array; detail: Float32Array; lumSoft: Float32Array } {
  const { w, h, rgb, ppm } = ctx;
  const lum = luminance(rgb, w * h);
  const lumSoft = blur(lum, w, h, sigmaMm * ppm);
  const detail = new Float32Array(w * h);
  for (let p = 0; p < detail.length; p++) detail[p] = lum[p] / Math.max(8, lumSoft[p]);
  return { lum, detail, lumSoft };
}

/** Borde irregular de quemado: la marca no queda con filo de vector. */
function irregularCore(ctx: MaterialCtx, sharpMm: number, noiseAmp: number, lo = 0.3, hi = 0.7): Float32Array {
  const { w, h, mask, ppm, ox, oy, seed } = ctx;
  const m = blur(mask, w, h, sharpMm * ppm);
  const out = new Float32Array(w * h);
  const scale = Math.max(2, 0.35 * ppm);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (m[p] <= 0.001) continue;
      const nz = valueNoise(x + ox, y + oy, scale, seed) * noiseAmp;
      out[p] = smoothstep(lo, hi, m[p] + nz) * Math.min(1, mask[p] * 4 + m[p]);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Pan: quemado oscuro, halo tostado, corteza mate dentro de la marca  */
/* ------------------------------------------------------------------ */
/**
 * Quemado con hierro caliente (pan, cáscara): núcleo casi negro y manchado,
 * borde que “sangra” hacia afuera de forma despareja y halo tostado.
 */
function burnLayers(ctx: MaterialCtx, o: { bleedMm: number; haloMm: number; coreSharpMm?: number }) {
  const { w, h, mask, ppm, ox, oy, seed } = ctx;
  const n = w * h;
  const core = irregularCore(ctx, o.coreSharpMm ?? 0.12, 0.12);
  // El calor se escapa un poco por fuera del trazo, más en unos lados que en otros.
  const bleedSrc = blur(mask, w, h, o.bleedMm * ppm);
  const haloSrc = blur(mask, w, h, o.haloMm * ppm);
  const bleed = new Float32Array(n);
  const halo = new Float32Array(n);
  const char = new Float32Array(n);
  const s1 = Math.max(2, 0.5 * ppm);
  const s2 = Math.max(2, 0.15 * ppm);
  const s3 = Math.max(2, 2.5 * ppm);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (haloSrc[p] < 0.003) continue;
      const nx = x + ox;
      const ny = y + oy;
      const edgeN = valueNoise(nx, ny, s1, seed + 5);
      bleed[p] = smoothstep(0.18, 0.55, bleedSrc[p] + edgeN * 0.12) * (1 - core[p]);
      halo[p] = clamp01(haloSrc[p] * (0.75 + 0.35 * valueNoise(nx, ny, s3, seed + 9)));
      // Manchas del quemado: zonas más negras y otras más marrones.
      char[p] = clamp01(
        0.55 + 0.3 * valueNoise(nx, ny, s1, seed + 13) + 0.22 * valueNoise(nx, ny, s2, seed + 17),
      );
    }
  }
  return { core, bleed, halo, char };
}

function applyPan(ctx: MaterialCtx): Float32Array {
  const { w, h, rgb } = ctx;
  const n = w * h;
  const out = new Float32Array(rgb);
  // Borde del quemado definido (el hierro marca con fuerza), con poco sangrado.
  const { core, bleed, halo, char } = burnLayers(ctx, { bleedMm: 0.2, haloMm: 1.1, coreSharpMm: 0.06 });
  const { detail } = photoDetail(ctx, 1.2);
  const relief = debossRelief(ctx, { profileMm: 0.25, depthMm: 0.8 });
  const tex: [number, number, number] = [0, 0, 0];
  const px: [number, number, number] = [0, 0, 0];

  for (let p = 0, i = 0; p < n; p++, i += 3) {
    const c = core[p];
    const bl = bleed[p];
    const hl = clamp01(halo[p] * 0.7 - c * 0.5);
    if (c <= 0.001 && hl <= 0.003 && bl <= 0.003) continue;
    // Textura de la corteza sin el brillo fuerte (lo quemado queda mate).
    const d = clamp(detail[p], 0.72, 1.08);
    let r = rgb[i];
    let g = rgb[i + 1];
    let b = rgb[i + 2];
    // Halo tostado: más oscuro y algo más marrón, sin saturar.
    r = mix(r, r * 0.8, hl);
    g = mix(g, g * 0.68, hl);
    b = mix(b, b * 0.6, hl);
    // Borde que sangra: marrón tostado.
    r = mix(r, 96 * d, bl * 0.7);
    g = mix(g, 50 * d, bl * 0.7);
    b = mix(b, 26 * d, bl * 0.7);
    // Núcleo: textura real de pan quemado recortada con el logo.
    let br: number;
    let bg: number;
    let bb: number;
    if (ctx.burnTex) {
      ctx.burnTex(p % w, (p / w) | 0, tex);
      const dt = clamp(d, 0.9, 1.05);
      br = (tex[0] * 1.15 + 6) * dt;
      bg = (tex[1] * 1.1 + 3) * dt;
      bb = (tex[2] * 1.1 + 2) * dt;
    } else {
      const k = char[p];
      br = mix(78, 26, k) * d;
      bg = mix(42, 15, k) * d;
      bb = mix(22, 10, k) * d;
    }
    r = mix(r, br, c);
    g = mix(g, bg, c);
    b = mix(b, bb, c);
    px[0] = r;
    px[1] = g;
    px[2] = b;
    shadeNatural(px, 1 + clamp(relief.shade[p] * 0.4, -0.3, 0.25), 0.4);
    out[i] = px[0];
    out[i + 1] = px[1];
    out[i + 2] = px[2];
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Fruta: tostado sobre la piel, poros visibles, brillo de aceite      */
/* ------------------------------------------------------------------ */
function applyFruta(ctx: MaterialCtx): Float32Array {
  const { w, h, rgb } = ctx;
  const n = w * h;
  const out = new Float32Array(rgb);
  const { core, bleed, halo, char } = burnLayers(ctx, { bleedMm: 0.22, haloMm: 0.9 });
  const { lum, lumSoft, detail } = photoDetail(ctx, 0.5);
  const relief = debossRelief(ctx, { profileMm: 0.2, depthMm: 0.6 });
  const shadow = castShadow(ctx, core, 0.3, 0.08);
  const tex: [number, number, number] = [0, 0, 0];
  const px: [number, number, number] = [0, 0, 0];

  for (let p = 0, i = 0; p < n; p++, i += 3) {
    const c0 = core[p];
    const bl = bleed[p];
    const hl = clamp01(halo[p] * 0.65 - c0 * 0.4);
    if (c0 <= 0.001 && hl <= 0.003 && bl <= 0.003) continue;
    // Los poros (más oscuros que su entorno) quedan hundidos: el sello los toca menos.
    const pore = clamp01((1 - detail[p]) * 3.5);
    const c = c0 * (1 - 0.4 * pore);
    const d = clamp(detail[p], 0.75, 1.2);
    let r = rgb[i];
    let g = rgb[i + 1];
    let b = rgb[i + 2];
    const L = 0.299 * r + 0.587 * g + 0.114 * b;
    // Halo: la piel alrededor se tuesta hacia un marrón apagado (baja la saturación, no la sube).
    r = mix(r, L * 0.86, hl * 0.55);
    g = mix(g, L * 0.56, hl * 0.55);
    b = mix(b, L * 0.32, hl * 0.55);
    // Borde que sangra: marrón tostado, no naranja vivo.
    r = mix(r, 118 * d, bl * 0.6);
    g = mix(g, 60 * d, bl * 0.6);
    b = mix(b, 26 * d, bl * 0.6);
    // Núcleo: textura real de piel quemada recortada con el logo, llevada a marrón.
    if (ctx.burnTex) {
      ctx.burnTex(p % w, (p / w) | 0, tex);
      const dt = clamp(d, 0.85, 1.1);
      r = mix(r, (tex[0] * 1.55 + 24) * dt, c);
      g = mix(g, (tex[1] * 1.05 + 9) * dt, c);
      b = mix(b, (tex[2] * 0.65 + 3) * dt, c);
    } else {
      const k = char[p];
      r = mix(r, mix(96, 34, k) * d, c);
      g = mix(g, mix(44, 17, k) * d, c);
      b = mix(b, mix(14, 8, k) * d, c);
    }
    px[0] = r;
    px[1] = g;
    px[2] = b;
    // Relieve: sombras multiplican; luces aclaran hacia blanco cálido (no neón).
    const s = (1 + clamp(relief.shade[p] * 0.7, -0.4, 0.3)) * (1 - 0.3 * shadow[p]);
    shadeNatural(px, s, 0.35);
    // Brillo del aceite dentro de la marca: reflejo neutro y suave.
    const spec = clamp01((Math.max(0, lum[p] - lumSoft[p] * 1.08) / 90) * c);
    px[0] = mix(px[0], 236, spec * 0.5);
    px[1] = mix(px[1], 226, spec * 0.5);
    px[2] = mix(px[2], 212, spec * 0.5);
    out[i] = px[0];
    out[i + 1] = px[1];
    out[i + 2] = px[2];
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Cerámica horneada: impresión profunda vista en perspectiva           */
/* ------------------------------------------------------------------ */
function applyCeramica(ctx: MaterialCtx): Float32Array {
  const { w, h, rgb, mask, ppm } = ctx;
  const n = w * h;
  const out = new Float32Array(rgb);
  const depthMm = 1.3;
  // Bordes apenas redondeados por la cocción, reborde leve de arcilla desplazada.
  const relief = debossRelief(ctx, { profileMm: 0.16, depthMm, rimMm: 0.8, rimHeightMm: 0.1 });
  const floor = blur(mask, w, h, 0.14 * ppm);
  const ao = blur(mask, w, h, 0.9 * ppm);
  // Con la pieza inclinada, el fondo del hueco se ve corrido hacia la cámara:
  // aparece la pared de atrás (arriba del trazo) y la de adelante queda oculta.
  const wallPx = depthMm * ppm * (ctx.viewTiltSin ?? 0);
  const wall = new Float32Array(n);
  const floorVis = new Float32Array(n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const f = floor[p];
      if (f < 0.002) continue;
      const below = wallPx > 0 ? sample1(floor, w, h, x, y - wallPx, 0) : f;
      floorVis[p] = Math.min(f, below);
      wall[p] = clamp01(f - below);
    }
  }
  // Sombra que proyecta la pared del lado de la luz sobre el fondo.
  const shadow = castShadow(ctx, floorVis, 0.7, 0.18);
  // El fondo queda algo más liso (el sello compacta la arcilla), pero conserva el grano.
  const lum = luminance(rgb, n);
  const lumSmooth = blur(lum, w, h, 0.25 * ppm);
  const px: [number, number, number] = [0, 0, 0];
  const lightDown = clamp01(-ctx.light[1]);

  for (let p = 0, i = 0; p < n; p++, i += 3) {
    const sh = relief.shade[p];
    const f = floor[p];
    if (Math.abs(sh) < 0.002 && f < 0.002) continue;
    const smooth = floorVis[p] * 0.35;
    const tex = mix(1, lumSmooth[p] / Math.max(8, lum[p]), smooth);
    // Oclusión suave en el fondo de trazos angostos.
    const occl = floorVis[p] * (0.06 + 0.1 * (1 - clamp01(ao[p] * 1.4)));
    // Pared de atrás: mira a la cámara y queda de espaldas a una luz que viene de arriba.
    const wallShade = 1 - wall[p] * (0.1 + 0.1 * lightDown);
    const lit = sh > 0 ? sh * 1.5 : sh * 0.75;
    const s = (1 + clamp(lit, -0.3, 0.8)) * (1 - occl) * (1 - 0.2 * shadow[p]) * wallShade * tex;
    px[0] = rgb[i];
    px[1] = rgb[i + 1];
    px[2] = rgb[i + 2];
    shadeNatural(px, s, 0.9);
    out[i] = px[0];
    out[i + 1] = px[1];
    out[i + 2] = px[2];
  }
  return out;
}


/* ------------------------------------------------------------------ */
/* Hielo: hundimiento derretido, refracción, brillos de agua           */
/* ------------------------------------------------------------------ */
function applyHielo(ctx: MaterialCtx): Float32Array {
  const { w, h, rgb, mask, ppm, light, ox, oy, seed } = ctx;
  const n = w * h;
  const out = new Float32Array(rgb);
  // El bronce caliente derrite: paredes anchas y redondeadas, no un corte fino.
  const relief = debossRelief(ctx, { profileMm: 0.4, depthMm: 1.4 });
  const floor = blur(mask, w, h, 0.28 * ppm);
  // Alrededor del hueco el hielo queda más blanco/lechoso (agua que se vuelve a congelar).
  const ringWide = blur(mask, w, h, 1.4 * ppm);
  const ringNear = blur(mask, w, h, 0.45 * ppm);
  const refractPx = 1.4 * ppm;
  const px: [number, number, number] = [0, 0, 0];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const i = p * 3;
      const f = floor[p];
      const sh = relief.shade[p];
      const slope = Math.hypot(relief.sx[p], relief.sy[p]);
      const ring = clamp01((ringWide[p] - ringNear[p] * 0.9) * 2.2) *
        (0.7 + 0.3 * valueNoise(x + ox, y + oy, 0.6 * ppm, seed + 3));
      if (f < 0.002 && slope < 0.002 && ring < 0.003) continue;
      // Refracción: lo que se ve a través del hueco se desplaza según la pendiente.
      sampleRgb(rgb, w, h, x - relief.sx[p] * refractPx, y - relief.sy[p] * refractPx, px);
      let r = px[0];
      let g = px[1];
      let b = px[2];
      // Película de agua en el fondo: un poco más clara y lechosa, con variación suave.
      // El fondo derretido queda esmerilado: se lee la marca aunque el trago sea oscuro.
      const film = f * (0.15 + 0.05 * valueNoise(x + ox, y + oy, 0.8 * ppm, seed));
      r = mix(r, 235, film);
      g = mix(g, 215, film);
      b = mix(b, 200, film);
      // Bordes: reflejo fino y nítido del lado de la luz y línea oscura del otro.
      const lit = clamp01(sh * 1.3);
      const spec = Math.pow(lit, 2.4) * 255;
      const dark = clamp01(-sh * 1.3) * 0.4;
      // Reflexión interna en las paredes del hueco (el borde brilla).
      const edge = clamp01(slope * 0.9) * 0.11;
      r = r * (1 - dark) + spec + edge * 255;
      g = g * (1 - dark) + spec * 0.95 + edge * 240;
      b = b * (1 - dark) + spec * 0.88 + edge * 225;
      // Aro lechoso alrededor de la marca.
      r = mix(r, 225, ring * 0.2);
      g = mix(g, 212, ring * 0.2);
      b = mix(b, 205, ring * 0.2);
      // Micro irregularidad del derretido.
      const jitter = 1 + pixelNoise(x + ox, y + oy, seed) * 0.02 * f;
      out[i] = r * jitter;
      out[i + 1] = g * jitter;
      out[i + 2] = b * jitter;
      void light;
    }
  }
  return out;
}

export function applyMaterial(material: SceneMaterial, ctx: MaterialCtx): Float32Array {
  switch (material) {
    case 'pan':
      return applyPan(ctx);
    case 'fruta':
      return applyFruta(ctx);
    case 'ceramica':
      return applyCeramica(ctx);
    case 'hielo':
      return applyHielo(ctx);
  }
}
