import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import sharp from 'sharp';
import { measureLogoAspectRatio } from '@/lib/logoMeasure';

/** Vercel/Next: cubre fallback IA en casos complejos. */
export const maxDuration = 120;

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ForegroundAnalysis = {
  width: number;
  height: number;
  useAlphaMask: boolean;
  maskStrength: Float32Array;
  foregroundCount: number;
  foregroundRatio: number;
  avgSaturation: number;
  hueSpread: number;
  likelySingleInk: boolean;
  likelyComplexImage: boolean;
};

type AiOptimizationStrategy = {
  recommended: 'deterministic_black' | 'ai_regenerate';
  background: 'transparent' | 'plain' | 'complex';
  logoKind: 'clean_logo' | 'logo_with_background' | 'photo_or_complex';
  confidence: number;
  reason: string;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const getMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  if (d > 1e-6) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  const s = max <= 1e-6 ? 0 : d / max;
  return { h, s, v: max };
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

async function normalizeInputBufferForStamp(buffer: Buffer, mimeType: string): Promise<Buffer> {
  const isSvg = mimeType === 'image/svg+xml';
  const base = isSvg
    ? sharp(buffer, { density: 1200 }) // evita rasterizado chico en SVG
    : sharp(buffer);

  const meta = await base.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const maxSide = Math.max(w, h);

  // Logos muy chicos terminan pixelados en el mockup al ampliarse.
  // Los elevamos a una base razonable para preservar bordes.
  if (maxSide > 0 && maxSide < 1200) {
    const scale = 1200 / maxSide;
    return base
      .resize(Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale)), {
        fit: 'fill',
        kernel: sharp.kernel.lanczos3,
      })
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  return base.png({ compressionLevel: 9 }).toBuffer();
}

async function analyzeForeground(buffer: Buffer): Promise<ForegroundAnalysis> {
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
  let foregroundCount = 0;
  let sumSaturation = 0;
  let satWeight = 0;
  let hueX = 0;
  let hueY = 0;
  let hueWeight = 0;

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
      if (fgStrength > 0.15) {
        foregroundCount++;
        const hsv = rgbToHsv(r, g, b);
        const w = fgStrength;
        sumSaturation += hsv.s * w;
        satWeight += w;
        if (hsv.s > 0.12 && hsv.v > 0.08) {
          const angle = hsv.h * Math.PI * 2;
          hueX += Math.cos(angle) * w;
          hueY += Math.sin(angle) * w;
          hueWeight += w;
        }
      }
    }
  }

  const pixelCount = Math.max(1, width * height);
  const foregroundRatio = foregroundCount / pixelCount;
  const avgSaturation = satWeight > 0 ? sumSaturation / satWeight : 0;

  let hueSpread = 0.5;
  if (hueWeight > 0) {
    const R = Math.sqrt(hueX * hueX + hueY * hueY) / hueWeight;
    hueSpread = clamp01((1 - R) * 0.5);
  }

  const likelySingleInk =
    foregroundRatio > 0.003 &&
    foregroundRatio < 0.8 &&
    (avgSaturation < 0.28 || hueSpread < 0.2);

  const likelyComplexImage =
    foregroundRatio > 0.25 &&
    avgSaturation > 0.22 &&
    hueSpread > 0.16 &&
    !likelySingleInk;

  return {
    width,
    height,
    useAlphaMask,
    maskStrength,
    foregroundCount,
    foregroundRatio,
    avgSaturation,
    hueSpread,
    likelySingleInk,
    likelyComplexImage,
  };
}

