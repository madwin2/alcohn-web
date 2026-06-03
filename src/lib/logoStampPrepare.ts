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
 * Normaliza y aísla el dibujo del logo para mockup/sello:
 * escala mínima, negro + alpha, recorte al contenido.
 */
export async function prepareLogoForStamp(buffer: Buffer): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const maxSide = Math.max(w, h);

  let base = sharp(buffer);
  if (maxSide > 0 && maxSide < 1200) {
    const scale = 1200 / maxSide;
    base = base.resize(
      Math.max(1, Math.round(w * scale)),
      Math.max(1, Math.round(h * scale)),
      { fit: 'fill', kernel: sharp.kernel.lanczos3 }
    );
  }

  const normalized = await base.png({ compressionLevel: 9 }).toBuffer();
  const blackTransparent = await convertToBlackFromMask(normalized);
  return sharp(blackTransparent).trim({ threshold: 12 }).png({ compressionLevel: 9 }).toBuffer();
}
