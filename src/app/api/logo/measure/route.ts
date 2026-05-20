import { NextRequest, NextResponse } from 'next/server';
import { measureLogoAspectRatio } from '@/lib/logoMeasure';

/**
 * Mide proporción ancho/alto del logo recortando fondo (Sharp trim y/o Python Pillow).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const logo = body.logo as string | undefined;
    if (!logo || typeof logo !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Falta logo (data URL o base64)' },
        { status: 400 }
      );
    }

    const { aspectRatio, method, widthPx, heightPx } = await measureLogoAspectRatio(logo);

    return NextResponse.json({
      success: true,
      aspectRatio,
      method,
      widthPx,
      heightPx,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error al medir el logo';
    console.error('[measure logo]', e);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
