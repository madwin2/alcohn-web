'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import CartItemRow from '@/components/cart/CartItemRow';
import CartSummary from '@/components/cart/CartSummary';
import ActionButton from '@/components/ActionButton';

export default function CartPage() {
  const { items, getSubtotal, clearCart } = useCart();
  const subtotal = getSubtotal();
  const hasItems = items.length > 0;

  if (!hasItems) {
    return (
      <div className="atelier-page min-h-screen py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="technical-sheet mx-auto max-w-2xl p-8 py-16 text-center md:p-12">
            <svg className="w-24 h-24 text-neutral-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h1 className="text-3xl font-semibold text-neutral-900 mb-4 tracking-tight">
              Tu carrito está vacío
            </h1>
            <p className="text-sm text-neutral-600 mb-8">
              Agregá productos para comenzar tu pedido.
            </p>
            <ActionButton href="/sellos/estandar" variant="primary">
              Ver diseños disponibles
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="atelier-page min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-4 tracking-tight">
            Carrito
          </h1>
          <div className="mt-6 technical-sheet p-5">
            <p className="text-sm text-neutral-700 mb-3">
              ¿Querés ver cómo quedaría tu logo marcado en cuero o madera antes de pagar?
            </p>
            <Link
              href="/buy?mode=custom"
              className="inline-block border border-neutral-900 bg-neutral-900 text-white px-5 py-2 text-xs font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              Generar muestra con mi logo
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Lista de items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="material-card p-6">
                  <CartItemRow item={item} showImage={true} />
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <button
                  onClick={clearCart}
                  className="text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </div>

          {/* Resumen sticky */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <div className="technical-sheet p-6 space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
                  Resumen
                </h2>
                
                <CartSummary subtotal={subtotal} />

                <div className="pt-4 border-t border-neutral-200">
                  <Link
                    href="/checkout"
                    className="block w-full border border-neutral-900 bg-neutral-900 text-white px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                  >
                    Finalizar pedido
                  </Link>
                </div>

                <Link
                  href="/sellos/estandar"
                  className="block text-center text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
                >
                  Seguir comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

