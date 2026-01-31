'use client';

import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import CartDrawer from './CartDrawer';

export default function CartButton() {
  const { getTotalItems } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const itemCount = getTotalItems();

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="relative inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-medium bg-white text-neutral-900 border border-white hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
        aria-label={`Carrito de compras${itemCount > 0 ? ` con ${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}` : ''}`}
      >
        <span>Carrito</span>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-neutral-900 text-white text-[10px] font-semibold rounded-full">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}


