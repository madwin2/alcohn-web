import { NextRequest, NextResponse } from 'next/server';
import { measureLogoAspectRatio } from '@/lib/logoMeasure';
import { optimizeLogoWithOpenAI } from '@/lib/logoOpenAiOptimize';
import { analyzeLogoStampHeuristics } from '@/lib/logoStampHeuristics';
import { prepareLogoForStamp } from '@/lib/logoStampPrepare';

/** Vercel/Next: gpt-image puede tardar. */
export const maxDuration = 120;

/**
 * Optimiza el logo para sello.
 * El wizard envía forceAi=true → solo OpenAI gpt-image (sin filtros Sharp basura).
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OPENAI_API_KEY no está configurada en las variables de entorno' },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('logo') as File;
    const forceAi =
      formData.get('forceAi') === 'true' ||
      formData.get('forceAi') === '1' ||
      formData.get('mode') === 'ai';

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Logo no proporcionado (debe ser un File)' },
        { status: 400 },
      );
    }

    if (!forceAi) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Se requiere optimización con IA (forceAi). Volvé a subir el logo desde el wizard.',
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uploadedBuffer = Buffer.from(arrayBuffer);
    const heuristics = await analyzeLogoStampHeuristics(uploadedBuffer);

    if (heuristics.isInvertedMonochrome) {
      console.log('[logo/optimize] Logo invertido → preparación determinística (sin IA)');
      const prepared = await prepareLogoForStamp(uploadedBuffer);
      const optimizedLogo = `data:image/png;base64,${prepared.toString('base64')}`;
      let aspectRatio = 1;
      try {
        const measured = await measureLogoAspectRatio(optimizedLogo);
        aspectRatio = measured.aspectRatio;
      } catch {
        // fallback silencioso
      }
      return NextResponse.json({
        success: true,
        optimizedLogo,
        aspectRatio,
        method: 'invert_deterministic',
        description:
          'Logo en blanco sobre fondo oscuro invertido y preparado sin IA para evitar deformaciones.',
      });
    }

    console.log('[logo/optimize] OpenAI gpt-image (forceAi)');
    const result = await optimizeLogoWithOpenAI(uploadedBuffer);

    return NextResponse.json({
      success: true,
      optimizedLogo: result.optimizedLogo,
      aspectRatio: result.aspectRatio,
      method: result.method,
      description: result.description,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; statusCode?: number; message?: string };
    console.error('Error optimizando logo:', error);

    if (err.status === 401 || err.statusCode === 401) {
      return NextResponse.json(
        { success: false, error: 'API key de OpenAI inválida o no configurada' },
        { status: 401 },
      );
    }

    if (err.status === 403 || err.statusCode === 403) {
      return NextResponse.json(
        {
          success: false,
          error: `Error de acceso al modelo: ${err.message}. Verificá acceso a gpt-image-1.5 o gpt-image-1.`,
        },
        { status: 403 },
      );
    }

    if (err.status === 400 || err.statusCode === 400) {
      return NextResponse.json(
        { success: false, error: err.message || 'Error al optimizar el logo' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: err.message || 'Error al optimizar el logo' },
      { status: 500 },
    );
  }
}
