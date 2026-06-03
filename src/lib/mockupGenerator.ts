import sharp from 'sharp';
import { prepareLogoForStamp } from '@/lib/logoStampPrepare';
import { renderMockup, type MockupMaterial } from '@/lib/mockupRender';

export type { MockupMaterial };

/** Mapea material del wizard al mockup. */
export function mapWizardMaterialToMockup(material: string): MockupMaterial {
  const m = (material || 'cuero').toLowerCase();
  if (m === 'madera' || m === 'ceramica' || m === 'alimentos' || m === 'otros') return 'madera';
  if (m === 'carton' || m === 'cartón') return 'carton';
  if (m === 'cuerina') return 'cuerina';
  return 'cuero';
}

function parseLogoToBuffer(logo: string): Buffer {
  const trimmed = logo.trim();
  if (trimmed.startsWith('data:')) {
    const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(trimmed);
    if (!match) throw new Error('Logo data URL inválido');
    const b64 = match[2].replace(/\s/g, '');
    return Buffer.from(b64, 'base64');
  }
  return Buffer.from(trimmed.replace(/\s/g, ''), 'base64');
}

export type GenerateMockupResult = {
  buffer: Buffer;
  method: 'python-like';
};

/**
 * Mockup serverless (efectos tipo mockup_generator.py + texturas). Sin Python.
 * Normaliza el logo (saca fondo blanco) y aplica efecto quemado o bajorrelieve.
 */
export async function generateRealisticMockup(logo: string, material: string): Promise<GenerateMockupResult> {
  const rawBuffer = parseLogoToBuffer(logo);
  const prepared = await prepareLogoForStamp(rawBuffer);
  const mat = mapWizardMaterialToMockup(material);

  const meta = await sharp(prepared).metadata();
  if (!meta.width || !meta.height || meta.width < 2 || meta.height < 2) {
    throw new Error('No se detectó dibujo en el logo después de prepararlo para el mockup.');
  }

  const buffer = await renderMockup(prepared, mat);
  return { buffer, method: 'python-like' };
}
