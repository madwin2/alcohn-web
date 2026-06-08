import OpenAI from 'openai';
import sharp from 'sharp';
import { measureLogoAspectRatio } from '@/lib/logoMeasure';
import { invertMonochromeLogoIfNeeded, prepareLogoForStamp } from '@/lib/logoStampPrepare';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const STAMP_OPTIMIZE_PROMPT = `Convierte este logo a monocromático, a un tinta, negro con fondo blanco.

CRÍTICO - NO MODIFIQUES EL DISEÑO:
- El logo debe quedar EXACTAMENTE IGUAL. Mismo diseño, mismas formas, mismas proporciones, mismos detalles, mismos textos.
- NO cambies ninguna línea, curva, forma, letra, símbolo o elemento del logo.
- NO agregues ni quites nada del diseño original.
- NO modifiques el estilo, la tipografía, ni ningún aspecto visual.

SOLO CONVERSIÓN DE COLOR:
- Convierte todos los colores a negro sólido puro.
- El fondo debe ser blanco puro (no transparente).
- Elimina degradados, sombras y efectos, pero mantén todas las formas exactamente iguales.
- El resultado debe ser el mismo logo pero en blanco y negro.`;

async function prepareImageForOpenAIEdit(originalBuffer: Buffer): Promise<Buffer> {
  let imageBuffer = await sharp(originalBuffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();

  if (imageBuffer.length > 3_500_000) {
    imageBuffer = await sharp(originalBuffer)
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  return imageBuffer;
}

async function runImageEdit(imageBuffer: Buffer): Promise<{ b64: string; model: string }> {
  const processedFile = new File([new Uint8Array(imageBuffer)], 'logo.png', {
    type: 'image/png',
  });

  try {
    const response = await openai.images.edit({
      model: 'gpt-image-1.5',
      image: processedFile,
      prompt: STAMP_OPTIMIZE_PROMPT,
      size: '1024x1024',
      quality: 'high',
      background: 'opaque',
    });
    const b64 = response.data?.[0]?.b64_json;
    if (b64) return { b64, model: 'gpt-image-1.5' };
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status !== 403 && !err.message?.includes('model')) {
      throw error;
    }
  }

  const response = await openai.images.edit({
    model: 'gpt-image-2',
    image: processedFile,
    prompt: STAMP_OPTIMIZE_PROMPT,
    size: '1024x1024',
    quality: 'high',
    background: 'opaque',
    input_fidelity: 'high',
  });
  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error('No se pudo generar la imagen optimizada con OpenAI');
  return { b64, model: 'gpt-image-1' };
}

export type OpenAiLogoOptimizeResult = {
  optimizedLogo: string;
  aspectRatio: number;
  method: string;
  description: string;
};

/**
 * Optimización con gpt-image (flujo original que funcionaba en el wizard).
 * Sin atajos determinísticos ni "convertToBlackFromMask".
 */
export async function optimizeLogoWithOpenAI(uploadedBuffer: Buffer): Promise<OpenAiLogoOptimizeResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY no está configurada');
  }

  const normalized = await sharp(uploadedBuffer).png({ compressionLevel: 9 }).toBuffer();
  const { buffer: polaritySafe } = await invertMonochromeLogoIfNeeded(normalized);
  const imageBuffer = await prepareImageForOpenAIEdit(polaritySafe);
  const { b64, model } = await runImageEdit(imageBuffer);

  const aiBuffer = Buffer.from(b64, 'base64');
  const prepared = await prepareLogoForStamp(aiBuffer);
  const optimizedLogo = `data:image/png;base64,${prepared.toString('base64')}`;

  let aspectRatio = 1;
  try {
    const measured = await measureLogoAspectRatio(optimizedLogo);
    aspectRatio = measured.aspectRatio;
  } catch {
    // fallback silencioso
  }

  return {
    optimizedLogo,
    aspectRatio,
    method: `ai_openai_${model}`,
    description:
      'Logo optimizado con OpenAI (negro sobre fondo limpio) manteniendo el diseño original.',
  };
}
