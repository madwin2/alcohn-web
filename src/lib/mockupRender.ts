import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import {
  applyCueroEmbossPythonLike,
  applyGlobalPostEffectsLikePython,
  applyMaderaBurnFallbackTint,
  applyMaderaBurnPythonLike,
  applyMockupFinalSharpening,
  computeLogoDrawDimensionsPython,
  buildMockupMaskFromRgba,
} from './mockupPythonLikeEffects';

export const MOCKUP_OUT_W = 1400;
export const MOCKUP_OUT_H = 1000;

export type MockupMaterial = 'madera' | 'cuero' | 'cuerina' | 'carton';

const FALLBACK_BG: Record<MockupMaterial, [number, number, number]> = {
  madera: [180, 145, 100],
  carton: [195, 170, 135],
  cuero: [150, 95, 50],
  cuerina: [65, 58, 55],
};

function textureCandidates(material: MockupMaterial): string[] {
  if (material === 'cuero' || material === 'cuerina') {
    return ['cuero.jpg', 'cuero.jpeg', 'cuero.png'];
  }
  return ['madera.jpg', 'madera.jpeg', 'madera.png'];
}

function textureDirs(): string[] {
  return [
    path.join(process.cwd(), 'public', 'mockup-textures'),
    path.join(process.cwd(), 'Ejemplo de Mockup', 'textures'),
  ];
}

function findTexture(material: MockupMaterial): string | null {
  for (const dir of textureDirs()) {
    for (const name of textureCandidates(material)) {
      const p = path.join(dir, name);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

function findBurnTexture(): string | null {
  const names = ['madera-quemada.png', 'madera_quemada.png', 'madera quemada.png'];
  for (const dir of textureDirs()) {
    for (const n of names) {
      const p = path.join(dir, n);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

async function loadBackgroundRgba(material: MockupMaterial): Promise<Uint8ClampedArray> {
  const tex = findTexture(material);
  let buf: Buffer;
  if (tex) {
    buf = await sharp(tex)
      .resize(MOCKUP_OUT_W, MOCKUP_OUT_H, { fit: 'cover', position: 'centre' })
      .removeAlpha()
      .raw()
      .toBuffer();
  } else {
    const [r, g, b] = FALLBACK_BG[material];
    buf = await sharp({
      create: { width: MOCKUP_OUT_W, height: MOCKUP_OUT_H, channels: 3, background: { r, g, b } },
    })
      .raw()
      .toBuffer();
  }
  const rgba = new Uint8ClampedArray(MOCKUP_OUT_W * MOCKUP_OUT_H * 4);
  for (let i = 0, p = 0; i < buf.length; i += 3, p += 4) {
    rgba[p] = buf[i];
    rgba[p + 1] = buf[i + 1];
    rgba[p + 2] = buf[i + 2];
    rgba[p + 3] = 255;
  }
  return rgba;
}

async function loadBurnTextureFull(): Promise<Uint8ClampedArray | null> {
  const p = findBurnTexture();
  if (!p) return null;
  const { data, info } = await sharp(p)
    .resize(MOCKUP_OUT_W, MOCKUP_OUT_H, { fit: 'cover', position: 'centre' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = new Uint8ClampedArray(MOCKUP_OUT_W * MOCKUP_OUT_H * 4);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const si = (y * info.width + x) * 3;
      const di = (y * MOCKUP_OUT_W + x) * 4;
      rgba[di] = data[si];
      rgba[di + 1] = data[si + 1];
      rgba[di + 2] = data[si + 2];
      rgba[di + 3] = 255;
    }
  }
  return rgba;
}

/** Logo optimizado → lienzo drawW×drawH centrado (RGBA). */
async function rasterizeLogoForDraw(
  preparedLogo: Buffer,
  drawW: number,
  drawH: number
): Promise<Uint8ClampedArray> {
  const resized = await sharp(preparedLogo)
    .resize(drawW, drawH, {
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const rw = meta.width ?? drawW;
  const rh = meta.height ?? drawH;
  const left = Math.round((drawW - rw) / 2);
  const top = Math.round((drawH - rh) / 2);

  const { data } = await sharp({
    create: {
      width: drawW,
      height: drawH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, left, top }])
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return new Uint8ClampedArray(data);
}

function isBurnMaterial(material: MockupMaterial): material is 'madera' | 'carton' {
  return material === 'madera' || material === 'carton';
}

/**
 * Mockup con la misma lógica que mockupPipeline.ts + mockupPythonLikeEffects.ts (serverless).
 */
export async function renderMockup(preparedLogo: Buffer, material: MockupMaterial): Promise<Buffer> {
  const meta = await sharp(preparedLogo).metadata();
  const nw = meta.width ?? 1;
  const nh = meta.height ?? 1;
  const { drawW, drawH } = computeLogoDrawDimensionsPython(nw, nh);
  const left = Math.round((MOCKUP_OUT_W - drawW) / 2);
  const top = Math.round((MOCKUP_OUT_H - drawH) / 2);

  const logoRgba = await rasterizeLogoForDraw(preparedLogo, drawW, drawH);
  const mask = buildMockupMaskFromRgba(logoRgba, drawW, drawH);
  const baseData = await loadBackgroundRgba(material);

  if (isBurnMaterial(material)) {
    const burnFull = await loadBurnTextureFull();
    if (burnFull) {
      applyMaderaBurnPythonLike(baseData, burnFull, mask, drawW, drawH, left, top, material);
    } else {
      applyMaderaBurnFallbackTint(baseData, mask, drawW, drawH, left, top, material);
    }
  } else {
    applyCueroEmbossPythonLike(baseData, mask, drawW, drawH, left, top);
  }

  applyGlobalPostEffectsLikePython({ data: baseData, width: MOCKUP_OUT_W, height: MOCKUP_OUT_H });
  applyMockupFinalSharpening(
    baseData,
    MOCKUP_OUT_W,
    MOCKUP_OUT_H,
    material === 'cuero' || material === 'cuerina'
      ? { amount: 0.17, blurSigma: 0.95 }
      : undefined
  );

  return sharp(Buffer.from(baseData.buffer), {
    raw: { width: MOCKUP_OUT_W, height: MOCKUP_OUT_H, channels: 4 },
  })
    .jpeg({ quality: 94, mozjpeg: true })
    .toBuffer();
}
