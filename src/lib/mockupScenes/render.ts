/**
 * Muestra por escena: el logo se dibuja a escala real sobre una foto del objeto
 * (pan, piel de cítrico, hielo, cerámica), siguiendo su curvatura y su luz.
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { buildMockupMaskFromRgba } from '@/lib/mockupPythonLikeEffects';
import { applyMaterial, MATERIAL_FEEL } from './materials';
import {
  blur,
  clamp,
  clamp01,
  luminance,
  pixelNoise,
  sample1,
  sampleRgb,
  smoothstep,
  valueNoise,
} from './raster';
import { MOCKUP_SCENES, type MockupScene } from './scenes';

type Photo = { rgb: Float32Array; w: number; h: number };

const photoCache = new Map<string, Promise<Photo>>();

function sceneDirs(): string[] {
  return [path.join(process.cwd(), 'public', 'mockup-scenes')];
}

function loadImageFile(relFile: string): Promise<Photo> {
  const cached = photoCache.get(relFile);
  if (cached) return cached;
  const promise = (async () => {
    const file = sceneDirs()
      .map((d) => path.join(d, relFile))
      .find((p) => fs.existsSync(p));
    if (!file) throw new Error(`No se encontró la imagen ${relFile}`);
    const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const rgb = new Float32Array(info.width * info.height * 3);
    for (let i = 0; i < rgb.length; i++) rgb[i] = data[i];
    return { rgb, w: info.width, h: info.height };
  })();
  photoCache.set(relFile, promise);
  promise.catch(() => photoCache.delete(relFile));
  return promise;
}

function loadPhoto(scene: MockupScene): Promise<Photo> {
  return loadImageFile(scene.file);
}

/** Muestreo de textura repetida en espejo (sin cortes visibles). */
function mirroredTexSampler(tex: Photo, scale: number, ox: number, oy: number, shift: number) {
  const tmp: [number, number, number] = [0, 0, 0];
  const period = (v: number, n: number) => {
    const m = ((v % (2 * n)) + 2 * n) % (2 * n);
    return m < n ? m : 2 * n - 1 - m;
  };
  return (x: number, y: number, out: [number, number, number]) => {
    const tx = period((x + ox) * scale + shift, tex.w - 1);
    const ty = period((y + oy) * scale + shift * 0.7, tex.h - 1);
    sampleRgb(tex.rgb, tex.w, tex.h, tx, ty, tmp);
    out[0] = tmp[0];
    out[1] = tmp[1];
    out[2] = tmp[2];
  };
}

/** Medida del logo en mm: la medida pedida (o la de la escena) ajustada a lo que entra en el objeto. */
function resolveLogoMm(
  scene: MockupScene,
  aspect: number,
  size?: { widthMm: number; heightMm: number } | null,
): { wMm: number; hMm: number; fitted: boolean } {
  let wMm: number;
  let hMm: number;
  if (size && size.widthMm > 0 && size.heightMm > 0) {
    // El logo ocupa la placa del sello manteniendo su proporción.
    const s = Math.min(size.widthMm / aspect, size.heightMm);
    hMm = s;
    wMm = s * aspect;
  } else if (aspect >= 1) {
    wMm = scene.defaultLongMm;
    hMm = wMm / aspect;
  } else {
    hMm = scene.defaultLongMm;
    wMm = hMm * aspect;
  }
  const ppm = scene.pxPerMm;
  const fy = scene.surface.kind === 'flat' ? scene.surface.foreshorten ?? 1 : 1;
  let shrink = 1;
  if (scene.zone.kind === 'ellipse') {
    const rx = scene.zone.rx / ppm;
    const ry = scene.zone.ry / (ppm * fy);
    const k = Math.sqrt((wMm / 2 / rx) ** 2 + (hMm / 2 / ry) ** 2);
    if (k > 1) shrink = 1 / k;
  } else {
    const hw = scene.zone.hw / ppm;
    const hh = scene.zone.hh / (ppm * fy);
    shrink = Math.min(1, hw / (wMm / 2), hh / (hMm / 2));
  }
  return { wMm: wMm * shrink, hMm: hMm * shrink, fitted: shrink < 0.999 };
}