async function convertToBlackFromMask(buffer: Buffer): Promise<Buffer> {
  const { data, width, height } = await getRgbaFromBuffer(buffer);
  const analysis = await analyzeForeground(buffer);
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const src = i * 4;
    const dst = src;
    const alphaSource = data[src + 3] / 255;
    const mask = analysis.maskStrength[i];
    let alpha: number;
    if (analysis.useAlphaMask) {
      alpha = Math.round(alphaSource * 255);
    } else {
      // En imágenes opacas, usar recorte más firme evita letras "lavadas/pixeladas".
      alpha = mask > 0.34 ? 255 : 0;
    }

    out[dst] = 0;
    out[dst + 1] = 0;
    out[dst + 2] = 0;
    out[dst + 3] = alpha;
  }

  return sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function maskSimilarity(aBuffer: Buffer, bBuffer: Buffer): Promise<number> {
  const [a, b] = await Promise.all([analyzeForeground(aBuffer), analyzeForeground(bBuffer)]);
  const side = 64;

  const aMaskPng = await sharp(aBuffer)
    .ensureAlpha()
    .resize(side, side, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bMaskPng = await sharp(bBuffer)
    .ensureAlpha()
    .resize(side, side, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const ad = aMaskPng.data;
  const bd = bMaskPng.data;
  let intersection = 0;
  let union = 0;

  for (let i = 0; i < side * side; i++) {
    const ai = i * 4;
    const bi = i * 4;
    const aPixel = a.useAlphaMask
      ? ad[ai + 3] > 32
      : (ad[ai] + ad[ai + 1] + ad[ai + 2]) / 3 < 220;
    const bPixel = b.useAlphaMask
      ? bd[bi + 3] > 32
      : (bd[bi] + bd[bi + 1] + bd[bi + 2]) / 3 < 220;
    if (aPixel && bPixel) intersection++;
    if (aPixel || bPixel) union++;
  }

  if (union === 0) return 0;
  return intersection / union;
}

function bufferToDataUrl(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function prepareInputForAi(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}

async function analyzeOptimizationStrategyWithAI(
  imageDataUrl: string
): Promise<AiOptimizationStrategy | null> {
  const prompt = `Analiza esta imagen para optimizarla como logo de sello.

Decidí SOLO una estrategia:
- "deterministic_black": cuando es claramente un logo y alcanza con convertir a negro preservando geometría.
- "ai_regenerate": cuando tiene fondo complejo, composición no aislada o requiere interpretación visual.

Responde SOLO JSON válido:
{
  "recommended": "deterministic_black" | "ai_regenerate",
  "background": "transparent" | "plain" | "complex",
  "logoKind": "clean_logo" | "logo_with_background" | "photo_or_complex",
  "confidence": number,
  "reason": "string"
}`;

  const parseStrategy = (content: string): AiOptimizationStrategy | null => {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      const raw = JSON.parse(match ? match[0] : content) as Partial<AiOptimizationStrategy>;
      const recommended =
        raw.recommended === 'deterministic_black' || raw.recommended === 'ai_regenerate'
          ? raw.recommended
          : null;
      const background =
        raw.background === 'transparent' || raw.background === 'plain' || raw.background === 'complex'
          ? raw.background
          : null;
      const logoKind =
        raw.logoKind === 'clean_logo' ||
        raw.logoKind === 'logo_with_background' ||
        raw.logoKind === 'photo_or_complex'
          ? raw.logoKind
          : null;
      if (!recommended || !background || !logoKind) return null;
      return {
        recommended,
        background,
        logoKind,
        confidence: Number.isFinite(Number(raw.confidence)) ? Number(raw.confidence) : 0.5,
        reason: typeof raw.reason === 'string' ? raw.reason : '',
      };
    } catch {
      return null;
    }
  };

  const tryModel = async (model: string): Promise<AiOptimizationStrategy | null> => {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 250,
    });
    const content = response.choices[0]?.message?.content || '';
    return parseStrategy(content);
  };

  try {
    return (
      (await tryModel('gpt-5.2-chat-latest')) ??
      (await tryModel('gpt-4o')) ??
      (await tryModel('gpt-4o-mini'))
    );
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar que OpenAI API key esté configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'OPENAI_API_KEY no está configurada en las variables de entorno',
        },
        { status: 500 }
      );
    }

    // Recibir FormData con el archivo
    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Logo no proporcionado (debe ser un File)' },
        { status: 400 }
      );
    }

    console.log('Optimizando logo...');

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const uploadedBuffer = Buffer.from(arrayBuffer);
    const originalBuffer = await normalizeInputBufferForStamp(uploadedBuffer, file.type || '');
    const foreground = await analyzeForeground(originalBuffer);
    const deterministicCandidate = await convertToBlackFromMask(originalBuffer);
    const deterministicDataUrl = bufferToDataUrl(deterministicCandidate);
    const originalDataUrl = bufferToDataUrl(originalBuffer);
    const aiStrategy = await analyzeOptimizationStrategyWithAI(originalDataUrl);
    const aiPrefersDeterministic = aiStrategy?.recommended === 'deterministic_black';
    const aiPrefersRegenerate = aiStrategy?.recommended === 'ai_regenerate';
    const aiSeesComplexBackground = aiStrategy?.background === 'complex';

    // Solo usar conversión determinística cuando la heurística Y la IA coinciden.
    if (foreground.likelySingleInk && (aiPrefersDeterministic || aiStrategy == null)) {
      const measured = await measureLogoAspectRatio(deterministicDataUrl);
      return NextResponse.json({
        success: true,
        optimizedLogo: deterministicDataUrl,
        aspectRatio: measured.aspectRatio,
        method: 'tool_single_ink_to_black',
        aiStrategy,
        description:
          'Conversión técnica directa a negro preservando forma y proporciones (sin regeneración IA).',
      });
    }

    // Si IA no pide regeneración y la imagen tampoco parece compleja, usamos técnica como fallback.
    if (!aiPrefersRegenerate && !aiSeesComplexBackground && !foreground.likelyComplexImage) {
      const measured = await measureLogoAspectRatio(deterministicDataUrl);
      return NextResponse.json({
        success: true,
        optimizedLogo: deterministicDataUrl,
        aspectRatio: measured.aspectRatio,
        method: 'tool_shape_safe_default',
        aiStrategy,
        description:
          'Optimización técnica priorizando fidelidad de forma (sin regeneración IA).',
      });
    }

    // Regeneración IA cuando el análisis IA/heurístico lo justifica.
    const imageBuffer = await prepareInputForAi(originalBuffer);
    const prompt = `Convierte este logo para sello a una versión legible en negro.

REGLA ESTRICTA:
- Conserva EXACTAMENTE la geometría del diseño original: proporciones, líneas, tipografía, espaciado y símbolos.
- No redibujes ni reinventes el logo.
- Solo ajusta color/contraste para que quede funcional en sello.

Si no podés mantener el diseño exactamente, devolvé la versión más fiel posible sin cambios estructurales.`;

    let aiBase64: string | null = null;
    let aiModel = 'gpt-image-1.5';

    try {
      const processedFile = new File([new Uint8Array(imageBuffer)], 'logo.png', {
        type: 'image/png',
      });
      const response = await openai.images.edit({
        model: 'gpt-image-1.5',
        image: processedFile,
        prompt,
        size: '1024x1024',
        quality: 'high',
        background: 'transparent',
      });
      aiBase64 = response.data?.[0]?.b64_json ?? null;
    } catch (error: any) {
      if (error?.status === 403 || error?.message?.includes('model')) {
        aiModel = 'gpt-image-1';
        const processedFile = new File([new Uint8Array(imageBuffer)], 'logo.png', {
          type: 'image/png',
        });
        const response = await openai.images.edit({
          model: 'gpt-image-1',
          image: processedFile,
          prompt,
          size: '1024x1024',
          quality: 'high',
          background: 'transparent',
          input_fidelity: 'high',
        });
        aiBase64 = response.data?.[0]?.b64_json ?? null;
      } else {
        throw error;
      }
    }

    if (!aiBase64) {
      throw new Error('No se pudo generar la imagen optimizada');
    }

    const aiBuffer = Buffer.from(aiBase64, 'base64');
    const similarity = await maskSimilarity(originalBuffer, aiBuffer);

    // Si la IA deformó mucho, descartamos y usamos herramienta determinística.
    if (similarity < 0.86) {
      const measured = await measureLogoAspectRatio(deterministicDataUrl);
      return NextResponse.json({
        success: true,
        optimizedLogo: deterministicDataUrl,
        aspectRatio: measured.aspectRatio,
        method: 'tool_fallback_after_ai_shape_drift',
        aiStrategy,
        description:
          'Se evitó regeneración por cambios de forma. Se aplicó conversión técnica a negro.',
      });
    }

    const aiDataUrl = bufferToDataUrl(aiBuffer);
    const measured = await measureLogoAspectRatio(aiDataUrl);
    return NextResponse.json({
      success: true,
      optimizedLogo: aiDataUrl,
      aspectRatio: measured.aspectRatio,
      method: `ai_regeneration_${aiModel}`,
      similarityScore: similarity,
      aiStrategy,
      description: 'Logo optimizado con IA manteniendo estructura validada.',
    });
  } catch (error: any) {
    console.error('Error optimizando logo:', error);
    
    // Manejar errores específicos
    if (error.status === 401 || error.statusCode === 401) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key de OpenAI inválida o no configurada',
        },
        { status: 401 }
      );
    }

    if (error.status === 403 || error.statusCode === 403) {
      return NextResponse.json(
        {
          success: false,
          error: `Error de acceso al modelo: ${error.message}. Verifica que tu proyecto tenga acceso a gpt-image-1.5 o gpt-image-1.`,
        },
        { status: 403 }
      );
    }

    // Si es un error 400 de OpenAI, devolver 400 en lugar de 500
    if (error.status === 400 || error.statusCode === 400) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error al optimizar el logo',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al optimizar el logo',
      },
      { status: 500 }
    );
  }
}
