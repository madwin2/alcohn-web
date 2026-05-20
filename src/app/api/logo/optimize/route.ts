import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import sharp from 'sharp';

/** Vercel/Next: debe cubrir imagen GPT + análisis de proporción sin cortar antes que el cliente. */
export const maxDuration = 120;

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

    // Recibir FormData con el archivo
    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Logo no proporcionado (debe ser un File)' },
        { status: 400 }
      );
    }

    console.log('Optimizando logo con gpt-image-1.5...');

    // Convertir File a Buffer y redimensionar la imagen
    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);
    
    // Redimensionar y comprimir la imagen para cumplir con el límite estricto de 16KB de OpenAI
    // IMPORTANTE: OpenAI images.edit requiere PNG, no JPEG
    let imageBuffer = await sharp(originalBuffer)
      .resize(256, 256, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 9, quality: 80 }) // PNG con máxima compresión
      .toBuffer();
    
    // Si aún es muy grande, reducir más el tamaño
    if (imageBuffer.length > 15000) {
      imageBuffer = await sharp(originalBuffer)
        .resize(128, 128, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png({ compressionLevel: 9, quality: 70 })
        .toBuffer();
    }
    
    // Verificar que imageBuffer es realmente un Buffer
    if (!Buffer.isBuffer(imageBuffer)) {
      throw new Error('Error procesando imagen: el resultado no es un Buffer válido');
    }
    
    console.log('Imagen procesada. Tamaño original:', originalBuffer.length, 'bytes. Tamaño final:', imageBuffer.length, 'bytes');
    console.log('Tipo de imageBuffer:', typeof imageBuffer, 'Es Buffer?', Buffer.isBuffer(imageBuffer));

    // Optimizar el logo usando gpt-image-1.5
    // El prompt es muy específico: mantener el logo original, solo optimizarlo a monocromático
    const prompt = `Convierte este logo a monocromático, a un tinta, negro con fondo blanco. 

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

    try {
      // Convertir el Buffer procesado de vuelta a File para OpenAI
      const processedFile = new File([new Uint8Array(imageBuffer)], 'logo.png', { type: 'image/png' });
      
      console.log('Enviando imagen a OpenAI. Tamaño:', imageBuffer.length, 'bytes');
      
      const response = await openai.images.edit({
        model: 'gpt-image-1.5',
        image: processedFile, // File object que OpenAI espera
        prompt: prompt,
        size: '1024x1024',
        quality: 'high',
        background: 'opaque',
      });

      const optimizedImageBase64 = response.data?.[0]?.b64_json;

      if (!optimizedImageBase64) {
        return NextResponse.json(
          { success: false, error: 'No se pudo generar la imagen optimizada' },
          { status: 500 }
        );
      }

      // Convertir a data URL
      const optimizedImageDataUrl = `data:image/png;base64,${optimizedImageBase64}`;

      console.log('Logo optimizado exitosamente con gpt-image-1.5');

      // Analizar el aspect ratio del diseño en la imagen optimizada
      let aspectRatio = 1.0; // Valor por defecto
      try {
        const aspectRatioPrompt = `Analiza esta imagen de logo optimizado. Calcula el aspect ratio (ancho/alto) del DISEÑO DEL LOGO (no de la imagen completa). Si el logo es cuadrado, el aspect ratio es 1.0. Si es más ancho que alto, será mayor a 1.0. Si es más alto que ancho, será menor a 1.0. Solo analiza el área del diseño del logo, ignorando espacios vacíos o fondos blancos.

Responde ÚNICAMENTE en formato JSON válido con esta estructura exacta (sin markdown, sin texto adicional):
{
  "aspectRatio": number
}`;

        const aspectResponse = await openai.chat.completions.create({
          model: 'gpt-5.2-chat-latest',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: aspectRatioPrompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: optimizedImageDataUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 200,
          response_format: { type: 'json_object' },
        });

        const aspectText = aspectResponse.choices[0]?.message?.content || '{}';
        const jsonMatch = aspectText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aspectData = JSON.parse(jsonMatch[0]);
          if (typeof aspectData.aspectRatio === 'number' && aspectData.aspectRatio > 0) {
            aspectRatio = aspectData.aspectRatio;
            console.log('Aspect ratio del diseño optimizado:', aspectRatio);
          }
        }
      } catch (aspectError: any) {
        console.warn('No se pudo calcular el aspect ratio del diseño optimizado, usando valor por defecto:', aspectError.message);
        // Intentar con modelos alternativos
        try {
          const aspectResponse2 = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Analiza esta imagen de logo optimizado. Calcula el aspect ratio (ancho/alto) del DISEÑO DEL LOGO (no de la imagen completa). Responde ÚNICAMENTE en formato JSON: {"aspectRatio": number}`,
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: optimizedImageDataUrl,
                    },
                  },
                ],
              },
            ],
            max_tokens: 200,
            response_format: { type: 'json_object' },
          });
          const aspectText2 = aspectResponse2.choices[0]?.message?.content || '{}';
          const jsonMatch2 = aspectText2.match(/\{[\s\S]*\}/);
          if (jsonMatch2) {
            const aspectData2 = JSON.parse(jsonMatch2[0]);
            if (typeof aspectData2.aspectRatio === 'number' && aspectData2.aspectRatio > 0) {
              aspectRatio = aspectData2.aspectRatio;
            }
          }
        } catch (aspectError2: any) {
          console.warn('Fallback de aspect ratio también falló, usando 1.0');
        }
      }

      return NextResponse.json({
        success: true,
        optimizedLogo: optimizedImageDataUrl,
        aspectRatio: aspectRatio,
        description: 'Logo optimizado a monocromático (negro sobre fondo blanco) manteniendo el diseño original.',
      });
    } catch (error: any) {
      console.error('Error optimizando logo con gpt-image-1.5:', error);
      
      // Si falla gpt-image-1.5, intentar con gpt-image-1
      if (error.message?.includes('model') || error.status === 403) {
        console.log('gpt-image-1.5 no disponible, intentando con gpt-image-1...');
        try {
          // Convertir el Buffer procesado de vuelta a File para el fallback
          const processedFile2 = new File([new Uint8Array(imageBuffer)], 'logo.png', { type: 'image/png' });
          
          const response2 = await openai.images.edit({
            model: 'gpt-image-1',
            image: processedFile2, // File object que OpenAI espera
            prompt: prompt,
            size: '1024x1024',
            quality: 'high',
            background: 'opaque',
            input_fidelity: 'high',
          });

          const optimizedImageBase642 = response2.data?.[0]?.b64_json;

          if (!optimizedImageBase642) {
            throw new Error('No se pudo generar la imagen optimizada');
          }

          const optimizedImageDataUrl2 = `data:image/png;base64,${optimizedImageBase642}`;

          console.log('Logo optimizado exitosamente con gpt-image-1');

          // Analizar el aspect ratio del diseño en la imagen optimizada (fallback)
          let aspectRatio2 = 1.0; // Valor por defecto
          try {
            const aspectRatioPrompt2 = `Analiza esta imagen de logo optimizado. Calcula el aspect ratio (ancho/alto) del DISEÑO DEL LOGO (no de la imagen completa). Responde ÚNICAMENTE en formato JSON: {"aspectRatio": number}`;
            const aspectResponse2 = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: aspectRatioPrompt2,
                    },
                    {
                      type: 'image_url',
                      image_url: {
                        url: optimizedImageDataUrl2,
                      },
                    },
                  ],
                },
              ],
              max_tokens: 200,
              response_format: { type: 'json_object' },
            });
            const aspectText2 = aspectResponse2.choices[0]?.message?.content || '{}';
            const jsonMatch2 = aspectText2.match(/\{[\s\S]*\}/);
            if (jsonMatch2) {
              const aspectData2 = JSON.parse(jsonMatch2[0]);
              if (typeof aspectData2.aspectRatio === 'number' && aspectData2.aspectRatio > 0) {
                aspectRatio2 = aspectData2.aspectRatio;
              }
            }
          } catch (aspectError2: any) {
            console.warn('No se pudo calcular el aspect ratio del diseño optimizado (fallback), usando valor por defecto');
          }

          return NextResponse.json({
            success: true,
            optimizedLogo: optimizedImageDataUrl2,
            aspectRatio: aspectRatio2,
            description: 'Logo optimizado a monocromático (negro sobre fondo blanco) manteniendo el diseño original.',
          });
        } catch (error2: any) {
          console.error('Error con gpt-image-1:', error2);
          throw error;
        }
      } else {
        throw error;
      }
    }
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
