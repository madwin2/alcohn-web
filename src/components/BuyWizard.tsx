'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactCrop, { type Crop, type PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Stepper from './Stepper';
import ContactStep from './buy/ContactStep';
import PurchaseInclusions from './PurchaseInclusions';
import { config } from '@/lib/config';
import { useCart } from '@/contexts/CartContext';
import { generateCartItemId } from '@/lib/cart';
import { sanitizeCartItemsForDb } from '@/lib/supabase/cartItems';
import {
  createCheckoutIntent,
  uploadComprobante,
} from '@/lib/supabase/mockupApiClient';
import { clearWizardSupabaseSession } from '@/lib/wizardSupabaseSession';
import { saveCheckoutPrefill } from '@/lib/checkoutPrefill';
import { fetchShippingCost } from '@/lib/shipping/client';
import { saveCheckoutShipping } from '@/lib/shipping/storage';
import type { ShippingMetodoUi } from '@/lib/shipping/types';
import { SHIPPING_METODO_LABELS } from '@/lib/shipping/types';
import { trackMetaInitiateCheckout, trackMetaPageView } from '@/lib/analytics/metaPixel';
import { savePurchaseSnapshot } from '@/lib/analytics/purchaseSnapshot';
import { getOrCreateWebSessionId, peekWizardSupabaseSession } from '@/lib/wizardSupabaseSession';
import {
  syncWizardContact,
  ensureMockupSolicitud,
  syncWizardLogos,
  syncWizardMockupPreview,
  markMockupPendingApproval,
  markCheckoutStarted,
} from '@/lib/wizardSupabaseSync';
import { patchMockupSolicitud, uploadMockupImage } from '@/lib/supabase/mockupApiClient';
import {
  getWizardOptionBySlug,
  wizardMaterialOptions,
  type WizardMaterialOption,
} from '@/data/stampUseCases';
import StampSizeScalePreview from '@/components/buy/StampSizeScalePreview';
import WizardCollapsible from '@/components/buy/WizardCollapsible';
import WizardCustomSizeFields from '@/components/buy/WizardCustomSizeFields';
import {
  WizardSizePickerRow,
  WizardSizeSummaryPanel,
  type WizardSizeTierOption,
} from '@/components/buy/WizardSizeStepMobile';
import { cotizarMm, parseSizeMm } from '@/lib/cotizador/fetchCotizacion';
import {
  fitProportionalStampSize,
  isValidStampSizeMm,
} from '@/lib/cotizador/stampSizeLimits';

interface BuyWizardData {
  nombre?: string;
  whatsapp?: string;
  email?: string;
  material?: 'cuero' | 'madera' | 'ambos' | 'ceramica' | 'alimentos' | 'otros';
  /** Uso elegido (misma clave que la grilla de la home). */
  usoSlug?: string;
  logoFile?: File | null;
  logoPreview?: string;
  logoOriginal?: string; // Logo original antes de optimización
  logoOptimized?: string; // Logo optimizado por OpenAI
  /** true cuando la "optimización" no cambió el diseño (p.ej. solo fondo) */
  logoOptimizationIsCosmetic?: boolean;
  logoAnalysis?: {
    isOptimal?: boolean; // true si es ideal para sello de bronce
    hasPlainBackground?: boolean; // true si tiene fondo blanco/transparente
    isComplex?: boolean; // true si es foto o imagen compleja
    needsOptimization?: boolean; // true si necesita optimización
    reason?: string; // Razón de la decisión
    aspectRatio?: number;
    /** Bbox del dibujo (trim), en píxeles — para escala en la vista previa. */
    contentWidthPx?: number;
    contentHeightPx?: number;
  };
  selectedSize?: string;
  /** Precio tarjeta / link (precio_link_ars del cotizador). */
  selectedPrice?: number;
  /** Precio transferencia (precio_transferencia_ars del cotizador). */
  selectedTransferPrice?: number;
  customSize?: { width: number; height: number };
  approximateSizeKey?: 'pequeño' | 'medio' | 'grande'; // Si viene de una medida aproximada
  sizeOptions?: Array<{
    size: string;
    price: number;
    transferPrice?: number;
    recommended?: boolean;
    ratio: number;
    tier?: 'pequeño' | 'mediano' | 'grande';
  }>;
  previewGenerated?: boolean;
  needsManualPreview?: boolean; // true si necesita muestra manual vía WhatsApp
  isAnalyzing?: boolean; // true mientras se analiza el logo
  isOptimizing?: boolean; // true mientras se optimiza el logo
  mockupUrl?: string; // URL del mockup generado
  thumbnailUrl?: string; // URL del thumbnail del mockup
  isGeneratingMockup?: boolean; // true mientras se genera el mockup
  mockupTextureMaterial?: 'cuero' | 'madera';
  mockupUsesFallbackTexture?: boolean;
}

const DEFAULT_MOCKUP_SIZE = '40x40mm';

/** Solo cuero y madera tienen generador de muestra; el resto usa textura de referencia. */
function resolveMockupGeneration(material: WizardMaterial): {
  mockupMaterial: 'cuero' | 'madera';
  usesFallback: boolean;
} {
  if (material === 'madera') return { mockupMaterial: 'madera', usesFallback: false };
  if (material === 'cuero') return { mockupMaterial: 'cuero', usesFallback: false };
  const mockupMaterial =
    material === 'ceramica' || material === 'otros' ? 'madera' : 'cuero';
  return { mockupMaterial, usesFallback: true };
}

type WizardMaterial = NonNullable<BuyWizardData['material']>;

interface BuyWizardProps {
  initialProduct?: string;
  initialMaterial?: WizardMaterial;
  initialUsoSlug?: string;
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

function wizardUsoDisplayLabel(data: BuyWizardData): string {
  if (data.usoSlug) {
    const opt = getWizardOptionBySlug(data.usoSlug);
    if (opt) return `${opt.oficio} (${opt.materialLabel})`;
  }
  return data.material ? WIZARD_MATERIAL_LABELS[data.material] || data.material : '';
}

const MAX_CART_DATA_URL_LENGTH = 180_000;

/** Miniatura del carrito: prioriza thumbnail/mockup; solo cae a textura base si no hay preview usable. */
function wizardCartImageUrl(d: BuyWizardData): string {
  const u = d.thumbnailUrl || d.mockupUrl || '';
  if (!u) {
    if (d.material === 'madera') return '/mockup-textures/madera.jpg';
    return '/mockup-textures/cuero.jpg';
  }

  // Aceptamos data URLs chicas (thumbnail) para mostrar la muestra real sin inflar demasiado localStorage.
  if (!u.startsWith('data:') || u.length <= MAX_CART_DATA_URL_LENGTH) return u;

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

/** Fallback si el cotizador no responde (URL legacy / sin red). */
const sizeMapFallback: Record<string, { size: string; price: number }> = {
  pequeño: { size: '25x25mm', price: 44000 },
  medio: { size: '40x40mm', price: 55000 },
  grande: { size: '60x60mm', price: 66000 },
};

const SIZE_TIER_LABELS = ['Pequeño', 'Mediano', 'Grande'] as const;

function buildWizardSizeTierOptions(
  sizeOptions: BuyWizardData['sizeOptions']
): WizardSizeTierOption[] {
  if (sizeOptions?.length) {
    return sizeOptions.map((o, i) => ({
      key: o.tier ?? String(i),
      label: SIZE_TIER_LABELS[i] ?? o.tier ?? `Opción ${i + 1}`,
      size: o.size,
      price: o.price,
      transferPrice: o.transferPrice,
      recommended: o.recommended,
    }));
  }
  return (['pequeño', 'medio', 'grande'] as const).map((key) => ({
    key,
    label: ({ pequeño: 'Pequeño', medio: 'Mediano', grande: 'Grande' } as const)[key],
    size: sizeMapFallback[key].size,
    price: sizeMapFallback[key].price,
    recommended: key === 'medio',
  }));
}

function tierToApproximateKey(
  tier?: 'pequeño' | 'mediano' | 'grande'
): 'pequeño' | 'medio' | 'grande' | undefined {
  if (tier === 'mediano') return 'medio';
  if (tier === 'pequeño' || tier === 'grande') return tier;
  return undefined;
}

type SizeOptionForQuote = {
  size: string;
  recommended?: boolean;
  ratio: number;
  refCm?: { ancho: number; largo: number };
};

async function enrichSizesWithCatalogPrices<T extends SizeOptionForQuote>(
  sizes: T[]
): Promise<Array<T & { price: number; transferPrice: number }>> {
  return Promise.all(
    sizes.map(async (s) => {
      let widthMm: number;
      let heightMm: number;
      const dim = parseSizeMm(s.size);
      if (dim) {
        widthMm = dim.width;
        heightMm = dim.height;
      } else if (s.refCm) {
        widthMm = Math.round(s.refCm.ancho * 10);
        heightMm = Math.round(s.refCm.largo * 10);
      } else {
        return { ...s, price: 0, transferPrice: 0 };
      }
      const q = await cotizarMm(widthMm, heightMm);
      return {
        ...s,
        price: q?.precio_link_ars ?? 0,
        transferPrice: q?.precio_transferencia_ars ?? 0,
      };
    })
  );
}

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
    // Si la API cae, intentar optimización con IA igual (como antes)
    return {
      isOptimal: false,
      hasPlainBackground: false,
      isComplex: true,
      needsOptimization: true,
      reason: `${msg} Intentaremos optimizar el logo con IA.`,
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

const loadImageFromDataUrl = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo cargar la imagen para procesarla.'));
    image.src = dataUrl;
  });

const extractNormalizedLogoMask = async (
  dataUrl: string,
  size = 64
): Promise<{ mask: Uint8Array; fillRatio: number } | null> => {
  if (!dataUrl.startsWith('data:image')) return null;
  const image = await loadImageFromDataUrl(dataUrl);
  const maxSide = 768;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || 1, image.naturalHeight || 1));
  const width = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || 1) * scale));

  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!sourceCtx) return null;
  sourceCtx.drawImage(image, 0, 0, width, height);

  let sourceData: ImageData;
  try {
    sourceData = sourceCtx.getImageData(0, 0, width, height);
  } catch {
    return null;
  }
  const pixels = sourceData.data;

  let borderAlphaTotal = 0;
  let borderCount = 0;
  const addBorderAlpha = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    borderAlphaTotal += pixels[i + 3];
    borderCount++;
  };
  for (let x = 0; x < width; x++) {
    addBorderAlpha(x, 0);
    addBorderAlpha(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    addBorderAlpha(0, y);
    addBorderAlpha(width - 1, y);
  }

  const useAlphaMask = borderCount > 0 ? borderAlphaTotal / borderCount < 252 : false;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const alpha = pixels[i + 3];
      const luminance = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
      const isForeground = useAlphaMask ? alpha > 32 : alpha > 10 && luminance < 220;

      if (isForeground) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;

  const boxWidth = maxX - minX + 1;
  const boxHeight = maxY - minY + 1;
  if (boxWidth < 2 || boxHeight < 2) return null;

  const normalizedCanvas = document.createElement('canvas');
  normalizedCanvas.width = size;
  normalizedCanvas.height = size;
  const normalizedCtx = normalizedCanvas.getContext('2d', { willReadFrequently: true });
  if (!normalizedCtx) return null;
  normalizedCtx.clearRect(0, 0, size, size);
  normalizedCtx.drawImage(
    sourceCanvas,
    minX,
    minY,
    boxWidth,
    boxHeight,
    0,
    0,
    size,
    size
  );

  const normalizedData = normalizedCtx.getImageData(0, 0, size, size).data;
  const mask = new Uint8Array(size * size);
  let foregroundPixels = 0;
  for (let i = 0; i < size * size; i++) {
    const p = i * 4;
    const alpha = normalizedData[p + 3];
    const luminance =
      0.2126 * normalizedData[p] +
      0.7152 * normalizedData[p + 1] +
      0.0722 * normalizedData[p + 2];
    const isForeground = useAlphaMask ? alpha > 32 : alpha > 10 && luminance < 220;
    if (isForeground) {
      mask[i] = 1;
      foregroundPixels++;
    }
  }

  return {
    mask,
    fillRatio: foregroundPixels / (size * size),
  };
};

