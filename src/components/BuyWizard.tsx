'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Stepper from './Stepper';
import ContactStep from './buy/ContactStep';
import PurchaseInclusions from './PurchaseInclusions';
import { config } from '@/lib/config';
import { useCart } from '@/contexts/CartContext';
import { saveCheckoutPrefill } from '@/lib/checkoutPrefill';
import { getOrCreateWebSessionId, peekWizardSupabaseSession } from '@/lib/wizardSupabaseSession';
import {
  syncWizardContact,
  ensureMockupSolicitud,
  syncWizardLogos,
  syncWizardMockupPreview,
  markMockupPendingApproval,
  markCheckoutStarted,
} from '@/lib/wizardSupabaseSync';
import { patchMockupSolicitud } from '@/lib/supabase/mockupApiClient';

interface BuyWizardData {
  nombre?: string;
  whatsapp?: string;
  email?: string;
  material?: 'cuero' | 'madera' | 'ambos' | 'ceramica' | 'alimentos' | 'otros';
  logoFile?: File | null;
  logoPreview?: string;
  logoOriginal?: string; // Logo original antes de optimización
  logoOptimized?: string; // Logo optimizado por OpenAI
  logoAnalysis?: {
    isOptimal?: boolean; // true si es ideal para sello de bronce
    hasPlainBackground?: boolean; // true si tiene fondo blanco/transparente
    isComplex?: boolean; // true si es foto o imagen compleja
    needsOptimization?: boolean; // true si necesita optimización
    reason?: string; // Razón de la decisión
    aspectRatio?: number;
  };
  selectedSize?: string;
  selectedPrice?: number;
  customSize?: { width: number; height: number };
  approximateSizeKey?: 'pequeño' | 'medio' | 'grande'; // Si viene de una medida aproximada
  sizeOptions?: Array<{ size: string; price: number; recommended?: boolean; ratio: number }>;
  previewGenerated?: boolean;
  needsManualPreview?: boolean; // true si necesita muestra manual vía WhatsApp
  isAnalyzing?: boolean; // true mientras se analiza el logo
  isOptimizing?: boolean; // true mientras se optimiza el logo
  mockupUrl?: string; // URL del mockup generado
  thumbnailUrl?: string; // URL del thumbnail del mockup
  isGeneratingMockup?: boolean; // true mientras se genera el mockup
}

type WizardMaterial = NonNullable<BuyWizardData['material']>;

interface BuyWizardProps {
  initialProduct?: string;
  initialMaterial?: WizardMaterial;
  onComplete?: (data: BuyWizardData) => void;
}

const WIZARD_MATERIAL_LABELS: Record<string, string> = {
  cuero: 'Cuero',
  madera: 'Madera',
  ambos: 'Cuero y madera',
  ceramica: 'Cerámica',
  alimentos: 'Alimentos',
  otros: 'Otros',
};

/** Miniatura del carrito: mockup si es URL corta; si no, textura según material (evita data URLs enormes en localStorage). */
function wizardCartImageUrl(d: BuyWizardData): string {
  const u = d.thumbnailUrl || d.mockupUrl || '';
  if (u && !u.startsWith('data:')) return u;
  if (d.material === 'madera') return '/mockup-textures/madera.jpg';
  return '/mockup-textures/cuero.jpg';
}

// Definición de medidas por categoría (en centímetros, convertidas a mm después)
const sellosChicos = [
  { w: 1, h: 1 }, { w: 2, h: 2 }, { w: 2.5, h: 2.5 },
  { w: 2, h: 1 }, { w: 3, h: 2 }, { w: 3, h: 2.5 },
  { w: 3, h: 1 }, { w: 4, h: 2 },
  { w: 4, h: 1 }, { w: 5, h: 1 }, { w: 6, h: 1 }, { w: 7, h: 1 }, { w: 8, h: 1 }
];

const sellosMedianos = [
  { w: 9, h: 1 }, { w: 5, h: 2 }, { w: 4, h: 2.5 }, { w: 3, h: 3 },
  { w: 6, h: 2 }, { w: 5, h: 2.5 }, { w: 4, h: 3 },
  { w: 7, h: 2 }, { w: 6, h: 2.5 }, { w: 5, h: 3 },
  { w: 8, h: 2 }, { w: 7, h: 2.5 }, { w: 6, h: 3 },
  { w: 4, h: 4 }, { w: 5, h: 4 }
];

const sellosGrandes = [
  { w: 9, h: 2 }, { w: 7, h: 3 }, { w: 6, h: 4 },
  { w: 8, h: 2.5 }, { w: 8, h: 3 }, { w: 7, h: 4 },
  { w: 9, h: 2.5 }, { w: 8, h: 4 },
  { w: 10, h: 2.5 }, { w: 9, h: 3 }, { w: 9, h: 4 }, { w: 5, h: 5 },
  { w: 6, h: 5 }, { w: 7, h: 5 }
];

// Función para determinar la categoría de una medida (en mm)
type SizeCategory = 'chico' | 'mediano' | 'grande' | null;
const getSizeCategory = (width: number, height: number): SizeCategory => {
  // Convertir mm a cm para comparar
  const wCm = width / 10;
  const hCm = height / 10;
  
  // Normalizar (siempre width >= height para comparar)
  const w = Math.max(wCm, hCm);
  const h = Math.min(wCm, hCm);
  
  // Verificar si está en sellos chicos
  const isChico = sellosChicos.some(s => 
    (Math.abs(s.w - w) < 0.1 && Math.abs(s.h - h) < 0.1) ||
    (Math.abs(s.w - h) < 0.1 && Math.abs(s.h - w) < 0.1)
  );
  
  if (isChico) return 'chico';
  
  // Verificar si está en sellos medianos
  const isMediano = sellosMedianos.some(s => 
    (Math.abs(s.w - w) < 0.1 && Math.abs(s.h - h) < 0.1) ||
    (Math.abs(s.w - h) < 0.1 && Math.abs(s.h - w) < 0.1)
  );
  
  if (isMediano) return 'mediano';
  
  // Verificar si está en sellos grandes
  const isGrande = sellosGrandes.some(s => 
    (Math.abs(s.w - w) < 0.1 && Math.abs(s.h - h) < 0.1) ||
    (Math.abs(s.w - h) < 0.1 && Math.abs(s.h - w) < 0.1)
  );
  
  if (isGrande) return 'grande';
  
  return null;
};

// Función para encontrar la medida más grande de una categoría manteniendo proporción
const findLargestInCategory = (category: 'chico' | 'mediano' | 'grande', aspectRatio: number): { width: number; height: number } | null => {
  const categoryList = category === 'chico' ? sellosChicos : category === 'mediano' ? sellosMedianos : sellosGrandes;
  
  // Filtrar medidas que se aproximen al aspect ratio
  const candidates = categoryList
    .map(s => {
      const w = s.w * 10; // Convertir a mm
      const h = s.h * 10;
      const ratio = w / h;
      return { width: w, height: h, ratio, area: w * h, diff: Math.abs(ratio - aspectRatio) };
    })
    .filter(c => Math.abs(c.ratio - aspectRatio) < 0.5) // Tolerancia para aspect ratio
    .sort((a, b) => b.area - a.area); // Ordenar por área descendente
  
  if (candidates.length === 0) return null;
  
  return { width: candidates[0].width, height: candidates[0].height };
};

// Función para encontrar medida cercana a 4x4 o 5x3 en medianos
const findMedianoTarget = (aspectRatio: number): { width: number; height: number } | null => {
  // Objetivos: 4x4 (ratio 1.0) o 5x3 (ratio 1.67)
  const targets = [
    { w: 4, h: 4, ratio: 1.0 },
    { w: 5, h: 3, ratio: 1.67 },
    { w: 3, h: 5, ratio: 0.6 }
  ];
  
  // Encontrar el target más cercano al aspect ratio
  const closestTarget = targets.reduce((prev, curr) => 
    Math.abs(curr.ratio - aspectRatio) < Math.abs(prev.ratio - aspectRatio) ? curr : prev
  );
  
  // Buscar en sellos medianos la medida más cercana
  const candidates = sellosMedianos
    .map(s => {
      const w = s.w * 10;
      const h = s.h * 10;
      const ratio = w / h;
      const targetRatio = closestTarget.ratio;
      return { 
        width: w, 
        height: h, 
        ratio, 
        diff: Math.abs(ratio - targetRatio),
        area: w * h
      };
    })
    .sort((a, b) => {
      // Priorizar por diferencia de ratio, luego por área
      if (Math.abs(a.diff - b.diff) < 0.1) return b.area - a.area;
      return a.diff - b.diff;
    });
  
  if (candidates.length === 0) return null;
  
  return { width: candidates[0].width, height: candidates[0].height };
};

