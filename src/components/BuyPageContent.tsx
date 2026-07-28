import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BuyWizard from '@/components/BuyWizard';
import {
  getWizardOptionBySlug,
  type WizardMaterial,
} from '@/data/stampUseCases';

const WIZARD_MATERIALS: WizardMaterial[] = [
  'cuero',
  'madera',
  'ambos',
  'ceramica',
  'alimentos',
  'otros',
];

function getWizardMaterial(value: string | null): WizardMaterial | undefined {
  if (!value) return undefined;
  return WIZARD_MATERIALS.includes(value as WizardMaterial)
    ? (value as WizardMaterial)
    : undefined;
}

function BuyPageContent() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product');
  const usoSlug = searchParams.get('uso');
  const fromUso = usoSlug ? getWizardOptionBySlug(usoSlug) : undefined;
  const initialMaterial =
    fromUso?.buyMaterial ?? getWizardMaterial(searchParams.get('material'));
  const initialUsoSlug = fromUso?.slug ?? (usoSlug || undefined);

  return (
    <div className="buy-page atelier-page h-[100svh] overflow-hidden py-0 md:min-h-screen md:h-auto md:py-16">
      <div className="container mx-auto flex h-full min-h-0 flex-col px-0 md:px-4">
        <div className="mb-12 hidden text-center md:block">
          <p className="craft-label mb-4">Compra online con muestra previa</p>
          <h1 className="mb-3 text-[1.95rem] font-semibold tracking-tight text-gray-900 md:mb-4 md:text-4xl">
            Diseñá tu sello, mirá la muestra y pagá online
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-700 md:text-lg">
            Primero guardamos tus datos para poder retomar el pedido si el archivo necesita revisión. Después elegís uso, medida, muestra, precio y forma de pago.
          </p>
        </div>

        <div className="min-h-0 flex-1">
          <BuyWizard
            initialProduct={productSlug || undefined}
            initialMaterial={initialMaterial}
            initialUsoSlug={initialUsoSlug}
          />
        </div>
      </div>
    </div>
  );
}

export default function BuyPageContentWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="atelier-page flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <BuyPageContent />
    </Suspense>
  );
}
