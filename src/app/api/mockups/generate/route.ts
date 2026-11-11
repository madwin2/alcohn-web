import { NextRequest, NextResponse } from 'next/server';
import { generateRealisticMockup } from '@/lib/mockupGenerator';
import sharp from 'sharp';

/** Vercel: mockup estilo mockup_generator.py (TypeScript, sin Python). */
export const maxDuration = 60;

/** "40x30mm" → { widthMm: 40, heightMm: 30 }. */
function parseSizeMm(size: string): { widthMm: number; heightMm: number } | null {
  const m = /^\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*mm\s*$/i.exec(size);
  if (!m) return null;
  const widthMm = Number(m[1].replace(',', '.'));
  const heightMm = Number(m[2].replace(',', '.'));
  return widthMm > 0 && heightMm > 0 ? { widthMm, heightMm } : null;
}

/**
 * Genera mockup con efectos tipo Python en TypeScript (serverless en Vercel).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logo, size, material, uso, sizeIsReference, aspectRatio: _aspectRatio, customSize: _customSize } = body;

    if (!logo || !size || !material) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'Faltan parámetros requeridos: logo, size, material',
          },
        },
        { status: 400 }
      );
    }

    // Con medida elegida, las escenas dibujan el logo a esa escala; si es solo de referencia, usan la recomendada.
    const sizeMm = sizeIsReference ? null : parseSizeMm(String(size));
    const { buffer, method, sceneId, logoMm, fitted } = await generateRealisticMockup(logo, material, {
      uso: typeof uso === 'string' ? uso : null,
      sizeMm,
    });
    const mockupBase64 = buffer.toString('base64');
    const mockupDataUrl = `data:image/jpeg;base64,${mockupBase64}`;

    const thumbnailBuffer = await sharp(buffer)
      .resize(360, 240, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 70 })
      .toBuffer();
    const thumbnailDataUrl = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;

    console.log(`[mockup] Generado (${method})`);

    return NextResponse.json({
      success: true,
      mockupUrl: mockupDataUrl,
      thumbnailUrl: thumbnailDataUrl,
      metadata: {
        generatedAt: new Date().toISOString(),
        generator: method === 'scene' ? 'mockup-scene' : 'mockup-python-like-ts',
        material,
        size,
        ...(sceneId ? { sceneId, logoMm, fitted } : {}),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al generar el mockup';
    console.error('Error generando mockup:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message,
        },
      },
      { status: 500 }
    );
  }
}
