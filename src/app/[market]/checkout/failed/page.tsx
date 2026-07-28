'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { marketPath } from '@/lib/markets/paths';
import type { InternationalMarketCode } from '@/lib/markets/types';

function InternationalCheckoutFailedContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const ordenId = searchParams.get('orden_id');

  const marketParam = typeof params.market === 'string' ? params.market : 'cl';
  const market = (
    marketParam === 'cl' || marketParam === 'pe' || marketParam === 'co' || marketParam === 'mx'
      ? marketParam
      : 'cl'
  ) as InternationalMarketCode;

  return (
    <div className="atelier-page min-h-screen py-16">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="technical-sheet p-8 text-center md:p-12">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
            No pudimos confirmar el pago
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-700">
            Tu carrito puede recuperarse desde esta versión del sitio. Si el cobro aparece en tu
            medio de pago, escribinos con el comprobante para revisarlo.
          </p>
          {ordenId ? <p className="mt-4 text-xs text-neutral-500">Referencia: {ordenId}</p> : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={marketPath(market, '/checkout')}
              className="inline-block border border-neutral-900 bg-neutral-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white"
            >
              Reintentar pago
            </Link>
            <Link
              href={marketPath(market, '/carrito')}
              className="inline-block border border-neutral-300 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-neutral-900"
            >
              Volver al carrito
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InternationalCheckoutFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-16" />}>
      <InternationalCheckoutFailedContent />
    </Suspense>
  );
}
