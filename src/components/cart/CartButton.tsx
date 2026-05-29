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
        className="relative inline-flex h-11 min-h-[44px] w-11 items-center justify-center px-0 py-0 bg-white text-neutral-900 border border-white hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900 sm:w-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:font-medium sm:uppercase sm:tracking-wider"
        aria-label={`Carrito de compras${itemCount > 0 ? ` con ${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}` : ''}`}
      >
        <svg className="h-5 w-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 4h2l2.4 11.2a2 2 0 002 1.6h8.2a2 2 0 002-1.55L21 8H6" />
          <circle cx="9" cy="20" r="1.4" fill="currentColor" />
          <circle cx="17" cy="20" r="1.4" fill="currentColor" />
        </svg>
        <span className="hidden sm:inline">Carrito</span>
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


