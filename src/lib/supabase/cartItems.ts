import type { CartItem } from '@/lib/cart';

const MAX_IMAGE_LEN = 2048;

/** Evita data URLs enormes en JSONB y normaliza precio/cantidad. */
export function sanitizeCartItemsForDb(items: CartItem[]): CartItem[] {
  return items.map((item) => {
    const price = typeof item.price === 'number' ? item.price : Number(item.price);
    const qtyRaw = typeof item.qty === 'number' ? item.qty : Number(item.qty);
    let image = typeof item.image === 'string' ? item.image : '';
    if (image.startsWith('data:')) {
      image =
        item.material?.toLowerCase().includes('madera') ||
        item.collection?.toLowerCase().includes('madera')
          ? '/mockup-textures/madera.jpg'
          : '/mockup-textures/cuero.jpg';
    } else if (image.length > MAX_IMAGE_LEN) {
      image = image.slice(0, MAX_IMAGE_LEN);
    }

    return {
      ...item,
      price: Number.isFinite(price) && price >= 0 ? price : 0,
      qty: Number.isFinite(qtyRaw) && qtyRaw >= 1 ? Math.min(999, Math.floor(qtyRaw)) : 1,
      image,
    };
  });
}

export function parseCartItemsFromBody(raw: unknown): CartItem[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const parsed: CartItem[] = [];
  for (const x of raw) {
    if (!x || typeof x !== 'object') return null;
    const o = x as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id : '';
    const title = typeof o.title === 'string' ? o.title : '';
    const price =
      typeof o.price === 'number'
        ? o.price
        : typeof o.price === 'string'
          ? Number(o.price)
          : NaN;
    const qty =
      typeof o.qty === 'number'
        ? o.qty
        : typeof o.qty === 'string'
          ? Number(o.qty)
          : NaN;

    if (!id || !title || !Number.isFinite(price) || price < 0 || !Number.isFinite(qty) || qty < 1) {
      return null;
    }

    parsed.push({
      id,
      title,
      collection: typeof o.collection === 'string' ? o.collection : '',
      material: typeof o.material === 'string' ? o.material : '',
      process: typeof o.process === 'string' ? o.process : '',
      variantSize: typeof o.variantSize === 'string' ? o.variantSize : '',
      price,
      qty: Math.min(999, Math.floor(qty)),
      image: typeof o.image === 'string' ? o.image : '',
      designSlug: typeof o.designSlug === 'string' ? o.designSlug : id,
    });
  }

  return sanitizeCartItemsForDb(parsed);
}
