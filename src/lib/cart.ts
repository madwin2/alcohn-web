import type { CurrencyCode, MarketCode } from '@/lib/markets/types';

// Tipos para el carrito
export interface CartItem {
  id: string; // design-slug + size (ej: "bandera-argentina-30x30mm")
  title: string;
  collection: string;
  material: string;
  process: string;
  variantSize: string;
  price: number;
  qty: number;
  image: string;
  designSlug: string; // Para poder cambiar variante después
  market?: MarketCode;
  currency?: CurrencyCode;
  /**
   * Sello personalizado comprado por tamaño desde la ficha (sin generador). El servidor
   * cotiza por grupo de precio y la medida final la define Alcohn al recibir el logo.
   */
  sizeCategory?: StampSizeCategoryKey;
  /** Uso elegido (`para-madera`, `para-pan`…): sirve para sugerir accesorios y para el pedido. */
  usoSlug?: string;
  /** `pendiente`: el cliente manda el logo por WhatsApp después de comprar. */
  logoStatus?: 'subido' | 'pendiente';
  /** Solicitud de muestra/logo asociada a ESTE sello (un pedido puede tener varios). */
  mockupSolicitudId?: string;
}

export type StampSizeCategoryKey = 'chico' | 'mediano' | 'grande';

export interface AddItemOptions {
  /** Unidades a sumar (por defecto 1). */
  qty?: number;
  /** Abre el panel del carrito con "Agregaste…" (por defecto true). */
  openDrawer?: boolean;
}

export interface CartState {
  items: CartItem[];
  isHydrated: boolean;
  addItem: (item: Omit<CartItem, 'id' | 'qty'>, options?: AddItemOptions) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  updateVariant: (id: string, newSize: string, newPrice: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDisplaySubtotal: () => number;
  /** Panel lateral del carrito (uno solo para toda la web). */
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** Última línea agregada: el panel la muestra como "Agregaste…". */
  lastAddedId: string | null;
}

/**
 * Subtotal pagando por transferencia (solo Argentina). Los precios del carrito son con
 * tarjeta (link); la transferencia tiene 15% off, igual que calcula el checkout.
 */
export const estimateTransferSubtotal = (items: Pick<CartItem, 'price' | 'qty'>[]): number =>
  items.reduce((sum, item) => sum + Math.round(item.price / 1.15) * item.qty, 0);

// Helper para generar ID único
export const generateCartItemId = (designSlug: string, size: string): string => {
  return `${designSlug}-${size}`;
};

const CART_STORAGE_KEY = 'alcohn_cart';

export const cartStorageKeyForMarket = (market: MarketCode): string =>
  market === 'ar' ? CART_STORAGE_KEY : `${CART_STORAGE_KEY}_${market}`;

export const loadCartFromStorage = (market: MarketCode = 'ar'): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(cartStorageKeyForMarket(market));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveCartToStorage = (items: CartItem[], market: MarketCode = 'ar'): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(cartStorageKeyForMarket(market), JSON.stringify(items));
  } catch {
    // Ignorar errores de localStorage
  }
};


