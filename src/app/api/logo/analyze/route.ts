import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const body = await request.json();
    const { logo } = body; // Base64 data URL o URL pública

    if (!logo) {
      return NextResponse.json(
        { success: false, error: 'Logo no proporcionado' },
        { status: 400 }
      );
    }

    // Preparar la URL de la imagen (OpenAI acepta data URLs directamente)
    const imageUrl = logo.startsWith('data:') 
      ? logo 
      : logo.startsWith('http') 
      ? logo 
      : `data:image/png;base64,${logo}`;

    console.log('Analizando logo con OpenAI Vision...');
    console.log('Tipo de imagen:', logo.substring(0, 50) + '...');
    console.log('ImageUrl preparada:', imageUrl.substring(0, 50) + '...');

    // Analizar el logo con OpenAI Vision usando GPT-5.2-chat-latest
    // Si no está disponible, intentar con gpt-4o, gpt-4o-mini o gpt-4-turbo
    let response;
    let modelUsed = 'gpt-5.2-chat-latest';
    
    const prompt = `Analiza esta imagen de logo para un sello de bronce. Determina:
1. ¿Tiene fondo liso (blanco/transparente) con logo en negro o escala de grises?
2. ¿Es una imagen compleja (foto, muchos colores, degradados, etc.)?
3. ¿Está optimizado para ser grabado en bronce (alto contraste, líneas claras)?
4. Calcula el aspect ratio (ancho/alto) del DISEÑO DEL LOGO (no de la imagen completa). Si el logo es cuadrado, el aspect ratio es 1.0. Si es más ancho que alto, será mayor a 1.0. Si es más alto que ancho, será menor a 1.0. Solo analiza el área del diseño del logo, ignorando espacios vacíos o fondos.

Responde ÚNICAMENTE en formato JSON válido con esta estructura exacta (sin markdown, sin texto adicional):
{
  "isOptimal": boolean,
  "hasPlainBackground": boolean,
  "isComplex": boolean,
  "needsOptimization": boolean,
  "reason": "string",
  "aspectRatio": number
}`;

    const createRequest = (model: string): ChatCompletionCreateParamsNonStreaming => ({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    // Intentar con gpt-5.2-chat-latest primero
    try {
      response = await openai.chat.completions.create(createRequest('gpt-5.2-chat-latest'));
      console.log('Respuesta de OpenAI recibida con gpt-5.2-chat-latest');
    } catch (error1: any) {
      // Si falla, intentar con gpt-4o
      if (error1.status === 403 || error1.message?.includes('model') || error1.message?.includes('not found')) {
        console.log('gpt-5.2-chat-latest no disponible, intentando con gpt-4o...');
        try {
          modelUsed = 'gpt-4o';
          response = await openai.chat.completions.create(createRequest('gpt-4o'));
          console.log('Respuesta de OpenAI recibida con gpt-4o');
        } catch (error2: any) {
          // Si falla, intentar con gpt-4o-mini
          console.log('gpt-4o no disponible, intentando con gpt-4o-mini...');
          try {
            modelUsed = 'gpt-4o-mini';
            response = await openai.chat.completions.create(createRequest('gpt-4o-mini'));
            console.log('Respuesta de OpenAI recibida con gpt-4o-mini');
          } catch (error3: any) {
            // Último intento con gpt-4-turbo
            console.log('gpt-4o-mini no disponible, intentando con gpt-4-turbo...');
            try {
              modelUsed = 'gpt-4-turbo';
              response = await openai.chat.completions.create(createRequest('gpt-4-turbo'));
              console.log('Respuesta de OpenAI recibida con gpt-4-turbo');
            } catch (error4: any) {
              // Si todos los modelos fallan, lanzar el error original
              throw error1;
            }
          }
        }
      } else {
        // Si el error no es por modelo, lanzarlo
        throw error1;
      }
    }

    console.log('Modelo usado:', modelUsed);
    const analysisText = response.choices[0]?.message?.content || '{}';
    console.log('Análisis recibido:', analysisText.substring(0, 200));
    
    // Parsear la respuesta JSON
    let analysis;
    try {
      // Intentar extraer JSON si está en markdown o tiene texto adicional
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(analysisText);
      }

      // Validar que tenga los campos requeridos
      if (typeof analysis.isOptimal !== 'boolean') {
        analysis.isOptimal = false;
      }
      if (typeof analysis.hasPlainBackground !== 'boolean') {
        analysis.hasPlainBackground = false;
      }
      if (typeof analysis.isComplex !== 'boolean') {
        analysis.isComplex = true;
      }
      if (typeof analysis.needsOptimization !== 'boolean') {
        analysis.needsOptimization = !analysis.isOptimal;
      }
      if (typeof analysis.reason !== 'string') {
        analysis.reason = analysis.isOptimal 
          ? 'Logo óptimo para sello de bronce'
          : 'Logo requiere optimización';
      }
      if (typeof analysis.aspectRatio !== 'number' || analysis.aspectRatio <= 0) {
        // Si no se puede determinar, calcular desde la imagen completa como fallback
        analysis.aspectRatio = 1.0; // Valor por defecto
      }
    } catch (e) {
      // Si falla el parseo, usar valores por defecto
      console.error('Error parseando respuesta de OpenAI:', e, 'Respuesta:', analysisText);
      analysis = {
        isOptimal: false,
        hasPlainBackground: false,
        isComplex: true,
        needsOptimization: true,
        reason: 'Error al analizar el logo. Se requiere optimización manual.',
      };
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Error analizando logo:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      code: error.code,
      response: error.response?.data || error.response,
    });
    
    // Manejar errores específicos de OpenAI
    if (error.status === 401 || error.statusCode === 401) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key de OpenAI inválida o no configurada',
        },
        { status: 401 }
      );
    }

    if (error.status === 429 || error.statusCode === 429) {
      return NextResponse.json(
        {
          success: false,
          error: 'Límite de rate de OpenAI excedido. Por favor intenta más tarde.',
        },
        { status: 429 }
      );
    }

    // Verificar si el error es por modelo no encontrado o sin acceso
    if (error.status === 403 || error.message?.includes('does not have access') || error.message?.includes('model')) {
      console.error('Error de acceso al modelo. Verificar permisos en OpenAI.');
      return NextResponse.json(
        {
          success: false,
          error: `Error de acceso al modelo: ${error.message}. Verifica que tu proyecto de OpenAI tenga acceso a modelos con visión (gpt-5.2-chat-latest, gpt-4o, gpt-4o-mini, gpt-4-turbo).`,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al analizar el logo',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
