import { NextRequest, NextResponse } from 'next/server';
import { generateRealisticMockup } from '@/lib/mockupGenerator';
import sharp from 'sharp';

/** Vercel: mockup con Sharp (sin Python). */
export const maxDuration = 60;

/**
 * Genera mockup con Sharp en TypeScript (serverless en Vercel).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logo, size, material, aspectRatio: _aspectRatio, customSize: _customSize } = body;

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

    const { buffer, method } = await generateRealisticMockup(logo, material);
    const mockupBase64 = buffer.toString('base64');
    const mockupDataUrl = `data:image/jpeg;base64,${mockupBase64}`;

    const thumbnailBuffer = await sharp(buffer)
      .resize(320, 240, { fit: 'cover', position: 'centre' })
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
        generator: 'sharp-mockup-ts',
        material,
        size,
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
