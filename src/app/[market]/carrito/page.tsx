'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import CartItemRow from '@/components/cart/CartItemRow';
import CartSummary from '@/components/cart/CartSummary';
import ActionButton from '@/components/ActionButton';
import { marketPath } from '@/lib/markets/paths';
import type { InternationalMarketCode } from '@/lib/markets/types';

export default function InternationalCartPage() {
  const params = useParams();
  const marketParam = typeof params.market === 'string' ? params.market : '';
  const market = (
    marketParam === 'cl' || marketParam === 'pe' || marketParam === 'co' || marketParam === 'mx'
      ? marketParam
      : null
  ) as InternationalMarketCode | null;

  const { items, getSubtotal, clearCart } = useCart();
  const subtotal = getSubtotal();
  const hasItems = items.length > 0;

  if (!market) {
    return null;
  }

  if (!hasItems) {
    return (
      <div className="atelier-page min-h-screen py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="technical-sheet mx-auto max-w-2xl p-8 py-16 text-center md:p-12">
            <h1 className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900">
              Tu carrito está vacío
            </h1>
            <p className="mb-8 text-sm text-neutral-600">Agregá productos para comenzar tu pedido.</p>
            <ActionButton href={marketPath(market, '/productos')} variant="primary">
              Ver catálogo internacional
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="atelier-page min-h-screen py-8 pb-32 md:py-16 md:pb-16">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-6 md:mb-12">
          <h1 className="mb-3 text-[2rem] font-semibold tracking-tight text-neutral-900 md:mb-4 md:text-5xl">
            Carrito
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-12 lg:grid-cols-3 lg:gap-16">
          <div className="lg:col-span-2">
            <div className="space-y-4 md:space-y-6">
              {items.map((item) => (
                <div key={item.id} className="material-card p-4 md:p-6">
                  <CartItemRow item={item} showImage />
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-neutral-200 pt-6">
              <button
                type="button"
                onClick={clearCart}
                className="text-sm text-neutral-600 underline transition-colors hover:text-neutral-900"
              >
                Vaciar carrito
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <div className="technical-sheet space-y-5 p-5 md:space-y-6 md:p-6">
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Resumen</h2>
                <CartSummary subtotal={subtotal} />
                <div className="hidden border-t border-neutral-200 pt-4 md:block">
                  <Link
                    href={marketPath(market, '/checkout')}
                    className="block w-full border border-neutral-900 bg-neutral-900 px-6 py-3 text-center text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-neutral-800"
                  >
                    Finalizar pedido
                  </Link>
                </div>
                <Link
                  href={marketPath(market, '/productos')}
                  className="block text-center text-sm text-neutral-600 underline transition-colors hover:text-neutral-900"
                >
                  Seguir comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/96 shadow-[0_-10px_30px_rgba(17,16,14,0.12)] backdrop-blur-sm lg:hidden">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <Link
            href={marketPath(market, '/checkout')}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center border border-neutral-900 bg-neutral-900 px-4 text-[12px] font-semibold uppercase tracking-wider text-white"
          >
            Finalizar pedido
          </Link>
        </div>
      </div>
    </div>
  );
}
