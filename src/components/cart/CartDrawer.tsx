'use client';

import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import CartItemRow from './CartItemRow';
import CartSummary from './CartSummary';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, getSubtotal } = useCart();

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const hasItems = items.length > 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-[60] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[60] shadow-xl flex flex-col transform transition-transform duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">
            Carrito
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
            aria-label="Cerrar carrito"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {hasItems ? (
            <div className="p-6 space-y-4">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <svg className="w-16 h-16 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-sm text-neutral-600 mb-2">Tu carrito está vacío</p>
              <Link
                href="/sellos/estandar"
                onClick={onClose}
                className="text-sm text-neutral-900 underline hover:text-neutral-600 transition-colors"
              >
                Ver diseños disponibles
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        {hasItems && (
          <div className="border-t border-neutral-200 p-6 space-y-4">
            <CartSummary subtotal={subtotal} />
            <div className="flex flex-col gap-2">
              <Link
                href="/carrito"
                onClick={onClose}
                className="w-full border border-neutral-300 bg-white text-neutral-900 px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-50 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
              >
                Ir al carrito
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full border border-neutral-900 bg-neutral-900 text-white px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
              >
                Finalizar pedido
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

