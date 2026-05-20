'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BuyWizard from '@/components/BuyWizard';

type WizardMaterial = 'cuero' | 'madera' | 'ambos' | 'ceramica' | 'alimentos' | 'otros';

const WIZARD_MATERIALS: WizardMaterial[] = ['cuero', 'madera', 'ambos', 'ceramica', 'alimentos', 'otros'];

function getWizardMaterial(value: string | null): WizardMaterial | undefined {
  if (!value) return undefined;
  return WIZARD_MATERIALS.includes(value as WizardMaterial) ? (value as WizardMaterial) : undefined;
}

function BuyPageContent() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product');
  const initialMaterial = getWizardMaterial(searchParams.get('material'));

  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="craft-label mb-4">Compra online con muestra previa</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Diseñá tu sello, mirá la muestra y pagá online
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Primero guardamos tus datos para poder retomar el pedido si el archivo necesita revisión. Después elegís uso, medida, muestra, precio y forma de pago.
          </p>
        </div>

        <BuyWizard initialProduct={productSlug || undefined} initialMaterial={initialMaterial} />
      </div>
    </div>
  );
}

export default function BuyPage() {
  return (
    <Suspense fallback={
      <div className="atelier-page min-h-screen flex items-center justify-center">
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






