'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { pushGtmEvent } from '@/lib/analytics/gtm';
import { consumePurchaseSnapshot } from '@/lib/analytics/purchaseSnapshot';
import { MARKETS } from '@/lib/markets/config';
import { marketPath } from '@/lib/markets/paths';
import type { InternationalMarketCode } from '@/lib/markets/types';

function InternationalCheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const ordenId = searchParams.get('orden_id');
  const { clearCart } = useCart();
  const [syncState, setSyncState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const confirmSentRef = useRef(false);
  const purchaseTrackedRef = useRef(false);

  const marketParam = typeof params.market === 'string' ? params.market : 'cl';
  const market = (
    marketParam === 'cl' || marketParam === 'pe' || marketParam === 'co' || marketParam === 'mx'
      ? marketParam
      : 'cl'
  ) as InternationalMarketCode;

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Google Ads (GTM) para CL/CO/MX. Perú tiene su propio flujo más abajo.
  useEffect(() => {
    if (market === 'pe') return;
    if (!ordenId || purchaseTrackedRef.current) return;
    const snapshot = consumePurchaseSnapshot(ordenId);
    if (!snapshot) return;
    purchaseTrackedRef.current = true;

    pushGtmEvent('purchase_international', {
      transaction_id: snapshot.orderId,
      value: snapshot.value,
      currency: MARKETS[market].currency,
      market,
      items: snapshot.items,
    });
  }, [ordenId, market]);

  // Perú: purchase_international solo en /pe/checkout/success tras pago confirmado.
  useEffect(() => {
    if (market !== 'pe') return;
    if (syncState !== 'ok') return;
    if (!ordenId || purchaseTrackedRef.current) return;

    const transactionId = String(ordenId);
    const eventId = `pe_${transactionId}`;
    const dedupeKey = `alcohn_gtm_purchase_international_${eventId}`;

    try {
      if (sessionStorage.getItem(dedupeKey)) {
        purchaseTrackedRef.current = true;
        return;
      }
    } catch {
      // sessionStorage puede fallar; seguimos con el snapshot.
    }

    const snapshot = consumePurchaseSnapshot(transactionId);
    if (!snapshot?.orderId) return;

    const value = Number(snapshot.value);
    if (!Number.isFinite(value) || value <= 0) return;

    const resolvedTransactionId = String(snapshot.orderId);
    purchaseTrackedRef.current = true;

    try {
      sessionStorage.setItem(dedupeKey, '1');
    } catch {
      // El tracking no debe romper la página de éxito.
    }

    pushGtmEvent('purchase_international', {
      market: 'pe',
      value,
      currency: 'PEN',
      transaction_id: resolvedTransactionId,
      event_id: `pe_${resolvedTransactionId}`,
    });
  }, [market, syncState, ordenId]);

  useEffect(() => {
    if (!ordenId || confirmSentRef.current) return;
    confirmSentRef.current = true;

    let cancelled = false;
    setSyncState('loading');

    fetch(`/api/orders/${ordenId}/confirmar-pago`, { method: 'POST' })
      .then(async (res) => {
        if (cancelled) return;
        setSyncState(res.ok ? 'ok' : 'error');
      })
      .catch(() => {
        if (!cancelled) setSyncState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [ordenId]);

  return (
    <div className="atelier-page min-h-screen py-16">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="technical-sheet p-8 text-center md:p-12">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Gracias por tu compra</h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-700">
            Recibimos el pedido y el pago está siendo confirmado. Te vamos a contactar por email o
            WhatsApp para continuar con la muestra y la fabricación. Cuando el envío llegue a aduana,
            DHL te avisará si corresponde pagar impuestos o aranceles de importación.
          </p>
          {ordenId ? (
            <p className="mt-4 text-xs text-neutral-500">Pedido: {ordenId}</p>
          ) : null}
          {syncState === 'loading' ? (
            <p className="mt-4 text-xs text-neutral-500">Confirmando pago...</p>
          ) : null}
          {syncState === 'error' ? (
            <p className="mt-4 text-xs text-amber-700">
              Si el cobro apareció en tu medio de pago, escribinos con el comprobante para revisarlo.
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={marketPath(market, '/productos')}
              className="inline-block border border-neutral-900 bg-neutral-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white"
            >
              Seguir comprando
            </Link>
            <Link
              href={marketPath(market, '/contacto')}
              className="inline-block border border-neutral-300 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-neutral-900"
            >
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InternationalCheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-16" />}>
      <InternationalCheckoutSuccessContent />
    </Suspense>
  );
}
