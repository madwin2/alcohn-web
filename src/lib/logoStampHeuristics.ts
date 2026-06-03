import sharp from 'sharp';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const isNearWhite = (r: number, g: number, b: number) => r >= 245 && g >= 245 && b >= 245;

const rgbToHue = (r: number, g: number, b: number): number => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  if (d <= 1e-6) return 0;
  if (max === rn) return ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
  if (max === gn) return ((bn - rn) / d + 2) * 60;
  return ((rn - gn) / d + 4) * 60;
};

export type LogoStampHeuristics = {
  hasTransparentBackground: boolean;
  hasWhiteBackground: boolean;
  hasPlainBackground: boolean;
  isMonochrome: boolean;
  likelyComplexImage: boolean;
  /** Foto, producto, textura o escena — no es un archivo de logo limpio. */
  likelyPhotoOrScene: boolean;
  /** Apto para sello/mockup sin pasar por IA de optimización. */
  approvedForStamp: boolean;
  details: string;
};

/**
 * Validación técnica del logo (misma idea que validateLogoForStamping en mockupPipeline.ts).
 * Corrige falsos positivos de Vision cuando marca fotos como “óptimas”.
 */
export async function analyzeLogoStampHeuristics(buffer: Buffer): Promise<LogoStampHeuristics> {
  const meta = await sharp(buffer).metadata();
  const w0 = meta.width ?? 1;
  const h0 = meta.height ?? 1;
  const maxSide = Math.max(w0, h0);
  const target = 520;
  const scale = maxSide > target ? target / maxSide : 1;
  const sw = Math.max(1, Math.round(w0 * scale));
  const sh = Math.max(1, Math.round(h0 * scale));

  const { data } = await sharp(buffer)
    .resize(sw, sh, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const step = Math.max(1, Math.floor(Math.sqrt((sw * sh) / 120000)));

  let total = 0;
  let transparent = 0;
  let edgeTotal = 0;
  let edgeTransparent = 0;
  let opaque = 0;
  let whiteOpaque = 0;
  let edgeWhite = 0;
  let foreground = 0;
  let grayscaleForeground = 0;
  const hueBins = new Array<number>(24).fill(0);

  for (let y = 0; y < sh; y += step) {
    for (let x = 0; x < sw; x += step) {
      const idx = (y * sw + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      total += 1;
      const isEdge = x <= step || y <= step || x >= sw - step - 1 || y >= sh - step - 1;
      if (isEdge) edgeTotal += 1;

      if (a < 20) {
        transparent += 1;
        if (isEdge) edgeTransparent += 1;
        continue;
      }

      if (a > 220) {
        opaque += 1;
        if (isNearWhite(r, g, b)) {
          whiteOpaque += 1;
          if (isEdge) edgeWhite += 1;
        }
      }

      if (isNearWhite(r, g, b)) continue;

      foreground += 1;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;

      if (sat < 0.14) {
        grayscaleForeground += 1;
      } else {
        const bin = clamp(Math.floor(rgbToHue(r, g, b) / 15), 0, hueBins.length - 1);
        hueBins[bin] += 1;
      }
    }
  }

  const transparentRatio = transparent / Math.max(1, total);
  const edgeTransparentRatio = edgeTransparent / Math.max(1, edgeTotal);
  const whiteRatio = whiteOpaque / Math.max(1, opaque);
  const edgeWhiteRatio = edgeWhite / Math.max(1, edgeTotal);
  const foregroundRatio = foreground / Math.max(1, total);
  const grayscaleShare = grayscaleForeground / Math.max(1, foreground);
  const colorful = foreground - grayscaleForeground;
  const dominantHueShare = colorful <= 0 ? 0 : Math.max(...hueBins) / colorful;

  const hasTransparentBackground = edgeTransparentRatio >= 0.58 || transparentRatio >= 0.24;
  const hasWhiteBackground =
    (edgeWhiteRatio >= 0.6 && whiteRatio >= 0.45) || (whiteRatio >= 0.75 && transparentRatio < 0.2);
  const hasPlainBackground = hasTransparentBackground || hasWhiteBackground;
  const isMonochrome = foreground > 25 && (grayscaleShare >= 0.86 || dominantHueShare >= 0.9);

  const likelyComplexImage =
    foregroundRatio > 0.22 && grayscaleShare < 0.72 && colorful > 40;
  const likelyPhotoOrScene =
    likelyComplexImage ||
    (foregroundRatio > 0.35 && grayscaleShare < 0.55) ||
    (!hasPlainBackground && foregroundRatio > 0.12);

  const approvedForStamp = hasPlainBackground && isMonochrome && !likelyPhotoOrScene;

  const details = [
    hasPlainBackground
      ? `Fondo OK (${hasTransparentBackground ? 'transparente' : 'blanco'})`
      : 'Fondo no válido',
    isMonochrome ? 'Monocromático' : 'Varios colores',
    likelyPhotoOrScene ? 'Imagen compleja/foto' : 'Diseño tipo logo',
  ].join(' · ');

  return {
    hasTransparentBackground,
    hasWhiteBackground,
    hasPlainBackground,
    isMonochrome,
    likelyComplexImage,
    likelyPhotoOrScene,
    approvedForStamp,
    details,
  };
}

/** Aplica heurísticas sobre el JSON de Vision (solo puede endurecer, no aflojar). */
export function mergeVisionAnalysisWithHeuristics(
  analysis: Record<string, unknown>,
  heuristics: LogoStampHeuristics,
): Record<string, unknown> {
  const out = { ...analysis };

  if (!heuristics.approvedForStamp || heuristics.likelyPhotoOrScene) {
    out.isOptimal = false;
    out.needsOptimization = true;
    out.isComplex = true;
    out.hasPlainBackground = heuristics.hasPlainBackground;
    const reason =
      heuristics.likelyPhotoOrScene
        ? 'Imagen fotográfica o con fondo complejo. Se optimizará con IA para el sello.'
        : !heuristics.hasPlainBackground
          ? 'El fondo no es blanco ni transparente. Se optimizará con IA.'
          : 'El diseño tiene varios colores. Se optimizará con IA para sello de bronce.';
    if (typeof out.reason !== 'string' || out.reason.includes('óptimo')) {
      out.reason = reason;
    }
  } else {
    out.hasPlainBackground = heuristics.hasPlainBackground;
    if (typeof out.isComplex !== 'boolean') {
      out.isComplex = !heuristics.isMonochrome;
    }
  }

  if (out.needsOptimization === true) {
    out.isOptimal = false;
  }

  return out;
}
