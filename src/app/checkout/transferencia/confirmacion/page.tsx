'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function TransferenciaConfirmacionContent() {
  const searchParams = useSearchParams();
  const ordenId = searchParams.get('orden_id');

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center md:px-8">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <svg
            className="h-7 w-7 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900">
          Pedido recibido
        </h1>
        <p className="mb-4 text-sm text-neutral-600">
          Registramos tu pedido y el comprobante de transferencia. Vamos a revisar el pago y te
          contactamos por WhatsApp para confirmar y mantenerte al tanto de la fabricación.
        </p>
        {ordenId ? (
          <p className="mb-6 text-sm text-neutral-700">
            Número de pedido:{' '}
            <span className="font-mono font-semibold text-neutral-900">{ordenId}</span>
          </p>
        ) : null}
        <Link
          href="/"
          className="inline-block border border-neutral-900 bg-neutral-900 px-6 py-3 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-neutral-800"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default function TransferenciaConfirmacionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white py-16 text-center text-sm text-neutral-600">
          Cargando…
        </div>
      }
    >
      <TransferenciaConfirmacionContent />
    </Suspense>
  );
}
