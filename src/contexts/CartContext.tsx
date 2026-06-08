'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, CartState, generateCartItemId, loadCartFromStorage, saveCartToStorage } from '@/lib/cart';
import { trackMetaAddToCart } from '@/lib/analytics/metaPixel';

const CartContext = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar del localStorage al montar
  useEffect(() => {
    const loadedItems = loadCartFromStorage();
    setItems(loadedItems);
    setIsHydrated(true);
  }, []);

  // Guardar en localStorage cuando cambian los items
  useEffect(() => {
    if (isHydrated) {
      saveCartToStorage(items);
    }
  }, [items, isHydrated]);

  const addItem = (item: Omit<CartItem, 'id' | 'qty'>) => {
    const id = generateCartItemId(item.designSlug, item.variantSize);

    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === id);

      if (existingItem) {
        trackMetaAddToCart({
          id,
          title: item.title,
          price: item.price,
          qty: 1,
        });
        return prevItems.map((i) =>
          i.id === id ? { ...i, qty: i.qty + 1 } : i
        );
      }

      trackMetaAddToCart({
        id,
        title: item.title,
        price: item.price,
        qty: 1,
      });
      return [...prevItems, { ...item, id, qty: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  };

  const updateVariant = (id: string, newSize: string, newPrice: number) => {
    setItems((prevItems) => {
      const item = prevItems.find((i) => i.id === id);
      if (!item) return prevItems;

      // Generar nuevo ID con la nueva variante
      const newId = generateCartItemId(item.designSlug, newSize);
      
      // Verificar si ya existe un item con ese ID
      const existingItem = prevItems.find((i) => i.id === newId);
      
      if (existingItem && existingItem.id !== id) {
        // Si ya existe, combinar cantidades y eliminar el viejo
        return prevItems
          .map((i) =>
            i.id === newId
              ? { ...i, qty: i.qty + item.qty }
              : i
          )
          .filter((i) => i.id !== id);
      }
      
      // Si no existe, actualizar el item actual
      return prevItems.map((i) =>
        i.id === id
          ? { ...i, id: newId, variantSize: newSize, price: newPrice }
          : i
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.qty, 0);
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isHydrated,
        addItem,
        removeItem,
        updateQuantity,
        updateVariant,
        clearCart,
        getTotalItems,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}


