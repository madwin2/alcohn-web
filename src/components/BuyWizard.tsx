'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import ReactCrop, { type Crop, type PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Stepper from './Stepper';
import ContactStep from './buy/ContactStep';
import GoogleReviewsBadge from './GoogleReviewsBadge';
import PurchaseInclusions from './PurchaseInclusions';
import { config } from '@/lib/config';
import { useCart } from '@/contexts/CartContext';
import { useMarket } from '@/contexts/MarketContext';
import { getMarketConfig } from '@/lib/markets/config';
import { formatMarketMoney } from '@/lib/markets/money';
import { marketPath } from '@/lib/markets/paths';
import { displayWizardProductPrice } from '@/lib/markets/pricing';
import { saveCheckoutPrefill, type CheckoutMetodoPagoPrefill } from '@/lib/checkoutPrefill';
import { fetchShippingCost } from '@/lib/shipping/client';
import { saveCheckoutShipping } from '@/lib/shipping/storage';
import { FREE_SHIPPING_MIN_STAMPS, countStampUnits } from '@/lib/shipping/freeShipping';
import type { ShippingMetodoUi } from '@/lib/shipping/types';
import { SHIPPING_METODO_LABELS } from '@/lib/shipping/types';
import { trackMetaInitiateCheckout } from '@/lib/analytics/metaPixel';
import { pushGtmEvent } from '@/lib/analytics/gtm';
import { trackEvent } from '@/lib/analytics/client';
import { trackWizardStep, WIZARD_STEPS, getWizardStepIndex, type WizardStepKey } from '@/lib/analytics/wizardStep';
import { getOrCreateWebSessionId, peekWizardSupabaseSession } from '@/lib/wizardSupabaseSession';
import {
  buildWizardEntryKey,
  clearWizardDraft,
  isWizardDraftWorthResuming,
  loadWizardDraft,
  saveWizardDraft,
  type WizardDraft,
} from '@/lib/wizardDraft';
import { getBrowserKind, isInAppBrowser, type BrowserKind } from '@/lib/browserKind';
import {
  syncWizardContact,
  ensureMockupSolicitud,
  syncWizardMockupContact,
  syncWizardLogos,
  syncWizardMockupPreview,
  syncWizardMedidasCotizacion,
  markMockupPendingApproval,
  markCheckoutStarted,
  type WizardMedidasCotizacionJson,
} from '@/lib/wizardSupabaseSync';
import { patchMockupSolicitud, uploadMockupImage } from '@/lib/supabase/mockupApiClient';
import {
  getWizardOptionBySlug,
  WIZARD_MAIN_USO_SLUGS,
  wizardMaterialOptions,
  wizardStampProcess,
  type WizardMaterialOption,
} from '@/data/stampUseCases';
import StampSizeScalePreview from '@/components/buy/StampSizeScalePreview';
import WizardCollapsible from '@/components/buy/WizardCollapsible';
import WizardCustomSizeFields from '@/components/buy/WizardCustomSizeFields';
import WizardMobileHeader from '@/components/buy/WizardMobileHeader';
import WizardSizeCompareScale from '@/components/buy/WizardSizeCompareScale';
import {
  WizardSizePickerRow,
  type WizardSizeTierOption,
} from '@/components/buy/WizardSizeStepMobile';
import { cotizarMm, parseSizeMm } from '@/lib/cotizador/fetchCotizacion';
import {
  fitProportionalStampSize,
  isValidStampSizeMm,
} from '@/lib/cotizador/stampSizeLimits';
import { localizeTree } from '@/lib/markets/localizeTree';
import WizardTextLogo, { type WizardTextLogoResult } from '@/components/buy/WizardTextLogo';
import WizardAddonCard from '@/components/buy/WizardAddonCard';
import { getTextLogoStyle } from '@/lib/textLogo';
import {
  buildWizardAddonCartLine,
  getWizardAddonSuggestion,
  resolveWizardAddon,
} from '@/lib/wizardAddons';
import { INSTALLMENTS_WITHOUT_INTEREST, installmentAmountArs } from '@/lib/installments';
import { MOCKUP_SCENES, resolveSceneId } from '@/lib/mockupScenes/scenes';

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

/**
 * Qué muestra se genera:
 * - Cuero y madera: textura + efecto (como siempre).
 * - Hielo, pan, piel de cítrico y cerámica: escena fotográfica propia (`mockupScenes`).
 * - El resto (jabón, lacre, packaging…): textura de referencia de cuero o madera.
 */