const isCosmeticLogoOptimization = async (
  originalDataUrl: string,
  optimizedDataUrl: string
): Promise<boolean> => {
  try {
    const [originalMaskData, optimizedMaskData] = await Promise.all([
      extractNormalizedLogoMask(originalDataUrl),
      extractNormalizedLogoMask(optimizedDataUrl),
    ]);
    if (!originalMaskData || !optimizedMaskData) return false;

    const len = originalMaskData.mask.length;
    let intersection = 0;
    let union = 0;

    for (let i = 0; i < len; i++) {
      const a = originalMaskData.mask[i] === 1;
      const b = optimizedMaskData.mask[i] === 1;
      if (a && b) intersection++;
      if (a || b) union++;
    }

    if (union === 0) return false;

    const iou = intersection / union;
    const fillRatioDiff = Math.abs(originalMaskData.fillRatio - optimizedMaskData.fillRatio);
    return iou >= 0.94 && fillRatioDiff <= 0.08;
  } catch {
    return false;
  }
};

const cropImageDataUrl = async (
  dataUrl: string,
  cropPercent: PercentCrop,
  originalMimeType: string
): Promise<string> => {
  const image = await loadImageFromDataUrl(dataUrl);
  const nw = image.naturalWidth || 1;
  const nh = image.naturalHeight || 1;

  const px = Math.max(0, Math.min(100, cropPercent.x ?? 0)) / 100;
  const py = Math.max(0, Math.min(100, cropPercent.y ?? 0)) / 100;
  const pw = Math.max(0, Math.min(100, cropPercent.width ?? 0)) / 100;
  const ph = Math.max(0, Math.min(100, cropPercent.height ?? 0)) / 100;

  const sx = Math.max(0, Math.round(nw * px));
  const sy = Math.max(0, Math.round(nh * py));
  const width = Math.max(1, Math.round(nw * pw));
  const height = Math.max(1, Math.round(nh * ph));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo preparar el recorte del logo.');

  ctx.drawImage(image, sx, sy, width, height, 0, 0, width, height);
  const mimeType =
    originalMimeType === 'image/jpeg' || originalMimeType === 'image/jpg'
      ? 'image/jpeg'
      : 'image/png';
  return canvas.toDataURL(mimeType, mimeType === 'image/jpeg' ? 0.92 : undefined);
};

