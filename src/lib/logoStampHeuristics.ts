import sharp from 'sharp';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const getMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const isNearWhite = (r: number, g: number, b: number) => r >= 245 && g >= 245 && b >= 245;

const luminance = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

const isLightTone = (r: number, g: number, b: number) => {
  const lum = luminance(r, g, b);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  return lum > 205 && sat < 0.22;
};

const isDarkTone = (r: number, g: number, b: number) => {
  const lum = luminance(r, g, b);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  return lum < 52 && sat < 0.25;
};

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
  /** Fondo negro u oscuro liso en el borde del lienzo. */
  hasDarkBackground: boolean;
  hasPlainBackground: boolean;
  isMonochrome: boolean;
  /** Logo claro sobre fondo oscuro (requiere invertir antes de mockup/IA). */
  isInvertedMonochrome: boolean;
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
  let edgeOpaque = 0;
  let edgeDarkOpaque = 0;
  let edgeLightOpaque = 0;
  let lightOpaque = 0;
  let darkOpaque = 0;
  let opaqueContent = 0;
  const borderR: number[] = [];
  const borderG: number[] = [];
  const borderB: number[] = [];
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
        opaqueContent += 1;
        if (isNearWhite(r, g, b)) {
          whiteOpaque += 1;
          if (isEdge) edgeWhite += 1;
        }
        if (isLightTone(r, g, b)) lightOpaque += 1;
        if (isDarkTone(r, g, b)) darkOpaque += 1;
        if (isEdge) {
          edgeOpaque += 1;
          borderR.push(r);
          borderG.push(g);
          borderB.push(b);
          if (isDarkTone(r, g, b)) edgeDarkOpaque += 1;
          if (isLightTone(r, g, b)) edgeLightOpaque += 1;
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
  const bgR = getMedian(borderR);
  const bgG = getMedian(borderG);
  const bgB = getMedian(borderB);
  const bgLum = luminance(bgR, bgG, bgB);
  const bgMax = Math.max(bgR, bgG, bgB);
  const bgMin = Math.min(bgR, bgG, bgB);
  const bgSat = bgMax === 0 ? 0 : (bgMax - bgMin) / bgMax;
  const bgDistanceThreshold = bgLum > 190 || bgLum < 65 ? 58 : 46;
  let edgeBgLike = 0;
  let bgMaskForeground = 0;
  let bgMaskGrayscale = 0;
  let bgMaskMinX = sw;
  let bgMaskMinY = sh;
  let bgMaskMaxX = -1;
  let bgMaskMaxY = -1;
  const bgMaskHueBins = new Array<number>(24).fill(0);

  for (let y = 0; y < sh; y += step) {
    for (let x = 0; x < sw; x += step) {
      const idx = (y * sw + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      if (a < 20) continue;

      const isEdge = x <= step || y <= step || x >= sw - step - 1 || y >= sh - step - 1;
      const dist = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
      if (isEdge && dist <= bgDistanceThreshold) edgeBgLike += 1;
      if (dist <= bgDistanceThreshold) continue;

      bgMaskForeground += 1;
      if (x < bgMaskMinX) bgMaskMinX = x;
      if (x > bgMaskMaxX) bgMaskMaxX = x;
      if (y < bgMaskMinY) bgMaskMinY = y;
      if (y > bgMaskMaxY) bgMaskMaxY = y;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      if (sat < 0.16) {
        bgMaskGrayscale += 1;
      } else {
        const bin = clamp(Math.floor(rgbToHue(r, g, b) / 15), 0, bgMaskHueBins.length - 1);
        bgMaskHueBins[bin] += 1;
      }
    }
  }

  const hasTransparentBackground =
    edgeTransparentRatio >= 0.58 ||
    transparentRatio >= 0.24 ||
    (edgeTransparentRatio >= 0.45 && transparentRatio >= 0.14);
  const hasWhiteBackground =
    (edgeWhiteRatio >= 0.6 && whiteRatio >= 0.45) || (whiteRatio >= 0.75 && transparentRatio < 0.2);
  const edgeBgLikeRatio = edgeBgLike / Math.max(1, edgeOpaque);
  const edgeLightRatio = edgeLightOpaque / Math.max(1, edgeOpaque);
  const hasLightPlainBackground =
    !hasTransparentBackground &&
    !hasWhiteBackground &&
    edgeOpaque > 20 &&
    edgeLightRatio >= 0.58 &&
    edgeBgLikeRatio >= 0.58 &&
    bgLum > 190 &&
    bgSat < 0.24;
  const edgeDarkRatio = edgeDarkOpaque / Math.max(1, edgeOpaque);
  const tonePixels = lightOpaque + darkOpaque;
  const toneShare = tonePixels / Math.max(1, opaqueContent);
  const hasDarkBackground =
    !hasTransparentBackground &&
    !hasWhiteBackground &&
    edgeDarkRatio >= 0.55 &&
    edgeOpaque > 20;
  const lightShare = lightOpaque / Math.max(1, opaqueContent);
  const isInvertedMonochrome =
    hasDarkBackground &&
    tonePixels > 40 &&
    toneShare >= 0.72 &&
    lightOpaque > 30 &&
    lightShare >= 0.015;
  const isMonochrome =
    (foreground > 25 && (grayscaleShare >= 0.86 || dominantHueShare >= 0.9)) ||
    (isInvertedMonochrome && toneShare >= 0.78);
  const bgMaskColorful = bgMaskForeground - bgMaskGrayscale;
  const bgMaskDominantHueShare =
    bgMaskColorful <= 0 ? 0 : Math.max(...bgMaskHueBins) / bgMaskColorful;
  const bgMaskGrayscaleShare = bgMaskGrayscale / Math.max(1, bgMaskForeground);
  const bgMaskForegroundRatio = bgMaskForeground / Math.max(1, total);
  const bgMaskBBoxArea =
    bgMaskMaxX >= bgMaskMinX && bgMaskMaxY >= bgMaskMinY
      ? ((bgMaskMaxX - bgMaskMinX + 1) * (bgMaskMaxY - bgMaskMinY + 1)) / Math.max(1, sw * sh)
      : 0;
  const isFlatLocalLogo =
    (bgMaskForeground > 25 &&
      bgMaskForegroundRatio <= 0.46 &&
      (bgMaskGrayscaleShare >= 0.64 || bgMaskDominantHueShare >= 0.58)) ||
    (hasTransparentBackground &&
      foreground > 25 &&
      foregroundRatio <= 0.5 &&
      (grayscaleShare >= 0.64 || dominantHueShare >= 0.58));
  const hasPlainBackground =
    hasTransparentBackground ||
    hasWhiteBackground ||
    hasLightPlainBackground ||
    (hasDarkBackground && (isInvertedMonochrome || isFlatLocalLogo));
  const darkForegroundLooksLikeScene =
    hasDarkBackground &&
    !hasTransparentBackground &&
    (bgMaskForegroundRatio > 0.34 || bgMaskBBoxArea > 0.78) &&
    !(bgMaskForegroundRatio <= 0.52 && bgMaskGrayscaleShare >= 0.86);

  const likelyComplexImage =
    darkForegroundLooksLikeScene ||
    (foregroundRatio > 0.22 &&
      grayscaleShare < 0.72 &&
      colorful > 40 &&
      !(hasPlainBackground && isFlatLocalLogo && !darkForegroundLooksLikeScene));
  const likelyPhotoOrScene =
    likelyComplexImage ||
    ((foregroundRatio > 0.35 || bgMaskForegroundRatio > 0.5) &&
      grayscaleShare < 0.55 &&
      !(hasPlainBackground && isFlatLocalLogo && !darkForegroundLooksLikeScene)) ||
    (!hasPlainBackground && foregroundRatio > 0.12 && !isInvertedMonochrome);

  const approvedForStamp =
    hasPlainBackground && (isMonochrome || isFlatLocalLogo) && !likelyPhotoOrScene;

  const details = [
    hasPlainBackground
      ? `Fondo OK (${hasTransparentBackground ? 'transparente' : hasDarkBackground ? 'oscuro' : hasLightPlainBackground ? 'claro' : 'blanco'})`
      : 'Fondo no válido',
    isInvertedMonochrome
      ? 'Invertido (blanco/negro)'
      : isMonochrome
        ? 'Monocromático'
        : isFlatLocalLogo
          ? 'Color plano'
          : 'Varios colores',
    likelyPhotoOrScene ? 'Imagen compleja/foto' : 'Diseño tipo logo',
  ].join(' · ');

  return {
    hasTransparentBackground,
    hasWhiteBackground,
    hasDarkBackground,
    hasPlainBackground,
    isMonochrome,
    isInvertedMonochrome,
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

  if (heuristics.approvedForStamp && !heuristics.likelyPhotoOrScene) {
    out.isOptimal = true;
    out.needsOptimization = false;
    out.isComplex = false;
    out.hasPlainBackground = true;
    out.reason =
      heuristics.isInvertedMonochrome
        ? 'Logo en blanco sobre fondo oscuro. Se prepara automáticamente sin IA para evitar deformaciones.'
        : 'Logo simple con fondo limpio. Se prepara automáticamente sin IA para evitar deformaciones.';
  } else if (!heuristics.approvedForStamp || heuristics.likelyPhotoOrScene) {
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
