/**
 * Construye filas de `sellos` a partir del carrito web (Opción A: insertar
 * solo cuando el pago está confirmado).
 */

import type { CartItem } from '@/lib/cart';
import type { SelloInsert, SelloItemType } from './types';

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

function resolveItemType(item: CartItem): SelloItemType {
  const slug = item.designSlug.toLowerCase();
  const collection = item.collection.toLowerCase();
  if (slug.includes('abecedario') || collection.includes('abecedario')) {
    return 'ABECEDARIO';
  }
  return 'SELLO';
}

function resolveTipo(item: CartItem): SelloInsert['tipo'] {
  const p = (item.process ?? '').toLowerCase();
  if (p.includes('alimento')) return 'Alimento';
  if (p.includes('lacre')) return 'Lacre';
  if (p.includes('3mm')) return '3mm';
  if (p.includes('abc')) return 'ABC';
  return 'Clasico';
}

export function buildSellosInsertsFromCart(
  ordenId: string,
  items: CartItem[],
  options?: { mockup_solicitud_id?: string | null }
): SelloInsert[] {
  return items.map((item) => {
    const dims = parseVariantSizeToCm(item.variantSize);
    const isPersonalized =
      item.collection === 'Personalizado' ||
      item.designSlug.startsWith('personalizado-');

    const lineTotal = item.price * Math.max(1, item.qty);

    return {
      orden_id: ordenId,
      valor: lineTotal,
      item_type: resolveItemType(item),
      tipo: resolveTipo(item),
      estado_fabricacion: 'Sin Hacer',
      estado_venta: 'Señado',
      diseno: item.title,
      nota: [item.material, item.variantSize, item.process]
        .filter(Boolean)
        .join(' · '),
      largo_real: dims.largo_real,
      ancho_real: dims.ancho_real,
      mockup_solicitud_id: isPersonalized
        ? options?.mockup_solicitud_id ?? null
        : null,
      item_config: {
        origen: 'web',
        design_slug: item.designSlug,
        collection: item.collection,
        material_web: item.material,
        process: item.process,
        variant_size: item.variantSize,
        qty: item.qty,
        unit_price: item.price,
        line_total: item.price * item.qty,
        image: item.image?.startsWith('data:') ? '[data-url]' : item.image,
      },
    };
  });
}