// Función para encontrar la medida más chica de grandes
const findSmallestGrande = (aspectRatio: number): { width: number; height: number } | null => {
  const candidates = sellosGrandes
    .map(s => {
      const w = s.w * 10;
      const h = s.h * 10;
      const ratio = w / h;
      return { width: w, height: h, ratio, area: w * h, diff: Math.abs(ratio - aspectRatio) };
    })
    .filter(c => Math.abs(c.ratio - aspectRatio) < 0.5)
    .sort((a, b) => a.area - b.area); // Ordenar por área ascendente
  
  if (candidates.length === 0) return null;
  
  return { width: candidates[0].width, height: candidates[0].height };
};

// Precios base por categoría
const basePrices = {
  chico: 44000,
  mediano: 55000,
  grande: 66000,
};

// Descuento por transferencia (10%)
const TRANSFER_DISCOUNT = 0.10;

// Función para calcular precio basado en categoría y área
const calculatePrice = (category: SizeCategory, width: number, height: number): number => {
  if (!category) return basePrices.mediano; // Default
  
  const area = width * height;
  const baseArea = category === 'chico' ? 400 : category === 'mediano' ? 1600 : 3600; // Áreas de referencia
  const multiplier = area / baseArea;
  const basePrice = basePrices[category];
  
  // Ajustar precio según área (con límites razonables)
  return Math.round(basePrice * Math.max(0.8, Math.min(1.5, multiplier)));
};

// Mapeo de tamaños recomendados a medidas específicas (usado como fallback)
const sizeMap: Record<string, { size: string; price: number }> = {
  pequeño: { size: '25x25mm', price: 44000 },
  medio: { size: '40x40mm', price: 55000 },
  grande: { size: '60x60mm', price: 66000 },
};

function medianOfSortedCopy(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/**
 * Proporción ancho/alto del DIBUJO del logo (bounding box del contenido), no del archivo completo.
 * - PNG/SVG con transparencia: usa el canal alpha.
 * - Imagen opaca: estima color de fondo con la mediana del borde y toma píxeles que se alejan bastante.
 */
function measureLogoContentAspectRatioFromDataUrl(dataUrl: string): Promise<number> {
  return new Promise((resolve) => {
    if (!dataUrl.startsWith('data:image')) {
      resolve(1);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const nw = img.naturalWidth || 1;
      const nh = img.naturalHeight || 1;
      const fullRatio = Math.max(0.15, Math.min(8, nw / nh));

      const maxSide = 640;
      const scale = Math.min(1, maxSide / Math.max(nw, nh));
      const cw = Math.max(1, Math.round(nw * scale));
      const ch = Math.max(1, Math.round(nh * scale));

      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve(fullRatio);
        return;
      }
      ctx.drawImage(img, 0, 0, cw, ch);
      let imageData: ImageData;
      try {
        imageData = ctx.getImageData(0, 0, cw, ch);
      } catch {
        resolve(fullRatio);
        return;
      }
      const data = imageData.data;

      const borderRs: number[] = [];
      const borderGs: number[] = [];
      const borderBs: number[] = [];
      const borderAs: number[] = [];
      const pushBorderPixel = (x: number, y: number) => {
        const i = (y * cw + x) * 4;
        borderRs.push(data[i]);
        borderGs.push(data[i + 1]);
        borderBs.push(data[i + 2]);
        borderAs.push(data[i + 3]);
      };
      for (let x = 0; x < cw; x++) {
        pushBorderPixel(x, 0);
        pushBorderPixel(x, ch - 1);
      }
      for (let y = 0; y < ch; y++) {
        pushBorderPixel(0, y);
        pushBorderPixel(cw - 1, y);
      }

      const bgR = medianOfSortedCopy(borderRs);
      const bgG = medianOfSortedCopy(borderGs);
      const bgB = medianOfSortedCopy(borderBs);
      const meanBorderAlpha = borderAs.reduce((a, b) => a + b, 0) / borderAs.length;

      // Borde mayormente transparente → recortar por alpha
      const useAlphaMask = meanBorderAlpha < 252;

      const colorDist = (i: number) => {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        return Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
      };

      let minX = cw;
      let minY = ch;
      let maxX = -1;
      let maxY = -1;
      let count = 0;

      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const i = (y * cw + x) * 4;
          const a = data[i + 3];
          let isFg = false;
          if (useAlphaMask) {
            isFg = a > 32;
          } else {
            const d = colorDist(i);
            const dr = Math.abs(data[i] - bgR);
            const dg = Math.abs(data[i + 1] - bgG);
            const db = Math.abs(data[i + 2] - bgB);
            const maxRgbDiff = Math.max(dr, dg, db);
            // Contenido = distinto del color típico del borde (fondo)
            isFg = d > 48 || maxRgbDiff > 28;
          }
          if (isFg) {
            count++;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      const boxW = maxX - minX + 1;
      const boxH = maxY - minY + 1;
      const areaFrac = (boxW * boxH) / (cw * ch);

      if (count < 8 || maxX < minX || boxW < 2 || boxH < 2 || areaFrac < 0.0008) {
        resolve(fullRatio);
        return;
      }

      // Si casi todo el canvas quedó marcado, el criterio de fondo falló → volver al marco completo
      if (areaFrac > 0.985 && !useAlphaMask) {
        resolve(fullRatio);
        return;
      }

      const r = boxW / boxH;
      resolve(Math.max(0.15, Math.min(8, Number.isFinite(r) ? r : fullRatio)));
    };
    img.onerror = () => resolve(1);
    img.src = dataUrl;
  });
}

async function parseJsonResponse(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Respuesta vacía del servidor');
  }
  if (trimmed.startsWith('<')) {
    throw new Error(
      'El servidor devolvió HTML en lugar de JSON (reiniciá `npm run dev` o revisá la ruta de la API).'
    );
  }
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    throw new Error('La respuesta del servidor no es JSON válido');
  }
}

