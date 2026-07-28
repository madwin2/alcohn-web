/**
 * Construye filas de `sellos` a partir del carrito web (Opción A: insertar
 * solo cuando el pago está confirmado).
 */

import type { CartItem } from '@/lib/cart';
import {
  getAccessoryBySlug,
  type Accessory,
  type AccessoryCode,
} from '@/data/accessories';
import type { SelloInsert, SelloItemType } from './types';

const VALID_ITEM_TYPES = new Set<SelloItemType>([
  'SELLO',
  'ABECEDARIO',
  'SOLDADOR',
  'MANGO_GOLPE',
  'BASE_REMACHADORA',
]);

const ACCESSORY_CODE_TO_ITEM_TYPE: Record<AccessoryCode, SelloItemType> = {
  soldador: 'SOLDADOR',
  mango_golpe: 'MANGO_GOLPE',
  base_remachadora: 'BASE_REMACHADORA',
};

/** Cart line persistido en `ordenes.carrito_json` (puede traer `item_type`). */
export type CartLineForDb = CartItem & {
  item_type?: SelloItemType;
};

/** Parsea medidas tipo "30x30mm", "5x3 cm", "40x40" → cm. */
export function parseVariantSizeToCm(
  variantSize: string
): { largo_real: number | null; ancho_real: number | null } {
  const normalized = variantSize
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(',', '.');
  const match = /^(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)(mm|cm)?$/i.exec(
    normalized.replace(/×/g, 'x')
  );
  if (!match) return { largo_real: null, ancho_real: null };

  let w = parseFloat(match[1]);
  let h = parseFloat(match[2]);
  const unit = (match[3] ?? 'mm').toLowerCase();
  if (unit === 'mm') {
    w = w / 10;
    h = h / 10;
  }
  if (!Number.isFinite(w) || !Number.isFinite(h)) {
    return { largo_real: null, ancho_real: null };
  }
  return { largo_real: w, ancho_real: h };
}

function accessoryItemType(accessory: Accessory): SelloItemType {
  return ACCESSORY_CODE_TO_ITEM_TYPE[accessory.code];
}

/**
 * Clasifica una línea del carrito web al `item_type` de `sellos`.
 * Prioriza `item_type` ya persistido, luego catálogo de accesorios, luego heurísticas.
 */
export function resolveItemType(item: CartLineForDb): SelloItemType {
  if (item.item_type && VALID_ITEM_TYPES.has(item.item_type)) {
    return item.item_type;
  }

  const slug = (item.designSlug ?? '').toLowerCase();
  const collection = (item.collection ?? '').toLowerCase();
  const title = (item.title ?? '').toLowerCase();

  if (slug.includes('abecedario') || collection.includes('abecedario')) {
    return 'ABECEDARIO';
  }

  const accessory = getAccessoryBySlug(slug);
  if (accessory) {
    return accessoryItemType(accessory);
  }

  if (
    collection.includes('accesorio') ||
    (item.material ?? '').toLowerCase().includes('accesorio')
  ) {
    if (
      slug.includes('calentador') ||
      slug.includes('soldador') ||
      title.includes('calentador') ||
      title.includes('soldador')
    ) {
      return 'SOLDADOR';
    }
    if (slug.includes('mango') || title.includes('mango')) {
      return 'MANGO_GOLPE';
    }
    if (
      slug.includes('base') ||
      slug.includes('remachadora') ||
      title.includes('remachadora') ||
      title.includes('base de aluminio')
    ) {
      return 'BASE_REMACHADORA';
    }
  }

  return 'SELLO';
}

function resolveTipo(item: CartLineForDb, itemType: SelloItemType): SelloInsert['tipo'] {
  if (itemType === 'ABECEDARIO') return 'ABC';
  // Accesorios no son sellos CNC: el check de DB exige un `tipo`, usamos Clasico.
  if (
    itemType === 'SOLDADOR' ||
    itemType === 'MANGO_GOLPE' ||
    itemType === 'BASE_REMACHADORA'
  ) {
    return 'Clasico';
  }
  const p = (item.process ?? '').toLowerCase();
  if (p.includes('alimento')) return 'Alimento';
  if (p.includes('lacre')) return 'Lacre';
  if (p.includes('3mm')) return '3mm';
  if (p.includes('abc')) return 'ABC';
  return 'Clasico';
}

