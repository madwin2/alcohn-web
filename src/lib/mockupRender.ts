import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const MOCKUP_OUT_W = 1400;
export const MOCKUP_OUT_H = 1000;
const LOGO_SCALE = 0.55;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export type MockupMaterial = 'madera' | 'cuero' | 'cuerina' | 'carton';

const BURN_COLORS: Record<
  'madera' | 'carton',
  { tint: [number, number, number]; deep: [number, number, number]; edge: [number, number, number] }
> = {
  madera: {
    tint: [108, 72, 35],
    deep: [60, 32, 12],
    edge: [145, 108, 58],
  },
  carton: {
    tint: [125, 88, 45],
    deep: [75, 45, 18],
    edge: [160, 125, 70],
  },
};

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

async function loadBackground(material: MockupMaterial): Promise<Buffer> {
  const tex = findTexture(material);
  if (tex) {
    return sharp(tex)
      .resize(MOCKUP_OUT_W, MOCKUP_OUT_H, { fit: 'cover', position: 'centre' })
      .removeAlpha()
      .toBuffer();
  }
  const [r, g, b] = FALLBACK_BG[material];
  return sharp({
    create: { width: MOCKUP_OUT_W, height: MOCKUP_OUT_H, channels: 3, background: { r, g, b } },
  }).toBuffer();
}

type SizedLogo = {
  width: number;
  height: number;
  /** Máscara en escala de grises (blanco = marca). */
  mask: Buffer;
};

async function prepareSizedLogo(preparedLogo: Buffer): Promise<SizedLogo> {
  const targetW = Math.round(MOCKUP_OUT_W * LOGO_SCALE);
  const maxH = Math.round(MOCKUP_OUT_H * LOGO_SCALE);

  const resized = await sharp(preparedLogo)
    .resize(targetW, maxH, { fit: 'inside' })
    .ensureAlpha()
    .png()
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (width < 2 || height < 2) throw new Error('Logo demasiado chico');

  // Logo preparado = negro sobre transparencia → el alpha ES la máscara de la marca.
  const mask = await sharp(resized).extractChannel('alpha').blur(0.7).png().toBuffer();

  return { width, height, mask };
}

/**
 * Capa para multiply: negro donde hay marca (oscurece), blanco donde no (sin cambio).
 * La máscara de entrada es blanca en la zona del logo.
 */
async function multiplyBurnLayer(
  width: number,
  height: number,
  mask: Buffer,
  strength: number,
  blur = 0
): Promise<Buffer> {
  const dark = Math.round(255 * (1 - clamp01(strength)));
  let pipe = sharp(mask);
  if (blur > 0) pipe = pipe.blur(blur);
  return pipe
    .negate()
    .linear(strength, dark)
    .resize(width, height, { fit: 'fill' })
    .png()
    .toBuffer();
}

/** RGBA con color sólido y alpha = luminancia de la máscara (blanco = opaco). */
async function rgbaFromMask(
  width: number,
  height: number,
  rgb: [number, number, number],
  mask: Buffer,
  blur = 0
): Promise<Buffer> {
  let pipe = sharp(mask).resize(width, height, { fit: 'fill' });
  if (blur > 0) pipe = pipe.blur(blur);
  const { data, info } = await pipe.greyscale().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const a = data[i];
    const o = i * 4;
    rgba[o] = rgb[0];
    rgba[o + 1] = rgb[1];
    rgba[o + 2] = rgb[2];
    rgba[o + 3] = a;
  }
  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

async function applyBurnEffect(
  bg: Buffer,
  sized: SizedLogo,
  material: 'madera' | 'carton'
): Promise<Buffer> {
  const { width: lw, height: lh, mask } = sized;
  const left = Math.round((MOCKUP_OUT_W - lw) / 2);
  const top = Math.round((MOCKUP_OUT_H - lh) / 2);
  const colors = BURN_COLORS[material];

  let result = bg;

  const burnTexPath = findBurnTexture();
  if (burnTexPath) {
    const clipAlpha = await rgbaFromMask(lw, lh, [255, 255, 255], mask);
    const tex = await sharp(burnTexPath)
      .resize(lw, lh, { fit: 'fill' })
      .modulate({ brightness: 2.1 })
      .removeAlpha()
      .composite([{ input: clipAlpha, blend: 'dest-in' }])
      .png()
      .toBuffer();
    result = await sharp(result)
      .composite([{ input: tex, left, top, blend: 'multiply' }])
      .toBuffer();
  }

  result = await sharp(result)
    .composite([
      {
        input: await multiplyBurnLayer(lw, lh, mask, 0.78),
        left,
        top,
        blend: 'multiply',
      },
      {
        input: await multiplyBurnLayer(lw, lh, mask, 0.35, 1.2),
        left,
        top,
        blend: 'multiply',
      },
      {
        input: await rgbaFromMask(lw, lh, [210, 170, 110], mask, 8),
        left,
        top,
        blend: 'screen',
      },
    ])
    .toBuffer();

  return result;
}

async function applyEmbossEffect(bg: Buffer, sized: SizedLogo): Promise<Buffer> {
  const { width: lw, height: lh, mask } = sized;
  const left = Math.round((MOCKUP_OUT_W - lw) / 2);
  const top = Math.round((MOCKUP_OUT_H - lh) / 2);

  return sharp(bg)
    .composite([
      {
        input: await multiplyBurnLayer(lw, lh, mask, 0.35, 0.5),
        left,
        top,
        blend: 'multiply',
      },
      {
        input: await rgbaFromMask(lw, lh, [65, 38, 18], mask, 2),
        left,
        top,
        blend: 'over',
      },
      {
        input: await rgbaFromMask(lw, lh, [255, 245, 230], mask, 1.5),
        left,
        top,
        blend: 'screen',
      },
    ])
    .toBuffer();
}

function vignetteSvg(width: number, height: number, strength: number): Buffer {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.max(width, height) * 0.72;
  const opacity = Math.min(0.45, strength);
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="v" cx="50%" cy="50%" r="50%">
      <stop offset="55%" stop-color="black" stop-opacity="0"/>
      <stop offset="100%" stop-color="black" stop-opacity="${opacity}"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
</svg>`;
  return Buffer.from(svg);
}

async function applyGlobalFinish(img: Buffer): Promise<Buffer> {
  const w = MOCKUP_OUT_W;
  const h = MOCKUP_OUT_H;
  const vignette = vignetteSvg(w, h, 0.22);

  return sharp(img)
    .composite([{ input: vignette, blend: 'multiply' }])
    .modulate({ brightness: 1.03, saturation: 1.04 })
    .linear(1.05, -8)
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
}

/**
 * Genera mockup realista en TypeScript (Sharp). Compatible con Vercel serverless.
 * `preparedLogo` debe venir de prepareLogoForStamp (negro + alpha + trim).
 */
export async function renderMockup(preparedLogo: Buffer, material: MockupMaterial): Promise<Buffer> {
  const bg = await loadBackground(material);
  const sized = await prepareSizedLogo(preparedLogo);

  let result: Buffer;
  if (material === 'madera' || material === 'carton') {
    result = await applyBurnEffect(bg, sized, material);
  } else if (material === 'cuero' || material === 'cuerina') {
    result = await applyEmbossEffect(bg, sized);
  } else {
    result = await applyBurnEffect(bg, sized, 'madera');
  }

  return applyGlobalFinish(result);
}
