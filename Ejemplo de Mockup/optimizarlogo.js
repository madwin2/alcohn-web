// =============================================
// ALCOHN AGENT — Tool: Optimizar Logo
// =============================================
// Edita un logo existente usando previous_response_id
// para encadenar desde la generación original.
// OpenAI tiene la imagen en contexto nativo,
// así la preserva mucho mejor.
//
// REQUIERE: npm install openai (v6+)
// =============================================

const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── IMPLEMENTACIÓN ──────────────────────────

/**
 * Edita un logo existente encadenando desde el response_id original.
 * Si no hay response_id, re-sube la imagen con input_fidelity: high.
 */
async function optimizarLogo(input) {
  const { imagen_base64, mimetype, instrucciones, problema, response_id } = input;

  if (!imagen_base64 && !response_id) {
    return { ok: false, error: 'No se proporcionó imagen para optimizar.' };
  }

  const cambios = instrucciones || problema || 'Optimizar para grabado en bronce';

  const prompt = `Modificá este logo aplicando SOLO el siguiente cambio: ${cambios}

REGLA ABSOLUTA: Todo lo que NO se menciona en el cambio debe quedar EXACTAMENTE IDÉNTICO al original.
- Mismo texto exacto (mismas palabras, misma tipografía, misma posición)
- Mismos colores
- Misma composición general
- Mismos elementos que no se mencionan en el cambio
Solo tocá lo que se pide. NADA más.`;

  try {
    let responseParams;

    if (response_id) {
      // Encadenar desde la respuesta original (mejor preservación)
      responseParams = {
        model: 'gpt-4.1',
        previous_response_id: response_id,
        input: prompt,
        tools: [{
          type: 'image_generation',
          action: 'edit',
          quality: 'high',
          size: '1024x1024'
        }]
      };
      console.log('[optimizarLogo] Usando previous_response_id para encadenar edición');
    } else if (imagen_base64) {
      // Fallback: re-subir la imagen con alta fidelidad
      const mime = mimetype || 'image/png';
      const dataUrl = `data:${mime};base64,${imagen_base64}`;
      responseParams = {
        model: 'gpt-4.1',
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: prompt },
              { type: 'input_image', image_url: dataUrl }
            ]
          }
        ],
        tools: [{
          type: 'image_generation',
          action: 'edit',
          quality: 'high',
          size: '1024x1024',
          input_fidelity: 'high'
        }]
      };
      console.log('[optimizarLogo] Fallback: re-subiendo imagen con input_fidelity high');
    }

    const response = await openai.responses.create(responseParams);

    const imageResults = response.output
      .filter(o => o.type === 'image_generation_call')
      .map(o => o.result);

    if (!imageResults.length || !imageResults[0]) {
      const textOutput = response.output
        .filter(o => o.type === 'message')
        .map(o => o.content?.map(c => c.text).join(''))
        .join('');
      return { ok: false, error: textOutput || 'OpenAI no devolvió imagen editada.' };
    }

    return {
      ok: true,
      imagen_base64: imageResults[0],
      mimetype: 'image/png',
      response_id: response.id,
      cambios: [`Cambio aplicado: ${cambios}`],
      nota: 'Logo editado preservando el diseño original.'
    };

  } catch (err) {
    console.error('[optimizarLogo] Error OpenAI:', err.message);
    return {
      ok: false,
      error: `No se pudo editar el logo: ${err.message}`
    };
  }
}

// ─── DEFINICIÓN PARA CLAUDE ──────────────────

const definicion = {
  name: 'optimizar_logo',
  description:
    'EDITA un logo existente del cliente — NO lo regenera desde cero. ' +
    'Usa la imagen original como base y aplica SOLO los cambios pedidos, preservando todo lo demás. ' +
    'Usá esta tool cuando: el cliente pide ajustes a un logo (cambiar tamaños, quitar/agregar elementos), ' +
    'el logo necesita optimización para grabado, o cuando analizar_imagen detectó problemas. ' +
    'NO incluyas imagen_base64 — el sistema la inyecta automáticamente.',
  input_schema: {
    type: 'object',
    properties: {
      instrucciones: {
        type: 'string',
        description:
          'Qué cambios hacer al logo. Sé específico. ' +
          'Ej: "hacé los cubiertos más chicos", "sacale el texto de abajo", "engrosá los trazos"'
      },
      problema: {
        type: 'string',
        description:
          'Problema técnico a corregir. Ej: "tiene degradados", "trazos muy finos"'
      },
      imagen_id: {
        type: 'integer',
        description:
          'ID de la imagen a editar (del registro de imágenes). ' +
          'Si no se proporciona, se usa la última imagen generada.'
      }
    },
    required: ['instrucciones']
  }
};

module.exports = { optimizarLogo, definicion };
