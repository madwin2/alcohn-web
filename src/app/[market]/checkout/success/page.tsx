'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { marketPath } from '@/lib/markets/paths';
import type { InternationalMarketCode } from '@/lib/markets/types';

function InternationalCheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const ordenId = searchParams.get('orden_id');
  const { clearCart } = useCart();
  const [syncState, setSyncState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const confirmSentRef = useRef(false);

  const marketParam = typeof params.market === 'string' ? params.market : 'cl';
  const market = (
    marketParam === 'cl' || marketParam === 'pe' || marketParam === 'co' || marketParam === 'mx'
      ? marketParam
      : 'cl'
  ) as InternationalMarketCode;

  useEffect(() => {
    clearCart();
  }, [clearCart]);

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