const LOGO_ANALYSIS_TIMEOUT_MS = 12000;
const LOGO_OPTIMIZE_TIMEOUT_MS = 120000;
const LOGO_MEASURE_TIMEOUT_MS = 7000;
const MOCKUP_GENERATE_TIMEOUT_MS = 20000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
  timeoutMessage: string
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error: unknown) {
    if ((error as { name?: string })?.name === 'AbortError') {
      throw new Error(timeoutMessage);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Mantiene proporción ancho/alto (ancho = ar × alto).
 * - Lado largo según categoría (chico/mediano/grande).
 * - Lado corto mínimo 5 mm (sellos muy anchos tipo 15:1); el largo mínimo 10 mm.
 */
function stampDimensionsFromLongSide(
  longSideMm: number,
  aspectWidthOverHeight: number,
  minLongMm: number,
  maxMm: number
): { width: number; height: number } {
  const ar = Math.max(0.05, Math.min(30, aspectWidthOverHeight));
  const minShortMm = 5;

  if (ar >= 1) {
    let w = Math.min(maxMm, Math.max(minLongMm, Math.round(longSideMm)));
    let h = Math.max(minShortMm, Math.min(maxMm, Math.round(w / ar)));
    w = Math.min(maxMm, Math.max(minLongMm, Math.round(h * ar)));
    h = Math.max(minShortMm, Math.min(maxMm, Math.round(w / ar)));
    if (w > maxMm) {
      w = maxMm;
      h = Math.max(minShortMm, Math.min(maxMm, Math.round(w / ar)));
    }
    if (h > maxMm) {
      h = maxMm;
      w = Math.max(minLongMm, Math.min(maxMm, Math.round(h * ar)));
    }
    return { width: w, height: h };
  }

  let h = Math.min(maxMm, Math.max(minLongMm, Math.round(longSideMm)));
  let w = Math.max(minShortMm, Math.min(maxMm, Math.round(h * ar)));
  h = Math.min(maxMm, Math.max(minLongMm, Math.round(w / ar)));
  w = Math.max(minShortMm, Math.min(maxMm, Math.round(h * ar)));
  if (h > maxMm) {
    h = maxMm;
    w = Math.max(minShortMm, Math.min(maxMm, Math.round(h * ar)));
  }
  if (w > maxMm) {
    w = maxMm;
    h = Math.max(minLongMm, Math.min(maxMm, Math.round(w / ar)));
  }
  return { width: w, height: h };
}

const LONG_SIDE_TIERS_MM = { chico: 52, mediano: 78, grande: 100 } as const;

const calculateSuggestedSizes = (
  aspectRatio: number
): Array<{ size: string; price: number; recommended?: boolean; category?: SizeCategory; ratio: number }> => {
  const ar = Math.max(0.05, Math.min(30, aspectRatio));
  const tiers: Array<{ key: keyof typeof LONG_SIDE_TIERS_MM; recommended: boolean }> = [
    { key: 'chico', recommended: false },
    { key: 'mediano', recommended: true },
    { key: 'grande', recommended: false },
  ];

  return tiers.map(({ key, recommended }) => {
    const longMm = LONG_SIDE_TIERS_MM[key];
    const { width, height } = stampDimensionsFromLongSide(longMm, ar, 10, 100);
    const category = getSizeCategory(width, height);
    const finalCategory =
      category || (key === 'chico' ? 'chico' : key === 'mediano' ? 'mediano' : 'grande');
    const price = calculatePrice(finalCategory, width, height);
    const ratio = width / height;
    return {
      size: `${width}x${height}mm`,
      price,
      recommended,
      category: finalCategory,
      ratio: Number.isFinite(ratio) ? ratio : ar,
    };
  });
};

// Función para analizar el logo con OpenAI (con proporción medida en el cliente si falla la API)
const analyzeLogoWithAI = async (
  imageUrl: string,
  fallbackAspectRatio: number
): Promise<{
  isOptimal: boolean;
  hasPlainBackground: boolean;
  isComplex: boolean;
  needsOptimization: boolean;
  reason: string;
  aspectRatio: number;
}> => {
  try {
    console.log('Enviando logo a analizar...', imageUrl.substring(0, 100));

    const response = await fetchWithTimeout(
      '/api/logo/analyze',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logo: imageUrl }),
      },
      LOGO_ANALYSIS_TIMEOUT_MS,
      'El analisis del logo tardo demasiado. Usamos la proporcion de tu archivo para sugerir medidas.'
    );

    const result = await parseJsonResponse(response);
    console.log('Respuesta del análisis:', result);

    if (!response.ok || !result.success) {
      const errMsg =
        typeof result.error === 'string'
          ? result.error
          : (result.error as { message?: string })?.message || 'Error al analizar el logo';
      throw new Error(errMsg);
    }

    const analysis = result.analysis as Record<string, unknown> | undefined;
    if (!analysis) throw new Error('Respuesta de análisis incompleta');

    let ar = Number(analysis.aspectRatio);
    if (!Number.isFinite(ar) || ar <= 0) {
      ar = fallbackAspectRatio;
    }

    return {
      isOptimal: Boolean(analysis.isOptimal),
      hasPlainBackground: Boolean(analysis.hasPlainBackground),
      isComplex: Boolean(analysis.isComplex),
      needsOptimization: Boolean(analysis.needsOptimization),
      reason: String(analysis.reason || ''),
      aspectRatio: ar,
    };
  } catch (error: unknown) {
    console.error('Error analizando logo:', error);
    const msg = error instanceof Error ? error.message : 'Error al analizar el logo';
    // Si la API cae, no pedimos optimización (evita otro fetch que también falle con HTML)
    return {
      isOptimal: false,
      hasPlainBackground: false,
      isComplex: false,
      needsOptimization: false,
      reason: `${msg} Usamos la proporción de tu archivo para sugerir medidas.`,
      aspectRatio: fallbackAspectRatio,
    };
  }
};

// Función helper para convertir dataURL a File
const dataUrlToFile = (dataUrl: string, filename = 'logo.png'): File => {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) throw new Error('Data URL inválido');
  const meta = dataUrl.slice(0, comma);
  const b64 = dataUrl.slice(comma + 1).replace(/\s/g, '');
  const mime = meta.match(/data:([^;]+)/)?.[1] ?? 'image/png';
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new File([bytes], filename, { type: mime });
};

// Función para optimizar el logo con OpenAI
const optimizeLogoWithAI = async (imageUrl: string): Promise<{ optimizedLogo: string; aspectRatio: number }> => {
  try {
    // Convertir dataURL a File
    const file = dataUrlToFile(imageUrl, 'logo.png');
    
    // Enviar como FormData
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetchWithTimeout(
      '/api/logo/optimize',
      {
        method: 'POST',
        body: formData, // No establecer Content-Type, el navegador lo hace automáticamente
      },
      LOGO_OPTIMIZE_TIMEOUT_MS,
      'La optimizacion del logo tardo demasiado.'
    );

    const result = await parseJsonResponse(response);

    if (!response.ok || !result.success) {
      const err =
        typeof result.error === 'string'
          ? result.error
          : 'Error al optimizar el logo';
      throw new Error(err);
    }

    const ar = Number(result.aspectRatio);
    const optimizedLogo = result.optimizedLogo;
    if (typeof optimizedLogo !== 'string' || !optimizedLogo.startsWith('data:')) {
      throw new Error('No se recibió imagen optimizada del servidor');
    }

    return {
      optimizedLogo,
      aspectRatio: Number.isFinite(ar) && ar > 0 ? ar : 1.0,
    };
  } catch (error: unknown) {
    throw error;
  }
};

/** Proporción del logo recortado (Python Pillow o Sharp trim en el servidor). */
const measureLogoOnServer = async (dataUrl: string): Promise<number | null> => {
  try {
    const response = await fetchWithTimeout(
      '/api/logo/measure',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: dataUrl }),
      },
      LOGO_MEASURE_TIMEOUT_MS,
      'La medicion del logo tardo demasiado.'
    );
    const result = await parseJsonResponse(response);
    if (!response.ok || !result.success) return null;
    const ar = Number(result.aspectRatio);
    return Number.isFinite(ar) && ar > 0 ? Math.max(0.05, Math.min(30, ar)) : null;
  } catch {
    return null;
  }
};

