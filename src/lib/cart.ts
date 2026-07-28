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
}

export interface CartState {
  items: CartItem[];
  isHydrated: boolean;
  addItem: (item: Omit<CartItem, 'id' | 'qty'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  updateVariant: (id: string, newSize: string, newPrice: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

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