function resolveMockupGeneration(
  material: WizardMaterial,
  usoSlug?: string,
): {
  mockupMaterial: 'cuero' | 'madera';
  usesFallback: boolean;
  sceneId: string | null;
} {
  const sceneId = resolveSceneId(usoSlug) ?? resolveSceneId(material);
  if (material === 'madera') return { mockupMaterial: 'madera', usesFallback: false, sceneId: null };
  if (material === 'cuero') return { mockupMaterial: 'cuero', usesFallback: false, sceneId: null };
  const mockupMaterial =
    material === 'ceramica' || material === 'otros' ? 'madera' : 'cuero';
  return { mockupMaterial, usesFallback: !sceneId, sceneId };
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
  // Aceptamos data URLs chicas (thumbnail) para mostrar la muestra real sin inflar demasiado localStorage.
  if (u && (!u.startsWith('data:') || u.length <= MAX_CART_DATA_URL_LENGTH)) return u;

  // Sin muestra usable: foto del material (escena propia para hielo, pan, fruta y cerámica).
  const sceneId = resolveSceneId(d.usoSlug) ?? resolveSceneId(d.material);
  const scene = sceneId ? MOCKUP_SCENES[sceneId] : null;
  if (scene) return `/mockup-scenes/${scene.file}`;
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

function BuyWizardContent({
  initialProduct,
  initialMaterial,
  initialUsoSlug,
  onComplete,
}: BuyWizardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { market } = useMarket();
  const isInternationalMarket = market !== 'ar';
  const { addItem, clearCart, items: cartItems } = useCart();
  const [step, setStep] = useState(0); // Paso 0 = material
  /** Mobile paso medida: tarjetas estándar vs formulario personalizado */
  const [mobileSizeMode, setMobileSizeMode] = useState<'standard' | 'custom'>('standard');
  const [data, setData] = useState<BuyWizardData>(() => (
    initialMaterial ? { material: initialMaterial } : {}
  ));
  const [manualPreviewRequested, setManualPreviewRequested] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | null>(null);
  /** Unidades del mismo sello (mismo logo y medida). */
  const [wizardQty, setWizardQty] = useState(1);
  /** Aviso "Sello agregado: subí el logo del próximo" después de "Agregar otro sello". */
  const [anotherStampAdded, setAnotherStampAdded] = useState<string | null>(null);
  const [checkoutNavigateBusy, setCheckoutNavigateBusy] = useState(false);
  const wizardPaymentTrackedRef = useRef(false);
  const mockupGeneradoTrackedRef = useRef(false);
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
  const lastTrackedWizardStepRef = useRef<number | null>(null);
  /** URL firmada del logo subido a la muestra: es lo que se guarda en el avance. */
  const [draftLogoUrl, setDraftLogoUrl] = useState<string | null>(null);
  /** No guardar el avance hasta haber intentado restaurar uno (si no, se pisa). */
  const [draftChecked, setDraftChecked] = useState(false);
  const resumeAttemptedRef = useRef(false);
  const [resumedFrom, setResumedFrom] = useState<'draft' | 'link' | null>(null);
  const [browserKind, setBrowserKind] = useState<BrowserKind>('desktop');
  const [showOtherUses, setShowOtherUses] = useState(false);
  /** Estilo del logo de texto en uso ("No tengo logo"); null si el logo es un archivo subido. */
  const [textLogoStyle, setTextLogoStyle] = useState<string | null>(null);
  /** Complemento sugerido en el pago (solo AR): cuál se muestra y si está agregado. */
  const [addonSlug, setAddonSlug] = useState<string | null>(null);
  const [addonAdded, setAddonAdded] = useState(false);
  const addonShownRef = useRef(false);
  const textLogoRef = useRef<string | null>(null);
  const mainMaterialOptions = WIZARD_MAIN_USO_SLUGS.map((slug) =>
    wizardMaterialOptions.find((o) => o.slug === slug)
  ).filter((o): o is WizardMaterialOption => Boolean(o));
  const otherMaterialOptions = wizardMaterialOptions.filter(
    (o) => !WIZARD_MAIN_USO_SLUGS.includes(o.slug)
  );
  const otherUseSelected = Boolean(
    data.usoSlug && !WIZARD_MAIN_USO_SLUGS.includes(data.usoSlug as WizardMaterialOption['slug'])
  );
  const entryKey = buildWizardEntryKey(pathname ?? '/buy', new URLSearchParams(searchParams.toString()));

  useEffect(() => {
    webSessionIdRef.current = getOrCreateWebSessionId();
    const session = peekWizardSupabaseSession();
    if (session?.cliente_id) clienteIdRef.current = session.cliente_id;
    if (session?.mockup_solicitud_id) mockupSolicitudIdRef.current = session.mockup_solicitud_id;
    setBrowserKind(getBrowserKind());
  }, []);

  useEffect(() => {
    wizardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    if (isInternationalMarket) {
      setShippingCost(0);
      return;
    }
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
  }, [shippingMethod, isInternationalMarket]);

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

  const buildMedidasCotizacionJson = (
    overrides?: Partial<WizardMedidasCotizacionJson>
  ): WizardMedidasCotizacionJson => ({
    size: overrides?.size ?? getSizeDisplayText(),
    medidaExacta: overrides?.medidaExacta ?? data.selectedSize ?? '',
    approximateSizeKey: overrides?.approximateSizeKey ?? data.approximateSizeKey,
    precio: overrides?.precio ?? data.selectedPrice,
    precio_transferencia: overrides?.precio_transferencia ?? data.selectedTransferPrice,
    customSize: overrides?.customSize ?? data.customSize,
    tipo: overrides?.tipo ?? (data.customSize ? 'manual' : 'catalogo'),
  });

  const syncMedidasToMockup = (overrides?: Partial<WizardMedidasCotizacionJson>) => {
    const mid = mockupSolicitudIdRef.current;
    const payload = buildMedidasCotizacionJson(overrides);
    if (!mid || !payload.medidaExacta.trim()) return;
    void syncWizardMedidasCotizacion(mid, payload);
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

  const steps = [...WIZARD_STEPS];
  const currentStepKey = WIZARD_STEPS[step]?.key;

  const goToStepKey = useCallback((key: WizardStepKey) => {
    const idx = getWizardStepIndex(key);
    if (idx >= 0) setStep(idx);
  }, []);

  const goToPreviousStep = useCallback(() => {
    setStep((prev) => Math.max(0, prev - 1));
  }, []);

  /** Eventos del paso del logo: analítica propia + GTM, con el navegador de origen. */
  const trackWizardDetail = useCallback(
    (eventName: string, metadata: Record<string, unknown> = {}) => {
      const payload = { ...metadata, navegador: getBrowserKind(), market };
      void trackEvent(eventName, { metadata: payload });
      pushGtmEvent(eventName, payload);
    },
    [market]
  );

  const restoreWizardDraft = useCallback(
    async (draft: WizardDraft, source: 'draft' | 'link') => {
      if (draft.mockupSolicitudId) mockupSolicitudIdRef.current = draft.mockupSolicitudId;
      if (draft.clienteId) clienteIdRef.current = draft.clienteId;

      let target: WizardStepKey = draft.step === 'material' ? 'logo' : draft.step;
      let logoPatch: Partial<BuyWizardData> = {};
      if (draft.logoUrl) {
        try {
          const res = await fetch(draft.logoUrl);
          if (!res.ok) throw new Error(`logo ${res.status}`);
          const blob = await res.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          });
          const file = new File([blob], draft.logoName || 'logo.png', {
            type: blob.type || 'image/png',
          });
          const aspectRatio = await measureLogoContentAspectRatioFromDataUrl(dataUrl);
          logoPatch = {
            logoFile: file,
            logoOriginal: dataUrl,
            logoPreview: dataUrl,
            logoAnalysis: { aspectRatio },
          };
          setDraftLogoUrl(draft.logoUrl);
        } catch {
          // La URL firmada venció o no se pudo bajar: vuelve a pedir el logo.
          target = 'logo';
        }
      } else {
        target = 'logo';
      }

      setData((prev) => ({
        ...prev,
        material: draft.material as WizardMaterial,
        usoSlug: draft.usoSlug ?? prev.usoSlug,
        nombre: draft.nombre ?? prev.nombre,
        whatsapp: draft.whatsapp ?? prev.whatsapp,
        email: draft.email ?? prev.email,
        ...logoPatch,
      }));
      goToStepKey(target);
      setResumedFrom(source);
      trackWizardDetail('wizard_resumed', {
        origen: source,
        paso: target,
        con_logo: Boolean(logoPatch.logoPreview),
        material: draft.material,
      });
    },
    [goToStepKey, trackWizardDetail]
  );

  // Retomar: primero el avance guardado en este navegador; si no hay, el link de
  // "Terminar más tarde" (?retomar=<id de la muestra>), que puede abrirse en otro.
  useEffect(() => {
    // Una sola vez por montaje real (en desarrollo React monta dos veces).
    if (resumeAttemptedRef.current) return;
    resumeAttemptedRef.current = true;
    const retomarId = searchParams.get('retomar');
    void (async () => {
      try {
        let draft = loadWizardDraft(entryKey);
        let source: 'draft' | 'link' = 'draft';
        if (!draft && retomarId && /^[0-9a-f-]{36}$/i.test(retomarId)) {
          const res = await fetch(`/api/mockups/solicitudes/${retomarId}`);
          if (res.ok) {
            const s = (await res.json()) as {
              id?: string;
              origen?: string;
              orden_id?: string | null;
              material?: string | null;
              archivo_base_url?: string | null;
            };
            if (s.id && s.origen === 'web' && !s.orden_id && s.material) {
              draft = {
                v: 1,
                savedAt: Date.now(),
                entryKey,
                step: s.archivo_base_url ? 'contact' : 'logo',
                material: s.material,
                mockupSolicitudId: s.id,
                logoUrl: s.archivo_base_url ?? undefined,
              };
              source = 'link';
            }
          }
        }
        if (!draft || !isWizardDraftWorthResuming(draft)) return;
        await restoreWizardDraft(draft, source);
      } catch (err) {
        console.info('[wizard] no se pudo retomar el avance', err);
      } finally {
        setDraftChecked(true);
      }
    })();
    // Solo al entrar: retomar no debe repetirse al cambiar de paso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar el avance en los pasos previos a la muestra. Después de enviar los datos
  // queda guardado el paso de contacto, así quien vuelve no repite logo ni datos.
  useEffect(() => {
    if (!draftChecked || !data.material) return;
    if (currentStepKey !== 'material' && currentStepKey !== 'logo' && currentStepKey !== 'contact') {
      return;
    }
    saveWizardDraft({
      entryKey,
      step: currentStepKey,
      material: data.material,
      usoSlug: data.usoSlug,
      mockupSolicitudId: mockupSolicitudIdRef.current ?? undefined,
      clienteId: clienteIdRef.current ?? undefined,
      logoUrl: data.logoPreview && draftLogoUrl ? draftLogoUrl : undefined,
      logoName: data.logoFile?.name,
      nombre: data.nombre,
      whatsapp: data.whatsapp,
      email: data.email,
    });
  }, [
    draftChecked,
    entryKey,
    currentStepKey,
    data.material,
    data.usoSlug,
    data.logoPreview,
    data.logoFile,
    data.nombre,
    data.whatsapp,
    data.email,
    draftLogoUrl,
  ]);

  const handleStartOver = () => {
    clearWizardDraft();
    mockupSolicitudIdRef.current = null;
    setDraftLogoUrl(null);
    setResumedFrom(null);
    setAnalysisError(null);
    setData(initialMaterial ? { material: initialMaterial } : {});
    setStep(0);
    trackWizardDetail('wizard_start_over');
  };

  useEffect(() => {
    if (lastTrackedWizardStepRef.current === step) return;
    lastTrackedWizardStepRef.current = step;

    const stepDef = WIZARD_STEPS[step];
    if (!stepDef) return;

    const mode =
      searchParams.get('mode') ??
      (searchParams.get('product') ? 'product' : 'custom');

    trackWizardStep({
      stepIndex: step,
      stepKey: stepDef.key,
      stepLabel: stepDef.label,
      mode,
      mockupSolicitudId: mockupSolicitudIdRef.current,
      webSessionId: webSessionIdRef.current,
    });
  }, [step, searchParams]);

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
    if (!data.logoFile || !data.material || currentStepKey !== 'size') return;

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
  }, [data.logoFile, data.material, data.logoAnalysis?.aspectRatio, currentStepKey]);

  // Mobile / paso medida: preseleccionar la opción recomendada al entrar o al cargar tiers
  useEffect(() => {
    if (currentStepKey !== 'size' || data.customSize) return;

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
  }, [currentStepKey, data.sizeOptions, data.customSize, data.selectedSize, data.selectedPrice]);

  useEffect(() => {
    if (currentStepKey !== 'size') setMobileSizeMode('standard');
  }, [currentStepKey]);

  // Medición del bbox del dibujo para la comparación a escala (logos ya subidos antes del cambio)
  useEffect(() => {
    if (currentStepKey !== 'size') return;
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
    currentStepKey,
    data.logoPreview,
    data.logoOptimized,
    data.logoAnalysis?.contentWidthPx,
  ]);

  useEffect(() => {
    if (currentStepKey !== 'payment' || data.needsManualPreview || !data.selectedPrice) return;
    if (wizardPaymentTrackedRef.current) return;
    wizardPaymentTrackedRef.current = true;

    window.dispatchEvent(new Event('alcohn:navigation'));
    trackMetaInitiateCheckout({
      value: data.selectedPrice + shippingCost,
      contentIds: [`wizard-${data.selectedSize || 'personalizado'}`],
      numItems: 1,
    });
  }, [currentStepKey, data.needsManualPreview, data.selectedPrice, data.selectedSize, shippingCost]);

  // Generate preview when size is selected (solo para logos óptimos u optimizados)
  // Mockup serverless (Sharp + texturas en public/mockup-textures)
  // Generar mockup solo cuando el usuario llegue al paso de vista previa
  useEffect(() => {
    if (
      currentStepKey === 'preview' &&
      !data.previewGenerated &&
      !data.needsManualPreview &&
      data.logoPreview &&
      data.material &&
      !data.isGeneratingMockup &&
      data.logoAnalysis
    ) {
      const generateMockup = async () => {
        const { mockupMaterial, usesFallback, sceneId } = resolveMockupGeneration(
          data.material!,
          data.usoSlug,
        );
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
            // Con escena propia se manda el material real y el uso; si no, la textura de referencia.
            material: sceneId ? data.material : mockupMaterial,
            uso: data.usoSlug ?? null,
            // Sin medida elegida, la escena usa la medida recomendada para ese objeto.
            sizeIsReference: !data.selectedSize && !customSizeObj,
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
            if (!mockupGeneradoTrackedRef.current) {
              mockupGeneradoTrackedRef.current = true;
              pushGtmEvent('mockup_generado', {
                market,
                material: data.material,
                medida: sizeStr,
              });
            }
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
  }, [currentStepKey, data.previewGenerated, data.needsManualPreview, data.logoPreview, data.material, data.logoOptimized, data.logoAnalysis, data.customSize, data.isGeneratingMockup, data.selectedSize]);

  const [isContactProcessing, setIsContactProcessing] = useState(false);

  const contactProcessingMessage = data.isOptimizing
    ? 'Optimizando tu logo para el sello de bronce…'
    : data.isAnalyzing
      ? 'Analizando tu logo…'
      : 'Generando tu muestra…';

  const handleContactSubmit = async (nombre: string, whatsapp: string, email: string) => {
    const logoFile = data.logoFile;
    const imageUrl = data.logoOriginal || data.logoPreview;
    if (!logoFile || !imageUrl) {
      setAnalysisError('Subí un logo antes de continuar.');
      goToStepKey('logo');
      return;
    }

    setIsContactProcessing(true);
    setData((prev) => ({ ...prev, nombre, whatsapp, email }));
    saveCheckoutPrefill({ nombre, whatsapp, email });

    try {
      const mid = mockupSolicitudIdRef.current;
      const cid = await syncWizardContact(
        nombre,
        whatsapp,
        email,
        webSessionIdRef.current,
        mid
      );
      if (cid) clienteIdRef.current = cid;

      if (mid) {
        await syncWizardMockupContact(mid, {
          clienteId: cid,
          nombre,
          whatsapp,
          email,
        });
      } else if (data.material) {
        const ensuredId = await ensureMockupSolicitud(cid, data.material, {
          nombre,
          whatsapp,
          email,
          webSessionId: webSessionIdRef.current,
          mockupSolicitudId: mid,
        });
        if (ensuredId) mockupSolicitudIdRef.current = ensuredId;
      }

      await runLogoProcessing(logoFile, imageUrl);
    } finally {
      setIsContactProcessing(false);
    }
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
    goToStepKey('logo');
  };

  const handleLogoUploaded = useCallback(async (
    file: File,
    imageUrl: string,
    textLogo?: { styleId: string; lines: string[] }
  ) => {
    const logoContentAspectRatio = await measureLogoContentAspectRatioFromDataUrl(imageUrl);
    let materialForMockup: WizardMaterial | undefined;

    setData((prev) => {
      materialForMockup = prev.material;
      return {
        ...prev,
        logoFile: file,
        logoOriginal: imageUrl,
        logoPreview: imageUrl,
        logoOptimized: undefined,
        logoOptimizationIsCosmetic: false,
        logoAnalysis: { aspectRatio: logoContentAspectRatio },
        sizeOptions: undefined,
        previewGenerated: false,
        mockupUrl: undefined,
        thumbnailUrl: undefined,
        isGeneratingMockup: false,
        needsManualPreview: false,
        isAnalyzing: false,
        isOptimizing: false,
      };
    });
    setAnalysisError(null);

    let mid = mockupSolicitudIdRef.current;
    if (!mid && materialForMockup) {
      mid = await ensureMockupSolicitud(null, materialForMockup, {
        webSessionId: webSessionIdRef.current,
      });
      if (mid) mockupSolicitudIdRef.current = mid;
    }
    setDraftLogoUrl(null);
    if (mid) {
      void syncWizardLogos(mid, imageUrl).then((url) => {
        if (url) setDraftLogoUrl(url);
      });
    }

    // Logo de texto: queda anotado en la solicitud para que el vendedor lo sepa (merge en
    // metadata_web). Si después sube un archivo, se desmarca.
    const wasTextLogo = textLogoRef.current !== null;
    textLogoRef.current = textLogo?.styleId ?? null;
    setTextLogoStyle(textLogo?.styleId ?? null);
    if (mid && (textLogo || wasTextLogo)) {
      void patchMockupSolicitud(mid, {
        metadata_web: textLogo
          ? {
              logo_texto: true,
              logo_texto_tipografia: getTextLogoStyle(textLogo.styleId).label,
              logo_texto_marca: textLogo.lines.join(' / '),
            }
          : { logo_texto: false },
      }).catch((err) => console.error('[wizard] logo de texto', err));
    }

    trackWizardDetail('logo_uploaded', {
      tipo: file.type || null,
      kb: Math.round(file.size / 1024),
      ...(textLogo ? { fuente: 'texto' } : {}),
    });
    goToStepKey('contact');
  }, [goToStepKey, trackWizardDetail]);

  /** "No tengo logo": el PNG armado con el nombre entra por el mismo camino que un archivo (sin recorte). */
  const handleTextLogoConfirm = async ({ file, dataUrl, styleId, lines }: WizardTextLogoResult) => {
    trackWizardDetail('logo_text_used', { estilo: styleId, lineas: lines.length });
    await handleLogoUploaded(file, dataUrl, { styleId, lines });
  };

  const runLogoProcessing = useCallback(async (file: File, imageUrl: string) => {
    const logoContentAspectRatio =
      data.logoAnalysis?.aspectRatio ??
      (await measureLogoContentAspectRatioFromDataUrl(imageUrl));

    setData((prev) => ({
      ...prev,
      logoFile: file,
      logoOriginal: imageUrl,
      logoPreview: imageUrl,
      logoOptimized: undefined,
      logoOptimizationIsCosmetic: false,
      isAnalyzing: true,
      isOptimizing: false,
    }));
    setAnalysisError(null);

    try {
      const analysis = await analyzeLogoWithAI(imageUrl, logoContentAspectRatio);

      let finalLogoUrl = imageUrl;

      let optimizedAspectRatio = analysis.aspectRatio;
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

      const measured = await measureLogoOnServer(finalLogoUrl);
      if (measured != null) {
        optimizedAspectRatio = measured.aspectRatio;
      }

      setData((prev) => ({
        ...prev,
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
        sizeOptions: undefined,
        previewGenerated: false,
        mockupUrl: undefined,
        thumbnailUrl: undefined,
        isGeneratingMockup: false,
        needsManualPreview: optimizationFailed && (analysis.isComplex || !analysis.hasPlainBackground),
        isAnalyzing: false,
        isOptimizing: false,
      }));

      const mid = mockupSolicitudIdRef.current;
      if (mid) {
        void syncWizardLogos(mid, imageUrl, finalLogoUrl !== imageUrl ? finalLogoUrl : undefined);
      }

      goToStepKey('preview');
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
      goToStepKey('preview');
    }
  }, [data.logoAnalysis?.aspectRatio, goToStepKey]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fuente = e.target.id === 'logo-camera' ? 'camara' : 'galeria';
    e.target.value = '';
    if (!file) {
      trackWizardDetail('logo_picker_cancel', { fuente });
      return;
    }
    if (file.type && !file.type.startsWith('image/')) {
      trackWizardDetail('logo_upload_error', { fuente, motivo: 'tipo', tipo: file.type });
      setAnalysisError('Ese archivo no es una imagen. Subí tu logo en PNG, JPG o SVG.');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => {
      trackWizardDetail('logo_upload_error', { fuente, motivo: 'lectura', tipo: file.type || null });
      setAnalysisError('No pudimos leer la imagen. Probá con otra o sacale una foto.');
    };
    reader.onloadend = () => {
      if (reader.error || typeof reader.result !== 'string') return;
      const imageUrl = reader.result;
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
    trackWizardDetail('logo_crop', { accion: 'sin_recortar' });
    await handleLogoUploaded(pending.file, pending.imageUrl);
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
      trackWizardDetail('logo_crop', { accion: hasValidCrop ? 'recortar' : 'sin_recortar' });
      await handleLogoUploaded(logoFile, croppedImageUrl);
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

    // El overlay tiene p-4 (32 px): en un celular de 375 px el modal no puede pasar de 343.
    const modalOuterMaxWidth = Math.min(viewportWidth - 32, viewportWidth * 0.95, cropModalMaxWidthPx);
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
      // Mínimo bajo: con un 220 fijo, un logo apaisado dejaba franja vacía en el recorte.
      previewHeightPx: Math.max(140, Math.floor(previewHeight)),
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
    goToStepKey('payment');
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
    syncMedidasToMockup({
      medidaExacta: `${widthMm}x${heightMm}mm`,
      size: `${widthMm}x${heightMm}mm`,
      precio: q.precio_link_ars,
      precio_transferencia: q.precio_transferencia_ars,
      approximateSizeKey: undefined,
      customSize: { width: widthMm, height: heightMm },
      tipo: 'catalogo',
    });
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

  /**
   * Complemento sugerido en el pago (solo Argentina): uno solo, según el material
   * (madera → calentador; cuero → mango de golpe o base para remachadora según la medida).
   */
  const selectedStampMm =
    data.customSize && data.customSize.width > 0 && data.customSize.height > 0
      ? data.customSize
      : parseSizeMm(data.selectedSize ?? '');
  const addonSuggestion = isInternationalMarket
    ? null
    : getWizardAddonSuggestion(data.material, selectedStampMm, data.usoSlug);
  const shownAddonSlug = addonSuggestion
    ? addonSlug && addonSlug === addonSuggestion.alternative
      ? addonSlug
      : addonSuggestion.primary
    : null;
  const wizardAddon = shownAddonSlug ? resolveWizardAddon(shownAddonSlug, data.usoSlug) : null;
  const otherAddonSlug = addonSuggestion?.alternative
    ? shownAddonSlug === addonSuggestion.primary
      ? addonSuggestion.alternative
      : addonSuggestion.primary
    : null;
  const alternativeAddon = otherAddonSlug ? resolveWizardAddon(otherAddonSlug) : null;
  const addonInOrder = Boolean(wizardAddon && addonAdded);

  // Si cambia el material o la medida y la sugerencia es otra, se arranca de cero.
  useEffect(() => {
    setAddonSlug(null);
    setAddonAdded(false);
  }, [addonSuggestion?.primary]);

  useEffect(() => {
    if (currentStepKey !== 'payment' || data.needsManualPreview || !wizardAddon) return;
    if (addonShownRef.current) return;
    addonShownRef.current = true;
    trackWizardDetail('wizard_addon_shown', { accesorio: wizardAddon.accessory.slug });
  }, [currentStepKey, data.needsManualPreview, wizardAddon, trackWizardDetail]);

  const handleAddonToggle = () => {
    if (!wizardAddon) return;
    const next = !addonAdded;
    setAddonAdded(next);
    trackWizardDetail(next ? 'wizard_addon_added' : 'wizard_addon_removed', {
      accesorio: wizardAddon.accessory.slug,
    });
  };

  const handleAddonSwitch = () => {
    if (!otherAddonSlug || !wizardAddon) return;
    if (addonAdded) {
      trackWizardDetail('wizard_addon_removed', { accesorio: wizardAddon.accessory.slug });
    }
    setAddonAdded(false);
    setAddonSlug(otherAddonSlug);
  };

  /** Sellos que ya hay en el carrito (de antes o de "Agregar otro sello"). */
  const stampsInCart = countStampUnits(cartItems);
  /** Envío gratis desde 3 sellos contando los del carrito + los de este paso (solo Argentina). */
  const wizardFreeShipping =
    !isInternationalMarket && stampsInCart + wizardQty >= FREE_SHIPPING_MIN_STAMPS;
  const effectiveShippingCost = wizardFreeShipping ? 0 : shippingCost;

  /**
   * Lleva al checkout el sello configurado en el wizard. Con `anotherStamp`, en vez de ir a
   * pagar lo deja en el carrito y vuelve al paso Logo para armar el próximo sello, sin volver
   * a pedir uso ni datos de contacto.
   */
  const handleAddWizardToCheckout = (
    metodo: CheckoutMetodoPagoPrefill = 'Openpay',
    options: { anotherStamp?: boolean } = {}
  ) => {
    const price = isInternationalMarket
      ? displayWizardProductPrice(
          data.selectedPrice ?? 0,
          data.selectedTransferPrice ?? 0,
          market
        )
      : metodo === 'Transferencia'
        ? data.selectedTransferPrice ?? 0
        : data.selectedPrice;
    if (!price || !data.material || checkoutNavigateBusy) return;
    if (!data.selectedSize?.trim()) return;
    setCheckoutNavigateBusy(true);
    if (!isInternationalMarket && data.nombre?.trim() && data.whatsapp?.trim()) {
      saveCheckoutPrefill({
        nombre: data.nombre.trim(),
        whatsapp: data.whatsapp.trim(),
        email: (data.email || '').trim(),
        metodoPago: metodo,
      });
    }
    if (!isInternationalMarket) {
      saveCheckoutShipping(shippingMethod, effectiveShippingCost);
    }
    const variantSize = data.selectedSize;
    const materialLabel = wizardUsoDisplayLabel(data);
    const designSlug = `personalizado-${Date.now()}`;
    const marketConfig = getMarketConfig(market);
    const mid = mockupSolicitudIdRef.current;
    const cartLine = {
      title: `Sello personalizado (${materialLabel}, ${variantSize})`,
      collection: 'Personalizado',
      material: 'Bronce',
      process: wizardStampProcess(data.usoSlug, data.material),
      variantSize,
      price,
      image: wizardCartImageUrl(data),
      designSlug,
      ...(data.usoSlug ? { usoSlug: data.usoSlug } : {}),
      logoStatus: 'subido' as const,
      // Cada sello lleva su propia muestra: un pedido puede tener varios logos.
      ...(mid ? { mockupSolicitudId: mid } : {}),
      ...(isInternationalMarket
        ? { market, currency: marketConfig.currency }
        : {}),
    };
    syncMedidasToMockup();
    addItem(cartLine, { qty: wizardQty, openDrawer: false });
    // Complemento agregado en el pago: misma línea que la ficha del accesorio.
    const addonLine =
      !isInternationalMarket && addonInOrder && wizardAddon
        ? buildWizardAddonCartLine(wizardAddon, metodo)
        : null;
    if (addonLine) addItem(addonLine, { openDrawer: false });
    if (mid) {
      void markCheckoutStarted(mid, addonLine ? [cartLine, addonLine] : [cartLine]);
    }
    clearWizardDraft();
    void trackEvent('add_to_cart', {
      metadata: {
        origen: 'generador',
        uso: data.usoSlug ?? data.material ?? null,
        qty: wizardQty,
        otro_sello: Boolean(options.anotherStamp),
      },
    });

    if (options.anotherStamp) {
      // Próximo sello: mismo uso y mismos datos de contacto; logo, medida y muestra nuevos.
      mockupSolicitudIdRef.current = null;
      textLogoRef.current = null;
      setDraftLogoUrl(null);
      setAnalysisError(null);
      setPaymentMethod(null);
      setAddonAdded(false);
      setWizardQty(1);
      setCheckoutNavigateBusy(false);
      setData((prev) => ({
        material: prev.material,
        usoSlug: prev.usoSlug,
        nombre: prev.nombre,
        whatsapp: prev.whatsapp,
        email: prev.email,
      }));
      setAnotherStampAdded(`${wizardQty > 1 ? `${wizardQty}× ` : ''}${materialLabel}, ${variantSize}`);
      goToStepKey('logo');
      return;
    }

    window.setTimeout(() => {
      router.push(isInternationalMarket ? marketPath(market, '/checkout') : '/checkout');
    }, 0);
  };

  /**
   * "No tengo logo" por WhatsApp: un vendedor asesora y arma un diseño simple. Convive con
   * el logo de texto dentro de la web (`WizardTextLogo`), para quien quiere algo más elaborado.
   */
  /** "Comprar sin muestra": ficha del uso con el bloque de compra por tamaño (solo Argentina). */
  const buyWithoutSampleHref = (() => {
    if (isInternationalMarket) return null;
    const uso =
      data.usoSlug ??
      (data.material === 'cuero' ? 'para-cuero' : data.material === 'madera' ? 'para-madera' : null);
    return uso ? `/sellos/${uso}#comprar` : '/productos';
  })();

  const noLogoWhatsappUrl = (() => {
    const phone = String(config.whatsapp.number || '').replace(/\D/g, '');
    const material = wizardUsoDisplayLabel(data);
    const text = [
      'Hola Alcohn 👋 Quiero un sello de bronce personalizado pero no tengo logo.',
      material ? `Lo voy a usar en: ${material}.` : null,
      '¿Me ayudan a armar el diseño?',
    ]
      .filter(Boolean)
      .join(' ');
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  })();

  /**
   * "Terminar más tarde": abre WhatsApp con un link para retomar. Sirve aunque se abra
   * en otro navegador (lo restaura `?retomar=`), y la persona queda como contacto.
   */
  const saveLaterWhatsappUrl = (() => {
    const phone = String(config.whatsapp.number || '').replace(/\D/g, '');
    const params = new URLSearchParams();
    for (const key of ['mode', 'product', 'material', 'uso', 'variant']) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
    if (!params.get('mode') && !params.get('product')) params.set('mode', 'custom');
    if (mockupSolicitudIdRef.current) params.set('retomar', mockupSolicitudIdRef.current);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.alcohnsellos.com';
    const link = `${origin}${pathname ?? '/buy'}?${params.toString()}`;
    const material = wizardUsoDisplayLabel(data);
    const text = [
      `Hola Alcohn 👋 Estoy armando mi sello${material ? ` para ${material}` : ''} en la web y no tengo el logo a mano.`,
      `Lo sigo más tarde desde acá: ${link}`,
      'Si prefieren, les mando el logo por este chat.',
    ].join('\n');
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  })();

  /**
   * Paso medida: primera vez que se ve el precio. Para quien duda, una salida a
   * WhatsApp con lo que eligió, así el equipo responde sin volver a preguntar.
   */
  const sizeDoubtsWhatsappUrl = (sizeLabel: string, price: number) => {
    const phone = String(config.whatsapp.number || '').replace(/\D/g, '');
    const material = wizardUsoDisplayLabel(data);
    const text = [
      'Hola Alcohn 👋 Hice mi muestra en la web y tengo una duda antes de comprar.',
      material ? `Material: ${material}.` : null,
      sizeLabel ? `Medida: ${sizeLabel}.` : null,
      price > 0 ? `Precio: ${formatMarketMoney(price, market)}.` : null,
      data.nombre ? `Soy ${data.nombre}.` : null,
    ]
      .filter(Boolean)
      .join('\n');
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const handleSizeDoubtsClick = (sizeLabel: string) => {
    pushGtmEvent('click_whatsapp', { ubicacion: 'wizard_medida', market });
    void trackEvent('whatsapp_click', {
      metadata: {
        ubicacion: 'wizard_medida',
        material: data.material ?? null,
        medida: sizeLabel || null,
        navegador: getBrowserKind(),
        mockup_solicitud_id: mockupSolicitudIdRef.current,
      },
    });
  };

  const sizeTrustLine = isInternationalMarket
    ? 'Bronce macizo · Garantía de por vida · Envío DHL con seguimiento'
    : `Bronce macizo · Garantía de por vida · Listo en ${config.production.days * 24} hs hábiles · Factura C`;

  const handleSaveLaterClick = () => {
    trackWizardDetail('wizard_save_later', { material: data.material ?? null });
    pushGtmEvent('click_whatsapp', { ubicacion: 'wizard_terminar_mas_tarde', market });
  };

  const handleNoLogoWhatsappClick = () => {
    pushGtmEvent('click_whatsapp', { ubicacion: 'wizard_sin_logo', market });
    void trackEvent('whatsapp_click', {
      metadata: { ubicacion: 'wizard_sin_logo', material: data.material ?? null },
    });
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
      pushGtmEvent('click_whatsapp', { ubicacion: 'buy_wizard', market });
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('[wizard] solicitar corrección por whatsapp', error);
      setAnalysisError('No se pudo abrir WhatsApp para solicitar la corrección. Probá nuevamente.');
    } finally {
      setIsRequestingCorrection(false);
    }
  };

  return (
    <div ref={wizardRef} className="buy-wizard mx-auto flex h-full max-w-5xl flex-col">
      <WizardMobileHeader
        steps={steps}
        currentStep={step + 1}
        onBack={step > 0 ? goToPreviousStep : undefined}
      />
      <div className="hidden md:block">
        <Stepper steps={steps} currentStep={step + 1} />
      </div>

      <div className="wizard-mobile-body technical-sheet blueprint-sheet flex min-h-0 flex-1 flex-col overflow-hidden md:p-8 lg:p-10">
        <div className="mb-4 hidden grid-cols-1 items-end gap-3 border-b border-[var(--alcohn-line)] pb-3 md:mb-8 md:grid md:grid-cols-[1fr_auto] md:gap-4 md:pb-6">
          <div>
            <p className="craft-label mb-2">Ficha de pedido personalizada</p>
            <h2 className="text-[1.95rem] font-semibold tracking-tight text-neutral-950 md:text-3xl">
              Diseñá, revisá y pagá con datos guardados
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold uppercase text-neutral-500 md:text-right">
            <span className="border border-dashed border-[var(--alcohn-line)] bg-white/70 px-3 py-2">Logo</span>
            <span className="border border-dashed border-[var(--alcohn-line)] bg-white/70 px-3 py-2">Precio</span>
          </div>
        </div>

        {/* Material */}
        {currentStepKey === 'material' && (
          <div className="wizard-step h-full overflow-y-auto md:space-y-6 md:[animation:none]">
            <div className="wizard-step-heading">
              <h2 className="mb-1 text-[21px] font-semibold tracking-tight text-neutral-950 md:mb-2 md:text-2xl">
                ¿Qué querés marcar?
              </h2>
              <p className="text-[13.5px] text-neutral-600 md:text-base">
                {/* Qué viene después, sin precio: el valor se construye paso a paso. */}
                <span className="md:hidden">
                  Tocá una opción y mirá cómo queda tu sello con tu logo. Gratis y sin compromiso.
                </span>
                <span className="hidden md:inline">
                  Elegí el uso principal y mirá cómo queda tu sello con tu logo. Gratis y sin
                  compromiso.
                </span>
              </p>
            </div>
            {/* Cuero y Madera solos y con foto; el resto de los usos, dentro de "Otros". */}
            <div className="grid grid-cols-2 gap-2.5 md:gap-4">
              {mainMaterialOptions.map((option) => {
                const isSelected = data.usoSlug === option.slug;
                return (
                  <button
                    key={option.slug}
                    type="button"
                    onClick={() => handleMaterialSelect(option)}
                    className={`group flex flex-col justify-start overflow-hidden border bg-[var(--alcohn-surface)] text-left transition-colors ${
                      isSelected
                        ? 'border-[var(--alcohn-ink)] shadow-[inset_0_0_0_1px_var(--alcohn-ink)]'
                        : 'border-[var(--alcohn-line)] hover:border-neutral-400'
                    }`}
                  >
                    <span className="relative block aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                      <Image
                        src={option.image}
                        alt={`Sello marcado en ${option.materialLabel.toLowerCase()}`}
                        fill
                        sizes="(min-width: 768px) 320px, 45vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        priority
                      />
                    </span>
                    <span className="block px-3 py-3 md:px-5 md:py-4">
                      <span className="block text-[16px] font-semibold leading-tight text-neutral-950 md:text-lg">
                        {option.materialLabel}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-neutral-500 md:text-sm">
                        {option.shortDescription}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2.5 md:mt-0">
              <button
                type="button"
                onClick={() => {
                  setShowOtherUses((open) => {
                    if (!open) trackWizardDetail('wizard_otros_open');
                    return !open;
                  });
                }}
                aria-expanded={showOtherUses || otherUseSelected}
                className={`flex min-h-[64px] w-full items-center justify-between gap-3 border bg-[var(--alcohn-surface)] px-3 py-3 text-left md:px-5 ${
                  otherUseSelected
                    ? 'border-[var(--alcohn-ink)] shadow-[inset_0_0_0_1px_var(--alcohn-ink)]'
                    : 'border-[var(--alcohn-line)] hover:border-neutral-400'
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-[16px] font-semibold leading-tight text-neutral-950 md:text-lg">
                    Otros
                  </span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-neutral-500 md:text-sm">
                    {otherMaterialOptions.map((o) => o.materialLabel).join(', ')}.
                  </span>
                </span>
                <span aria-hidden className="shrink-0 text-lg text-neutral-500">
                  {showOtherUses || otherUseSelected ? '−' : '+'}
                </span>
              </button>
              {(showOtherUses || otherUseSelected) && (
                <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
                  {otherMaterialOptions.map((option) => {
                    const isSelected = data.usoSlug === option.slug;
                    return (
                      <button
                        key={option.slug}
                        type="button"
                        onClick={() => handleMaterialSelect(option)}
                        className={`wizard-opt-card flex min-h-[64px] flex-col justify-center gap-0.5 border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] px-3 py-3 text-left md:px-5 md:py-4 ${
                          isSelected ? 'is-selected border-[var(--alcohn-ink)] shadow-[inset_0_0_0_1px_var(--alcohn-ink)]' : 'hover:border-neutral-400 hover:bg-white'
                        }`}
                      >
                        <span className="wizard-opt-card__title text-[14.5px] font-semibold leading-tight text-neutral-950 md:text-base">
                          {option.materialLabel}
                        </span>
                        <span className="wizard-opt-card__hint text-[11px] leading-snug text-neutral-500 md:mt-1 md:text-sm">
                          {option.shortDescription}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="wizard-trust-strip md:hidden">
              <span>Muestra gratis</span>
              <span>Bronce macizo</span>
              <span>
                {market === 'ar'
                  ? 'Envíos a todo el país'
                  : `Envío DHL a ${getMarketConfig(market).countryName}`}
              </span>
            </div>
            <div className="mt-1 flex justify-center md:mt-4 md:justify-start">
              <GoogleReviewsBadge />
            </div>
          </div>
        )}

        {resumedFrom && (currentStepKey === 'logo' || currentStepKey === 'contact') && (
          <div className="mb-3 flex items-center justify-between gap-3 border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] px-3 py-2 text-[12.5px] text-neutral-700">
            <span>Seguís donde lo dejaste.</span>
            <button
              type="button"
              onClick={handleStartOver}
              className="min-h-[36px] shrink-0 font-semibold text-neutral-900 underline underline-offset-2"
            >
              Empezar de nuevo
            </button>
          </div>
        )}

        {/* Logo */}
        {currentStepKey === 'logo' && (
          <div className="wizard-step h-full overflow-y-auto md:space-y-6 md:[animation:none]">
            {(anotherStampAdded || stampsInCart > 0) && !data.logoPreview && (
              <div className="wizard-notice wizard-notice--green flex items-start justify-between gap-3">
                <p className="text-[13px] leading-snug">
                  {anotherStampAdded ? (
                    <>
                      <strong className="font-semibold">✓ Agregamos tu sello</strong> ({anotherStampAdded}).
                      Ahora subí el logo del próximo.
                    </>
                  ) : (
                    <>
                      Tenés {stampsInCart} {stampsInCart === 1 ? 'sello' : 'sellos'} en el carrito.
                    </>
                  )}
                </p>
                <a href={marketPath(market, '/carrito')} className="shrink-0 text-[12.5px] font-semibold underline underline-offset-2">
                  Ver carrito
                </a>
              </div>
            )}
            <div className="wizard-step-heading">
              <h2 className="mb-1 text-[21px] font-semibold tracking-tight text-neutral-950 md:mb-2 md:text-2xl">
                <span className="md:hidden">¿Cómo armamos tu sello?</span>
                <span className="hidden md:inline">Subir logo</span>
              </h2>
              <p className="text-[13.5px] text-neutral-600 md:text-base">
                <span className="md:hidden">Elegí una opción. Con tu logo te mostramos cómo queda, gratis.</span>
                <span className="hidden md:inline">
                  PNG, JPG o SVG · ideal con fondo transparente. No hace falta que sea perfecto: lo optimizamos gratis.
                </span>
              </p>
            </div>
            <div className="wizard-dropzone border border-dashed border-[var(--alcohn-line-strong)] bg-[var(--alcohn-surface)] text-center transition-colors hover:border-neutral-400 max-md:!py-5 md:border-gray-300 md:p-12">
              <input
                type="file"
                id="logo-upload"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={isApplyingLogoCrop}
              />
              <label
                htmlFor="logo-upload"
                onClick={() => trackWizardDetail('logo_picker_open', { fuente: 'galeria' })}
                className={`block ${isApplyingLogoCrop ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
              >
                {data.logoPreview ? (
                  <div className="space-y-4">
                    <div className="relative mx-auto h-32 w-32">
                      <Image
                        src={data.logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <p className="text-sm text-neutral-600">
                      Tocá para cambiar el logo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-[52px] w-[52px] items-center justify-center border border-dashed border-[rgba(184,132,79,0.55)] bg-[rgba(184,132,79,0.08)] text-[22px] text-neutral-900">
                      ↑
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-neutral-900">
                        <span className="md:hidden">Subir mi logo</span>
                        <span className="hidden md:inline">Tocá para subir tu logo</span>
                      </p>
                      <p className="mt-1 font-mono text-[10.5px] text-neutral-500">
                        PNG, JPG o SVG<span className="md:hidden"> · lo mejoramos gratis</span>
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
            {!data.logoPreview && (
              <div className="md:hidden">
                {/* `capture` abre la cámara directo: para quien tiene el logo impreso (etiqueta, tarjeta, bolsa). */}
                <input
                  type="file"
                  id="logo-camera"
                  accept="image/*"
                  capture="environment"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isApplyingLogoCrop}
                />
                <label
                  htmlFor="logo-camera"
                  onClick={() => trackWizardDetail('logo_picker_open', { fuente: 'camara' })}
                  className={`flex min-h-[52px] items-center gap-3 border border-[var(--alcohn-line-strong)] bg-white px-3 py-2 text-[13.5px] font-semibold text-neutral-900 ${
                    isApplyingLogoCrop ? 'cursor-wait opacity-50' : 'cursor-pointer'
                  }`}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h3l2-2.5h6L17 8h3v11H4z" />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>
                  <span className="text-left">
                    Sacarle una foto a mi logo
                    <span className="block text-[11.5px] font-normal text-neutral-500">
                      De frente y con buena luz. Después la recortás.
                    </span>
                  </span>
                </label>
              </div>
            )}
            {/* Sin archivo: arma el logo con el nombre de la marca y sigue por el mismo camino. */}
            {(!data.logoPreview || textLogoStyle) && (
              <WizardTextLogo
                disabled={isApplyingLogoCrop}
                onOpen={() => trackWizardDetail('logo_text_open')}
                onConfirm={handleTextLogoConfirm}
              />
            )}
            {!data.logoPreview && analysisError && (
              <p role="alert" className="text-[13px] text-red-700">
                {analysisError}
              </p>
            )}
            {/* Navegador interno de Instagram/Facebook: el logo suele estar en otra app. */}
            {!data.logoPreview && isInAppBrowser(browserKind) && (
              <div className="border border-dashed border-[var(--alcohn-line-strong)] bg-[var(--alcohn-surface)] p-3 md:hidden">
                <p className="text-[13.5px] font-semibold text-neutral-900">
                  ¿Tu logo está en WhatsApp o en el mail?
                </p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-neutral-600">
                  Guardalo en la galería sin cerrar esta ventana y volvé a Instagram: seguís donde
                  estabas.
                </p>
                <a
                  href={saveLaterWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleSaveLaterClick}
                  className="mt-2 inline-flex min-h-[44px] items-center gap-2 text-[13.5px] font-semibold text-neutral-900 underline decoration-[var(--alcohn-bronze)] underline-offset-4"
                >
                  Terminar más tarde por WhatsApp →
                </a>
                <p className="text-[11.5px] text-neutral-500">Te guardamos el link en el chat.</p>
              </div>
            )}
            {!data.logoPreview && (
              /* Opción con el mismo peso que las demás (antes era un link al pie, fuera de pantalla). */
              <a
                href={noLogoWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleNoLogoWhatsappClick}
                className="flex min-h-[52px] items-center gap-3 border border-[var(--alcohn-line-strong)] bg-white px-3 py-2 text-left"
              >
                <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f8f4e] text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-semibold text-neutral-900 md:text-sm">
                    Prefiero que me ayuden por WhatsApp
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-neutral-600 md:text-sm">
                    Lo armamos juntos con tu nombre o tu marca.
                  </span>
                </span>
                <span aria-hidden className="ml-auto shrink-0 text-neutral-400">→</span>
              </a>
            )}
            {data.logoPreview && (
              <div className="wizard-notice wizard-notice--green md:rounded-lg md:border-solid md:border-blue-200 md:bg-blue-50 md:text-blue-800">
                <span className="md:hidden" aria-hidden>✓</span>
                <div>
                  <p className="text-sm font-medium md:text-blue-900">
                    <span className="md:hidden">Logo listo.</span>
                    <span className="hidden md:inline">Logo listo</span>
                  </p>
                  <p className="mt-0.5 text-[12.5px] md:mt-1 md:text-xs md:text-blue-800">
                    <span className="md:hidden">
                      En el próximo paso te pedimos tus datos para enviarte la muestra digital gratis.
                    </span>
                    <span className="hidden md:inline">
                      En el siguiente paso pedimos tus datos y generamos la muestra digital con IA.
                    </span>
                  </p>
                </div>
              </div>
            )}

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
                      Si tu imagen tiene bordes o fondo de más, ajustá el recuadro. Si no, seguí sin recortar.
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

                  {/* Lo habitual es seguir sin recortar: va primero en celular y a la derecha en desktop. */}
                  <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
                    <button
                      type="button"
                      onClick={handleUseLogoWithoutCrop}
                      disabled={isApplyingLogoCrop}
                      className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-70 md:order-last md:min-h-[44px]"
                    >
                      Usar sin recortar
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyLogoCrop}
                      disabled={isApplyingLogoCrop}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[var(--alcohn-line)] px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isApplyingLogoCrop ? 'Aplicando recorte...' : 'Aplicar recorte'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingLogoUpload(null);
                        setPendingLogoAspectRatio(1);
                        trackWizardDetail('logo_crop', { accion: 'cancelar' });
                      }}
                      disabled={isApplyingLogoCrop}
                      className="inline-flex min-h-[40px] items-center justify-center px-4 py-2 text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 md:order-first"
                    >
                      Elegir otra imagen
                    </button>
                  </div>
                </div>
              </div>
            )}

            {data.logoPreview && (
              <button
                type="button"
                onClick={() => goToStepKey('contact')}
                className="wizard-cta-btn sticky bottom-0 z-20 md:rounded-md md:text-sm md:tracking-wider"
              >
                Continuar →
              </button>
            )}
          </div>
        )}

        {/* Contacto */}
        {currentStepKey === 'contact' && (
          <ContactStep
            nombre={data.nombre || ''}
            whatsapp={data.whatsapp || ''}
            email={data.email || ''}
            onSubmit={handleContactSubmit}
            logoUrl={data.logoPreview}
            onChangeLogo={() => goToStepKey('logo')}
            isProcessing={isContactProcessing || data.isAnalyzing || data.isOptimizing}
            processingMessage={contactProcessingMessage}
          />
        )}

        {/* Medida */}
        {currentStepKey === 'size' && (
          <div className="flex min-h-0 flex-1 flex-col md:block">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto md:space-y-6 md:overflow-visible">
            <div className="wizard-step-heading">
              <h2 className="text-[21px] font-semibold tracking-tight text-neutral-950 md:mb-2 md:text-2xl">
                <span className="md:hidden">Elegí la medida</span>
                <span className="hidden md:inline">Elegir medida</span>
              </h2>
              <p className="mt-1 text-[13.5px] text-neutral-600 md:hidden">
                {isInternationalMarket
                  ? 'Precio del producto en tu moneda local. El envío DHL se suma en el checkout.'
                  : 'Precio final, sin sorpresas. 15% de descuento pagando por transferencia.'}
              </p>
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
                  {data.selectedPrice ? (
                    <span className="ml-2">
                      -{' '}
                      {formatMarketMoney(
                        displayWizardProductPrice(
                          data.selectedPrice,
                          data.selectedTransferPrice ?? 0,
                          market
                        ),
                        market
                      )}
                    </span>
                  ) : null}
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
                syncMedidasToMockup({
                  medidaExacta: option.size,
                  size: approx
                    ? ({ pequeño: 'Pequeño', medio: 'Mediano', grande: 'Grande' } as const)[approx]
                    : option.size,
                  approximateSizeKey: approx,
                  precio: option.price,
                  precio_transferencia: option.transferPrice,
                  customSize: undefined,
                  tipo: 'catalogo',
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
                      syncMedidasToMockup({
                        medidaExacta: option.size,
                        precio: q.precio_link_ars,
                        precio_transferencia: q.precio_transferencia_ars,
                      });
                    });
                  }
                }
              };

              return (
                <>
                  <div className="space-y-3 md:hidden">
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
                        {tierOptions.some(
                          (o) => o.recommended && !data.customSize && o.size === data.selectedSize
                        ) && (
                          <p className="-mt-1 text-[12px] leading-snug text-neutral-600">
                            <span className="font-semibold text-[var(--alcohn-bronze-dark)]">
                              ✓ Recomendada:
                            </span>{' '}
                            medida ajustada a las proporciones de tu diseño.
                          </p>
                        )}
                        <WizardSizeCompareScale
                          options={tierOptions}
                          selectedSize={data.selectedSize}
                          logoUrl={logoForScale}
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
                          className="flex min-h-[44px] w-full items-center justify-center border border-[var(--alcohn-line-strong)] bg-white px-4 text-[13.5px] font-semibold text-neutral-900"
                        >
                          Quiero otra medida
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="border border-[var(--alcohn-ink)] bg-[var(--alcohn-surface)] p-3 shadow-[inset_0_0_0_1px_var(--alcohn-ink)]">
                          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-neutral-700">
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
                      const localPrice = displayWizardProductPrice(
                        option.price,
                        transfer,
                        market
                      );
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
                              Recomendada
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
                              {formatMarketMoney(localPrice, market)}
                            </div>
                            {!isInternationalMarket && (
                              <>
                                <div className="text-xs text-gray-600">
                                  o {INSTALLMENTS_WITHOUT_INTEREST} cuotas sin interés de{' '}
                                  {formatMarketMoney(installmentAmountArs(option.price, 'link'), market)}
                                </div>
                                <div className="text-xs font-medium text-green-600">
                                  Transferencia (15% off): {formatMarketMoney(transfer, market)}
                                </div>
                              </>
                            )}
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
                        <strong>Precio:</strong>{' '}
                        {formatMarketMoney(
                          displayWizardProductPrice(
                            data.selectedPrice,
                            data.selectedTransferPrice ?? 0,
                            market
                          ),
                          market
                        )}
                      </p>
                      {!isInternationalMarket && (
                        <>
                          <p className="text-xs text-gray-600">
                            o {INSTALLMENTS_WITHOUT_INTEREST} cuotas sin interés de{' '}
                            {formatMarketMoney(installmentAmountArs(data.selectedPrice, 'link'), market)}
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            Transferencia (15% off):{' '}
                            {formatMarketMoney(data.selectedTransferPrice ?? 0, market)}
                          </p>
                        </>
                      )}
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
            const usingCustom =
              Boolean(data.customSize && data.customSize.width > 0 && data.customSize.height > 0);
            const sizeLabel = usingCustom
              ? `${data.customSize!.width}×${data.customSize!.height} mm`
              : data.selectedSize?.replace(/mm$/i, ' mm') ?? '';
            const localPrice = displayWizardProductPrice(
              data.selectedPrice ?? 0,
              data.selectedTransferPrice ?? 0,
              market
            );
            // Precio con tarjeta (selectedPrice) / 3, igual que el checkout.
            const localCuota =
              localPrice > 0 ? installmentAmountArs(data.selectedPrice ?? 0, 'link') : 0;
            const showSummary = Boolean(sizeLabel && localPrice > 0);

            return (
              <div className="wizard-mobile-cta shrink-0 border-t border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] shadow-[0_-10px_24px_rgba(17,16,14,0.07)] md:hidden">
                {showSummary && (
                  <div className="px-4 pb-1 pt-2.5">
                    <div className="flex items-baseline justify-between gap-2 py-0.5 text-[13.5px]">
                      <span className="text-neutral-600">Medida</span>
                      <span className="font-semibold tabular-nums text-neutral-950">{sizeLabel}</span>
                    </div>
                    {isInternationalMarket ? (
                      <div className="flex items-baseline justify-between gap-2 py-0.5 text-[13.5px] text-emerald-700">
                        <span>Precio</span>
                        <span className="font-semibold tabular-nums">
                          {formatMarketMoney(localPrice, market)}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-between gap-2 py-0.5 text-[13.5px]">
                          <span className="text-neutral-600">Precio con tarjeta</span>
                          <span className="text-right font-semibold tabular-nums text-neutral-950">
                            {formatMarketMoney(localPrice, market)}
                            <small className="mt-0.5 block text-[11px] font-medium text-neutral-600">
                              o {INSTALLMENTS_WITHOUT_INTEREST} cuotas sin interés de{' '}
                              {formatMarketMoney(localCuota, market)}
                            </small>
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-2 py-0.5 text-[13.5px] text-emerald-700">
                          <span>Transferencia (15% off)</span>
                          <span className="font-semibold tabular-nums">
                            {formatMarketMoney(data.selectedTransferPrice ?? 0, market)}
                          </span>
                        </div>
                      </>
                    )}
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-neutral-500">
                      {sizeTrustLine}
                    </p>
                  </div>
                )}
                <div className="px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
                  {data.selectedSize && data.selectedPrice ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleSizeSelect(
                          data.selectedSize!,
                          data.selectedPrice!,
                          data.selectedTransferPrice
                        )
                      }
                      className="wizard-cta-btn"
                    >
                      Elegir cómo pagar →
                    </button>
                  ) : (
                    <button type="button" disabled className="wizard-cta-btn">
                      Elegí una medida para continuar
                    </button>
                  )}
                  <a
                    href={sizeDoubtsWhatsappUrl(sizeLabel, showSummary ? localPrice : 0)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSizeDoubtsClick(sizeLabel)}
                    className="mt-1 flex min-h-[40px] items-center justify-center text-[12.5px] font-medium text-neutral-600 underline decoration-[var(--alcohn-bronze)] underline-offset-4"
                  >
                    ¿Dudas? Consultanos por WhatsApp
                  </a>
                </div>
              </div>
            );
          })()}
          </div>
        )}

        {/* Vista previa */}
        {currentStepKey === 'preview' && (
          <>
            {analysisError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">Aviso al procesar el logo</p>
                <p className="mt-1 text-xs text-red-700">{analysisError}</p>
              </div>
            )}
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
                      <div className="mx-auto max-w-xl text-center">
                        <p className="text-sm text-gray-600">
                          ¿Ves algo mal en tu muestra? Mandanos un WhatsApp y lo corregimos.
                        </p>
                        <button
                          type="button"
                          onClick={handleRequestPreviewCorrection}
                          disabled={isRequestingCorrection}
                          className="mt-3 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2 text-sm font-medium text-[#128C7E] transition-colors hover:bg-[#25D366]/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <svg
                            className="h-4 w-4 shrink-0"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          {isRequestingCorrection
                            ? 'Abriendo WhatsApp...'
                            : 'Pedir un ajuste por WhatsApp'}
                        </button>
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

        {/* Pago */}
        {currentStepKey === 'payment' && !data.needsManualPreview && (() => {
          const transferPrice = (data.selectedTransferPrice ?? 0) * wizardQty;
          const cardPrice = (data.selectedPrice || 0) * wizardQty;
          const addonCard = addonInOrder && wizardAddon ? wizardAddon.linkPrice : 0;
          const addonTransfer = addonInOrder && wizardAddon ? wizardAddon.transferPrice : 0;
          const shippingCost = effectiveShippingCost;
          const cardTotal = cardPrice + shippingCost + addonCard;
          const transferTotal = transferPrice + shippingCost + addonTransfer;
          const stampsMissing = Math.max(0, FREE_SHIPPING_MIN_STAMPS - stampsInCart - wizardQty);
          const cuotaPrice = Math.round(cardTotal / 3);
          const materialDisplay = wizardUsoDisplayLabel(data);
          const clientLogo = data.logoOptimized || data.logoPreview;

          if (isInternationalMarket) {
            const productLocal = displayWizardProductPrice(
              cardPrice,
              transferPrice,
              market
            );
            const dhlShipping = getMarketConfig(market).dhlShippingAmount;
            const estimatedTotal = productLocal + dhlShipping;

            return (
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-6 md:space-y-6 md:pb-0">
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-gray-900 md:text-2xl">
                    Confirmá tu pedido internacional
                  </h2>
                  <p className="text-sm text-gray-600 md:text-base">
                    Revisá el resumen y continuá al checkout para pagar en moneda local con envío DHL.
                  </p>
                </div>

                <div className="technical-sheet space-y-4 p-5 md:p-6">
                  <div>
                    <p className="craft-label mb-2">Resumen</p>
                    <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
                      Sello personalizado listo para checkout
                    </h3>
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
                    <div className="grid grid-cols-[0.34fr_0.66fr] py-3">
                      <dt className="text-neutral-500">Producto desde</dt>
                      <dd className="font-medium text-neutral-950">
                        {formatMarketMoney(productLocal, market)}
                      </dd>
                    </div>
                    <div className="grid grid-cols-[0.34fr_0.66fr] py-3">
                      <dt className="text-neutral-500">Envío DHL</dt>
                      <dd className="font-medium text-neutral-950">
                        {formatMarketMoney(dhlShipping, market)}
                      </dd>
                    </div>
                  </dl>
                  <div className="flex items-center justify-between border-t border-[var(--alcohn-line)] pt-4 text-base font-semibold text-neutral-950">
                    <span>Total estimado</span>
                    <span>{formatMarketMoney(estimatedTotal, market)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={checkoutNavigateBusy}
                  onClick={() => handleAddWizardToCheckout()}
                  className="w-full border border-neutral-900 bg-neutral-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
                >
                  {checkoutNavigateBusy ? 'Agregando al carrito...' : 'Ir a pagar →'}
                </button>
              </div>
            );
          }
          
          return (
            <div className="min-h-0 flex-1 overflow-y-auto space-y-4 pb-6 md:space-y-6 md:pb-0">
              <div className="wizard-step-heading">
                <h2 className="mb-1 text-[21px] font-semibold tracking-tight text-neutral-950 md:mb-2 md:text-2xl">
                  <span className="md:hidden">¿Cómo querés pagar?</span>
                  <span className="hidden md:inline">Método de pago</span>
                </h2>
                <p className="text-[13.5px] text-neutral-600 md:text-base">
                  <span className="md:hidden">Elegí una opción. Después confirmás el envío y pagás.</span>
                  <span className="hidden md:inline">
                    Elegí cómo querés pagar tu sello personalizado.
                  </span>
                </p>
              </div>

              {/* Cantidad y "Agregar otro sello": varios sellos en un mismo pedido. */}
              <div className="border border-[var(--alcohn-line)] bg-white p-3 md:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-neutral-900">Cantidad</p>
                    <p className="text-[12px] leading-snug text-neutral-500">Mismo logo y medida</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setWizardQty((q) => Math.max(1, q - 1))}
                      disabled={wizardQty <= 1}
                      className="flex h-11 w-11 items-center justify-center border border-neutral-300 bg-white text-lg disabled:opacity-40"
                      aria-label="Restar un sello"
                    >
                      −
                    </button>
                    <span className="flex h-11 w-11 items-center justify-center border-y border-neutral-300 text-[15px] font-semibold" aria-live="polite">
                      {wizardQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWizardQty((q) => Math.min(99, q + 1))}
                      className="flex h-11 w-11 items-center justify-center border border-neutral-300 bg-white text-lg"
                      aria-label="Sumar un sello"
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[12.5px] leading-snug text-neutral-700">
                  {wizardFreeShipping ? (
                    <strong className="font-semibold text-emerald-700">¡Tenés envío gratis!</strong>
                  ) : (
                    <>
                      Llevando {FREE_SHIPPING_MIN_STAMPS} sellos o más, el envío es gratis
                      {stampsMissing > 0 && stampsInCart + wizardQty > 0
                        ? ` (te ${stampsMissing === 1 ? 'falta' : 'faltan'} ${stampsMissing}).`
                        : '.'}
                    </>
                  )}
                  {stampsInCart > 0 && (
                    <span className="block text-neutral-500">
                      Ya tenés {stampsInCart} {stampsInCart === 1 ? 'sello' : 'sellos'} en el carrito.
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => handleAddWizardToCheckout('Openpay', { anotherStamp: true })}
                  disabled={checkoutNavigateBusy || !data.selectedPrice}
                  className="mt-3 flex min-h-[48px] w-full items-center justify-center border border-dashed border-neutral-400 bg-white px-4 text-[13px] font-semibold uppercase tracking-wider text-neutral-900 transition-colors hover:border-neutral-900 disabled:opacity-50"
                >
                  + Agregar otro sello (otro logo o medida)
                </button>
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
                  {wizardFreeShipping && shippingMethod !== 'retiro' && (
                    <div className="flex justify-between text-xs text-emerald-700">
                      <span>Costo envío</span>
                      <span>Gratis (3 sellos o más)</span>
                    </div>
                  )}
                  {wizardQty > 1 && (
                    <div className="flex justify-between gap-3 text-xs text-neutral-600">
                      <span>Cantidad</span>
                      <span>{wizardQty} sellos</span>
                    </div>
                  )}
                  {addonInOrder && wizardAddon && (
                    <div className="flex justify-between gap-3 text-xs text-neutral-600">
                      <span>{wizardAddon.accessory.title}</span>
                      <span>${wizardAddon.linkPrice.toLocaleString('es-AR')}</span>
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
                      <dd className="font-medium text-neutral-950">
                        {getSizeDisplayText()}
                        {wizardQty > 1 ? ` · ${wizardQty} sellos` : ''}
                      </dd>
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
                        {wizardFreeShipping && shippingMethod !== 'retiro' && (
                          <p className="mt-1 text-xs text-emerald-700">Envío gratis (3 sellos o más)</p>
                        )}
                      </dd>
                    </div>
                    {addonInOrder && wizardAddon && (
                      <div className="grid grid-cols-[0.34fr_0.66fr] py-3">
                        <dt className="text-neutral-500">Complemento</dt>
                        <dd className="font-medium text-neutral-950">
                          {wizardAddon.accessory.title} · $
                          {wizardAddon.linkPrice.toLocaleString('es-AR')}
                        </dd>
                      </div>
                    )}
                    <div className="grid grid-cols-[0.34fr_0.66fr] py-3">
                      <dt className="font-semibold text-neutral-950">Total</dt>
                      <dd className="text-xl font-bold text-neutral-950">
                        ${cardTotal.toLocaleString('es-AR')}
                      </dd>
                    </div>
                  </dl>
                </div>

                <PurchaseInclusions market={market}
                  compact
                  title="Incluido con tu sello"
                  logoUrl={clientLogo}
                />
              </div>

              {/* Complemento según el uso: antes de los métodos, así los totales ya lo incluyen. */}
              {wizardAddon && (
                <WizardAddonCard
                  addon={wizardAddon}
                  added={addonAdded}
                  onToggle={handleAddonToggle}
                  paymentMethod={paymentMethod}
                  alternative={
                    alternativeAddon
                      ? { addon: alternativeAddon, onSwitch: handleAddonSwitch }
                      : null
                  }
                />
              )}

              {/* Payment Methods */}
              {!paymentMethod ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                  {/* Transferencia primero en mobile (ahorro), tarjeta después */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className="relative border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-4 text-left transition-all hover:border-[var(--alcohn-bronze)] focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 md:order-2 md:p-6"
                  >
                    {cardTotal > transferTotal && (
                      <span className="absolute -top-2.5 right-3 bg-emerald-700 px-2 py-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-wide text-white md:hidden">
                        15% de descuento
                      </span>
                    )}
                    <div className="mb-2 flex items-center justify-between gap-2 md:mb-3">
                      <h3 className="text-[15px] font-semibold text-neutral-950 md:text-base">
                        Transferencia bancaria
                      </h3>
                      <span className="block h-5 w-5 shrink-0 rounded-full border-[1.5px] border-[var(--alcohn-line-strong)]" aria-hidden />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[20px] font-bold tabular-nums text-neutral-950 md:text-2xl">
                        {cardTotal > transferTotal && (
                          <span className="mr-1.5 text-[13px] font-medium text-neutral-400 line-through md:hidden">
                            ${cardTotal.toLocaleString('es-AR')}
                          </span>
                        )}
                        ${transferTotal.toLocaleString('es-AR')}
                      </div>
                      <div className="text-[12px] text-neutral-600 md:text-sm md:text-green-600 md:font-medium">
                        <span className="md:hidden">Señás ${config.seña.amount.toLocaleString('es-AR')} ahora · el resto cuando el sello está listo</span>
                        <span className="hidden md:inline">
                          15% de descuento · Seña ${config.seña.amount.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className="relative border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-4 text-left transition-all hover:border-[var(--alcohn-bronze)] focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 md:order-1 md:p-6"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 md:mb-3">
                      <h3 className="text-[15px] font-semibold text-neutral-950 md:text-base">
                        <span className="md:hidden">Tarjeta</span>
                        <span className="hidden md:inline">Pagar con tarjeta</span>
                      </h3>
                      <span className="block h-5 w-5 shrink-0 rounded-full border-[1.5px] border-[var(--alcohn-line-strong)]" aria-hidden />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[20px] font-bold tabular-nums text-neutral-950 md:text-2xl">
                        ${cardTotal.toLocaleString('es-AR')}
                      </div>
                      <div className="text-[12px] text-neutral-600 md:text-sm md:font-medium md:text-green-600">
                        3 cuotas sin interés de ${cuotaPrice.toLocaleString('es-AR')}
                        <span className="md:hidden"> · pago seguro BBVA</span>
                      </div>
                      <div className="mt-2 hidden text-xs text-gray-500 md:block">
                        Pagá con Open Pay de BBVA
                      </div>
                    </div>
                  </button>

                  <div className="wizard-trust-strip pt-1 md:hidden">
                    <span>Pago seguro</span>
                    <span>Factura C</span>
                    <span>Garantía de por vida</span>
                  </div>
                </div>
              ) : paymentMethod === 'card' ? (
                // Pago con tarjeta - Open Pay
                <div className="space-y-6">
                  <div className="border border-[var(--alcohn-line)] bg-[var(--alcohn-paper)] p-4">
                    <p className="text-sm text-gray-800">
                      Pago seguro con tarjeta, en hasta 3 cuotas sin interés.
                    </p>
                  </div>
                  
                  {/* Aquí iría el formulario de Open Pay */}
                  <div className="bg-white border border-[var(--alcohn-line)] p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      En el próximo paso confirmás tus datos de envío y pagás con tarjeta. Tu sello
                      va con el material, la medida y el precio que elegiste.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAddWizardToCheckout('Openpay')}
                      disabled={checkoutNavigateBusy || !data.selectedPrice}
                      className="block w-full text-center px-4 py-3 text-sm leading-snug bg-[var(--alcohn-ink)] text-white border border-[var(--alcohn-ink)] font-semibold uppercase tracking-wider hover:bg-[var(--alcohn-ink-soft)] hover:border-[var(--alcohn-bronze)] transition-colors disabled:opacity-50 disabled:pointer-events-none md:px-6 md:text-base"
                    >
                      {checkoutNavigateBusy ? (
                        'Preparando pedido…'
                      ) : (
                        <>
                          <span className="md:hidden">Seguir con tarjeta →</span>
                          <span className="hidden md:inline">
                            Seguir con tarjeta →
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
                <div className="space-y-6">
                  <div className="border border-[var(--alcohn-line)] bg-[var(--alcohn-paper)] p-4">
                    <p className="text-sm text-gray-800">
                      Pagá por transferencia con <strong>15% de descuento</strong>.
                      En el próximo paso confirmás tus datos de envío y te mostramos los datos
                      bancarios para transferir y subir el comprobante.
                    </p>
                  </div>

                  <div className="bg-white border border-[var(--alcohn-line)] p-6">
                    <div className="mb-4 space-y-1">
                      <p className="text-xs uppercase tracking-wider text-neutral-500">Total transferencia</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        ${transferTotal.toLocaleString('es-AR')}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Seña a transferir: ${config.seña.amount.toLocaleString('es-AR')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddWizardToCheckout('Transferencia')}
                      disabled={checkoutNavigateBusy || !transferPrice}
                      className="block w-full text-center px-4 py-3 text-sm leading-snug bg-[var(--alcohn-ink)] text-white border border-[var(--alcohn-ink)] font-semibold uppercase tracking-wider hover:bg-[var(--alcohn-ink-soft)] hover:border-[var(--alcohn-bronze)] transition-colors disabled:opacity-50 disabled:pointer-events-none md:px-6 md:text-base"
                    >
                      {checkoutNavigateBusy ? (
                        'Preparando pedido…'
                      ) : (
                        <>
                          <span className="md:hidden">Seguir con transferencia →</span>
                          <span className="hidden md:inline">
                            Seguir con transferencia →
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
              )}
            </div>
          );
        })()}

        {/* Navigation */}
        {currentStepKey &&
          currentStepKey !== 'material' &&
          currentStepKey !== 'payment' &&
          !(currentStepKey === 'contact' && (isContactProcessing || data.isAnalyzing || data.isOptimizing)) &&
          !pendingLogoUpload && (
          <div
            className={`z-20 mt-3 flex shrink-0 items-center justify-between gap-3 border-t border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] pt-3 md:mt-4 ${
              currentStepKey === 'size' ? 'hidden md:flex' : ''
            }`}
          >
            <button
              onClick={goToPreviousStep}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center border border-[var(--alcohn-line)] bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[var(--alcohn-bronze)] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:rounded-md"
            >
              ← Atrás
            </button>
            {/* Sin logo a mano: compra directa por tamaño en la ficha y el logo va por WhatsApp. */}
            {currentStepKey === 'logo' && !data.logoPreview && buyWithoutSampleHref && (
              <a
                href={buyWithoutSampleHref}
                onClick={() => trackWizardDetail('wizard_comprar_sin_muestra', { uso: data.usoSlug ?? null })}
                className="inline-flex min-h-[52px] flex-[2] flex-col items-center justify-center bg-[var(--alcohn-ink)] px-3 py-1.5 text-center text-white transition-colors hover:bg-[var(--alcohn-ink-soft)] md:min-h-[44px] md:rounded-md"
              >
                <span className="text-[12.5px] font-semibold uppercase tracking-[0.06em]">Comprar sin muestra</span>
                <span className="text-[11px] text-white/75">y mandar el logo después</span>
              </a>
            )}
            {currentStepKey === 'preview' &&
              !data.needsManualPreview &&
              (data.previewGenerated || data.logoPreview) &&
              !data.isGeneratingMockup && (
                <button
                  onClick={() => goToStepKey('size')}
                  className="inline-flex min-h-[52px] flex-1 items-center justify-center bg-[var(--alcohn-ink)] px-5 py-2 text-[12.5px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[var(--alcohn-ink-soft)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:translate-y-px md:min-h-[44px] md:rounded-md md:bg-primary md:text-sm md:tracking-wider md:hover:bg-primary-light"
                >
                  Ver precios →
                </button>
              )}
            {currentStepKey === 'size' && data.selectedSize && data.selectedPrice && (
              <button
                onClick={() =>
                  handleSizeSelect(
                    data.selectedSize!,
                    data.selectedPrice!,
                    data.selectedTransferPrice
                  )
                }
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md border border-primary bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Elegir cómo pagar →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuyWizard(props: BuyWizardProps) {
  const { market } = useMarket();
  return localizeTree(BuyWizardContent(props), market);
}