export default function BuyWizard({ initialProduct, initialMaterial, onComplete }: BuyWizardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [step, setStep] = useState(0); // Empezar en paso 0 (contacto)
  const [data, setData] = useState<BuyWizardData>(() => (
    initialMaterial ? { material: initialMaterial } : {}
  ));
  const [manualPreviewRequested, setManualPreviewRequested] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [checkoutNavigateBusy, setCheckoutNavigateBusy] = useState(false);
  const wizardRef = useRef<HTMLDivElement>(null);
  const webSessionIdRef = useRef('');
  const clienteIdRef = useRef<string | null>(null);
  const mockupSolicitudIdRef = useRef<string | null>(null);

  useEffect(() => {
    webSessionIdRef.current = getOrCreateWebSessionId();
    const session = peekWizardSupabaseSession();
    if (session?.cliente_id) clienteIdRef.current = session.cliente_id;
    if (session?.mockup_solicitud_id) mockupSolicitudIdRef.current = session.mockup_solicitud_id;
  }, []);

  useEffect(() => {
    wizardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    if (!initialMaterial) return;
    setData((prevData) => (
      prevData.material ? prevData : { ...prevData, material: initialMaterial }
    ));
  }, [initialMaterial]);

  // Función helper para obtener el texto de la medida a mostrar
  const getSizeDisplayText = (): string => {
    if (data.approximateSizeKey) {
      // Si viene de una medida aproximada, mostrar el nombre legible
      const sizeLabels: Record<'pequeño' | 'medio' | 'grande', string> = {
        pequeño: 'Pequeño',
        medio: 'Mediano',
        grande: 'Grande',
      };
      return sizeLabels[data.approximateSizeKey];
    }
    // Si es medida específica, mostrar la medida exacta
    return data.selectedSize || '';
  };

  // Leer parámetros de la URL al montar el componente
  useEffect(() => {
    const sizeParam = searchParams.get('size');
    const priceParam = searchParams.get('price');
    const modeParam = searchParams.get('mode');
    const wParam = searchParams.get('w');
    const hParam = searchParams.get('h');

    if (sizeParam && priceParam) {
      // Medida recomendada (pequeño/medio/grande)
      const sizeKey = sizeParam.toLowerCase();
      const mappedSize = sizeMap[sizeKey] || {
        size: `${sizeParam}mm`,
        price: parseInt(priceParam, 10),
      };
      
      // Si es una medida aproximada, guardar también el key
      const approximateKeys: string[] = ['pequeño', 'medio', 'grande'];
      const isApproximate = approximateKeys.includes(sizeKey);
      
      setData((prevData) => ({
        ...prevData,
        selectedSize: mappedSize.size,
        selectedPrice: mappedSize.price,
        ...(isApproximate && { approximateSizeKey: sizeKey as 'pequeño' | 'medio' | 'grande' }),
      }));
      // Empezar en paso 1 (material), no saltar pasos
    } else if (modeParam === 'custom' && wParam && hParam) {
      // Medida personalizada
      const width = parseInt(wParam, 10);
      const height = parseInt(hParam, 10);
      if (width >= 10 && width <= 100 && height >= 10 && height <= 100) {
        setData((prevData) => ({
          ...prevData,
          selectedSize: `${width}x${height}mm`,
          customSize: { width, height },
          selectedPrice: 44000, // Precio base, se ajustará según medida
        }));
        // Empezar en paso 1 (material), no saltar pasos
      }
    }
  }, [searchParams]);

  const steps = [
    { label: 'Contacto', key: 'contact' },
    { label: 'Material', key: 'material' },
    { label: 'Logo', key: 'logo' },
    { label: 'Medida', key: 'size' },
    { label: 'Vista previa', key: 'preview' },
    { label: 'Pago', key: 'payment' },
  ];

  // Generate size options when logo and material are ready, basado en aspect ratio
  useEffect(() => {
    if (data.logoFile && data.material && data.logoAnalysis?.aspectRatio && step >= 3 && !data.sizeOptions) {
      // Calcular medidas basadas en el aspect ratio del diseño del logo
      const aspectRatio = data.logoAnalysis.aspectRatio;
      const suggestedSizes = calculateSuggestedSizes(aspectRatio);
      setData((prevData) => ({ ...prevData, sizeOptions: suggestedSizes }));
    } else if (data.logoFile && data.material && step >= 3 && !data.sizeOptions && !data.logoAnalysis?.aspectRatio) {
      // Fallback: proporción 1:1
      const fallbackSizes = [
        { size: '30x30mm', price: 44000, recommended: false, ratio: 1 },
        { size: '40x40mm', price: 55000, recommended: true, ratio: 1 },
        { size: '50x50mm', price: 66000, recommended: false, ratio: 1 },
      ];
      setData((prevData) => ({ ...prevData, sizeOptions: fallbackSizes }));
    }
  }, [data.logoFile, data.material, data.logoAnalysis?.aspectRatio, step, data.sizeOptions]);

  // Generate preview when size is selected (solo para logos óptimos u optimizados)
  // Usa el servicio Python para generar el mockup con texturas y efectos consistentes
  // Generar mockup solo cuando el usuario llegue al paso 4 (vista previa)
  useEffect(() => {
    if (
      step === 4 && // Solo en el paso de vista previa
      data.selectedSize &&
      !data.previewGenerated &&
      !data.needsManualPreview &&
      data.logoPreview &&
      data.material &&
      !data.isGeneratingMockup &&
      data.logoAnalysis
    ) {
      const generateMockup = async () => {
        setData((prevData) => ({ ...prevData, isGeneratingMockup: true }));
        
        try {
          // Usar el logo optimizado si existe, o el original si ya estaba óptimo
          const logoToUse = data.logoOptimized || data.logoPreview;
          
          // Preparar el tamaño (extraer dimensiones si es necesario)
          let sizeStr = data.selectedSize || '40x40mm';
          let customSizeObj = undefined;
          
          // Si es una medida personalizada, extraer width y height
          if (data.customSize && data.customSize.width && data.customSize.height) {
            customSizeObj = {
              width: data.customSize.width,
              height: data.customSize.height,
            };
            sizeStr = `${data.customSize.width}x${data.customSize.height}mm`;
          }
          
          // Preparar el request body para el servicio Python
          const requestBody: any = {
            logo: logoToUse,
            size: sizeStr,
            material: data.material || 'otros',
          };
          
          // Agregar aspect ratio si está disponible
          if (data.logoAnalysis?.aspectRatio) {
            requestBody.aspectRatio = data.logoAnalysis.aspectRatio;
          }
          
          // Agregar customSize si existe
          if (customSizeObj) {
            requestBody.customSize = customSizeObj;
          }
          
          // Llamar al servicio Python
          const response = await fetchWithTimeout(
            '/api/mockups/generate',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            },
            MOCKUP_GENERATE_TIMEOUT_MS,
            'La muestra tardo demasiado en generarse.'
          );

          const result = (await parseJsonResponse(response)) as {
            success?: boolean;
            mockupUrl?: string;
            thumbnailUrl?: string;
            error?: unknown;
          };

          if (result.success) {
            const mockupUrl = result.mockupUrl;
            setData((prevData) => ({
              ...prevData,
              previewGenerated: true,
              mockupUrl,
              thumbnailUrl: result.thumbnailUrl || result.mockupUrl,
              isGeneratingMockup: false,
            }));
            const mid = mockupSolicitudIdRef.current;
            const mat = data.material;
            if (mid && mockupUrl && mat) {
              void syncWizardMockupPreview(mid, mat, mockupUrl, {
                size: data.selectedSize || '',
                price: data.selectedPrice,
                approximateSizeKey: data.approximateSizeKey,
              });
            }
          } else {
            console.error('Error generando mockup con servicio Python:', result.error);
            setData((prevData) => ({
              ...prevData,
              previewGenerated: true,
              isGeneratingMockup: false,
            }));
          }
        } catch (error) {
          console.error('Error generando mockup:', error);
          setData((prevData) => ({
            ...prevData,
            previewGenerated: true,
            isGeneratingMockup: false,
          }));
        }
      };

      generateMockup();
    }
  }, [step, data.selectedSize, data.previewGenerated, data.needsManualPreview, data.logoPreview, data.material, data.logoOptimized, data.logoAnalysis, data.customSize, data.isGeneratingMockup]);

  const handleContactSubmit = async (nombre: string, whatsapp: string, email: string) => {
    setData({ ...data, nombre, whatsapp, email });
    saveCheckoutPrefill({ nombre, whatsapp, email });
    const cid = await syncWizardContact(
      nombre,
      whatsapp,
      email,
      webSessionIdRef.current
    );
    if (cid) clienteIdRef.current = cid;
    setStep(1);
  };

  const handleMaterialSelect = async (material: WizardMaterial) => {
    setData((prev) => ({ ...prev, material }));
    const mid = await ensureMockupSolicitud(clienteIdRef.current, material, {
      nombre: data.nombre,
      whatsapp: data.whatsapp,
      email: data.email,
      webSessionId: webSessionIdRef.current,
      mockupSolicitudId: mockupSolicitudIdRef.current,
    });
    if (mid) mockupSolicitudIdRef.current = mid;
    setStep(2);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageUrl = reader.result as string;

        // Proporción del dibujo del logo (recorte de contenido), no del lienzo completo
        const logoContentAspectRatio = await measureLogoContentAspectRatioFromDataUrl(imageUrl);

        // Guardar logo original
        setData({
          ...data,
          logoFile: file,
          logoOriginal: imageUrl,
          logoPreview: imageUrl,
          isAnalyzing: true,
          isOptimizing: false,
        });
        setAnalysisError(null);

        try {
          // Paso 1: Analizar el logo con OpenAI (fallback = proporción del contenido del logo)
          const analysis = await analyzeLogoWithAI(imageUrl, logoContentAspectRatio);

          let finalLogoUrl = imageUrl;

          // Paso 2: Si no está óptimo, optimizarlo
          let optimizedAspectRatio = analysis.aspectRatio;
          // Si la API devolvió ~cuadrado pero el archivo no lo es, confiar en la medición local
          if (Math.abs(logoContentAspectRatio - 1) > 0.08 && Math.abs(optimizedAspectRatio - 1) < 0.02) {
            optimizedAspectRatio = logoContentAspectRatio;
          }

          if (analysis.needsOptimization && !analysis.isOptimal) {
            setData((prev) => ({ ...prev, isOptimizing: true }));

            try {
              const optimizeResult = await optimizeLogoWithAI(imageUrl);
              finalLogoUrl = optimizeResult.optimizedLogo;
            } catch (optimizeError: unknown) {
              console.info('Optimizacion automatica omitida; se usa el logo original.', optimizeError);
              const omsg = optimizeError instanceof Error ? optimizeError.message : '';
              setAnalysisError(
                `No se pudo optimizar el logo automáticamente. Se usa el original. ${omsg ? `(${omsg})` : ''}`
              );
            }
          }

          // Medición real del dibujo (recorte alpha / fondo): Python si está, si no Sharp trim
          const measuredAr = await measureLogoOnServer(finalLogoUrl);
          if (measuredAr != null) {
            optimizedAspectRatio = measuredAr;
          }

          // Actualizar datos con el análisis y logo final
          const newData = {
            ...data,
            logoFile: file,
            logoOriginal: imageUrl,
            logoPreview: finalLogoUrl,
            logoOptimized: finalLogoUrl !== imageUrl ? finalLogoUrl : undefined,
            logoAnalysis: {
              ...analysis,
              aspectRatio: optimizedAspectRatio,
            },
            // Nuevo logo → recalcular medidas y volver a generar mockup
            sizeOptions: undefined,
            previewGenerated: false,
            mockupUrl: undefined,
            thumbnailUrl: undefined,
            isGeneratingMockup: false,
            // Siempre intentamos muestra automática (Python/Sharp + texturas).
            // Si el resultado no convence, el cliente puede pedir revisión por WhatsApp.
            needsManualPreview: false,
            isAnalyzing: false,
            isOptimizing: false,
          };
          setData(newData);

          const mid = mockupSolicitudIdRef.current;
          if (mid) {
            void syncWizardLogos(mid, imageUrl, finalLogoUrl !== imageUrl ? finalLogoUrl : undefined);
          }

          if (newData.selectedSize) {
            setStep(4); // Vista previa (mockup)
          } else {
            setStep(3); // Selección de medida
          }
        } catch (error: unknown) {
          console.error('Error procesando logo:', error);
          const msg = error instanceof Error ? error.message : 'Error al procesar el logo';
          setAnalysisError(msg);
          setData((prev) => ({
            ...prev,
            isAnalyzing: false,
            isOptimizing: false,
            needsManualPreview: false,
            logoAnalysis: {
              isOptimal: false,
              hasPlainBackground: false,
              isComplex: false,
              needsOptimization: false,
              reason: msg,
              aspectRatio: logoContentAspectRatio,
            },
            sizeOptions: undefined,
            previewGenerated: false,
            mockupUrl: undefined,
            thumbnailUrl: undefined,
            isGeneratingMockup: false,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSizeSelect = (size: string, price: number) => {
    const newData = {
      ...data,
      selectedSize: size,
      selectedPrice: price,
      approximateSizeKey: undefined, // Limpiar si se selecciona una medida específica
    };
    setData(newData);
    setStep(4); // Vista previa (mockup)
  };

  const handleRequestManualPreview = async () => {
    const mid = mockupSolicitudIdRef.current;
    if (mid) {
      if (data.logoPreview) {
        void syncWizardLogos(
          mid,
          data.logoOriginal || data.logoPreview,
          data.logoOptimized
        );
      }
      await markMockupPendingApproval(mid);
      try {
        await patchMockupSolicitud(mid, {
          medidas_cotizacion_json: {
            size: getSizeDisplayText(),
            medidaExacta: data.selectedSize,
            approximateSizeKey: data.approximateSizeKey,
            precio: data.selectedPrice,
            tipo: 'manual',
          },
        });
      } catch (err) {
        console.error('[wizard] cotizacion manual', err);
      }
    }
    setManualPreviewRequested(true);
  };

  const handlePaymentComplete = () => {
    if (onComplete) {
      onComplete(data);
    }
  };

  /** Lleva al checkout el sello configurado en el wizard (precio tarjeta = selectedPrice). */
  const handleAddWizardToCheckout = () => {
    if (!data.selectedPrice || !data.material || checkoutNavigateBusy) return;
    setCheckoutNavigateBusy(true);
    if (data.nombre?.trim() && data.whatsapp?.trim()) {
      saveCheckoutPrefill({
        nombre: data.nombre.trim(),
        whatsapp: data.whatsapp.trim(),
        email: (data.email || '').trim(),
      });
    }
    const variantSize = data.selectedSize || getSizeDisplayText();
    const materialLabel = WIZARD_MATERIAL_LABELS[data.material] || data.material;
    const designSlug = `personalizado-${Date.now()}`;
    const cartLine = {
      title: `Sello personalizado (${materialLabel}, ${variantSize})`,
      collection: 'Personalizado',
      material: 'Bronce',
      process: 'CNC',
      variantSize,
      price: data.selectedPrice,
      image: wizardCartImageUrl(data),
      designSlug,
    };
    addItem(cartLine);
    const mid = mockupSolicitudIdRef.current;
    if (mid) {
      void markCheckoutStarted(mid, [cartLine]);
    }
    window.setTimeout(() => {
      router.push('/checkout');
    }, 0);
  };

  return (
    <div ref={wizardRef} className="max-w-5xl mx-auto">
      <Stepper steps={steps} currentStep={step + 1} />

      <div className="technical-sheet blueprint-sheet p-4 md:p-8 lg:p-10">
        <div className="mb-8 grid grid-cols-1 gap-4 border-b border-[var(--alcohn-line)] pb-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="craft-label mb-2">Ficha de pedido personalizada</p>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-950">
              Diseñá, revisá y pagá con datos guardados
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold uppercase text-neutral-500 md:text-right">
            <span className="border border-dashed border-[var(--alcohn-line)] bg-white/70 px-3 py-2">Logo</span>
            <span className="border border-dashed border-[var(--alcohn-line)] bg-white/70 px-3 py-2">Precio</span>
          </div>
        </div>

        {/* Step 0: Contact Information */}
        {step === 0 && (
          <ContactStep
            nombre={data.nombre || ''}
            whatsapp={data.whatsapp || ''}
            email={data.email || ''}
            onSubmit={handleContactSubmit}
          />
        )}

        {/* Step 1: Material Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Qué querés marcar
              </h2>
              <p className="text-gray-600">
                Seleccioná el material principal para el cual vas a usar el sello.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(['cuero', 'madera', 'ambos', 'ceramica', 'alimentos', 'otros'] as const).map((material) => (
                <button
                  key={material}
                  onClick={() => handleMaterialSelect(material)}
                  className={`p-6 border text-left transition-all duration-200 ${
                    data.material === material
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1 capitalize">
                    {material === 'ambos' 
                      ? 'Cuero y Madera' 
                      : material === 'ceramica'
                      ? 'Cerámica'
                      : material === 'alimentos'
                      ? 'Alimentos'
                      : material === 'otros'
                      ? 'Otros'
                      : material}
                  </div>
                  <div className="text-sm text-gray-600">
                    {material === 'cuero'
                      ? 'Sellos optimizados para cuero'
                      : material === 'madera'
                      ? 'Sellos optimizados para madera'
                      : material === 'ambos'
                      ? 'Sellos universales para ambos materiales'
                      : material === 'ceramica'
                      ? 'Sellos para cerámica en crudo'
                      : material === 'alimentos'
                      ? 'Sellos para alimentos'
                      : 'Otros materiales'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Logo Upload */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Subir logo
              </h2>
              <p className="text-gray-600">
                Subí tu logo en formato PNG, JPG o SVG. Aceptamos fondos transparentes.
              </p>
            </div>
            <div className="border border-dashed border-gray-300 p-12 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="logo-upload"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={data.isAnalyzing || data.isOptimizing}
              />
              <label
                htmlFor="logo-upload"
                className={`block ${data.isAnalyzing || data.isOptimizing ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
              >
                {data.logoPreview ? (
                  <div className="space-y-4">
                    <div className="relative w-32 h-32 mx-auto">
                      <Image
                        src={data.logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                      {(data.isAnalyzing || data.isOptimizing) && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                            <p className="text-xs text-gray-600">
                              {data.isAnalyzing ? 'Analizando...' : 'Optimizando...'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {!data.isAnalyzing && !data.isOptimizing && (
                      <p className="text-sm text-gray-600">
                        Click para cambiar el logo
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Click para subir o arrastrar aquí
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, SVG hasta 10MB
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Estado de análisis */}
            {data.isAnalyzing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  <p className="text-sm text-blue-800">
                    Analizando el logo con IA para determinar si está optimizado para el sello...
                  </p>
                </div>
              </div>
            )}

            {/* Estado de optimización */}
            {data.isOptimizing && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
                  <p className="text-sm text-purple-800">
                    Optimizando el logo con IA para que sea ideal para el sello de bronce...
                  </p>
                </div>
              </div>
            )}

            {/* Resultado del análisis */}
            {data.logoAnalysis && !data.isAnalyzing && !data.isOptimizing && (
              <div className={`border p-4 ${
                data.logoAnalysis.isOptimal
                  ? 'bg-green-50 border-green-200'
                  : data.logoAnalysis.needsOptimization && data.logoOptimized
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start space-x-3">
                  {data.logoAnalysis.isOptimal ? (
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : data.logoOptimized ? (
                    <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      data.logoAnalysis.isOptimal
                        ? 'text-green-800'
                        : data.logoOptimized
                        ? 'text-purple-800'
                        : 'text-yellow-800'
                    }`}>
                      {data.logoAnalysis.isOptimal
                        ? 'Logo óptimo para sello de bronce'
                        : data.logoOptimized
                        ? 'Logo optimizado exitosamente'
                        : 'Logo requiere optimización manual'}
                    </p>
                    {data.logoAnalysis.reason && (
                      <p className={`text-xs mt-1 ${
                        data.logoAnalysis.isOptimal
                          ? 'text-green-700'
                          : data.logoOptimized
                          ? 'text-purple-700'
                          : 'text-yellow-700'
                      }`}>
                        {data.logoAnalysis.reason}
                      </p>
                    )}
                    {data.logoOptimized && (
                      <p className="text-xs text-purple-700 mt-1">
                        Se ha generado una versión optimizada de tu logo. Puedes continuar con el proceso.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error en el análisis */}
            {analysisError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">Error al procesar el logo</p>
                    <p className="text-xs text-red-700 mt-1">{analysisError}</p>
                    <p className="text-xs text-red-700 mt-1">
                      Las medidas sugeridas usan la proporción de tu imagen; podés continuar con la vista previa.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Comparación logo original vs optimizado */}
            {data.logoOriginal && data.logoOptimized && !data.isAnalyzing && !data.isOptimizing && (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-3">Comparación:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Original</p>
                    <div className="relative w-full aspect-square bg-gray-50 rounded border border-gray-200">
                      <Image
                        src={data.logoOriginal}
                        alt="Logo original"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Optimizado</p>
                    <div className="relative w-full aspect-square bg-white rounded border-2 border-purple-300">
                      <Image
                        src={data.logoOptimized}
                        alt="Logo optimizado"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {data.logoPreview && !data.isAnalyzing && !data.isOptimizing && (
              <button
                onClick={() => {
                  // Si ya hay medida seleccionada, saltar al paso 4 (vista previa)
                  // Si no, ir al paso 3 (selección de medida)
                  if (data.selectedSize) {
                    setStep(4);
                  } else {
                    setStep(3);
                  }
                }}
                className="w-full px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Continuar
              </button>
            )}
          </div>
        )}

        {/* Step 3: Size Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Elegir medida
              </h2>
              <p className="text-gray-600">
                {data.selectedSize
                  ? `Medida seleccionada: ${getSizeDisplayText()}. Podés cambiarla si querés.`
                  : 'Seleccioná la medida que mejor se adapte a tu necesidad.'}
              </p>
            </div>
            {data.selectedSize && (
              <div className="bg-primary/10 border border-primary rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-900">
                  Medida pre-seleccionada: <span className="font-semibold">{getSizeDisplayText()}</span>
                  {data.selectedPrice && (
                    <span className="ml-2">- ${data.selectedPrice.toLocaleString('es-AR')}</span>
                  )}
                </p>
              </div>
            )}

            <div className="border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Cómo elegir medida
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Pequeño</p>
                  <p className="text-gray-600">
                    Logos simples, etiquetas, packaging chico o piezas delicadas.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mediano</p>
                  <p className="text-gray-600">
                    Recomendado para la mayoría de marcas: buen equilibrio entre lectura y precio.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Grande</p>
                  <p className="text-gray-600">
                    Para piezas grandes, marcas con más detalle o lectura a distancia.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Opciones de tamaño: Basadas en aspect ratio del logo o estándar */}
            {data.sizeOptions && data.sizeOptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {data.sizeOptions.map((sizeOption, index) => {
                  const isSelected = data.selectedSize === sizeOption.size && !data.customSize;
                  const sizeLabels = ['Pequeño', 'Mediano', 'Grande'];
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setData({
                          ...data,
                          selectedSize: sizeOption.size,
                          selectedPrice: sizeOption.price,
                          approximateSizeKey: undefined, // Limpiar si había uno
                          customSize: undefined, // Limpiar medida personalizada
                        });
                      }}
                      className={`p-6 border text-left transition-all duration-200 relative ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {sizeOption.recommended && (
                        <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-primary text-white rounded">
                          Recomendado
                        </span>
                      )}
                      <div className="font-semibold text-gray-900 mb-2">
                        {sizeLabels[index] || `Opción ${index + 1}`}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {sizeOption.size}
                        <span className="text-xs text-gray-500 block mt-1">
                          Proporción de esta medida: {sizeOption.ratio.toFixed(2)}:1
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-gray-900">
                          ${sizeOption.price.toLocaleString('es-AR')}
                        </div>
                        <div className="text-xs text-gray-600">
                          3 cuotas sin interés: ${Math.round(sizeOption.price / 3).toLocaleString('es-AR')}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          Transferencia: ${Math.round(sizeOption.price * (1 - TRANSFER_DISCOUNT)).toLocaleString('es-AR')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Fallback: mostrar opciones estándar si no hay sizeOptions calculadas
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {(['pequeño', 'medio', 'grande'] as const).map((sizeKey) => {
                  const sizeData = sizeMap[sizeKey];
                  const isSelected = data.approximateSizeKey === sizeKey || 
                    (data.selectedSize === sizeData.size && !data.customSize);
                  const sizeLabels: Record<'pequeño' | 'medio' | 'grande', string> = {
                    pequeño: 'Pequeño',
                    medio: 'Mediano',
                    grande: 'Grande',
                  };
                  
                  return (
                    <button
                      key={sizeKey}
                      onClick={() => {
                        setData({
                          ...data,
                          selectedSize: sizeData.size,
                          selectedPrice: sizeData.price,
                          approximateSizeKey: sizeKey,
                          customSize: undefined, // Limpiar medida personalizada
                        });
                      }}
                      className={`p-6 border text-left transition-all duration-200 relative ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {sizeKey === 'medio' && (
                        <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-primary text-white rounded">
                          Recomendado
                        </span>
                      )}
                      <div className="font-semibold text-gray-900 mb-2">
                        {sizeLabels[sizeKey]}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {sizeData.size}
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-gray-900">
                          ${sizeData.price.toLocaleString('es-AR')}
                        </div>
                        <div className="text-xs text-gray-600">
                          3 cuotas sin interés: ${Math.round(sizeData.price / 3).toLocaleString('es-AR')}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          Transferencia: ${Math.round(sizeData.price * (1 - TRANSFER_DISCOUNT)).toLocaleString('es-AR')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Opción para medida personalizada */}
            <div className="border border-dashed border-gray-300 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Medida personalizada
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Si necesitás una medida específica, ingresá ancho y alto en milímetros. El sistema calculará automáticamente la proporción, categoría y precio.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
                    Ancho (mm)
                  </label>
                  <input
                    type="text"
                    value={data.customSize?.width || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      
                      // Permitir escribir cualquier número, validar después
                      if (value === '') {
                        setData({
                          ...data,
                          customSize: data.customSize 
                            ? { ...data.customSize, width: 0, height: data.customSize.height || 0 }
                            : undefined,
                          selectedSize: undefined,
                          selectedPrice: undefined,
                        });
                        return;
                      }
                      
                      const num = parseInt(value, 10);
                      if (isNaN(num)) return;
                      
                      // Si hay aspect ratio del logo y hay un alto previo, calcular alto proporcionalmente
                      let newHeight = data.customSize?.height || num;
                      if (data.logoAnalysis?.aspectRatio && data.customSize?.height && data.customSize.height > 0) {
                        // Mantener proporción del logo
                        newHeight = Math.round(num / data.logoAnalysis.aspectRatio);
                        newHeight = Math.max(10, Math.min(100, newHeight));
                      } else if (!data.customSize?.height || data.customSize.height === 0) {
                        // Si no hay alto, usar el mismo valor
                        newHeight = num;
                      }
                      
                      // Validar que ambos valores estén en rango válido antes de calcular precio
                      if (num >= 10 && num <= 100 && newHeight >= 10 && newHeight <= 100) {
                        const category = getSizeCategory(num, newHeight);
                        const price = calculatePrice(category, num, newHeight);
                        
                        setData({
                          ...data,
                          customSize: { 
                            width: num, 
                            height: newHeight
                          },
                          selectedSize: `${num}x${newHeight}mm`,
                          selectedPrice: price,
                          approximateSizeKey: undefined,
                        });
                      } else {
                        // Permitir escribir pero no calcular precio hasta que ambos estén válidos
                        setData({
                          ...data,
                          customSize: { 
                            width: num, 
                            height: newHeight
                          },
                          selectedSize: undefined,
                          selectedPrice: undefined,
                        });
                      }
                    }}
                    placeholder="30"
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
                    Alto (mm)
                  </label>
                  <input
                    type="text"
                    value={data.customSize?.height || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      
                      // Permitir escribir cualquier número, validar después
                      if (value === '') {
                        setData({
                          ...data,
                          customSize: data.customSize 
                            ? { ...data.customSize, width: data.customSize.width || 0, height: 0 }
                            : undefined,
                          selectedSize: undefined,
                          selectedPrice: undefined,
                        });
                        return;
                      }
                      
                      const num = parseInt(value, 10);
                      if (isNaN(num)) return;
                      
                      // Si hay aspect ratio del logo y hay un ancho previo, calcular ancho proporcionalmente
                      let newWidth = data.customSize?.width || num;
                      if (data.logoAnalysis?.aspectRatio && data.customSize?.width && data.customSize.width > 0) {
                        // Mantener proporción del logo
                        newWidth = Math.round(num * data.logoAnalysis.aspectRatio);
                        newWidth = Math.max(10, Math.min(100, newWidth));
                      } else if (!data.customSize?.width || data.customSize.width === 0) {
                        // Si no hay ancho, usar el mismo valor
                        newWidth = num;
                      }
                      
                      // Validar que ambos valores estén en rango válido antes de calcular precio
                      if (newWidth >= 10 && newWidth <= 100 && num >= 10 && num <= 100) {
                        const category = getSizeCategory(newWidth, num);
                        const price = calculatePrice(category, newWidth, num);
                        
                        setData({
                          ...data,
                          customSize: { 
                            width: newWidth, 
                            height: num 
                          },
                          selectedSize: `${newWidth}x${num}mm`,
                          selectedPrice: price,
                          approximateSizeKey: undefined,
                        });
                      } else {
                        // Permitir escribir pero no calcular precio hasta que ambos estén válidos
                        setData({
                          ...data,
                          customSize: { 
                            width: newWidth, 
                            height: num 
                          },
                          selectedSize: undefined,
                          selectedPrice: undefined,
                        });
                      }
                    }}
                    placeholder="45"
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Rango: 10–100mm. Rectangulares incluidos. {data.logoAnalysis?.aspectRatio && 'La proporción se ajusta automáticamente según tu logo.'}
              </p>
              {data.customSize && data.customSize.width >= 10 && data.customSize.height >= 10 && (
                <div className="bg-gray-50 border border-gray-200 p-4 space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>Medida personalizada:</strong> {data.customSize.width}×{data.customSize.height}mm
                  </p>
                  {(() => {
                    const category = getSizeCategory(data.customSize.width, data.customSize.height);
                    const categoryLabels: Record<string, string> = {
                      chico: 'Chico',
                      mediano: 'Mediano',
                      grande: 'Grande'
                    };
                    return category && (
                      <p className="text-sm text-gray-700">
                        <strong>Categoría:</strong> {categoryLabels[category]}
                      </p>
                    );
                  })()}
                  {data.selectedPrice && (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900">
                        <strong>Precio:</strong> ${data.selectedPrice.toLocaleString('es-AR')}
                      </p>
                      <p className="text-xs text-gray-600">
                        3 cuotas sin interés: ${Math.round(data.selectedPrice / 3).toLocaleString('es-AR')}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        Transferencia: ${Math.round(data.selectedPrice * (1 - TRANSFER_DISCOUNT)).toLocaleString('es-AR')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botón para continuar cuando hay una medida seleccionada */}
            {data.selectedSize && data.selectedPrice && (
              <button
                onClick={() => {
                  handleSizeSelect(data.selectedSize!, data.selectedPrice!);
                }}
                className="w-full px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Continuar
              </button>
            )}
          </div>
        )}

        {/* Step 4: Request Manual Preview (for complex logos) or Auto Preview (for simple logos) */}
        {step === 4 && (
          <>
            {data.needsManualPreview ? (
              // Logo complejo: Solicitar muestra manual
              <div className="space-y-6 text-center">
                {!manualPreviewRequested ? (
                  <>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Solicitar muestra personalizada
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Tu logo requiere trabajo manual de diseño. Uno de nuestros diseñadores armará la muestra personalizada y te la enviará por WhatsApp.
                      </p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-yellow-800">
                          <strong>¿Por qué?</strong> Tu logo es complejo (foto, muchos colores, etc.) y necesita ser adaptado para el sello de bronce. Nuestro diseñador lo optimizará para que quede perfecto.
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Resumen de tu pedido:</strong>
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 text-left max-w-md mx-auto">
                        <li>• Material: {data.material}</li>
                        <li>• Medida: {getSizeDisplayText()}</li>
                        {data.selectedPrice && (
                          <li>• Precio: ${data.selectedPrice.toLocaleString('es-AR')}</li>
                        )}
                      </ul>
                    </div>
                    <button
                      onClick={handleRequestManualPreview}
                      className="w-full bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Solicitar muestra
                    </button>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center justify-center mb-4">
                        <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Solicitud enviada
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Tu solicitud de muestra personalizada ha sido registrada. Uno de nuestros diseñadores la revisará y te contactará por WhatsApp en las próximas 24 horas.
                      </p>
                      <div className="bg-white border border-[var(--alcohn-line)] rounded-lg p-4 mt-4">
                        <p className="text-sm text-gray-700">
                          <strong>Contacto:</strong> {data.whatsapp}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <strong>Nombre:</strong> {data.nombre}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Logo óptimo u optimizado: Vista previa automática
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Vista previa digital
                  </h2>
                  <p className="text-gray-600">
                    {data.mockupUrl 
                      ? 'Vista previa generada automáticamente de cómo se verá tu sello aplicado.'
                      : 'Logo analizado y listo. Estamos generando la muestra sobre la textura del material elegido.'}
                  </p>
                </div>


                <div className="material-frame rounded-lg p-6 md:p-12 min-h-[360px] md:min-h-[400px] flex items-center justify-center">
                  {data.isGeneratingMockup ? (
                    <div className="text-center text-gray-400">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                      <p>Generando muestra automática...</p>
                      <p className="text-xs mt-2 text-gray-500">
                        Esto puede tomar unos segundos
                      </p>
                    </div>
                  ) : data.previewGenerated && data.mockupUrl ? (
                    // Mockup generado - mostrar mockup y opción de ver logos
                    <div className="space-y-6 text-center w-full">
                      {/* Mockup */}
                      <div className="relative w-full max-w-2xl mx-auto bg-white border border-[var(--alcohn-line)] rounded-lg overflow-hidden shadow-sm">
                        <Image
                          src={data.thumbnailUrl || data.mockupUrl}
                          alt="Vista previa del sello"
                          width={800}
                          height={600}
                          className="w-full h-auto"
                          unoptimized
                        />
                      </div>
                      
                      {/* Mostrar logos si hay versión optimizada */}
                      {data.logoOptimized && data.logoOriginal && (
                        <div className="mt-6 border-t border-[var(--alcohn-line)] pt-6">
                          <p className="text-sm font-medium text-gray-700 mb-4">
                            Comparar logos:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <div className="bg-white border border-[var(--alcohn-line)] rounded-lg p-4">
                              <p className="text-xs text-gray-600 mb-2">Original</p>
                              <div className="relative w-full aspect-square bg-gray-50 rounded border border-[var(--alcohn-line)]">
                                <Image
                                  src={data.logoOriginal}
                                  alt="Logo original"
                                  fill
                                  className="object-contain p-2"
                                  unoptimized
                                />
                              </div>
                            </div>
                            <div className="bg-white border-2 border-[var(--alcohn-bronze)] rounded-lg p-4">
                              <p className="text-xs text-[var(--alcohn-bronze-dark)] mb-2 font-semibold">Optimizado</p>
                              <div className="relative w-full aspect-square bg-white rounded border-2 border-[var(--alcohn-bronze)]">
                                <Image
                                  src={data.logoOptimized}
                                  alt="Logo optimizado"
                                  fill
                                  className="object-contain p-2"
                                  unoptimized
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">Muestra generada automáticamente</p>
                        <p className="text-xs">
                          Material: {data.material} | Medida: {getSizeDisplayText()}
                        </p>
                        {data.logoOptimized && (
                          <p className="text-xs text-purple-600 mt-1">
                            ✓ Logo optimizado automáticamente
                          </p>
                        )}
                      </div>
                    </div>
                  ) : data.previewGenerated && data.logoPreview ? (
                    // Vista previa temporal: mostrar logo analizado (mockup se generará después)
                    <div className="space-y-6 text-center w-full">
                      {/* Mostrar el logo (se muestra la comparación abajo si hay optimizado) */}
                      <div className="relative w-64 h-64 mx-auto bg-white border border-[var(--alcohn-line)] rounded-lg p-8 shadow-sm">
                        <Image
                          src={data.logoPreview}
                          alt="Logo"
                          fill
                          className="object-contain p-4"
                          unoptimized
                        />
                      </div>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p className="font-medium">Logo analizado y listo</p>
                        <p className="text-xs">
                          Material: {data.material} | Medida: {getSizeDisplayText()}
                        </p>
                        {data.logoAnalysis?.isOptimal && !data.logoOptimized && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                            <p className="text-xs text-green-800">
                              ✓ Logo óptimo para sello de bronce
                            </p>
                            {data.logoAnalysis.reason && (
                              <p className="text-xs text-green-700 mt-1">
                                {data.logoAnalysis.reason}
                              </p>
                            )}
                          </div>
                        )}
                        {data.logoOptimized && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
                            <p className="text-xs text-purple-800">
                              ✓ Versión optimizada disponible (ver comparación abajo)
                            </p>
                          </div>
                        )}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                          <p className="text-xs text-blue-800">
                            ℹ️ La muestra visual automática se generará próximamente
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                      <p>Preparando vista previa...</p>
                    </div>
                  )}
                </div>
                {data.previewGenerated && (
                  <div className="space-y-4">
                    {!data.mockupUrl && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          ⚠️ El servicio de mockups no está disponible. Puedes continuar con el proceso.
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => setStep(5)}
                      className="w-full px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Continuar al pago
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Step 5: Payment (solo para logos simples con vista previa automática) */}
        {step === 5 && !data.needsManualPreview && (() => {
          const transferPrice = data.selectedPrice ? Math.round(data.selectedPrice * (1 - TRANSFER_DISCOUNT)) : 0;
          const cardPrice = data.selectedPrice || 0;
          const cuotaPrice = Math.round(cardPrice / 3);
          
          const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
              setReceiptFile(file);
              const reader = new FileReader();
              reader.onloadend = () => {
                setReceiptPreview(reader.result as string);
              };
              reader.readAsDataURL(file);
            }
          };
          
          const handleSubmitReceipt = async () => {
            if (!receiptFile) return;
            
            setIsUploadingReceipt(true);
            try {
              // Aquí iría la lógica para subir el comprobante al servidor
              // Por ahora simulamos una subida exitosa
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Llamar a handlePaymentComplete después de subir
              if (handlePaymentComplete) {
                handlePaymentComplete();
              }
            } catch (error) {
              console.error('Error subiendo comprobante:', error);
            } finally {
              setIsUploadingReceipt(false);
            }
          };
          
          return (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Método de pago
                </h2>
                <p className="text-gray-600">
                  Elegí cómo querés pagar tu sello personalizado.
                </p>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-[0.58fr_0.42fr] gap-4">
                <div className="technical-sheet p-5 md:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="craft-label mb-2">Resumen del pedido</p>
                      <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
                        Sello personalizado listo para checkout
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold uppercase text-neutral-400">ALC-PAY</span>
                  </div>
                  <dl className="divide-y divide-[var(--alcohn-line)] text-sm">
                    <div className="grid grid-cols-[0.34fr_0.66fr] py-3">
                      <dt className="text-neutral-500">Material</dt>
                      <dd className="font-medium capitalize text-neutral-950">{data.material}</dd>
                    </div>
                    <div className="grid grid-cols-[0.34fr_0.66fr] py-3">
                      <dt className="text-neutral-500">Medida</dt>
                      <dd className="font-medium text-neutral-950">{getSizeDisplayText()}</dd>
                    </div>
                    <div className="grid grid-cols-[0.34fr_0.66fr] py-3">
                      <dt className="text-neutral-500">Muestra</dt>
                      <dd className="font-medium text-neutral-950">Vista previa generada</dd>
                    </div>
                    <div className="grid grid-cols-[0.34fr_0.66fr] py-3">
                      <dt className="font-semibold text-neutral-950">Total</dt>
                      <dd className="text-xl font-bold text-neutral-950">
                        ${data.selectedPrice?.toLocaleString('es-AR')}
                      </dd>
                    </div>
                  </dl>
                </div>

                <PurchaseInclusions
                  compact
                  title="Incluido con tu sello"
                />
              </div>

              {/* Payment Methods */}
              {!paymentMethod ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tarjeta con Open Pay */}
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className="technical-sheet p-5 md:p-6 text-left transition-all hover:border-[var(--alcohn-bronze)] hover:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Pagar con tarjeta</h3>
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-6 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-900">
                        ${cardPrice.toLocaleString('es-AR')}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        3 cuotas sin interés: ${cuotaPrice.toLocaleString('es-AR')}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Pagá con Open Pay de BBVA
                      </div>
                    </div>
                  </button>

                  {/* Transferencia */}
                  <button
                    onClick={() => setPaymentMethod('transfer')}
                    className="technical-sheet p-5 md:p-6 text-left transition-all hover:border-[var(--alcohn-bronze)] hover:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Transferencia bancaria</h3>
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-900 line-through text-gray-400">
                        ${cardPrice.toLocaleString('es-AR')}
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        ${transferPrice.toLocaleString('es-AR')}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Ahorrá ${(cardPrice - transferPrice).toLocaleString('es-AR')} (10% desc.)
                      </div>
                    </div>
                  </button>
                </div>
              ) : paymentMethod === 'card' ? (
                // Pago con tarjeta - Open Pay
                <div className="space-y-6">
                  <div className="border border-[var(--alcohn-line)] bg-[var(--alcohn-paper)] p-4">
                    <p className="text-sm text-gray-800">
                      Pagá de forma segura con Open Pay. 3 cuotas sin interés disponibles.
                    </p>
                  </div>
                  
                  {/* Aquí iría el formulario de Open Pay */}
                  <div className="bg-white border border-[var(--alcohn-line)] p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Agregamos tu sello (material, medida y precio que viste) al pedido y te llevamos
                      al checkout. Ahí podés completar tus datos y elegir &quot;Pagar con tarjeta
                      (Openpay)&quot;.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddWizardToCheckout}
                      disabled={checkoutNavigateBusy || !data.selectedPrice}
                      className="block w-full text-center px-6 py-3 bg-[var(--alcohn-ink)] text-white border border-[var(--alcohn-ink)] font-semibold uppercase tracking-wider hover:bg-[var(--alcohn-ink-soft)] hover:border-[var(--alcohn-bronze)] transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {checkoutNavigateBusy ? 'Preparando pedido…' : 'Continuar al checkout y pagar con Openpay'}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← Volver a métodos de pago
                  </button>
                </div>
              ) : (
                // Pago con transferencia
                <div className="space-y-6">
                  {/* Datos bancarios */}
                  <div className="bg-white border border-[var(--alcohn-line)] p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Datos para transferencia</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600 block mb-1">Banco:</span>
                        <span className="text-gray-900 font-medium">{config.bank.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">CBU:</span>
                        <span className="text-gray-900 font-medium font-mono">{config.bank.cbu}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">Alias:</span>
                        <span className="text-gray-900 font-medium">{config.bank.alias}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">Titular:</span>
                        <span className="text-gray-900 font-medium">{config.bank.cuit}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <span className="text-gray-600 block mb-1">Monto a transferir:</span>
                        <span className="text-gray-900 font-bold text-lg">
                          ${transferPrice.toLocaleString('es-AR')}
                        </span>
                        <span className="text-xs text-gray-500 block mt-1">
                          Precio original: ${cardPrice.toLocaleString('es-AR')} - Descuento aplicado: ${(cardPrice - transferPrice).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Carga de comprobante */}
                  <div className="bg-white border border-[var(--alcohn-line)] p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Enviar comprobante</h3>
                    <p className="text-sm text-gray-600">
                      Subí el comprobante de transferencia o enviálo por WhatsApp.
                    </p>
                    
                    {!receiptPreview ? (
                      <div className="space-y-3">
                        <div className="border border-dashed border-gray-300 p-8 text-center">
                          <input
                            type="file"
                            id="receipt-upload"
                            accept="image/*,.pdf"
                            onChange={handleReceiptUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="receipt-upload"
                            className="cursor-pointer block"
                          >
                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm font-medium text-gray-700">
                              Click para subir comprobante
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, PDF hasta 5MB
                            </p>
                          </label>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex-1 border-t border-gray-200"></div>
                          <span className="text-xs text-gray-500">o</span>
                          <div className="flex-1 border-t border-gray-200"></div>
                        </div>
                        
                        <a
                          href={`https://wa.me/${config.whatsapp.number}?text=Hola, acabo de realizar una compra. Adjunto el comprobante de transferencia.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handlePaymentComplete}
                          className="block w-full px-6 py-3 bg-green-600 text-white font-semibold uppercase tracking-wider hover:bg-green-700 transition-colors text-center"
                        >
                          Enviar por WhatsApp
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900">Comprobante cargado</p>
                            <button
                              onClick={() => {
                                setReceiptFile(null);
                                setReceiptPreview(null);
                              }}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Eliminar
                            </button>
                          </div>
                          {receiptPreview.startsWith('data:image') ? (
                            <img
                              src={receiptPreview}
                              alt="Comprobante"
                              className="w-full h-auto rounded border border-gray-200"
                            />
                          ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
                              <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-gray-600">{receiptFile?.name || 'Archivo PDF cargado'}</p>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={handleSubmitReceipt}
                          disabled={isUploadingReceipt}
                          className="w-full px-6 py-3 bg-primary text-white font-semibold uppercase tracking-wider hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploadingReceipt ? 'Enviando...' : 'Confirmar pedido'}
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← Volver a métodos de pago
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Navigation */}
        {step > 1 && step < 5 && (
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 text-gray-700 bg-white border border-[var(--alcohn-line)] rounded-md hover:border-[var(--alcohn-bronze)] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Atrás
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
