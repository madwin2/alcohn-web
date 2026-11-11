import type { CartItem } from '@/lib/cart';
import { config } from '@/lib/config';

/**
 * Sellos comprados sin logo (el cliente lo manda por WhatsApp después de pagar).
 * Se guarda al crear la orden para que la página de confirmación muestre el botón de
 * WhatsApp con el número de pedido; Alcohn sube el logo al pedido desde su panel.
 */
export type PendingLogoSnapshot = {
  orderId: string;
  stamps: string[];
};

const KEY = 'alcohn_pending_logo';

export function pendingLogoStampsFromCart(items: CartItem[]): string[] {
  return items
    .filter((i) => i.logoStatus === 'pendiente')
    .map((i) => (i.qty > 1 ? `${i.qty}× ${i.title}` : i.title));
}

export function savePendingLogoSnapshot(orderId: string, items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  const stamps = pendingLogoStampsFromCart(items);
  try {
    if (stamps.length === 0) {
      sessionStorage.removeItem(KEY);
      return;
    }
    sessionStorage.setItem(KEY, JSON.stringify({ orderId, stamps } satisfies PendingLogoSnapshot));
  } catch {
    // Sin sessionStorage la página igual ofrece WhatsApp con el número de pedido.
  }
}

export function readPendingLogoSnapshot(orderId: string | null): PendingLogoSnapshot | null {
  if (typeof window === 'undefined' || !orderId) return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingLogoSnapshot;
    return parsed.orderId === orderId && Array.isArray(parsed.stamps) ? parsed : null;
  } catch {
    return null;
  }
}

/** Mensaje de WhatsApp para mandar el logo de un pedido ya pagado. */
export function pendingLogoWhatsappUrl(orderId: string, stamps: string[]): string {
  const phone = String(config.whatsapp.number || '').replace(/\D/g, '');
  const lines = [
    `Hola Alcohn 👋 Te mando el logo para mi pedido ${orderId}.`,
    stamps.length ? `Sellos: ${stamps.join(', ')}.` : null,
    '(Adjunto el logo en este chat)',
  ].filter(Boolean);
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}
