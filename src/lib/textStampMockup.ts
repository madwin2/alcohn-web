// Genera la "muestra en cuero" del configurador de Abecedarios reutilizando el mismo
// motor de efectos (máscara + bajorrelieve + post-proceso) que el generador de mockups
// de sellos personalizados, para mantener la misma estética en todo el sitio.
// Solo debe importarse desde componentes cliente ('use client'), ya que usa Canvas/Image del navegador.

import {
  applyCueroEmbossPythonLike,
  applyGlobalPostEffectsLikePython,
  applyMockupFinalSharpening,
  buildMockupMaskFromRgba,
} from '@/lib/mockupPythonLikeEffects';

const OUTPUT_WIDTH = 1400;
const OUTPUT_HEIGHT = 1000;
const BASE_TEXT_BOX_WIDTH = OUTPUT_WIDTH * 0.82;
const BASE_TEXT_BOX_HEIGHT = OUTPUT_HEIGHT * 0.62;
const MAX_BOX_WIDTH_RATIO = 0.94;
const MAX_BOX_HEIGHT_RATIO = 0.8;
const MAX_LINES = 3;
const MAX_FONT_PX = 210;
const MIN_FONT_PX = 30;

/** Referencia: 5mm = escala 1. El tamaño elegido agranda/achica la caja de texto en la muestra. */
export function sizeScaleFromMm(tamanoMm: number): number {
  const scale = tamanoMm / 5;
  return Math.max(0.65, Math.min(1.6, scale));
}

const CUERO_TEXTURE_URL = '/mockup-textures/cuero.jpg';

let cachedTextureImage: HTMLImageElement | null = null;
let cachedTexturePromise: Promise<HTMLImageElement> | null = null;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar imagen: ${src}`));
    img.src = src;
  });
}

function loadCueroTexture(): Promise<HTMLImageElement> {
  if (cachedTextureImage) return Promise.resolve(cachedTextureImage);
  if (!cachedTexturePromise) {
    cachedTexturePromise = loadImage(CUERO_TEXTURE_URL).then((img) => {
      cachedTextureImage = img;
      return img;
    });
  }
  return cachedTexturePromise;
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, outW: number, outH: number) {
  const scale = Math.max(outW / img.naturalWidth, outH / img.naturalHeight);
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const left = Math.round((outW - w) / 2);
  const top = Math.round((outH - h) / 2);
  ctx.drawImage(img, left, top, w, h);
}

function truncateWithEllipsis(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let low = 0;
  let high = text.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const candidate = `${text.slice(0, mid)}…`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return `${text.slice(0, low)}…`;
}

/** Wrap "greedy" por palabras (separadas por espacio); si una palabra sola no entra, corta por caracteres. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ').filter(Boolean);
  const lines: string[] = [];
  let current = '';

  const pushCurrent = () => {
    if (current) {
      lines.push(current);
      current = '';
    }
  };

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }

    if (ctx.measureText(word).width <= maxWidth) {
      pushCurrent();
      current = word;
      continue;
    }

    pushCurrent();
    let chunk = '';
    for (const ch of word) {
      const testChunk = chunk + ch;
      if (ctx.measureText(testChunk).width <= maxWidth) {
        chunk = testChunk;
      } else {
        if (chunk) lines.push(chunk);
        chunk = ch;
      }
    }
    current = chunk;
  }
  pushCurrent();
  return lines;
}

interface FittedText {
  fontPx: number;
  lineHeight: number;
  lines: string[];
}

function fitTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  boxW: number,
  boxH: number,
): FittedText {
  let fontPx = MAX_FONT_PX;
  while (fontPx >= MIN_FONT_PX) {
    ctx.font = `700 ${fontPx}px ${fontFamily}`;
    const lineHeight = Math.round(fontPx * 1.18);
    const lines = wrapText(ctx, text, boxW);
    if (lines.length <= MAX_LINES && lines.length * lineHeight <= boxH) {
      return { fontPx, lineHeight, lines };
    }
    fontPx -= 6;
  }

  ctx.font = `700 ${MIN_FONT_PX}px ${fontFamily}`;
  const lineHeight = Math.round(MIN_FONT_PX * 1.18);
  let lines = wrapText(ctx, text, boxW);
  if (lines.length > MAX_LINES) {
    lines = lines.slice(0, MAX_LINES);
    lines[MAX_LINES - 1] = truncateWithEllipsis(ctx, `${lines[MAX_LINES - 1]}…`, boxW);
  }
  return { fontPx: MIN_FONT_PX, lineHeight, lines };
}

function renderTextMaskCanvas(
  text: string,
  fontFamily: string,
  sizeScale: number,
): { canvas: HTMLCanvasElement; drawW: number; drawH: number } {
  const boxW = Math.round(
    Math.min(OUTPUT_WIDTH * MAX_BOX_WIDTH_RATIO, BASE_TEXT_BOX_WIDTH * sizeScale),
  );
  const boxH = Math.round(
    Math.min(OUTPUT_HEIGHT * MAX_BOX_HEIGHT_RATIO, BASE_TEXT_BOX_HEIGHT * sizeScale),
  );

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) throw new Error('No se pudo preparar el lienzo de texto');

  const fitted = fitTextBlock(measureCtx, text, fontFamily, boxW, boxH);

  const canvas = document.createElement('canvas');
  canvas.width = boxW;
  canvas.height = boxH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo preparar el lienzo de texto');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `700 ${fitted.fontPx}px ${fontFamily}`;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const totalHeight = fitted.lines.length * fitted.lineHeight;
  const startY = (canvas.height - totalHeight) / 2 + fitted.lineHeight / 2;

  fitted.lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, startY + index * fitted.lineHeight);
  });

  return { canvas, drawW: boxW, drawH: boxH };
}

/**
 * Genera una muestra fotorrealista en cuero del texto indicado, usando el mismo motor de
 * bajorrelieve + post-proceso que el generador de mockups de sellos personalizados.
 * Devuelve un data URL (JPEG) listo para usar en <img>.
 */
export async function generateLeatherTextMockup(
  text: string,
  fontFamily: string,
  sizeScale = 1,
): Promise<string> {
  const safeText = text.trim() || 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
  const { canvas: textCanvas, drawW, drawH } = renderTextMaskCanvas(safeText, fontFamily, sizeScale);
  const textCtx = textCanvas.getContext('2d');
  if (!textCtx) throw new Error('No se pudo leer el lienzo de texto');
  const textRgba = textCtx.getImageData(0, 0, drawW, drawH).data;
  const mask = buildMockupMaskFromRgba(textRgba, drawW, drawH);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = OUTPUT_WIDTH;
  outCanvas.height = OUTPUT_HEIGHT;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) throw new Error('No se pudo preparar el lienzo de salida');

  const texture = await loadCueroTexture();
  drawCover(outCtx, texture, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  const baseImageData = outCtx.getImageData(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  const left = Math.round((OUTPUT_WIDTH - drawW) / 2);
  const top = Math.round((OUTPUT_HEIGHT - drawH) / 2);

  applyCueroEmbossPythonLike(baseImageData.data, mask, drawW, drawH, left, top);
  applyGlobalPostEffectsLikePython(baseImageData, { perspectiveStrength: 0.022, dofBlur: 0.9, vignetteStrength: 0.22 });
  applyMockupFinalSharpening(baseImageData.data, OUTPUT_WIDTH, OUTPUT_HEIGHT, { amount: 0.17, blurSigma: 0.95 });

  outCtx.putImageData(baseImageData, 0, 0);
  return outCanvas.toDataURL('image/jpeg', 0.92);
}
