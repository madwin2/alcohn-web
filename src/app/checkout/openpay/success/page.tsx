'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

function OpenpaySuccessContent() {
  const searchParams = useSearchParams();
  const ordenId = searchParams.get('orden_id');
  const { clearCart } = useCart();
  const [syncState, setSyncState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (!ordenId) return;
    let cancelled = false;
    setSyncState('loading');
    fetch(`/api/orders/${ordenId}/confirmar-pago`, { method: 'POST' })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          console.error('[openpay success]', data.error);
          setSyncState('error');
          return;
        }
        setSyncState('ok');
      })
      .catch(() => {
        if (!cancelled) setSyncState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [ordenId]);

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-2xl text-center py-16">
        <h1 className="text-3xl font-semibold text-neutral-900 mb-4 tracking-tight">
          Pago recibido
        </h1>
        <p className="text-sm text-neutral-600 mb-4">
          Si completaste el pago en Openpay, tu operación quedó registrada. Te contactaremos por
          WhatsApp para coordinar el envío y los detalles del pedido.
        </p>
        {ordenId && syncState === 'loading' && (
          <p className="text-xs text-neutral-500 mb-4">Registrando tu pedido…</p>
        )}
        {ordenId && syncState === 'error' && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 mb-4">
            El pago pudo haberse acreditado, pero hubo un error al registrar el pedido en el
            sistema. Escribinos por WhatsApp con tu nombre y el monto.
          </p>
        )}
        <Link
          href="/"
          className="inline-block border border-neutral-900 bg-neutral-900 text-white px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default function OpenpaySuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white py-16 text-center text-sm text-neutral-600">
          Cargando…
        </div>
      }
    >
      <OpenpaySuccessContent />
    </Suspense>
  );
}
