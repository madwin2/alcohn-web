/**
 * Escenas fotográficas para las muestras de materiales nuevos.
 * Las coordenadas están medidas sobre las fotos originales (1536×1024).
 */

export type SceneMaterial = 'pan' | 'fruta' | 'hielo' | 'ceramica';

export type SurfaceModel =
  /** Plano. `foreshorten` < 1 si la cámara lo ve inclinado (achica el eje vertical). */
  | { kind: 'flat'; foreshorten?: number }
  /** Domo visto desde arriba (tapa de pan). Radio de curvatura en mm. */
  | { kind: 'dome'; radiusMm: number }
  /** Cilindro vertical visto de frente (taza). Radio en mm. */
  | { kind: 'cylinderV'; radiusMm: number };

export type SceneZone =
  | { kind: 'ellipse'; rx: number; ry: number }
  | { kind: 'rect'; hw: number; hh: number };

export interface MockupScene {
  id: string;
  material: SceneMaterial;
  /** Archivo dentro de `public/mockup-scenes/`. */
  file: string;
  /** Centro de la zona donde va el sello (px de la foto). */
  cx: number;
  cy: number;
  /** Píxeles por milímetro en el centro de la zona. */
  pxPerMm: number;
  surface: SurfaceModel;
  /** Zona útil para el logo, en px alrededor del centro. */
  zone: SceneZone;
  /** Dirección hacia la luz en el plano de la imagen (x derecha, y abajo). */
  light: [number, number];
  /** Lado largo por defecto del logo en mm (antes de elegir la medida). */
  defaultLongMm: number;
  /** Cuánto se hunde/aplasta el material (mm): define cuánto marca en zonas curvas. */
  complianceMm: number;
  /** Desenfoque de la foto en la zona (px) y grano (niveles 0-255). */
  photoBlurPx: number;
  photoNoise: number;
  /** Recorte por color (p. ej. solo sobre la piel naranja). */
  colorClip?: 'citrusPeel';
  /** Recorte final de la foto (zoom sobre la marca), en px de la foto original. */
  crop?: { x: number; y: number; w: number; h: number };
  /** Textura real de quemado para el núcleo de la marca (pan, piel). */
  burnTexture?: { file: string; texPxPerMm: number };
}

export const MOCKUP_SCENES: Record<string, MockupScene> = {
  'pan-hamburguesa-cenital': {
    id: 'pan-hamburguesa-cenital',
    material: 'pan',
    file: 'pan-hamburguesa-cenital.webp',
    cx: 772,
    cy: 468,
    pxPerMm: 7.8,
    surface: { kind: 'dome', radiusMm: 90 },
    zone: { kind: 'ellipse', rx: 335, ry: 340 },
    light: [-0.35, -0.94],
    defaultLongMm: 60,
    complianceMm: 10,
    photoBlurPx: 0.45,
    photoNoise: 2.2,
    burnTexture: { file: 'texturas/pan-quemado.webp', texPxPerMm: 60 },
  },
  'hielo-negroni-cenital': {
    id: 'hielo-negroni-cenital',
    material: 'hielo',
    file: 'hielo-negroni-cenital.webp',
    cx: 743,
    cy: 492,
    pxPerMm: 10.4,
    surface: { kind: 'flat' },
    zone: { kind: 'rect', hw: 225, hh: 220 },
    light: [0.55, -0.83],
    defaultLongMm: 38,
    complianceMm: 100,
    photoBlurPx: 0.8,
    photoNoise: 2.5,
  },
  'fruta-piel-naranja': {
    id: 'fruta-piel-naranja',
    material: 'fruta',
    file: 'fruta-piel-naranja.webp',
    cx: 738,
    cy: 548,
    pxPerMm: 16,
    surface: { kind: 'flat' },
    zone: { kind: 'ellipse', rx: 470, ry: 175 },
    light: [-0.6, -0.8],
    defaultLongMm: 32,
    complianceMm: 100,
    photoBlurPx: 0.6,
    photoNoise: 2,
    colorClip: 'citrusPeel',
    burnTexture: { file: 'texturas/piel-quemada.webp', texPxPerMm: 18 },
  },
  'ceramica-base-bowl': {
    id: 'ceramica-base-bowl',
    material: 'ceramica',
    file: 'ceramica-base-bowl.webp',
    // Centro del disco plano de la base (dentro del pie torneado), visto en perspectiva.
    cx: 755,
    cy: 398,
    pxPerMm: 7.3,
    surface: { kind: 'flat', foreshorten: 0.85 },
    zone: { kind: 'ellipse', rx: 235, ry: 198 },
    light: [-0.85, -0.53],
    defaultLongMm: 58,
    complianceMm: 100,
    photoBlurPx: 0.7,
    photoNoise: 2.5,
    // Zoom sobre la base: la marca es la protagonista.
    crop: { x: 215, y: 38, w: 1080, h: 720 },
  },
  'ceramica-taza-franja': {
    id: 'ceramica-taza-franja',
    material: 'ceramica',
    file: 'ceramica-taza-franja.webp',
    cx: 755,
    cy: 650,
    pxPerMm: 11.9,
    surface: { kind: 'cylinderV', radiusMm: 45 },
    zone: { kind: 'rect', hw: 380, hh: 200 },
    light: [-0.97, -0.24],
    defaultLongMm: 40,
    complianceMm: 15,
    photoBlurPx: 0.6,
    photoNoise: 2.5,
  },
};

/** Escena por defecto según el uso del generador o el material. */
export function resolveSceneId(usoOrMaterial: string | undefined | null): string | null {
  const k = (usoOrMaterial || '').toLowerCase();
  if (k === 'para-hielo' || k === 'hielo') return 'hielo-negroni-cenital';
  if (k === 'para-fruta' || k === 'fruta') return 'fruta-piel-naranja';
  if (k === 'para-pan' || k === 'pan') return 'pan-hamburguesa-cenital';
  if (k === 'para-ceramica' || k === 'ceramica') return 'ceramica-base-bowl';
  if (MOCKUP_SCENES[k]) return k;
  return null;
}
