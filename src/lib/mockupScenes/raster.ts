/**
 * Utilidades de raster en Float32 para las muestras por escena.
 * Todo trabaja sobre buffers planos (un canal) o RGB intercalado (3 canales).
 */

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

/** Box blur separable (in place) con radio entero. */
function boxBlurPass(src: Float32Array, dst: Float32Array, w: number, h: number, r: number): void {
  if (r <= 0) {
    dst.set(src);
    return;
  }
  const tmp = new Float32Array(w * h);
  const norm = 1 / (2 * r + 1);
  // Horizontal
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let acc = 0;
    for (let k = -r; k <= r; k++) acc += src[row + clamp(k, 0, w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = acc * norm;
      const add = src[row + Math.min(x + r + 1, w - 1)];
      const sub = src[row + Math.max(x - r, 0)];
      acc += add - sub;
    }
  }
  // Vertical
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let k = -r; k <= r; k++) acc += tmp[clamp(k, 0, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      dst[y * w + x] = acc * norm;
      const add = tmp[Math.min(y + r + 1, h - 1) * w + x];
      const sub = tmp[Math.max(y - r, 0) * w + x];
      acc += add - sub;
    }
  }
}

/** Aproximación de desenfoque gaussiano (3 pasadas de box blur). Sigma en píxeles. */
export function blur(src: Float32Array, w: number, h: number, sigma: number): Float32Array {
  const out = new Float32Array(src.length);
  if (sigma < 0.3) {
    out.set(src);
    return out;
  }
  // Radio de box equivalente para 3 pasadas.
  const r = Math.max(1, Math.round(Math.sqrt((12 * sigma * sigma) / 3 + 1) / 2 - 0.5));
  const a = new Float32Array(src.length);
  boxBlurPass(src, a, w, h, r);
  boxBlurPass(a, out, w, h, r);
  boxBlurPass(out, a, w, h, r);
  return a;
}

/** Muestreo bilineal de un canal; fuera de rango devuelve `outside`. */
export function sample1(src: Float32Array, w: number, h: number, x: number, y: number, outside = 0): number {
  if (x < 0 || y < 0 || x > w - 1 || y > h - 1) return outside;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, w - 1);
  const y1 = Math.min(y0 + 1, h - 1);
  const fx = x - x0;
  const fy = y - y0;
  const a = src[y0 * w + x0];
  const b = src[y0 * w + x1];
  const c = src[y1 * w + x0];
  const d = src[y1 * w + x1];
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

/** Muestreo bilineal RGB intercalado (bordes recortados). */
export function sampleRgb(
  src: Float32Array,
  w: number,
  h: number,
  x: number,
  y: number,
  out: [number, number, number],
): void {
  const cx = clamp(x, 0, w - 1);
  const cy = clamp(y, 0, h - 1);
  const x0 = Math.floor(cx);
  const y0 = Math.floor(cy);
  const x1 = Math.min(x0 + 1, w - 1);
  const y1 = Math.min(y0 + 1, h - 1);
  const fx = cx - x0;
  const fy = cy - y0;
  for (let c = 0; c < 3; c++) {
    const a = src[(y0 * w + x0) * 3 + c];
    const b = src[(y0 * w + x1) * 3 + c];
    const d0 = src[(y1 * w + x0) * 3 + c];
    const e = src[(y1 * w + x1) * 3 + c];
    out[c] = (a * (1 - fx) + b * fx) * (1 - fy) + (d0 * (1 - fx) + e * fx) * fy;
  }
}

/** Luminancia de un buffer RGB intercalado. */
export function luminance(rgb: Float32Array, n: number): Float32Array {
  const out = new Float32Array(n);
  for (let p = 0, i = 0; p < n; p++, i += 3) {
    out[p] = 0.299 * rgb[i] + 0.587 * rgb[i + 1] + 0.114 * rgb[i + 2];
  }
  return out;
}

/** Gradiente central (por píxel). */
export function gradient(src: Float32Array, w: number, h: number): { gx: Float32Array; gy: Float32Array } {
  const gx = new Float32Array(w * h);
  const gy = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const l = src[y * w + Math.max(x - 1, 0)];
      const r = src[y * w + Math.min(x + 1, w - 1)];
      const u = src[Math.max(y - 1, 0) * w + x];
      const d = src[Math.min(y + 1, h - 1) * w + x];
      gx[p] = (r - l) / 2;
      gy[p] = (d - u) / 2;
    }
  }
  return { gx, gy };
}

/** Hash determinístico 2D → [0,1). */
function hash2(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Ruido de valor suave 2D, escala en píxeles. Devuelve ~[-1, 1]. */
export function valueNoise(x: number, y: number, scale: number, seed: number): number {
  const fx = x / scale;
  const fy = y / scale;
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const a = hash2(x0, y0, seed);
  const b = hash2(x0 + 1, y0, seed);
  const c = hash2(x0, y0 + 1, seed);
  const d = hash2(x0 + 1, y0 + 1, seed);
  return (mix(mix(a, b, sx), mix(c, d, sx), sy)) * 2 - 1;
}

/** Ruido blanco determinístico por píxel, ~[-1, 1]. */
export function pixelNoise(x: number, y: number, seed: number): number {
  return hash2(x, y, seed) * 2 - 1;
}
