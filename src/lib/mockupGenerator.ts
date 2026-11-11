import sharp from 'sharp';
import { prepareLogoForStamp } from '@/lib/logoStampPrepare';
import { renderMockup, type MockupMaterial } from '@/lib/mockupRender';
import { renderSceneMockup } from '@/lib/mockupScenes/render';
import { resolveSceneId } from '@/lib/mockupScenes/scenes';

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
  method: 'python-like' | 'scene';
  /** Solo en muestras por escena (hielo, pan, fruta, cerámica). */
  sceneId?: string;
  logoMm?: { width: number; height: number };
  fitted?: boolean;
};

export type GenerateMockupOptions = {
  /** Uso del generador (`para-hielo`, `para-pan`, …): elige la escena. */
  uso?: string | null;
  /** Medida del sello elegida; sin medida se usa la recomendada de la escena. */
  sizeMm?: { widthMm: number; heightMm: number } | null;
};

/**
 * Mockup serverless. Sin Python.
 * - Hielo, pan, piel de cítrico y cerámica: escena fotográfica con el logo a escala real.
 * - Cuero y madera: textura + quemado o bajorrelieve (como siempre).
 */
export async function generateRealisticMockup(
  logo: string,
  material: string,
  opts?: GenerateMockupOptions,
): Promise<GenerateMockupResult> {
  const rawBuffer = parseLogoToBuffer(logo);
  const prepared = await prepareLogoForStamp(rawBuffer);

  const meta = await sharp(prepared).metadata();
  if (!meta.width || !meta.height || meta.width < 2 || meta.height < 2) {
    throw new Error('No se detectó dibujo en el logo después de prepararlo para el mockup.');
  }

  const sceneId = resolveSceneId(opts?.uso) ?? resolveSceneId(material);
  if (sceneId) {
    const res = await renderSceneMockup(prepared, sceneId, { sizeMm: opts?.sizeMm });
    return { buffer: res.buffer, method: 'scene', sceneId, logoMm: res.logoMm, fitted: res.fitted };
  }

  const buffer = await renderMockup(prepared, mapWizardMaterialToMockup(material));
  return { buffer, method: 'python-like' };
}