function isPersonalizedCartLine(item: CartLineForDb): boolean {
  return (
    item.collection === 'Personalizado' ||
    (item.designSlug ?? '').startsWith('personalizado-')
  );
}

function isAccessoryItemType(itemType: SelloItemType): boolean {
  return (
    itemType === 'SOLDADOR' ||
    itemType === 'MANGO_GOLPE' ||
    itemType === 'BASE_REMACHADORA'
  );
}

/** Ítems de carrito que no son sellos fabricables (p. ej. línea de envío en Openpay). */
export function isNonSelloCartLine(item: CartItem): boolean {
  return item.id.startsWith('envio-') || item.designSlug.startsWith('envio-');
}

/** Anota `item_type` en cada línea para que la app interna no tenga que adivinar. */
export function enrichCartItemsWithItemType(items: CartItem[]): CartLineForDb[] {
  return items.map((item) => {
    if (isNonSelloCartLine(item)) return item;
    const item_type = resolveItemType(item);
    return { ...item, item_type };
  });
}

export function buildSellosInsertsFromCart(
  ordenId: string,
  items: CartItem[],
  options?: {
    mockup_solicitud_id?: string | null;
    /** Costo de envío Correo (se suma al primer sello para que valor_total lo incluya). */
    envio_costo?: number;
  }
): SelloInsert[] {
  const productItems = items.filter((item) => !isNonSelloCartLine(item));
  const envioCosto =
    typeof options?.envio_costo === 'number' && options.envio_costo > 0
      ? options.envio_costo
      : 0;

  const rows = productItems.map((item) => {
    const itemType = resolveItemType(item);
    const accessory = getAccessoryBySlug(item.designSlug);
    const isAccessory = isAccessoryItemType(itemType);
    const isPersonalized = isPersonalizedCartLine(item) && !isAccessory;

    // Accesorios no tienen medida de sello; no inventar dims desde "Único".
    const dims = isAccessory
      ? { largo_real: null, ancho_real: null }
      : parseVariantSizeToCm(item.variantSize);

    const lineTotal = item.price * Math.max(1, item.qty);
    const diseno = accessory?.title ?? item.title;

    const noteParts = isAccessory
      ? [accessory?.title ?? item.title, item.variantSize !== 'Único' ? item.variantSize : null]
      : [item.material, item.variantSize, item.process];

    return {
      orden_id: ordenId,
      valor: lineTotal,
      item_type: itemType,
      tipo: resolveTipo(item, itemType),
      estado_fabricacion: 'Sin Hacer' as const,
      estado_venta: 'Señado' as const,
      diseno,
      nota: noteParts.filter(Boolean).join(' · '),
      largo_real: dims.largo_real,
      ancho_real: dims.ancho_real,
      mockup_solicitud_id: isPersonalized
        ? options?.mockup_solicitud_id ?? null
        : null,
      item_config: {
        origen: 'web',
        item_type: itemType,
        cart_item_id: item.id,
        design_slug: item.designSlug,
        collection: item.collection,
        material_web: item.material,
        process: item.process,
        variant_size: item.variantSize,
        qty: item.qty,
        unit_price: item.price,
        line_total: lineTotal,
        image: item.image?.startsWith('data:') ? '[data-url]' : item.image,
        ...(accessory
          ? {
              accessory_code: accessory.code,
              accessory_slug: accessory.slug,
            }
          : {}),
        ...(accessory?.code === 'soldador'
          ? { soldadorPower: '200W' }
          : {}),
      },
    };
  });

  if (envioCosto > 0 && rows.length > 0) {
    // Preferir sumar el envío al primer sello fabricable (no a un accesorio).
    const stampIdx = rows.findIndex((r) => r.item_type === 'SELLO' || r.item_type === 'ABECEDARIO');
    const envioIdx = stampIdx >= 0 ? stampIdx : 0;
    rows[envioIdx].valor = Number(rows[envioIdx].valor) + envioCosto;
    const envioNote = `Envío $${envioCosto.toLocaleString('es-AR')}`;
    rows[envioIdx].nota = rows[envioIdx].nota
      ? `${rows[envioIdx].nota} · ${envioNote}`
      : envioNote;
    const cfg = rows[envioIdx].item_config as Record<string, unknown>;
    (rows[envioIdx] as SelloInsert).item_config = { ...cfg, envio_costo: envioCosto };
  }

  return rows as SelloInsert[];
}
