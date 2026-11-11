'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { pushGtmEvent } from '@/lib/analytics/gtm';
import GoogleCustomerReviewsOptIn from '@/components/GoogleCustomerReviewsOptIn';
import { trackMetaPurchase } from '@/lib/analytics/metaPixel';
import { consumePurchaseSnapshot } from '@/lib/analytics/purchaseSnapshot';
import PendingLogoWhatsapp from '@/components/checkout/PendingLogoWhatsapp';

function OpenpaySuccessContent() {
  const searchParams = useSearchParams();
  const ordenId = searchParams.get('orden_id');
  const { clearCart } = useCart();
  const [syncState, setSyncState] = useState<'idle' | 'loading' | 'ok' | 'pending' | 'error'>('idle');
  const confirmSentRef = useRef(false);
  const purchaseTrackedRef = useRef(false);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Se mide la compra solo cuando el servidor verificó el cobro con Openpay.
  useEffect(() => {
    if (!ordenId || syncState !== 'ok' || purchaseTrackedRef.current) return;
    const snapshot = consumePurchaseSnapshot(ordenId);
    if (!snapshot) return;
    purchaseTrackedRef.current = true;

    pushGtmEvent('purchase', {
      transaction_id: snapshot.orderId,
      value: snapshot.value,
      currency: 'ARS',
      market: 'ar',
      items: snapshot.items,
    });
    trackMetaPurchase(snapshot);
  }, [ordenId, syncState]);

  useEffect(() => {
    if (!ordenId) return;
    if (confirmSentRef.current) return;
    confirmSentRef.current = true;

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
        const data = (await res.json().catch(() => ({}))) as { pending?: boolean };
        setSyncState(data.pending ? 'pending' : 'ok');
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
      {syncState === 'ok' && <GoogleCustomerReviewsOptIn orderId={ordenId} deliveryCountry="AR" />}
      <div className="container mx-auto px-4 md:px-8 max-w-2xl text-center py-16">
        <h1 className="text-3xl font-semibold text-neutral-900 mb-4 tracking-tight">
          {syncState === 'pending' ? 'Pago en proceso' : 'Pago recibido'}
        </h1>
        <p className="text-sm text-neutral-600 mb-4">
          Muchas gracias por tu compra. Te vamos a contactar por WhatsApp para confirmarte la compra y por ese medio te vamos a mantener al tanto del estado de fabricacion de tu sello.
        </p>
        {ordenId && syncState === 'loading' && (
          <p className="text-xs text-neutral-500 mb-4">Registrando tu pedido…</p>
        )}
        {ordenId && syncState === 'pending' && (
          <p className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 px-3 py-2 mb-4">
            Estamos esperando la confirmación del pago de Openpay. Cuando se acredite, el pedido
            se registra solo y te escribimos por WhatsApp.
          </p>
        )}
        {ordenId && syncState === 'error' && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 mb-4">
            El pago pudo haberse acreditado, pero hubo un error al registrar el pedido en el
            sistema. Escribinos por WhatsApp con tu nombre y el monto.
          </p>
        )}
        {syncState !== 'error' && <PendingLogoWhatsapp orderId={ordenId} />}
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
