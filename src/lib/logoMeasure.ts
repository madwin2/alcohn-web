import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);

export function parseLogoDataUrlToBuffer(logo: string): { buffer: Buffer; ext: string } {
  const trimmed = logo.trim();
  if (trimmed.startsWith('data:')) {
    const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(trimmed);
    if (!match) throw new Error('Logo data URL inválido');
    const mime = match[1];
    const b64 = match[2].replace(/\s/g, '');
    const ext = mime.includes('jpeg') || mime.includes('jpg') ? '.jpg' : '.png';
    return { buffer: Buffer.from(b64, 'base64'), ext };
  }
  const b64 = trimmed.replace(/\s/g, '');
  return { buffer: Buffer.from(b64, 'base64'), ext: '.png' };
}

/**
 * Recorta bordes homogéneos (alpha o color tipo top-left) y devuelve proporción ancho/alto del contenido.
 */
export async function measureAspectRatioWithSharp(buffer: Buffer): Promise<{
  aspectRatio: number;
  widthPx: number;
  heightPx: number;
} | null> {
  try {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height || meta.width < 2 || meta.height < 2) return null;

    const thresholds = [60, 45, 30, 20, 12, 8];
    let best: { w: number; h: number; area: number } | null = null;

    for (const threshold of thresholds) {
      try {
        const { info } = await sharp(buffer)
          .trim({ threshold })
          .toBuffer({ resolveWithObject: true });
        const w = info.width ?? 0;
        const h = info.height ?? 0;
        if (w < 2 || h < 2) continue;
        const area = w * h;
        if (!best || area < best.area) {
          best = { w, h, area };
        }
      } catch {
        /* siguiente threshold */
      }
    }

    if (best && (best.w < meta.width || best.h < meta.height)) {
      const ar = best.w / best.h;
      return {
        aspectRatio: Math.max(0.05, Math.min(30, ar)),
        widthPx: best.w,
        heightPx: best.h,
      };
    }

    const ar = meta.width / meta.height;
    return {
      aspectRatio: Math.max(0.05, Math.min(30, ar)),
      widthPx: meta.width,
      heightPx: meta.height,
    };
  } catch {
    return null;
  }
}

/** measure_logo.py (Pillow): bbox por alpha o fondo claro vs esquinas. */
export async function measureAspectRatioWithPython(
  buffer: Buffer,
  ext: string
): Promise<{ aspectRatio: number; widthPx: number; heightPx: number } | null> {
  const script = path.join(process.cwd(), 'Ejemplo de Mockup', 'measure_logo.py');
  if (!fs.existsSync(script)) return null;

  const tmpIn = path.join(os.tmpdir(), `alcohn_measure_${Date.now()}${ext}`);
  try {
    fs.writeFileSync(tmpIn, buffer);

    const argsBase = [script, tmpIn];
    const attempts: { cmd: string; args: string[] }[] =
      process.platform === 'win32'
        ? [
            { cmd: 'py', args: ['-3', ...argsBase] },
            { cmd: 'python', args: [...argsBase] },
            { cmd: 'python3', args: [...argsBase] },
          ]
        : [
            { cmd: 'python3', args: [...argsBase] },
            { cmd: 'python', args: [...argsBase] },
          ];

    for (const { cmd, args } of attempts) {
      try {
        const { stdout } = await execFileAsync(cmd, args, {
          timeout: 45_000,
          maxBuffer: 4 * 1024 * 1024,
          windowsHide: true,
        });
        const line = stdout.trim().split(/\r?\n/).filter(Boolean).pop();
        if (!line) continue;
        const data = JSON.parse(line) as {
          ok?: boolean;
          aspectRatio?: number;
          bbox?: [number, number, number, number];
        };
        if (!data.ok || typeof data.aspectRatio !== 'number' || data.aspectRatio <= 0) continue;
        const bw = data.bbox?.[2];
        const bh = data.bbox?.[3];
        return {
          aspectRatio: Math.max(0.05, Math.min(30, data.aspectRatio)),
          widthPx: typeof bw === 'number' ? bw : 0,
          heightPx: typeof bh === 'number' ? bh : 0,
        };
      } catch {
        /* siguiente intérprete */
      }
    }
    return null;
  } finally {
    try {
      fs.unlinkSync(tmpIn);
    } catch {
      /* ignore */
    }
  }
}

export async function measureLogoAspectRatio(logo: string): Promise<{
  aspectRatio: number;
  method: 'python' | 'sharp' | 'full_frame';
  widthPx: number;
  heightPx: number;
}> {
  const { buffer, ext } = parseLogoDataUrlToBuffer(logo);

  const py = await measureAspectRatioWithPython(buffer, ext);
  if (py) {
    return { ...py, method: 'python' };
  }

  const sh = await measureAspectRatioWithSharp(buffer);
  if (sh) {
    return { ...sh, method: 'sharp' };
  }

  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 1;
  const h = meta.height ?? 1;
  return {
    aspectRatio: Math.max(0.05, Math.min(30, w / h)),
    method: 'full_frame',
    widthPx: w,
    heightPx: h,
  };
}