/** Logo → máscara 0-1 en el plano de la superficie (resolución `res` px/mm, con margen). */
async function logoMaskOnSurface(
  preparedLogo: Buffer,
  wMm: number,
  hMm: number,
  res: number,
  padMm: number,
): Promise<{ mask: Float32Array; mw: number; mh: number }> {
  const lw = Math.max(2, Math.round(wMm * res));
  const lh = Math.max(2, Math.round(hMm * res));
  const pad = Math.round(padMm * res);
  const mw = lw + pad * 2;
  const mh = lh + pad * 2;
  const resized = await sharp(preparedLogo)
    .resize(lw, lh, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const meta = await sharp(resized).metadata();
  const left = pad + Math.round((lw - (meta.width ?? lw)) / 2);
  const top = pad + Math.round((lh - (meta.height ?? lh)) / 2);
  const { data } = await sharp({
    create: { width: mw, height: mh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: resized, left, top }])
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const mask = buildMockupMaskFromRgba(new Uint8ClampedArray(data), mw, mh);
  return { mask: new Float32Array(mask), mw, mh };
}

/** Pixel de la foto → coordenadas sobre la superficie (mm) y cuánto “cae” la superficie ahí. */
function imageToSurface(
  scene: MockupScene,
  x: number,
  y: number,
): { u: number; v: number; dropMm: number } | null {
  const ppm = scene.pxPerMm;
  const dx = (x - scene.cx) / ppm;
  const dy = (y - scene.cy) / ppm;
  const s = scene.surface;
  if (s.kind === 'flat') {
    return { u: dx, v: dy / (s.foreshorten ?? 1), dropMm: 0 };
  }
  if (s.kind === 'dome') {
    const R = s.radiusMm;
    const rho = Math.hypot(dx, dy);
    if (rho >= R * 0.999) return null;
    if (rho < 1e-6) return { u: 0, v: 0, dropMm: 0 };
    const arc = R * Math.asin(rho / R);
    return { u: (dx / rho) * arc, v: (dy / rho) * arc, dropMm: R - Math.sqrt(R * R - rho * rho) };
  }
  const R = s.radiusMm;
  if (Math.abs(dx) >= R * 0.999) return null;
  return { u: R * Math.asin(dx / R), v: dy, dropMm: R - Math.sqrt(R * R - dx * dx) };
}

/** Zona útil con borde suave (0-1). */
function zoneAlpha(scene: MockupScene, x: number, y: number): number {
  const dx = x - scene.cx;
  const dy = y - scene.cy;
  const feather = 14;
  if (scene.zone.kind === 'ellipse') {
    const { rx, ry } = scene.zone;
    const d = Math.hypot(dx / rx, dy / ry);
    const edgePx = (d - 1) * Math.min(rx, ry);
    return 1 - smoothstep(-feather, feather, edgePx);
  }
  const { hw, hh } = scene.zone;
  const ex = Math.abs(dx) - hw;
  const ey = Math.abs(dy) - hh;
  return (1 - smoothstep(-feather, feather, ex)) * (1 - smoothstep(-feather, feather, ey));
}

/** Piel de cítrico: naranja/amarillo saturado, no la madera ni el blanco del corte. */
function citrusPeelAlpha(r: number, g: number, b: number): number {
  const sat = r - b;
  return smoothstep(95, 135, sat) * smoothstep(120, 160, r);
}

function hashBuffer(buf: Buffer): number {
  let h = 2166136261;
  const step = Math.max(1, Math.floor(buf.length / 4096));
  for (let i = 0; i < buf.length; i += step) {
    h ^= buf[i];
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type SceneMockupResult = {
  buffer: Buffer;
  sceneId: string;
  logoMm: { width: number; height: number };
  /** true si el logo se achicó para entrar en el objeto. */
  fitted: boolean;
};

export async function renderSceneMockup(
  preparedLogo: Buffer,
  sceneId: string,
  opts?: { sizeMm?: { widthMm: number; heightMm: number } | null },
): Promise<SceneMockupResult> {
  const scene = MOCKUP_SCENES[sceneId];
  if (!scene) throw new Error(`Escena desconocida: ${sceneId}`);
  const photo = await loadPhoto(scene);
  const meta = await sharp(preparedLogo).metadata();
  const aspect = (meta.width ?? 1) / Math.max(1, meta.height ?? 1);
  const { wMm, hMm, fitted } = resolveLogoMm(scene, aspect, opts?.sizeMm);

  const ppm = scene.pxPerMm;
  const res = ppm * 1.5;
  const padMm = 4;
  const { mask: logoMask, mw, mh } = await logoMaskOnSurface(preparedLogo, wMm, hMm, res, padMm);
  const halfUMm = mw / res / 2;
  const halfVMm = mh / res / 2;

  // Región de la foto que puede cambiar.
  const fy = scene.surface.kind === 'flat' ? scene.surface.foreshorten ?? 1 : 1;
  const x0 = clamp(Math.floor(scene.cx - halfUMm * ppm - 8), 0, photo.w - 1);
  const x1 = clamp(Math.ceil(scene.cx + halfUMm * ppm + 8), 0, photo.w - 1);
  const y0 = clamp(Math.floor(scene.cy - halfVMm * ppm * fy - 8), 0, photo.h - 1);
  const y1 = clamp(Math.ceil(scene.cy + halfVMm * ppm * fy + 8), 0, photo.h - 1);
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const n = w * h;

  const regionRgb = new Float32Array(n * 3);
  const mask = new Float32Array(n);
  const alpha = new Float32Array(n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const gx = x + x0;
      const gy = y + y0;
      const si = (gy * photo.w + gx) * 3;
      const r = photo.rgb[si];
      const g = photo.rgb[si + 1];
      const b = photo.rgb[si + 2];
      regionRgb[p * 3] = r;
      regionRgb[p * 3 + 1] = g;
      regionRgb[p * 3 + 2] = b;
      let a = zoneAlpha(scene, gx, gy);
      if (scene.colorClip === 'citrusPeel') a *= citrusPeelAlpha(r, g, b);
      alpha[p] = a;
    }
  }

  // Relieve de la pieza leído de la foto: lo más claro a escala fina suele ser lo más alto
  // (miga, poros, arcilla) y es lo que el sello toca primero.
  const feel = MATERIAL_FEEL[scene.material];
  const lum = luminance(regionRgb, n);
  const lumFine = blur(lum, w, h, 0.25 * ppm);
  const lumBroad = blur(lum, w, h, 2 * ppm);

  const seed = hashBuffer(preparedLogo) ^ 0x5bd1e995;
  // Inclinación del sello: dirección fija por logo (la misma muestra si se regenera).
  const tiltAngle = ((seed % 3600) / 3600) * Math.PI * 2;
  const tiltX = Math.cos(tiltAngle) * feel.tilt;
  const tiltY = Math.sin(tiltAngle) * feel.tilt;
  const halfW = Math.max(1, wMm / 2);
  const halfH = Math.max(1, hMm / 2);
  const wobbleScale = feel.wobbleScaleMm * res;
  const pressureScale = feel.pressureScaleMm * res;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const s = imageToSurface(scene, x + x0, y + y0);
      if (!s) continue;
      // Borde irregular: el trazo se corre un poco según la textura del material.
      const mxp = (s.u + halfUMm) * res;
      const myp = (s.v + halfVMm) * res;
      const du = valueNoise(mxp, myp, wobbleScale, seed + 11) * feel.wobbleMm * res;
      const dv = valueNoise(mxp, myp, wobbleScale, seed + 23) * feel.wobbleMm * res;
      const m = sample1(logoMask, mw, mh, mxp + du, myp + dv);
      if (m <= 0) continue;
      // Contacto: donde la superficie cae más de lo que el material cede, el sello no marca.
      const k = s.dropMm / scene.complianceMm;
      const contact = smoothstep(0, 1, clamp01(1 - k * k));
      // Presión: inclinación del sello + pieza despareja + textura de la foto.
      const tilt = 1 + tiltX * clamp(s.u / halfW, -1, 1) + tiltY * clamp(s.v / halfH, -1, 1);
      const uneven = 1 + feel.pressureNoise * valueNoise(mxp, myp, pressureScale, seed + 37);
      const relief = clamp((lumFine[p] - lumBroad[p]) / Math.max(20, lumBroad[p]), -0.3, 0.3);
      const pressure = contact * tilt * uneven * (1 + feel.reliefK * relief);
      mask[p] = m * smoothstep(feel.fade[0], feel.fade[1], pressure);
    }
  }
  // El recorte por color se suaviza para no dejar dientes en el borde de la piel.
  const alphaSoft = scene.colorClip ? blur(alpha, w, h, 1.5) : alpha;

  let burnTex: ((x: number, y: number, out: [number, number, number]) => void) | undefined;
  if (scene.burnTexture) {
    const tex = await loadImageFile(scene.burnTexture.file);
    // Cada logo toma otra parte de la textura (no todas las marcas iguales).
    burnTex = mirroredTexSampler(tex, scene.burnTexture.texPxPerMm / ppm, x0, y0, seed % 997);
  }

  const effected = applyMaterial(scene.material, {
    w,
    h,
    rgb: regionRgb,
    mask,
    ppm,
    light: normalize(scene.light),
    ox: x0,
    oy: y0,
    seed,
    burnTex,
    viewTiltSin: Math.sqrt(Math.max(0, 1 - fy * fy)),
  });

  // Igualar la foto: el cambio se suaviza como el foco de la foto y lleva su grano.
  const delta = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
  for (let p = 0; p < n; p++) {
    for (let c = 0; c < 3; c++) delta[c][p] = (effected[p * 3 + c] - regionRgb[p * 3 + c]) * alphaSoft[p];
  }
  const blurred = delta.map((d) => blur(d, w, h, scene.photoBlurPx));

  const outRgb = Buffer.alloc(photo.w * photo.h * 3);
  for (let i = 0; i < outRgb.length; i++) outRgb[i] = photo.rgb[i];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const changed = Math.abs(blurred[0][p]) + Math.abs(blurred[1][p]) + Math.abs(blurred[2][p]);
      if (changed < 0.05) continue;
      const grain = pixelNoise(x + x0, y + y0, seed) * scene.photoNoise * clamp01(changed / 30);
      const di = ((y + y0) * photo.w + (x + x0)) * 3;
      for (let c = 0; c < 3; c++) {
        outRgb[di + c] = clamp(Math.round(regionRgb[p * 3 + c] + blurred[c][p] + grain), 0, 255);
      }
    }
  }

  let img = sharp(outRgb, { raw: { width: photo.w, height: photo.h, channels: 3 } });
  if (scene.crop) {
    // Zoom sobre la marca (sin agrandar: se mantiene la nitidez de la foto).
    const left = clamp(Math.round(scene.crop.x), 0, photo.w - 2);
    const top = clamp(Math.round(scene.crop.y), 0, photo.h - 2);
    img = img.extract({
      left,
      top,
      width: Math.min(Math.round(scene.crop.w), photo.w - left),
      height: Math.min(Math.round(scene.crop.h), photo.h - top),
    });
  }
  const buffer = await img.jpeg({ quality: 92, mozjpeg: true }).toBuffer();
  return { buffer, sceneId: scene.id, logoMm: { width: wMm, height: hMm }, fitted };
}

function normalize(v: [number, number]): [number, number] {
  const l = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / l, v[1] / l];
}
