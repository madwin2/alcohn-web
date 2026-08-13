'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import CartItemRow from '@/components/cart/CartItemRow';
import CartSummary from '@/components/cart/CartSummary';
import InternationalShippingForm from '@/components/checkout/InternationalShippingForm';
import { useCart } from '@/contexts/CartContext';
import { useMarket } from '@/contexts/MarketContext';
import { savePurchaseSnapshot } from '@/lib/analytics/purchaseSnapshot';
import { formatMarketMoney } from '@/lib/markets/money';
import { marketBuyPath, marketPath } from '@/lib/markets/paths';
import type { InternationalMarketCode } from '@/lib/markets/types';
import type { InternationalShippingFormData } from '@/lib/shipping/international';

interface PricingResponse {
  market: string;
  currency: string;
  subtotal: number;
  shipping: number;
  total: number;
  lineItems: Array<{ id: string; title: string; price: number; qty: number }>;
}

export default function InternationalCheckoutPage() {
  const { market, config } = useMarket();
  const { items, isHydrated } = useCart();
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const internationalMarket = (
    market === 'cl' || market === 'pe' || market === 'co' || market === 'mx' ? market : null
  ) as InternationalMarketCode | null;

  useEffect(() => {
    if (!internationalMarket || !isHydrated || items.length === 0) return;

    let cancelled = false;
    setPricingError(null);

    fetch('/api/checkout/international/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ market: internationalMarket, items }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? 'No se pudo calcular el precio');
        }
        return res.json() as Promise<PricingResponse>;
      })
      .then((data) => {
        if (!cancelled) setPricing(data);
      })
      .catch((error) => {
        if (!cancelled) {
          setPricing(null);
          setPricingError(error instanceof Error ? error.message : 'Error de precio');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [internationalMarket, isHydrated, items]);

  const displayItems = useMemo(() => {
    if (pricing?.lineItems?.length) {
      return items.map((item) => {
        const priced = pricing.lineItems.find((line) => line.id === item.id);
        return priced ? { ...item, price: priced.price } : item;
      });
    }
    return items;
  }, [items, pricing]);

  if (!internationalMarket) {
    return null;
  }

  if (isHydrated && items.length === 0) {
    return (
      <div className="atelier-page min-h-screen py-16">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">Tu carrito está vacío</h1>
          <p className="mt-4 text-sm text-neutral-600">Agregá productos antes de pagar.</p>
          <Link
            href={marketBuyPath(internationalMarket)}
            className="mt-8 inline-block border border-neutral-900 bg-neutral-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white"
          >
            Diseñar mi sello
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (shippingForm: InternationalShippingFormData, customsAccepted: boolean) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const intentRes = await fetch('/api/checkout/international/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: internationalMarket,
          items,
          shippingForm,
          customsAccepted,
        }),
      });

      const intentData = (await intentRes.json().catch(() => ({}))) as {
        error?: string;
        orden_id?: string;
      };

      if (!intentRes.ok || !intentData.orden_id) {
        throw new Error(intentData.error ?? 'No se pudo crear la orden');
      }

      // Snapshot para el tracking de conversión (Google Ads) en la página de éxito.
      savePurchaseSnapshot({
        orderId: intentData.orden_id,
        value: pricing?.total ?? 0,
        items: (pricing?.lineItems ?? []).map((li) => ({
          id: li.id,
          title: li.title,
          price: li.price,
          qty: li.qty,
        })),
      });

      const paymentRes = await fetch('/api/checkout/international/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orden_id: intentData.orden_id }),
      });

      const paymentData = (await paymentRes.json().catch(() => ({}))) as {
        error?: string;
        checkoutUrl?: string;
      };

      if (!paymentRes.ok || !paymentData.checkoutUrl) {
        throw new Error(paymentData.error ?? 'No se pudo iniciar el pago');
      }

      window.location.href = paymentData.checkoutUrl;
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error al procesar el checkout');
      setSubmitting(false);
    }
  };

  return (
    <div className="atelier-page min-h-screen py-8 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 md:mb-12">
          <p className="craft-label mb-2">Checkout internacional · {config.countryName}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
            Finalizar pedido
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="technical-sheet space-y-4 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-neutral-900">Tu pedido</h2>
              {displayItems.map((item) => (
                <CartItemRow key={item.id} item={item} showImage={false} />
              ))}
            </div>

            <InternationalShippingForm
              market={internationalMarket}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
            />
          </div>

          <div>
            <div className="lg:sticky lg:top-24">
              <div className="technical-sheet space-y-5 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-neutral-900">Resumen</h2>

                {pricing ? (
                  <>
                    <CartSummary
                      subtotal={pricing.subtotal}
                      shippingCost={pricing.shipping}
                      shippingLabel="DHL Internacional"
                    />
                  </>
                ) : pricingError ? (
                  <p className="text-sm text-red-600">{pricingError}</p>
                ) : (
                  <p className="text-sm text-neutral-600">Calculando precio...</p>
                )}

                {pricing ? (
                  <p className="text-xs text-neutral-500">
                    Total estimado: {formatMarketMoney(pricing.total, internationalMarket)} ({pricing.currency})
                  </p>
                ) : null}

                <Link
                  href={marketPath(internationalMarket, '/carrito')}
                  className="block text-sm text-neutral-600 underline hover:text-neutral-900"
                >
                  Volver al carrito
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
