import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import sharp from 'sharp';

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

    // Recibir FormData con el archivo y material
    const formData = await request.formData();
    const file = formData.get('logo') as File;
    const material = formData.get('material') as string;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Logo no proporcionado (debe ser un File)' },
        { status: 400 }
      );
    }

    if (!material) {
      return NextResponse.json(
        { success: false, error: 'Material no proporcionado' },
        { status: 400 }
      );
    }

    console.log('Generando mockup con gpt-image-1.5...');
    console.log('Material:', material);

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

    // Crear prompt específico según el material
    const materialPrompts: Record<string, string> = {
      cuero: `Crea un mockup realista mostrando solo la marca del logo aplicada sobre cuero. 

CRÍTICO - RESPETA EL LOGO AL 100%:
- El logo debe aparecer EXACTAMENTE como está en la imagen proporcionada. Mismo diseño, mismas formas, mismas proporciones.
- NO cambies ninguna línea, curva, letra, símbolo o elemento del logo.
- NO agregues ni quites nada del diseño original.

SOLO MUESTRA LA MARCA SOBRE EL MATERIAL:
- Muestra SOLO la superficie de cuero vaqueta marron clarito, con la marca del logo impresa en relieve.
- El marcado es a presion, queda del mismo color que el cuero, levemente mas oscuro por las sombras.
- NO muestres ningún sello físico, solo la textura del cuero y la marca.
- La marca debe verse como una impresión en relieve sobre el cuero, con sombras y textura realista.
- El cuero debe tener textura natural, con grano visible.
- La iluminación debe ser realista, mostrando profundidad y relieve.
- El resultado debe ser solo cuero con la marca, sin objetos adicionales.`,
      
      madera: `Crea un mockup realista mostrando solo la marca del logo aplicada sobre madera. 

CRÍTICO - RESPETA EL LOGO AL 100%:
- El logo debe aparecer EXACTAMENTE como está en la imagen proporcionada. Mismo diseño, mismas formas, mismas proporciones.
- NO cambies ninguna línea, curva, letra, símbolo o elemento del logo.
- NO agregues ni quites nada del diseño original.

SOLO MUESTRA LA MARCA SOBRE EL MATERIAL:
- Muestra SOLO la superficie de madera de pino clarita, con la marca del logo grabada/quemada.
- NO muestres ningún sello físico, solo la textura de la madera y la marca.
- La marca debe verse como una quemadura/grabado en la madera, con textura de madera quemada.
- La madera debe tener vetas naturales visibles.
- La iluminación debe ser realista, mostrando profundidad del grabado.
- El resultado debe ser solo madera con la marca, sin objetos adicionales.`,
      
      ambos: `Crea un mockup realista mostrando solo las marcas del logo aplicadas sobre cuero y madera. 

CRÍTICO - RESPETA EL LOGO AL 100%:
- El logo debe aparecer EXACTAMENTE como está en la imagen proporcionada. Mismo diseño, mismas formas, mismas proporciones.
- NO cambies ninguna línea, curva, letra, símbolo o elemento del logo.
- NO agregues ni quites nada del diseño original.

SOLO MUESTRA LAS MARCAS SOBRE LOS MATERIALES:
- Muestra SOLO dos superficies: una de cuero con la marca en relieve y otra de madera con la marca grabada.
- NO muestres ningún sello físico, solo las texturas de los materiales y las marcas.
- Ambas aplicaciones deben verse realistas con texturas naturales.
- La iluminación debe ser realista en ambas.
- El resultado debe ser solo los materiales con las marcas, sin objetos adicionales.`,
      
      ceramica: `Crea un mockup realista mostrando solo la marca del logo aplicada sobre cerámica cruda. 

CRÍTICO - RESPETA EL LOGO AL 100%:
- El logo debe aparecer EXACTAMENTE como está en la imagen proporcionada. Mismo diseño, mismas formas, mismas proporciones.
- NO cambies ninguna línea, curva, letra, símbolo o elemento del logo.
- NO agregues ni quites nada del diseño original.

SOLO MUESTRA LA MARCA SOBRE EL MATERIAL:
- Muestra SOLO la superficie de cerámica cruda (arcilla) con la marca del logo impresa.
- NO muestres ningún sello físico, solo la textura de la arcilla y la marca.
- La marca debe verse como una impresión en la arcilla, con textura de cerámica.
- La superficie debe tener textura de arcilla natural.
- La iluminación debe ser realista.
- El resultado debe ser solo cerámica con la marca, sin objetos adicionales.`,
      
      alimentos: `Crea un mockup realista mostrando solo la marca del logo aplicada sobre alimentos. 

CRÍTICO - RESPETA EL LOGO AL 100%:
- El logo debe aparecer EXACTAMENTE como está en la imagen proporcionada. Mismo diseño, mismas formas, mismas proporciones.
- NO cambies ninguna línea, curva, letra, símbolo o elemento del logo.
- NO agregues ni quites nada del diseño original.

SOLO MUESTRA LA MARCA SOBRE EL ALIMENTO:
- Muestra SOLO el alimento (pan, mantequilla, etc.) con la marca del logo impresa.
- NO muestres ningún sello físico, solo el alimento y la marca.
- La marca debe verse como una impresión en el alimento.
- El alimento debe verse fresco y realista.
- La iluminación debe ser realista.
- El resultado debe ser solo el alimento con la marca, sin objetos adicionales.`,
      
      otros: `Crea un mockup realista mostrando solo la marca del logo aplicada sobre una superficie. 

CRÍTICO - RESPETA EL LOGO AL 100%:
- El logo debe aparecer EXACTAMENTE como está en la imagen proporcionada. Mismo diseño, mismas formas, mismas proporciones.
- NO cambies ninguna línea, curva, letra, símbolo o elemento del logo.
- NO agregues ni quites nada del diseño original.

SOLO MUESTRA LA MARCA SOBRE LA SUPERFICIE:
- Muestra SOLO la superficie con la marca del logo aplicada.
- NO muestres ningún sello físico, solo la textura de la superficie y la marca.
- La superficie debe tener textura realista.
- La iluminación debe ser realista.
- El resultado debe ser solo la superficie con la marca, sin objetos adicionales.`,
    };

    const prompt = materialPrompts[material] || materialPrompts.otros;

    try {
      // Convertir el Buffer procesado de vuelta a File para OpenAI
      const processedFile = new File([new Uint8Array(imageBuffer)], 'mockup.png', { type: 'image/png' });
      
      console.log('Enviando imagen a OpenAI. Tamaño:', imageBuffer.length, 'bytes');
      
      const response = await openai.images.edit({
        model: 'gpt-image-1.5',
        image: processedFile, // File object que OpenAI espera
        prompt: prompt,
        size: '1024x1024',
        quality: 'high',
        background: 'opaque',
      });

      const mockupBase64 = response.data?.[0]?.b64_json;

      if (!mockupBase64) {
        return NextResponse.json(
          { success: false, error: 'No se pudo generar el mockup' },
          { status: 500 }
        );
      }

      // Convertir a data URL
      const mockupDataUrl = `data:image/png;base64,${mockupBase64}`;

      console.log('Mockup generado exitosamente con gpt-image-1.5');

      return NextResponse.json({
        success: true,
        mockupUrl: mockupDataUrl,
        thumbnailUrl: mockupDataUrl, // Por ahora usamos la misma imagen
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTime: 0, // Se calcularía si tuviéramos el tiempo real
          model: 'gpt-image-1.5',
          material: material,
        },
      });
    } catch (error: any) {
      console.error('Error generando mockup con gpt-image-1.5:', error);
      
      // Si falla gpt-image-1.5, intentar con gpt-image-1
      if (error.message?.includes('model') || error.status === 403) {
        console.log('gpt-image-1.5 no disponible, intentando con gpt-image-1...');
        try {
          // Convertir el Buffer procesado de vuelta a File para el fallback
          const processedFile2 = new File([new Uint8Array(imageBuffer)], 'mockup.png', { type: 'image/png' });
          
          const response2 = await openai.images.edit({
            model: 'gpt-image-1',
            image: processedFile2, // File object que OpenAI espera
            prompt: prompt,
            size: '1024x1024',
            quality: 'high',
            background: 'opaque',
            input_fidelity: 'high',
          });

          const mockupBase642 = response2.data?.[0]?.b64_json;

          if (!mockupBase642) {
            throw new Error('No se pudo generar el mockup');
          }

          const mockupDataUrl2 = `data:image/png;base64,${mockupBase642}`;

          console.log('Mockup generado exitosamente con gpt-image-1');

          return NextResponse.json({
            success: true,
            mockupUrl: mockupDataUrl2,
            thumbnailUrl: mockupDataUrl2,
            metadata: {
              generatedAt: new Date().toISOString(),
              processingTime: 0,
              model: 'gpt-image-1',
              material: material,
            },
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
    console.error('Error generando mockup:', error);
    
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
          error: error.message || 'Error al generar el mockup',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al generar el mockup',
      },
      { status: 500 }
    );
  }
}