// Función para optimizar el logo con OpenAI
const optimizeLogoWithAI = async (imageUrl: string): Promise<{ optimizedLogo: string; aspectRatio: number }> => {
  try {
    // Convertir dataURL a File
    const file = dataUrlToFile(imageUrl, 'logo.png');
    
    // Enviar como FormData
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('forceAi', 'true');

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

/** Medición del dibujo recortado (trim) en el servidor. */
const measureLogoOnServer = async (
  dataUrl: string
): Promise<{
  aspectRatio: number;
  contentWidthPx: number;
  contentHeightPx: number;
} | null> => {
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
    const contentWidthPx = Number(result.widthPx);
    const contentHeightPx = Number(result.heightPx);
    if (!Number.isFinite(ar) || ar <= 0) return null;
    return {
      aspectRatio: Math.max(0.05, Math.min(30, ar)),
      contentWidthPx:
        Number.isFinite(contentWidthPx) && contentWidthPx > 0 ? contentWidthPx : 0,
      contentHeightPx:
        Number.isFinite(contentHeightPx) && contentHeightPx > 0 ? contentHeightPx : 0,
    };
  } catch {
    return null;
  }
};

export default function BuyWizard({
  initialProduct,
  initialMaterial,
  initialUsoSlug,
  onComplete,
}: BuyWizardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem, clearCart } = useCart();
  const [step, setStep] = useState(0); // Empezar en paso 0 (contacto)
  /** Mobile paso medida: tarjetas estándar vs formulario personalizado */
  const [mobileSizeMode, setMobileSizeMode] = useState<'standard' | 'custom'>('standard');
  const [data, setData] = useState<BuyWizardData>(() => (
    initialMaterial ? { material: initialMaterial } : {}
  ));
  const [manualPreviewRequested, setManualPreviewRequested] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [transferCheckoutError, setTransferCheckoutError] = useState<string | null>(null);
  const [checkoutNavigateBusy, setCheckoutNavigateBusy] = useState(false);
  const wizardPaymentTrackedRef = useRef(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMetodoUi>('retiro');
  const [shippingCost, setShippingCost] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isRequestingCorrection, setIsRequestingCorrection] = useState(false);
  const [pendingLogoUpload, setPendingLogoUpload] = useState<{
    file: File;
    imageUrl: string;
  } | null>(null);
  const [pendingLogoAspectRatio, setPendingLogoAspectRatio] = useState(1);
  const [cropViewport, setCropViewport] = useState({ width: 1280, height: 800 });
  const [logoCrop, setLogoCrop] = useState<Crop | undefined>({
    unit: '%',
    x: 2,
    y: 2,
    width: 96,
    height: 96,
  });
  const [logoCroppedAreaPercent, setLogoCroppedAreaPercent] = useState<PercentCrop | null>(null);
  const [isApplyingLogoCrop, setIsApplyingLogoCrop] = useState(false);
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
    if (shippingMethod === 'retiro') {
      setShippingCost(0);
      return;
    }
    const tipo = shippingMethod === 'domicilio' ? 'Domicilio' : 'Sucursal';
    let cancelled = false;
    fetchShippingCost(tipo).then((cost) => {
      if (!cancelled) setShippingCost(cost);
    });
    return () => {
      cancelled = true;
    };
  }, [shippingMethod]);

  useEffect(() => {
    if (!initialMaterial && !initialUsoSlug) return;
    const fromUso = initialUsoSlug ? getWizardOptionBySlug(initialUsoSlug) : undefined;
    setData((prevData) => {
      if (prevData.material) return prevData;
      if (fromUso) {
        return { ...prevData, material: fromUso.buyMaterial, usoSlug: fromUso.slug };
      }
      if (initialMaterial) return { ...prevData, material: initialMaterial };
      return prevData;
    });
  }, [initialMaterial, initialUsoSlug]);

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
      const mappedSize = sizeMapFallback[sizeKey] || {
        size: `${sizeParam}mm`,
        price: parseInt(priceParam, 10),
      };

      const approximateKeys: string[] = ['pequeño', 'medio', 'grande'];
      const isApproximate = approximateKeys.includes(sizeKey);

      setData((prevData) => ({
        ...prevData,
        selectedSize: mappedSize.size,
        selectedPrice: mappedSize.price,
        ...(isApproximate && { approximateSizeKey: sizeKey as 'pequeño' | 'medio' | 'grande' }),
      }));

      const dim = parseSizeMm(mappedSize.size);
      if (dim) {
        void cotizarMm(dim.width, dim.height).then((q) => {
          if (!q) return;
          setData((prev) => ({
            ...prev,
            selectedPrice: q.precio_link_ars,
            selectedTransferPrice: q.precio_transferencia_ars,
          }));
        });
      }
      // Empezar en paso 1 (material), no saltar pasos
    } else if (modeParam === 'custom' && wParam && hParam) {
      // Medida personalizada
      const width = parseInt(wParam, 10);
      const height = parseInt(hParam, 10);
      if (isValidStampSizeMm(width, height)) {
        setData((prevData) => ({
          ...prevData,
          selectedSize: `${width}x${height}mm`,
          customSize: { width, height },
        }));
        void cotizarMm(width, height).then((q) => {
          if (!q) return;
          setData((prev) => ({
            ...prev,
            selectedPrice: q.precio_link_ars,
            selectedTransferPrice: q.precio_transferencia_ars,
          }));
        });
      }
    }
  }, [searchParams]);

  const steps = [
    { label: 'Contacto', key: 'contact' },
    { label: 'Material', key: 'material' },
    { label: 'Logo', key: 'logo' },
    { label: 'Vista previa', key: 'preview' },
    { label: 'Medida', key: 'size' },
    { label: 'Pago', key: 'payment' },
  ];

  useEffect(() => {
    if (!data.isAnalyzing && !data.isOptimizing) {
      setAnalysisProgress(0);
      return;
    }
    setAnalysisProgress(data.isOptimizing ? 58 : 12);
    const id = window.setInterval(() => {
      setAnalysisProgress((prev) => {
        const cap = data.isOptimizing ? 94 : 52;
        return prev >= cap ? prev : prev + 5;
      });
    }, 350);
    return () => window.clearInterval(id);
  }, [data.isAnalyzing, data.isOptimizing]);

  // Medidas sugeridas + precios (catálogo Supabase vía /api/cotizador/tiers)
  useEffect(() => {
    if (!data.logoFile || !data.material || step !== 4) return;

    let cancelled = false;
    const aspectRatio = data.logoAnalysis?.aspectRatio ?? 1;

    void fetch('/api/cotizador/tiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aspect_ratio: aspectRatio }),
    })
      .then((res) => res.json())
      .then((json: { tiers?: Array<{
        size: string;
        recommended?: boolean;
        ratio: number;
        tier: 'pequeño' | 'mediano' | 'grande';
        refCm?: { ancho: number; largo: number };
        price: number;
        transferPrice: number;
      }>; error?: string }) => {
        if (cancelled || !json.tiers?.length) return;
        setData((prev) => ({
          ...prev,
          sizeOptions: json.tiers!.map((t) => ({
            size: t.size,
            recommended: t.recommended,
            ratio: t.ratio,
            tier: t.tier,
            refCm: t.refCm,
            price: t.price,
            transferPrice: t.transferPrice,
          })),
        }));
      })
      .catch(() => {
        /* sin fallback: el paso muestra estado vacío hasta reintentar */
      });

    return () => {
      cancelled = true;
    };
  }, [data.logoFile, data.material, data.logoAnalysis?.aspectRatio, step]);

  // Mobile / paso medida: preseleccionar la opción recomendada al entrar o al cargar tiers
  useEffect(() => {
    if (step !== 4 || data.customSize) return;

    const options = buildWizardSizeTierOptions(data.sizeOptions);
    if (!options.length) return;

    const matchesOption = options.some((o) => o.size === data.selectedSize);
    if (matchesOption && data.selectedPrice) return;

    const pick = options.find((o) => o.recommended) ?? options[1] ?? options[0];
    const tier = data.sizeOptions?.find((o) => o.size === pick.size)?.tier;

    setData((prev) => ({
      ...prev,
      selectedSize: pick.size,
      selectedPrice: pick.price,
      selectedTransferPrice: pick.transferPrice,
      approximateSizeKey: tierToApproximateKey(tier),
      customSize: undefined,
    }));
  }, [step, data.sizeOptions, data.customSize, data.selectedSize, data.selectedPrice]);

  useEffect(() => {
    if (step !== 4) setMobileSizeMode('standard');
  }, [step]);

  // Medición del bbox del dibujo para la comparación a escala (logos ya subidos antes del cambio)
  useEffect(() => {
    if (step !== 4) return;
    const logoUrl = data.logoOptimized || data.logoPreview;
    if (!logoUrl || data.logoAnalysis?.contentWidthPx) return;

    let cancelled = false;
    void measureLogoOnServer(logoUrl).then((measured) => {
      if (cancelled || !measured?.contentWidthPx || !measured.contentHeightPx) return;
      setData((prev) => ({
        ...prev,
        logoAnalysis: {
          ...prev.logoAnalysis,
          aspectRatio: measured.aspectRatio ?? prev.logoAnalysis?.aspectRatio,
          contentWidthPx: measured.contentWidthPx,
          contentHeightPx: measured.contentHeightPx,
        },
        // Proporción refinada → recotizar Pequeño / Mediano / Grande
        sizeOptions: undefined,
      }));
    });
    return () => {
      cancelled = true;
    };
  }, [
    step,
    data.logoPreview,
    data.logoOptimized,
    data.logoAnalysis?.contentWidthPx,
  ]);

  useEffect(() => {
    if (step !== 5 || data.needsManualPreview || !data.selectedPrice) return;
    if (wizardPaymentTrackedRef.current) return;
    wizardPaymentTrackedRef.current = true;

    window.dispatchEvent(new Event('alcohn:navigation'));
    trackMetaPageView();
    trackMetaInitiateCheckout({
      value: data.selectedPrice + shippingCost,
      contentIds: [`wizard-${data.selectedSize || 'personalizado'}`],
      numItems: 1,
    });
  }, [step, data.needsManualPreview, data.selectedPrice, data.selectedSize, shippingCost]);

  // Generate preview when size is selected (solo para logos óptimos u optimizados)
  // Mockup serverless (Sharp + texturas en public/mockup-textures)
  // Generar mockup solo cuando el usuario llegue al paso 4 (vista previa)
  useEffect(() => {
    if (
      step === 3 && // Vista previa antes de elegir medida
      !data.previewGenerated &&
      !data.needsManualPreview &&
      data.logoPreview &&
      data.material &&
      !data.isGeneratingMockup &&
      data.logoAnalysis
    ) {
      const generateMockup = async () => {
        const { mockupMaterial, usesFallback } = resolveMockupGeneration(data.material!);
        setData((prevData) => ({
          ...prevData,
          isGeneratingMockup: true,
          mockupTextureMaterial: mockupMaterial,
          mockupUsesFallbackTexture: usesFallback,
        }));
        
        try {
          // Usar el logo optimizado si existe, o el original si ya estaba óptimo
          const logoToUse = data.logoOptimized || data.logoPreview;
          
          // Medida de referencia para la muestra (la definitiva se elige después)
          let sizeStr = data.selectedSize || DEFAULT_MOCKUP_SIZE;
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
          const requestBody: Record<string, unknown> = {
            logo: logoToUse,
            size: sizeStr,
            material: mockupMaterial,
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
            const errMsg =
              typeof result.error === 'object' && result.error && 'message' in result.error
                ? String((result.error as { message?: string }).message)
                : 'No se pudo generar la muestra automática.';
            console.error('Error generando mockup:', result.error);
            setAnalysisError(errMsg);
            setData((prevData) => ({
              ...prevData,
              previewGenerated: true,
              isGeneratingMockup: false,
              mockupUrl: undefined,
              thumbnailUrl: undefined,
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
  }, [step, data.previewGenerated, data.needsManualPreview, data.logoPreview, data.material, data.logoOptimized, data.logoAnalysis, data.customSize, data.isGeneratingMockup, data.selectedSize]);

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

  const handleMaterialSelect = async (option: WizardMaterialOption) => {
    setData((prev) => ({
      ...prev,
      material: option.buyMaterial,
      usoSlug: option.slug,
    }));
    const mid = await ensureMockupSolicitud(clienteIdRef.current, option.buyMaterial, {
      nombre: data.nombre,
      whatsapp: data.whatsapp,
      email: data.email,
      webSessionId: webSessionIdRef.current,
      mockupSolicitudId: mockupSolicitudIdRef.current,
    });
    if (mid) mockupSolicitudIdRef.current = mid;
    setStep(2);
  };

  const processUploadedLogo = useCallback(async (file: File, imageUrl: string) => {
    // Proporción del dibujo del logo (recorte de contenido), no del lienzo completo
    const logoContentAspectRatio = await measureLogoContentAspectRatioFromDataUrl(imageUrl);

    // Guardar logo original
    setData({
      ...data,
      logoFile: file,
      logoOriginal: imageUrl,
      logoPreview: imageUrl,
      logoOptimized: undefined,
      logoOptimizationIsCosmetic: false,
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

      const shouldOptimizeWithAI =
        analysis.needsOptimization ||
        !analysis.isOptimal ||
        analysis.isComplex ||
        !analysis.hasPlainBackground;

      if (shouldOptimizeWithAI) {
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

      let cosmeticOptimization = false;
      if (finalLogoUrl !== imageUrl) {
        cosmeticOptimization = await isCosmeticLogoOptimization(imageUrl, finalLogoUrl);
      }

      const optimizationFailed =
        shouldOptimizeWithAI && finalLogoUrl === imageUrl;

      // Medición real del dibujo (recorte alpha / fondo): Python si está, si no Sharp trim
      const measured = await measureLogoOnServer(finalLogoUrl);
      if (measured != null) {
        optimizedAspectRatio = measured.aspectRatio;
      }

      // Actualizar datos con el análisis y logo final
      const newData = {
        ...data,
        logoFile: file,
        logoOriginal: imageUrl,
        logoPreview: finalLogoUrl,
        logoOptimized: finalLogoUrl !== imageUrl ? finalLogoUrl : undefined,
        logoOptimizationIsCosmetic: cosmeticOptimization,
        logoAnalysis: {
          ...analysis,
          aspectRatio: optimizedAspectRatio,
          contentWidthPx: measured?.contentWidthPx || undefined,
          contentHeightPx: measured?.contentHeightPx || undefined,
        },
        // Nuevo logo → recalcular medidas y volver a generar mockup
        sizeOptions: undefined,
        previewGenerated: false,
        mockupUrl: undefined,
        thumbnailUrl: undefined,
        isGeneratingMockup: false,
        needsManualPreview: optimizationFailed && (analysis.isComplex || !analysis.hasPlainBackground),
        isAnalyzing: false,
        isOptimizing: false,
      };
      setData(newData);

      const mid = mockupSolicitudIdRef.current;
      if (mid) {
        void syncWizardLogos(mid, imageUrl, finalLogoUrl !== imageUrl ? finalLogoUrl : undefined);
      }

      setStep(3); // Vista previa (mockup antes de medida y precio)
    } catch (error: unknown) {
      console.error('Error procesando logo:', error);
      const msg = error instanceof Error ? error.message : 'Error al procesar el logo';
      setAnalysisError(msg);
      setData((prev) => ({
        ...prev,
        isAnalyzing: false,
        isOptimizing: false,
        needsManualPreview: false,
        logoOptimizationIsCosmetic: false,
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
  }, [data]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setLogoCrop({
        unit: '%',
        x: 2,
        y: 2,
        width: 96,
        height: 96,
      });
      setLogoCroppedAreaPercent(null);
      setPendingLogoAspectRatio(1);
      setPendingLogoUpload({ file, imageUrl });
      void loadImageFromDataUrl(imageUrl)
        .then((img) => {
          const ratio = (img.naturalWidth || 1) / (img.naturalHeight || 1);
          if (Number.isFinite(ratio) && ratio > 0) setPendingLogoAspectRatio(ratio);
        })
        .catch(() => {
          setPendingLogoAspectRatio(1);
        });
    };
    reader.readAsDataURL(file);
  };

  const handleUseLogoWithoutCrop = async () => {
    if (!pendingLogoUpload || isApplyingLogoCrop) return;
    const pending = pendingLogoUpload;
    setPendingLogoUpload(null);
    setPendingLogoAspectRatio(1);
    await processUploadedLogo(pending.file, pending.imageUrl);
  };

  const handleApplyLogoCrop = async () => {
    if (!pendingLogoUpload || isApplyingLogoCrop) return;
    setIsApplyingLogoCrop(true);
    try {
      const hasValidCrop =
        logoCroppedAreaPercent &&
        Number.isFinite(logoCroppedAreaPercent.width) &&
        Number.isFinite(logoCroppedAreaPercent.height) &&
        (logoCroppedAreaPercent.width ?? 0) >= 1 &&
        (logoCroppedAreaPercent.height ?? 0) >= 1;
      const croppedImageUrl = hasValidCrop
        ? await cropImageDataUrl(
            pendingLogoUpload.imageUrl,
            logoCroppedAreaPercent,
            pendingLogoUpload.file.type
          )
        : pendingLogoUpload.imageUrl;
      const logoFile = hasValidCrop
        ? dataUrlToFile(croppedImageUrl, pendingLogoUpload.file.name || 'logo-crop.png')
        : pendingLogoUpload.file;
      setPendingLogoUpload(null);
      setPendingLogoAspectRatio(1);
      await processUploadedLogo(logoFile, croppedImageUrl);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo recortar el logo.';
      setAnalysisError(msg);
    } finally {
      setIsApplyingLogoCrop(false);
    }
  };

  const hasVisibleOptimization = Boolean(
    data.logoOptimized && !data.logoOptimizationIsCosmetic
  );
  const hasCosmeticOptimization = Boolean(
    data.logoOptimized && data.logoOptimizationIsCosmetic
  );
  const isTallNarrowPendingLogo = pendingLogoAspectRatio > 0 && pendingLogoAspectRatio < 0.72;
  const cropModalMaxWidthPx = isTallNarrowPendingLogo ? 520 : 920;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateViewport = () => {
      setCropViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const cropLayout = useMemo(() => {
    const viewportWidth = cropViewport.width || 1280;
    const viewportHeight = cropViewport.height || 800;

    const modalOuterMaxWidth = Math.min(viewportWidth * 0.95, cropModalMaxWidthPx);
    const modalHorizontalPadding = 40; // padding + borde del modal
    const previewMaxWidth = Math.max(220, modalOuterMaxWidth - modalHorizontalPadding);
    const previewMaxHeight = Math.max(220, Math.min(viewportHeight * 0.62, viewportHeight - 260));
    const safeRatio = pendingLogoAspectRatio > 0 ? pendingLogoAspectRatio : 1;

    let previewWidth = previewMaxWidth;
    let previewHeight = previewWidth / safeRatio;
    if (previewHeight > previewMaxHeight) {
      previewHeight = previewMaxHeight;
      previewWidth = previewHeight * safeRatio;
    }

    return {
      modalWidthPx: Math.ceil(Math.min(modalOuterMaxWidth, previewWidth + modalHorizontalPadding)),
      previewWidthPx: Math.max(220, Math.floor(previewWidth)),
      previewHeightPx: Math.max(220, Math.floor(previewHeight)),
    };
  }, [cropViewport.height, cropViewport.width, cropModalMaxWidthPx, pendingLogoAspectRatio]);

  const handleSizeSelect = (size: string, price: number, transferPrice?: number) => {
    const newData = {
      ...data,
      selectedSize: size,
      selectedPrice: price,
      selectedTransferPrice: transferPrice,
      approximateSizeKey: undefined,
    };
    setData(newData);
    setStep(5);
  };

  const applyCotizacionMm = async (widthMm: number, heightMm: number) => {
    const q = await cotizarMm(widthMm, heightMm);
    if (!q) {
      setData((prev) => ({
        ...prev,
        selectedSize: `${widthMm}x${heightMm}mm`,
        selectedPrice: undefined,
        selectedTransferPrice: undefined,
      }));
      return;
    }
    setData((prev) => ({
      ...prev,
      selectedSize: `${widthMm}x${heightMm}mm`,
      selectedPrice: q.precio_link_ars,
      selectedTransferPrice: q.precio_transferencia_ars,
      approximateSizeKey: undefined,
    }));
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
            precio_transferencia: data.selectedTransferPrice,
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

  const buildWizardTransferCartItems = () => {
    const variantSize = data.selectedSize || getSizeDisplayText();
    const materialLabel = wizardUsoDisplayLabel(data);
    const designSlug = `personalizado-${Date.now()}`;
    const price = data.selectedTransferPrice ?? 0;
    return sanitizeCartItemsForDb([
      {
        id: generateCartItemId(designSlug, variantSize),
        title: `Sello personalizado (${materialLabel}, ${variantSize})`,
        collection: 'Personalizado',
        material: 'Bronce',
        process: 'CNC',
        variantSize,
        price,
        qty: 1,
        image: wizardCartImageUrl(data),
        designSlug,
      },
    ]);
  };

  const createWizardTransferOrder = async () => {
    if (!data.nombre?.trim() || !data.whatsapp?.trim()) {
      throw new Error('Completá nombre y WhatsApp en el paso de contacto.');
    }
    if (!data.selectedTransferPrice || data.selectedTransferPrice <= 0) {
      throw new Error('Elegí una medida con precio antes de confirmar.');
    }
    const session = peekWizardSupabaseSession();
    return createCheckoutIntent({
      metodo_pago: 'Transferencia',
      cliente: {
        nombre: data.nombre.trim(),
        telefono: data.whatsapp.trim(),
        email: data.email?.trim() || undefined,
      },
      cliente_id: session?.cliente_id,
      mockup_solicitud_id: session?.mockup_solicitud_id,
      items: buildWizardTransferCartItems(),
      envio_costo: shippingCost > 0 ? shippingCost : 0,
      envio_metodo: shippingMethod,
    });
  };

  const persistWizardPurchaseSnapshot = (
    ordenId: string,
    total: number,
    unitPrice: number
  ) => {
    const variantSize = data.selectedSize || getSizeDisplayText();
    const materialLabel = wizardUsoDisplayLabel(data);
    const designSlug = `personalizado-${ordenId}`;
    savePurchaseSnapshot({
      orderId: ordenId,
      value: total,
      items: [
        {
          id: generateCartItemId(designSlug, variantSize),
          title: `Sello personalizado (${materialLabel}, ${variantSize})`,
          price: unitPrice,
          qty: 1,
        },
      ],
    });
  };

  const goToTransferConfirmation = (ordenId: string) => {
    clearCart();
    clearWizardSupabaseSession();
    router.push(
      `/checkout/transferencia/confirmacion?orden_id=${encodeURIComponent(ordenId)}`
    );
  };

  const handleRequestPreviewCorrection = async () => {
    if (isRequestingCorrection) return;
    setIsRequestingCorrection(true);
    try {
      const mid = mockupSolicitudIdRef.current;
      let originalLogoUrl = '';
      let optimizedLogoUrl = '';
      let generatedMockupUrl = '';

      if (mid) {
        if (data.logoOriginal) {
          try {
            const up = await uploadMockupImage(mid, 'logo_original', data.logoOriginal);
            originalLogoUrl = up.url;
          } catch (err) {
            console.error('[wizard] upload logo_original para corrección', err);
          }
        }
        if (data.logoOptimized) {
          try {
            const up = await uploadMockupImage(mid, 'logo_optimizado', data.logoOptimized);
            optimizedLogoUrl = up.url;
          } catch (err) {
            console.error('[wizard] upload logo_optimizado para corrección', err);
          }
        }
        if (data.mockupUrl) {
          try {
            const fallbackMaterial = resolveMockupGeneration(data.material ?? 'cuero').mockupMaterial;
            const kind = fallbackMaterial === 'madera' ? 'mockup_madera' : 'mockup_cuero';
            const up = await uploadMockupImage(mid, kind, data.mockupUrl);
            generatedMockupUrl = up.url;
          } catch (err) {
            console.error('[wizard] upload mockup para corrección', err);
          }
        }

        try {
          await patchMockupSolicitud(mid, {
            estado: 'pendiente_aprobacion',
            metadata_web: {
              correccion_solicitada: true,
              correccion_solicitada_at: new Date().toISOString(),
              correccion_origen: 'whatsapp',
            },
          });
        } catch (err) {
          console.error('[wizard] pendiente_aprobacion corrección', err);
        }
      }

      const phone = String(config.whatsapp.number || '').replace(/\D/g, '');
      const lines = [
        'Hola, quiero solicitar corrección de muestra del diseñador online.',
        mid ? `ID solicitud: ${mid}` : null,
        data.nombre ? `Nombre: ${data.nombre}` : null,
        data.whatsapp ? `WhatsApp cliente: ${data.whatsapp}` : null,
        `Uso/material: ${wizardUsoDisplayLabel(data) || '-'}`,
        `Medida: ${getSizeDisplayText() || 'sin definir'}`,
        'Motivo: La muestra automática quedó incorrecta y necesito revisión manual.',
        originalLogoUrl ? `Logo original: ${originalLogoUrl}` : null,
        optimizedLogoUrl ? `Logo optimizado: ${optimizedLogoUrl}` : null,
        generatedMockupUrl ? `Muestra generada: ${generatedMockupUrl}` : null,
      ].filter(Boolean) as string[];

      const message = encodeURIComponent(lines.join('\n'));
      const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('[wizard] solicitar corrección por whatsapp', error);
      setAnalysisError('No se pudo abrir WhatsApp para solicitar la corrección. Probá nuevamente.');
    } finally {
      setIsRequestingCorrection(false);
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
    saveCheckoutShipping(shippingMethod, shippingCost);
    const variantSize = data.selectedSize || getSizeDisplayText();
    const materialLabel = wizardUsoDisplayLabel(data);
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
    <div ref={wizardRef} className="buy-wizard mx-auto flex h-full max-w-5xl flex-col">
      <Stepper steps={steps} currentStep={step + 1} />

      <div className="technical-sheet blueprint-sheet flex flex-1 min-h-0 flex-col overflow-hidden p-3 md:p-8 lg:p-10">
        <div className="hidden mb-4 grid-cols-1 gap-3 border-b border-[var(--alcohn-line)] pb-3 md:mb-8 md:grid md:grid-cols-[1fr_auto] md:gap-4 md:pb-6 md:items-end">
          <div>
            <p className="craft-label mb-2">Ficha de pedido personalizada</p>
            <h2 className="text-[1.95rem] md:text-3xl font-semibold tracking-tight text-neutral-950">
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
          <div className="h-full overflow-hidden md:overflow-y-auto space-y-3 md:space-y-6">
            <div>
              <h2 className="text-lg md:text-2xl font-semibold text-gray-900 mb-2">
                Qué querés marcar
              </h2>
              <p className="hidden md:block text-sm text-gray-600 md:text-base">
                En celular, elegí una opción para avanzar rápido.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-2 lg:grid-cols-3 md:gap-4">
              {wizardMaterialOptions.map((option) => {
                const isSelected = data.usoSlug === option.slug;
                const shortMaterialLabel = option.materialLabel.split(' ')[0];
                return (
                  <button
                    key={option.slug}
                    type="button"
                    onClick={() => handleMaterialSelect(option)}
                    className={`min-h-[68px] rounded-sm border px-3 py-3 text-center transition-all duration-200 active:scale-[0.98] md:min-h-0 md:rounded-none md:px-6 md:py-6 md:text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 text-[15px] leading-tight md:mb-1 md:text-base md:leading-normal">
                      {shortMaterialLabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Logo Upload */}
        {step === 2 && (
          <div className="h-full overflow-hidden md:overflow-y-auto space-y-4 md:space-y-6">
            <div>
              <h2 className="text-lg md:text-2xl font-semibold text-gray-900 mb-2">
                Subir logo
              </h2>
              <p className="text-sm text-gray-600 md:text-base">
                Subí PNG, JPG o SVG. Ideal con fondo transparente.
              </p>
            </div>
            <div className="border border-dashed border-gray-300 p-6 md:p-12 text-center hover:border-gray-400 transition-colors">
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

            {pendingLogoUpload && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4">
                <div
                  className={`relative z-[121] mx-auto flex w-fit max-w-[95vw] max-h-[95dvh] flex-col overflow-hidden rounded-lg bg-white p-4 shadow-xl md:p-5 ${
                    isTallNarrowPendingLogo
                      ? 'md:max-w-[560px]'
                      : 'md:max-w-[920px]'
                  }`}
                  style={{ width: `${cropLayout.modalWidthPx}px` }}
                >
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-gray-900 md:text-lg">
                      Recortar logo (opcional)
                    </h3>
                    <p className="text-xs text-gray-600 md:text-sm">
                      Mové y deformá el recorte directo sobre la imagen. Si preferís, podés seguir sin recortar.
                    </p>
                  </div>

                  <div
                    className="flex min-h-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--alcohn-line)] bg-gray-50 p-2"
                    style={{
                      width: `${cropLayout.previewWidthPx}px`,
                      height: `${cropLayout.previewHeightPx}px`,
                    }}
                  >
                    <ReactCrop
                      crop={logoCrop}
                      onChange={(crop) => setLogoCrop(crop)}
                      onComplete={(_, percentCrop) =>
                        setLogoCroppedAreaPercent(
                          percentCrop.width >= 1 && percentCrop.height >= 1 ? percentCrop : null
                        )
                      }
                      minWidth={40}
                      minHeight={40}
                      className="!h-full !w-full"
                      keepSelection
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pendingLogoUpload.imageUrl}
                        alt="Logo para recortar"
                        className="mx-auto block h-full w-full object-contain"
                      />
                    </ReactCrop>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 md:flex-row md:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setPendingLogoUpload(null);
                        setPendingLogoAspectRatio(1);
                      }}
                      disabled={isApplyingLogoCrop}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[var(--alcohn-line)] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleUseLogoWithoutCrop}
                      disabled={isApplyingLogoCrop}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[var(--alcohn-line)] px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Usar sin recortar
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyLogoCrop}
                      disabled={isApplyingLogoCrop}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isApplyingLogoCrop ? 'Aplicando recorte...' : 'Aplicar recorte'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Estado de análisis */}
            {(data.isAnalyzing || data.isOptimizing) && (
              <div
                className={`rounded-lg border p-4 ${
                  data.isOptimizing ? 'border-purple-200 bg-purple-50' : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p
                    className={`text-sm font-medium ${
                      data.isOptimizing ? 'text-purple-800' : 'text-blue-800'
                    }`}
                  >
                    {data.isAnalyzing
                      ? 'Analizando tu logo...'
                      : 'Optimizando para el sello de bronce...'}
                  </p>
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      data.isOptimizing ? 'text-purple-700' : 'text-blue-700'
                    }`}
                  >
                    {analysisProgress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/80">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      data.isOptimizing ? 'bg-purple-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.max(8, analysisProgress)}%` }}
                  />
                </div>
                <p
                  className={`mt-2 text-xs ${
                    data.isOptimizing ? 'text-purple-700' : 'text-blue-700'
                  }`}
                >
                  {data.isAnalyzing
                    ? 'Revisamos fondo, detalle y proporción para el grabado.'
                    : 'Ajustamos el archivo para que la muestra y el sello queden legibles.'}
                </p>
              </div>
            )}

            {/* Resultado del análisis */}
            {data.logoAnalysis && !data.isAnalyzing && !data.isOptimizing && (
              <div className={`border p-4 ${
                data.logoAnalysis.isOptimal || hasCosmeticOptimization
                  ? 'bg-green-50 border-green-200'
                  : data.logoAnalysis.needsOptimization && hasVisibleOptimization
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start space-x-3">
                  {data.logoAnalysis.isOptimal || hasCosmeticOptimization ? (
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : hasVisibleOptimization ? (
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
                      data.logoAnalysis.isOptimal || hasCosmeticOptimization
                        ? 'text-green-800'
                        : hasVisibleOptimization
                        ? 'text-purple-800'
                        : 'text-yellow-800'
                    }`}>
                      {data.logoAnalysis.isOptimal
                        ? 'Logo óptimo para sello de bronce'
                        : hasCosmeticOptimization
                        ? 'Logo listo para generar la muestra'
                        : hasVisibleOptimization
                        ? 'Logo optimizado exitosamente'
                        : 'Logo requiere optimización manual'}
                    </p>
                    {data.logoAnalysis.reason && (
                      <p className={`text-xs mt-1 ${
                        data.logoAnalysis.isOptimal || hasCosmeticOptimization
                          ? 'text-green-700'
                          : hasVisibleOptimization
                          ? 'text-purple-700'
                          : 'text-yellow-700'
                      }`}>
                        {data.logoAnalysis.reason}
                      </p>
                    )}
                    {hasVisibleOptimization && (
                      <p className="text-xs text-purple-700 mt-1">
                        Se ha generado una versión optimizada de tu logo. Puedes continuar con el proceso.
                      </p>
                    )}
                    {hasCosmeticOptimization && (
                      <p className="text-xs text-green-700 mt-1">
                        No mostramos comparación porque el diseño se mantuvo igual; solo ajustamos el archivo para la muestra.
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
            {data.logoOriginal && hasVisibleOptimization && !data.isAnalyzing && !data.isOptimizing && (
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
                        src={data.logoOptimized!}
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
                onClick={() => setStep(3)}
                className="sticky bottom-0 z-20 inline-flex w-full min-h-[52px] items-center justify-center px-6 py-3 bg-primary text-white rounded-md text-sm font-semibold uppercase tracking-wider shadow-[0_-8px_24px_rgba(17,16,14,0.18)] hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Continuar
              </button>
            )}
          </div>
        )}

        {/* Step 4: Size Selection */}
        {step === 4 && (
          <div className="flex min-h-0 flex-1 flex-col md:block">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto md:space-y-6 md:overflow-visible">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 md:mb-2 md:text-2xl">
                Elegir medida
              </h2>
              <p className="hidden text-sm text-gray-600 md:block md:text-base">
                {data.selectedSize
                  ? `Medida seleccionada: ${getSizeDisplayText()}. Podés cambiarla si querés.`
                  : 'Seleccioná la medida que mejor se adapte a tu necesidad.'}
              </p>
            </div>
            {data.selectedSize && (
              <div className="hidden md:block bg-primary/10 border border-primary rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-900">
                  Medida pre-seleccionada: <span className="font-semibold">{getSizeDisplayText()}</span>
                  {data.selectedPrice && (
                    <span className="ml-2">- ${data.selectedPrice.toLocaleString('es-AR')}</span>
                  )}
                </p>
              </div>
            )}

            <WizardCollapsible
              title="Cómo elegir medida"
              compact
              className={`mb-2 md:mb-4 ${mobileSizeMode === 'custom' ? 'hidden md:block' : ''}`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Pequeño</p>
                  <p className="text-gray-600">
                    Logos simples, detalle sutil o piezas delicadas.
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
            </WizardCollapsible>

            {(() => {
              const tierOptions = buildWizardSizeTierOptions(data.sizeOptions);
              const logoForScale =
                data.logoOptimized || data.logoPreview || data.thumbnailUrl || null;

              const selectTierOption = (option: WizardSizeTierOption) => {
                const tier = data.sizeOptions?.find((o) => o.size === option.size)?.tier;
                const approx =
                  tierToApproximateKey(tier) ??
                  (option.key === 'medio'
                    ? 'medio'
                    : option.key === 'pequeño' || option.key === 'grande'
                      ? option.key
                      : undefined);

                setData({
                  ...data,
                  selectedSize: option.size,
                  selectedPrice: option.price,
                  selectedTransferPrice: option.transferPrice,
                  approximateSizeKey: approx,
                  customSize: undefined,
                });

                if (!data.sizeOptions?.length) {
                  const dim = parseSizeMm(option.size);
                  if (dim) {
                    void cotizarMm(dim.width, dim.height).then((q) => {
                      if (!q) return;
                      setData((prev) => ({
                        ...prev,
                        selectedTransferPrice: q.precio_transferencia_ars,
                        selectedPrice: q.precio_link_ars,
                      }));
                    });
                  }
                }
              };

              return (
                <>
                  <div className="space-y-2 md:hidden">
                    {mobileSizeMode === 'standard' ? (
                      <>
                        <WizardSizePickerRow
                          options={tierOptions}
                          selectedSize={data.selectedSize}
                          customSize={data.customSize}
                          onSelect={(option) => {
                            setMobileSizeMode('standard');
                            selectTierOption(option);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setMobileSizeMode('custom');
                            setData((prev) => ({
                              ...prev,
                              approximateSizeKey: undefined,
                              customSize: prev.customSize ?? { width: 0, height: 0 },
                            }));
                          }}
                          className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-dashed border-[var(--alcohn-line)] bg-white px-3 text-sm font-medium text-neutral-800 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
                        >
                          Medida personalizada
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="rounded-lg border border-[var(--alcohn-ink)] bg-white p-3 shadow-[inset_0_0_0_1px_var(--alcohn-ink)]">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-700">
                            Medida personalizada
                          </p>
                          <WizardCustomSizeFields
                            customSize={data.customSize}
                            aspectRatio={data.logoAnalysis?.aspectRatio}
                            onPatch={(patch) =>
                              setData((prev) => ({ ...prev, ...patch }))
                            }
                            onCotizar={(w, h) => void applyCotizacionMm(w, h)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileSizeMode('standard');
                            const pick =
                              tierOptions.find((o) => o.recommended) ??
                              tierOptions[1] ??
                              tierOptions[0];
                            if (pick) selectTierOption(pick);
                          }}
                          className="flex min-h-[40px] w-full items-center justify-center text-sm font-medium text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
                        >
                          ← Volver a Pequeño / Mediano / Grande
                        </button>
                      </>
                    )}
                  </div>

                  <div className="mb-3 hidden md:grid md:grid-cols-3 md:gap-4 md:mb-4">
                    {tierOptions.map((option, index) => {
                      const isSelected =
                        !data.customSize && data.selectedSize === option.size;
                      const transfer =
                        option.transferPrice ??
                        data.sizeOptions?.[index]?.transferPrice ??
                        0;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => selectTierOption(option)}
                          className={`relative flex min-h-[300px] flex-col border p-6 text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {option.recommended && (
                            <span className="absolute top-3 right-3 rounded bg-primary px-2 py-1 text-xs font-medium text-white">
                              Recomendado
                            </span>
                          )}
                          <div className="mb-1 font-medium text-gray-900">
                            {option.label}
                          </div>
                          <div className="mb-2 text-lg font-semibold text-gray-900">
                            {option.size}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="text-2xl font-bold text-gray-900">
                              ${option.price.toLocaleString('es-AR')}
                            </div>
                            <div className="text-xs text-gray-600">
                              3 cuotas sin interés:{' '}
                              ${Math.round(option.price / 3).toLocaleString('es-AR')}
                            </div>
                            <div className="text-xs font-medium text-green-600">
                              Transferencia: ${transfer.toLocaleString('es-AR')}
                            </div>
                          </div>
                          <StampSizeScalePreview
                            sizeLabel={option.size}
                            logoUrl={logoForScale}
                            className="mt-auto w-full"
                          />
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            <WizardCollapsible
              title="Medida personalizada"
              compact
              className="hidden border-dashed border-gray-200/70 md:block"
            >
              <WizardCustomSizeFields
                customSize={data.customSize}
                aspectRatio={data.logoAnalysis?.aspectRatio}
                onPatch={(patch) => setData((prev) => ({ ...prev, ...patch }))}
                onCotizar={(w, h) => void applyCotizacionMm(w, h)}
                className="mb-4"
              />

              {data.customSize && isValidStampSizeMm(data.customSize.width, data.customSize.height) && (
                <div className="hidden grid-cols-1 gap-4 border-t border-gray-200/80 pt-4 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="space-y-2 min-w-0">
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
                        Transferencia: ${(data.selectedTransferPrice ?? 0).toLocaleString('es-AR')}
                      </p>
                    </div>
                  )}
                  </div>
                  <StampSizeScalePreview
                    sizeLabel={`${data.customSize.width}×${data.customSize.height}mm`}
                    logoUrl={data.logoOptimized || data.logoPreview || data.thumbnailUrl}
                    compact
                    className="w-full sm:w-[min(200px,100%)] sm:shrink-0"
                  />
                </div>
              )}
            </WizardCollapsible>
          </div>

          {(() => {
            const tierOptions = buildWizardSizeTierOptions(data.sizeOptions);
            const logoForScale =
              data.logoOptimized || data.logoPreview || data.thumbnailUrl || null;

            return (
              <div className="shrink-0 overflow-hidden rounded-t-xl border border-b-0 border-[var(--alcohn-line)] bg-white shadow-[0_-8px_24px_rgba(17,16,14,0.08)] md:hidden">
                <WizardSizeSummaryPanel
                  options={tierOptions}
                  selectedSize={data.selectedSize}
                  selectedPrice={data.selectedPrice}
                  selectedTransferPrice={data.selectedTransferPrice}
                  customSize={data.customSize}
                  logoUrl={logoForScale}
                />
                <div className="flex items-center justify-between gap-3 border-t border-[var(--alcohn-line)]/80 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-[var(--alcohn-line)] bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:border-neutral-400"
                  >
                    ← Atrás
                  </button>
                  {data.selectedSize && data.selectedPrice && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSizeSelect(
                          data.selectedSize!,
                          data.selectedPrice!,
                          data.selectedTransferPrice
                        )
                      }
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-[var(--alcohn-ink)] px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[var(--alcohn-ink-soft)]"
                    >
                      Continuar
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
          </div>
        )}

        {/* Step 3: Request Manual Preview (for complex logos) or Auto Preview (for simple logos) */}
        {step === 3 && (
          <>
            {data.needsManualPreview ? (
              // Logo complejo: Solicitar muestra manual
              <div className="space-y-6 text-center">
                {!manualPreviewRequested ? (
                  <>
                    <div>
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
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
                      className="inline-flex w-full min-h-[52px] items-center justify-center bg-primary text-white px-6 py-3 rounded-md text-sm font-semibold uppercase tracking-wider hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
              <div className="h-full overflow-y-auto space-y-4 md:space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                    Vista previa digital
                  </h2>
                  <p className="text-sm md:text-base text-gray-600">
                    {data.mockupUrl 
                      ? 'Vista previa generada automáticamente de cómo se verá tu sello aplicado.'
                      : 'Logo analizado y listo. Estamos generando la muestra sobre la textura del material elegido.'}
                  </p>
                </div>


                <div className="material-frame rounded-lg p-4 md:p-12 min-h-[220px] md:min-h-[400px] flex items-center justify-center">
                  {data.isGeneratingMockup ? (
                    <div className="w-full max-w-md text-center text-gray-600">
                      <p className="mb-3 text-sm font-medium">Generando muestra automática...</p>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
                      </div>
                      <p className="mt-3 text-xs text-gray-500">
                        Aplicamos tu logo sobre la textura del material. Esto puede tomar unos segundos.
                      </p>
                    </div>
                  ) : data.previewGenerated && data.mockupUrl ? (
                    // Mockup generado - mostrar mockup y opción de ver logos
                    <div className="space-y-4 text-center w-full md:space-y-6">
                      {/* Mockup */}
                      <div className="relative w-full max-w-2xl mx-auto bg-white border border-[var(--alcohn-line)] rounded-lg overflow-hidden shadow-sm">
                        <Image
                          src={(data.mockupUrl || data.thumbnailUrl)!}
                          alt="Vista previa del sello"
                          width={800}
                          height={600}
                          className="w-full h-auto"
                          unoptimized
                        />
                      </div>
                      
                      {/* Mostrar logos solo cuando hubo cambios de diseño reales */}
                      {data.logoOriginal && hasVisibleOptimization && (
                        <div className="mt-4 border-t border-[var(--alcohn-line)] pt-4">
                          <p className="mb-2 text-xs font-medium text-gray-700 md:mb-4 md:text-sm">
                            Comparar logos:
                          </p>
                          <div className="mx-auto grid max-w-sm grid-cols-2 gap-2 md:max-w-2xl md:gap-4">
                            <div className="bg-white border border-[var(--alcohn-line)] rounded-lg p-2 md:p-4">
                              <p className="text-xs text-gray-600 mb-2">Original</p>
                              <div className="relative h-24 w-full bg-gray-50 rounded border border-[var(--alcohn-line)] md:h-auto md:aspect-square">
                                <Image
                                  src={data.logoOriginal}
                                  alt="Logo original"
                                  fill
                                  className="object-contain p-2"
                                  unoptimized
                                />
                              </div>
                            </div>
                            <div className="bg-white border-2 border-[var(--alcohn-bronze)] rounded-lg p-2 md:p-4">
                              <p className="text-xs text-[var(--alcohn-bronze-dark)] mb-2 font-semibold">Optimizado</p>
                              <div className="relative h-24 w-full bg-white rounded border-2 border-[var(--alcohn-bronze)] md:h-auto md:aspect-square">
                                <Image
                                  src={data.logoOptimized!}
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
                      
                      {data.mockupUsesFallbackTexture && data.mockupTextureMaterial && (
                        <div className="mx-auto max-w-xl rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
                          <p className="text-sm font-medium text-amber-900">Muestra de referencia</p>
                          <p className="mt-1 text-xs leading-relaxed text-amber-800">
                            Todavía no tenemos generador de muestra para{' '}
                            {wizardUsoDisplayLabel(data)}. Usamos la textura de{' '}
                            <strong>{WIZARD_MATERIAL_LABELS[data.mockupTextureMaterial]}</strong> para que veas cómo
                            podría verse la marca. Tu sello funciona igual en el material que elegiste.
                          </p>
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">Muestra generada automáticamente</p>
                        <p className="text-xs">
                          Uso: {wizardUsoDisplayLabel(data)}
                          {data.selectedSize ? ` | Medida: ${getSizeDisplayText()}` : ' | Medida de referencia para la vista'}
                        </p>
                        {hasVisibleOptimization && (
                          <p className="text-xs text-purple-600 mt-1">
                            ✓ Logo optimizado automáticamente
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleRequestPreviewCorrection}
                        disabled={isRequestingCorrection}
                        className="mx-auto inline-flex min-h-[44px] items-center justify-center rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-900 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isRequestingCorrection
                          ? 'Preparando WhatsApp...'
                          : 'La muestra está mal, pedir corrección por WhatsApp'}
                      </button>
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
                        {hasVisibleOptimization && (
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
                {(data.previewGenerated || data.logoPreview) && !data.isGeneratingMockup && !data.mockupUrl && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      El servicio de mockups no está disponible. Podés continuar y elegir la medida.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Step 5: Payment (solo para logos simples con vista previa automática) */}
        {step === 5 && !data.needsManualPreview && (() => {
          const transferPrice = data.selectedTransferPrice ?? 0;
          const cardPrice = data.selectedPrice || 0;
          const cardTotal = cardPrice + shippingCost;
          const transferTotal = transferPrice + shippingCost;
          const cuotaPrice = Math.round(cardTotal / 3);
          const materialDisplay = wizardUsoDisplayLabel(data);
          const clientLogo = data.logoOptimized || data.logoPreview;
          
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

            setTransferCheckoutError(null);
            setIsUploadingReceipt(true);
            try {
              const intent = await createWizardTransferOrder();
              await uploadComprobante(intent.orden_id, receiptFile);
              persistWizardPurchaseSnapshot(intent.orden_id, transferTotal, transferPrice);
              goToTransferConfirmation(intent.orden_id);
            } catch (error) {
              console.error('Error confirmando pedido por transferencia:', error);
              setTransferCheckoutError(
                error instanceof Error
                  ? error.message
                  : 'No se pudo registrar el pedido. Intentá de nuevo.'
              );
            } finally {
              setIsUploadingReceipt(false);
            }
          };

          const handleTransferWhatsApp = async () => {
            setTransferCheckoutError(null);
            setIsUploadingReceipt(true);
            try {
              const intent = await createWizardTransferOrder();
              persistWizardPurchaseSnapshot(intent.orden_id, transferTotal, transferPrice);
              const phone = String(config.whatsapp.number || '').replace(/\D/g, '');
              const message = encodeURIComponent(
                [
                  'Hola, acabo de realizar una compra por transferencia.',
                  `Número de pedido: ${intent.orden_id}`,
                  data.nombre ? `Nombre: ${data.nombre}` : null,
                  'Adjunto el comprobante de transferencia.',
                ]
                  .filter(Boolean)
                  .join('\n')
              );
              window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
              goToTransferConfirmation(intent.orden_id);
            } catch (error) {
              console.error('Error registrando pedido por transferencia:', error);
              setTransferCheckoutError(
                error instanceof Error
                  ? error.message
                  : 'No se pudo registrar el pedido. Intentá de nuevo.'
              );
            } finally {
              setIsUploadingReceipt(false);
            }
          };
          
          return (
            <div className="min-h-0 flex-1 overflow-y-auto space-y-4 pb-6 md:space-y-6 md:pb-0">
              <div>
                <h2 className="text-lg md:text-2xl font-semibold text-gray-900 mb-2">
                  Método de pago
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Elegí cómo querés pagar tu sello personalizado.
                </p>
              </div>

              {/* Order Summary (mobile colapsable) */}
              <details className="lg:hidden border border-[var(--alcohn-line)] bg-white open:bg-white">
                <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 px-3 py-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="craft-label text-[10px]">Resumen del pedido</span>
                    <span className="text-base font-semibold text-neutral-950">
                      Total ${cardTotal.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Detalle
                    <svg className="h-3 w-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-[var(--alcohn-line)] px-3 py-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-neutral-500">Material / Uso</span>
                    <span className="font-medium text-neutral-900 text-right">{materialDisplay}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-neutral-500">Medida</span>
                    <span className="font-medium text-neutral-900">{getSizeDisplayText()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-neutral-500">Envío</span>
                    <select
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value as ShippingMetodoUi)}
                      className="border border-[var(--alcohn-line)] bg-white px-2 py-2 text-[13px] font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    >
                      <option value="domicilio">Domicilio</option>
                      <option value="sucursal">Sucursal</option>
                      <option value="retiro">{SHIPPING_METODO_LABELS.retiro}</option>
                    </select>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-xs text-neutral-600">
                      <span>Costo envío</span>
                      <span>${shippingCost.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold text-neutral-950">
                    <span>Total tarjeta</span>
                    <span>${cardTotal.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>Total transferencia</span>
                    <span>${transferTotal.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </details>

              <div className="hidden lg:grid grid-cols-1 lg:grid-cols-[0.58fr_0.42fr] gap-4">
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
                      <dd className="font-medium text-neutral-950">{materialDisplay}</dd>
                    </div>
                    <div className="grid grid-cols-[0.34fr_0.66fr] py-3">
                      <dt className="text-neutral-500">Medida</dt>
                      <dd className="font-medium text-neutral-950">{getSizeDisplayText()}</dd>
                    </div>
                    <div className="grid grid-cols-[0.34fr_0.66fr] py-3 items-center gap-2">
                      <dt className="text-neutral-500">Envío</dt>
                      <dd>
                        <select
                          value={shippingMethod}
                          onChange={(e) =>
                            setShippingMethod(e.target.value as ShippingMetodoUi)
                          }
                          className="w-full border border-[var(--alcohn-line)] bg-white px-2 py-1.5 text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        >
                          <option value="domicilio">Domicilio</option>
                          <option value="sucursal">Sucursal</option>
                          <option value="retiro">{SHIPPING_METODO_LABELS.retiro}</option>
                        </select>
                        {shippingCost > 0 && (
                          <p className="mt-1 text-xs text-neutral-500">
                            + ${shippingCost.toLocaleString('es-AR')} envío
                          </p>
                        )}
                      </dd>
                    </div>
                    <div className="grid grid-cols-[0.34fr_0.66fr] py-3">
                      <dt className="font-semibold text-neutral-950">Total</dt>
                      <dd className="text-xl font-bold text-neutral-950">
                        ${cardTotal.toLocaleString('es-AR')}
                      </dd>
                    </div>
                  </dl>
                </div>

                <PurchaseInclusions
                  compact
                  title="Incluido con tu sello"
                  logoUrl={clientLogo}
                />
              </div>

              {/* Payment Methods */}
              {!paymentMethod ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                  {/* Tarjeta con Open Pay */}
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className="technical-sheet p-4 md:p-6 text-left transition-all hover:border-[var(--alcohn-bronze)] hover:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Pagar con tarjeta</h3>
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-6 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-900">
                        ${cardTotal.toLocaleString('es-AR')}
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
                    className="technical-sheet p-4 md:p-6 text-left transition-all hover:border-[var(--alcohn-bronze)] hover:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Transferencia bancaria</h3>
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-900 line-through text-gray-400">
                        ${cardTotal.toLocaleString('es-AR')}
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        ${transferTotal.toLocaleString('es-AR')}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Ahorrá ${Math.max(0, cardTotal - transferTotal).toLocaleString('es-AR')} pagando por transferencia
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
                      className="block w-full text-center px-4 py-3 text-sm leading-snug bg-[var(--alcohn-ink)] text-white border border-[var(--alcohn-ink)] font-semibold uppercase tracking-wider hover:bg-[var(--alcohn-ink-soft)] hover:border-[var(--alcohn-bronze)] transition-colors disabled:opacity-50 disabled:pointer-events-none md:px-6 md:text-base"
                    >
                      {checkoutNavigateBusy ? (
                        'Preparando pedido…'
                      ) : (
                        <>
                          <span className="md:hidden">Continuar al checkout (Openpay)</span>
                          <span className="hidden md:inline">
                            Continuar al checkout y pagar con Openpay
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="inline-flex min-h-[44px] items-center text-sm text-gray-600 hover:text-gray-900"
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
                          ${transferTotal.toLocaleString('es-AR')}
                        </span>
                        <span className="text-xs text-gray-500 block mt-1">
                          Tarjeta / link: ${cardTotal.toLocaleString('es-AR')} — Transferencia: ${transferTotal.toLocaleString('es-AR')}
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
                        
                        <button
                          type="button"
                          onClick={handleTransferWhatsApp}
                          disabled={isUploadingReceipt}
                          className="inline-flex w-full min-h-[52px] items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-semibold uppercase tracking-wider hover:bg-green-700 transition-colors text-center disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                          </svg>
                          Enviar por WhatsApp
                        </button>
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
                          {isUploadingReceipt ? 'Registrando pedido…' : 'Confirmar pedido'}
                        </button>
                      </div>
                    )}
                    {transferCheckoutError && (
                      <p className="text-sm text-red-600" role="alert">
                        {transferCheckoutError}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="inline-flex min-h-[44px] items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← Volver a métodos de pago
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Navigation */}
        {step > 1 && step < 5 && !pendingLogoUpload && (
          <div
            className={`z-20 mt-3 shrink-0 border-t border-gray-200 bg-[var(--alcohn-surface)] pt-3 flex items-center justify-between gap-3 md:mt-4 ${
              step === 4 ? 'hidden md:flex' : ''
            }`}
          >
            <button
              onClick={() => setStep(step - 1)}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-[var(--alcohn-line)] rounded-md hover:border-[var(--alcohn-bronze)] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              ← Atrás
            </button>
            {step === 3 &&
              !data.needsManualPreview &&
              (data.previewGenerated || data.logoPreview) &&
              !data.isGeneratingMockup && (
                <button
                  onClick={() => setStep(4)}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center px-5 py-2 text-sm font-semibold uppercase tracking-wider text-white bg-primary border border-primary rounded-md hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Continuar
                </button>
              )}
            {step === 4 && data.selectedSize && data.selectedPrice && (
              <button
                onClick={() =>
                  handleSizeSelect(
                    data.selectedSize!,
                    data.selectedPrice!,
                    data.selectedTransferPrice
                  )
                }
                className="inline-flex min-h-[44px] flex-1 items-center justify-center px-5 py-2 text-sm font-semibold uppercase tracking-wider text-white bg-primary border border-primary rounded-md hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Continuar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
