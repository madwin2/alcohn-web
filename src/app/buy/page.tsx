'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BuyWizard from '@/components/BuyWizard';

function BuyPageContent() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product');

  return (
    <div className="min-h-screen bg-[#f6f5f2] py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Compra tu Sello Personalizado
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Seguí los pasos para personalizar tu sello de bronce.
          </p>
        </div>

        <BuyWizard initialProduct={productSlug || undefined} />
      </div>
    </div>
  );
}

export default function BuyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f6f5f2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <BuyPageContent />
    </Suspense>
  );
}






