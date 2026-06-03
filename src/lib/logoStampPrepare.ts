import sharp from 'sharp';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const getMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

async function getRgbaFromBuffer(buffer: Buffer): Promise<{
  data: Buffer;
  width: number;
  height: number;
}> {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return {
    data,
    width: info.width,
    height: info.height,
  };
}

async function analyzeForeground(buffer: Buffer): Promise<{
  width: number;
  height: number;
  useAlphaMask: boolean;
  maskStrength: Float32Array;
}> {
  const { data, width, height } = await getRgbaFromBuffer(buffer);
  const borderR: number[] = [];
  const borderG: number[] = [];
  const borderB: number[] = [];
  const borderA: number[] = [];

  const addBorder = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    borderR.push(data[i]);
    borderG.push(data[i + 1]);
    borderB.push(data[i + 2]);
    borderA.push(data[i + 3]);
  };

  for (let x = 0; x < width; x++) {
    addBorder(x, 0);
    addBorder(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    addBorder(0, y);
    addBorder(width - 1, y);
  }

  const bgR = getMedian(borderR);
  const bgG = getMedian(borderG);
  const bgB = getMedian(borderB);
  const avgBorderAlpha =
    borderA.length > 0 ? borderA.reduce((acc, v) => acc + v, 0) / borderA.length : 255;
  const useAlphaMask = avgBorderAlpha < 250;

  const maskStrength = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      let fgStrength = 0;
      if (useAlphaMask) {
        fgStrength = a / 255;
      } else {
        const dist = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
        fgStrength = clamp01((dist - 20) / 100);
        if (a < 16) fgStrength = 0;
      }

      maskStrength[y * width + x] = fgStrength;
    }
  }

  return { width, height, useAlphaMask, maskStrength };
}

const isNearWhite = (r: number, g: number, b: number) => r >= 245 && g >= 245 && b >= 245;

/** Negro sobre transparencia; quita fondos blancos/planos del lienzo. */
export async function convertToBlackFromMask(buffer: Buffer): Promise<Buffer> {
  const { data, width, height } = await getRgbaFromBuffer(buffer);
  const analysis = await analyzeForeground(buffer);
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const src = i * 4;
    const alphaSource = data[src + 3] / 255;
    const mask = analysis.maskStrength[i];
    let alpha: number;
    if (analysis.useAlphaMask) {
      alpha = Math.round(alphaSource * 255);
    } else {
      alpha = mask > 0.34 ? 255 : 0;
    }

    out[src] = 0;
    out[src + 1] = 0;
    out[src + 2] = 0;
    out[src + 3] = alpha;
  }

  return sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Igual que optimizeLogoForMockup del pipeline de referencia (negro + alpha, sin papel blanco).
 */
async function optimizeLogoLikePipeline(buffer: Buffer): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const maxSide = Math.max(w, h);

  let base = sharp(buffer);
  if (maxSide > 0 && maxSide < 1800) {
    const scale = 1800 / maxSide;
    base = base.resize(
      Math.max(1, Math.round(w * scale)),
      Math.max(1, Math.round(h * scale)),
      { fit: 'fill', kernel: sharp.kernel.lanczos3 }
    );
  }

  const { data, info } = await base.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0; i < info.width * info.height; i++) {
    const src = i * 4;
    const dst = src;
    const r = data[src];
    const g = data[src + 1];
    const b = data[src + 2];
    const a = data[src + 3];
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;

    const transparentPx = a < 22;
    const whiteBgPx = isNearWhite(r, g, b) || (luminance > 244 && sat < 0.16);
    if (transparentPx || whiteBgPx) {
      out[dst + 3] = 0;
      continue;
    }

    out[dst] = 0;
    out[dst + 1] = 0;
    out[dst + 2] = 0;
    out[dst + 3] = a > 100 ? 255 : Math.round((a / 100) * 255);
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 12 })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Normaliza y aísla el dibujo del logo para mockup/sello.
 */
export async function prepareLogoForStamp(buffer: Buffer): Promise<Buffer> {
  return optimizeLogoLikePipeline(buffer);
}
