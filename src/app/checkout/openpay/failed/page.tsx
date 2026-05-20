'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function OpenpayFailedContent() {
  const searchParams = useSearchParams();
  const ordenId = searchParams.get('orden_id');

  useEffect(() => {
    if (!ordenId) return;
    fetch(`/api/orders/${ordenId}/pago-fallido`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pago_error_mensaje: 'Pago no completado en Openpay (redirect failed)',
      }),
    }).catch((err) => console.error('[openpay failed]', err));
  }, [ordenId]);

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-2xl text-center py-16">
        <h1 className="text-3xl font-semibold text-neutral-900 mb-4 tracking-tight">
          No se completó el pago
        </h1>
        <p className="text-sm text-neutral-600 mb-8">
          Podés volver al checkout e intentar de nuevo. Si necesitás ayuda, escribinos por WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/checkout"
            className="inline-block border border-neutral-900 bg-neutral-900 text-white px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            Volver al checkout
          </Link>
          <Link
            href="/carrito"
            className="inline-block border border-neutral-300 text-neutral-900 px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-50 transition-colors"
          >
            Ir al carrito
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OpenpayFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white py-16 text-center text-sm text-neutral-600">
          Cargando…
        </div>
      }
    >
      <OpenpayFailedContent />
    </Suspense>
  );
}
