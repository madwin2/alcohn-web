import { NextRequest, NextResponse } from 'next/server';

// Esta API route llama al servicio Python para generar la muestra automática
// TODO: Reemplazar con la URL real del servicio Python cuando esté disponible
const MOCKUP_SERVICE_URL = process.env.MOCKUP_SERVICE_URL || 'http://localhost:8000/api/mockups/generate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logo, size, material, aspectRatio, customSize } = body;

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

    // Preparar el request para el servicio Python
    const requestBody: any = {
      logo,
      size,
      material,
    };

    if (aspectRatio) {
      requestBody.aspectRatio = aspectRatio;
    }

    if (customSize) {
      requestBody.customSize = customSize;
    }

    // Llamar al servicio Python
    const response = await fetch(MOCKUP_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVICE_ERROR',
            message: errorData.error?.message || 'Error en el servicio de mockups',
            details: errorData.error,
          },
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error('Error generando mockup:', error);
    
    // Si el servicio Python no está disponible, devolver un error descriptivo
    if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'El servicio de generación de mockups no está disponible en este momento',
          },
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: error.message || 'Error al generar el mockup',
        },
      },
      { status: 500 }
    );
  }
}
