import { NextRequest, NextResponse } from 'next/server';
import { generateRealisticMockup } from '@/lib/mockupGenerator';

/**
 * Genera mockup con mockup_generator.py (Pillow) si hay Python;
 * si no, Sharp + texturas en public/mockup-textures (copiadas del ejemplo).
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

    return NextResponse.json({
      success: true,
      mockupUrl: mockupDataUrl,
      thumbnailUrl: mockupDataUrl,
      metadata: {
        generatedAt: new Date().toISOString(),
        generator: method === 'python' ? 'mockup_generator.py (Pillow)' : 'sharp + textura',
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
