'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useMarket } from '@/contexts/MarketContext';
import { marketBuyPath, marketPath } from '@/lib/markets/paths';
import { formatMarketMoney } from '@/lib/markets/money';
import { getCartAddonSuggestion } from '@/lib/cartAddonSuggestion';
import { buildWizardAddonCartLine } from '@/lib/wizardAddons';
import CartItemRow from './CartItemRow';
import CartSummary from './CartSummary';
import FreeShippingProgress from './FreeShippingProgress';
import { estimateTransferSubtotal } from '@/lib/cart';
import { qualifiesForFreeShipping } from '@/lib/shipping/freeShipping';

/**
 * Panel lateral del carrito. Uno solo para toda la web (estado en `CartContext`):
 * se abre al tocar el carrito y también al agregar algo, con "Agregaste…", el avance
 * hacia el envío gratis, un accesorio sugerido y "+ Agregar otro sello".
 */
export default function CartDrawer() {
  const { items, getDisplaySubtotal, isDrawerOpen, closeDrawer, lastAddedId, addItem } = useCart();
  const { market } = useMarket();
  const cartHref = marketPath(market, '/carrito');
  const checkoutHref = marketPath(market, '/checkout');
  const emptyCatalogHref = market === 'ar' ? marketPath(market, '/productos') : marketBuyPath(market);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) closeDrawer();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen, closeDrawer]);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const subtotal = getDisplaySubtotal();
  const hasItems = items.length > 0;
  const lastAdded = lastAddedId ? items.find((i) => i.id === lastAddedId) : undefined;
  const addon = market === 'ar' ? getCartAddonSuggestion(items, lastAddedId) : null;

  // "+ Agregar otro sello": a la ficha del mismo uso (si lo sabemos) o al catálogo.
  const anotherStampHref = lastAdded?.usoSlug
    ? `${marketPath(market, `/sellos/${lastAdded.usoSlug}`)}#comprar`
    : marketPath(market, '/productos');

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/30" onClick={closeDrawer} aria-hidden="true" />

      <div
        className="fixed right-0 top-0 z-[60] flex h-[100dvh] w-full max-w-md flex-col bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
            {lastAdded ? 'Agregado al carrito' : 'Carrito'}
          </h2>
          <button
            onClick={closeDrawer}
            className="inline-flex h-11 w-11 items-center justify-center rounded text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            aria-label="Cerrar carrito"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {hasItems ? (
            <div className="space-y-5 px-5 py-4">
              {lastAdded && (
                <p
                  role="status"
                  className="flex items-start gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[13.5px] leading-snug text-emerald-900"
                >
                  <span aria-hidden className="font-bold">✓</span>
                  <span>
                    Agregaste <strong className="font-semibold">{lastAdded.title}</strong>
                  </span>
                </p>
              )}

              {market === 'ar' && <FreeShippingProgress items={items} />}

              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>

              {addon && (
                <div className="border border-[var(--alcohn-line,#e5e5e5)] bg-[var(--alcohn-surface,#faf8f5)] p-3">
                  <p className="craft-label mb-2">Completá tu kit</p>
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden border border-neutral-200 bg-white">
                      <Image
                        src={addon.accessory.image}
                        alt={addon.accessory.title}
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-900">{addon.accessory.title}</p>
                      <p className="mt-0.5 text-[12.5px] leading-snug text-neutral-600">{addon.pitch}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-neutral-900">
                          {formatMarketMoney(addon.linkPrice, market)}
                        </span>
                        <button
                          type="button"
                          onClick={() => addItem(buildWizardAddonCartLine(addon, 'Openpay'))}
                          className="inline-flex min-h-[40px] items-center border border-neutral-900 bg-white px-3 text-[12px] font-semibold uppercase tracking-wider text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
                        >
                          + Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <p className="mb-2 text-sm text-neutral-600">Tu carrito está vacío</p>
              <Link
                href={emptyCatalogHref}
                onClick={closeDrawer}
                className="text-sm text-neutral-900 underline transition-colors hover:text-neutral-600"
              >
                Ver sellos
              </Link>
            </div>
          )}
        </div>

        {hasItems && (
          <div className="space-y-3 border-t border-neutral-200 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <CartSummary
              subtotal={subtotal}
              freeShipping={market === 'ar' && qualifiesForFreeShipping(items, market)}
              shippingLabel={market === 'ar' && qualifiesForFreeShipping(items, market) ? 'desde 3 sellos' : undefined}
              transferSubtotal={market === 'ar' ? estimateTransferSubtotal(items) : undefined}
            />
            <div className="flex flex-col gap-2">
              <Link
                href={checkoutHref}
                onClick={closeDrawer}
                className="flex min-h-[48px] w-full items-center justify-center border border-neutral-900 bg-neutral-900 px-6 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800"
              >
                Ir a pagar
              </Link>
              <Link
                href={anotherStampHref}
                onClick={closeDrawer}
                className="flex min-h-[48px] w-full items-center justify-center border border-neutral-300 bg-white px-6 text-sm font-semibold uppercase tracking-wider text-neutral-900 transition-colors hover:bg-neutral-50"
              >
                + Agregar otro sello
              </Link>
              <Link
                href={cartHref}
                onClick={closeDrawer}
                className="mx-auto inline-flex min-h-[40px] items-center text-[13px] text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
              >
                Ver carrito completo
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
