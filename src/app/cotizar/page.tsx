'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import UploadStep from '@/components/cotizar/UploadStep';
import MaterialStep from '@/components/cotizar/MaterialStep';
import SizeStep from '@/components/cotizar/SizeStep';
import SummaryStep from '@/components/cotizar/SummaryStep';
import ActionsStep from '@/components/cotizar/ActionsStep';
import { CotizacionData, SizeOption } from '@/types';

export default function CotizarPage() {
  const searchParams = useSearchParams();
  const tipoFromUrl = searchParams.get('tipo');

  // Determinar step inicial: si viene con material desde URL, puede empezar en paso 2
  const initialStep = tipoFromUrl ? 2 : 1;
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState<CotizacionData>({
    material: tipoFromUrl as any || null,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [suggestedSizes, setSuggestedSizes] = useState<SizeOption[]>([]);

  // Simular sugerencia de medidas basada en el logo
  useEffect(() => {
    if (logoFile && data.material) {
      // TODO: Implementar lógica real de sugerencia de medidas basada en proporciones del logo
      // Por ahora, sugerencias mock basadas en el material
      const mockSizes: SizeOption[] = [
        { size: '30x30mm', price: 44000 }, // TODO: Precios reales
        { size: '40x40mm', price: 55000 },
        { size: '50x50mm', price: 66000 },
      ];
      setSuggestedSizes(mockSizes);
      // Si ya tenemos logo y material, avanzar al paso de medidas
      setStep((currentStep) => (currentStep < 3 ? 3 : currentStep));
    }
  }, [logoFile, data.material]);

  const handleLogoUpload = (file: File | null) => {
    setLogoFile(file);
    if (file) {
      // Simular URL del logo (en producción sería una URL real)
      setData({ ...data, logoUrl: URL.createObjectURL(file) });
      if (data.material) {
        setStep(3);
      } else {
        setStep(2);
      }
    }
  };

  const handleMaterialSelect = (material: 'cuero' | 'madera' | 'alimentos' | 'otro') => {
    setData({ ...data, material });
    // Si ya hay logo, avanzar al paso de medidas
    if (logoFile) {
      setStep(3);
    }
    // Si no hay logo, quedarse en paso 2 o ir al paso 1 para subir logo
  };

  const handleSizeSelect = (size: string) => {
    const selectedSize = suggestedSizes.find((s) => s.size === size);
    setData({
      ...data,
      medida: size,
      precio: selectedSize?.price,
    });
    setStep(4);
  };

  const handleShippingSelect = (envio: 'domicilio' | 'sucursal') => {
    setData({ ...data, envio });
    setStep(5);
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Cotizá tu sello de bronce
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tu historia merece un sello que la represente. Empezá ahora, es simple y rápido.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-accent text-primary'
                      : 'bg-secondary text-gray-400'
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Logo</span>
              <span>Material</span>
              <span>Medida</span>
              <span>Resumen</span>
              <span>Acción</span>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white border border-secondary-dark rounded-lg p-8">
            {step === 1 && (
              <UploadStep onUpload={handleLogoUpload} currentFile={logoFile} />
            )}

            {step === 2 && (
              <div className="space-y-4">
                <MaterialStep
                  selected={data.material || null}
                  onSelect={handleMaterialSelect}
                />
                {!logoFile && (
                  <div className="mt-6 pt-6 border-t border-secondary-dark">
                    <p className="text-sm text-gray-600 mb-4">
                      También podés subir tu logo primero si preferís
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-accent font-semibold hover:underline"
                    >
                      Subir logo →
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <>
                {suggestedSizes.length > 0 ? (
                  <SizeStep
                    sizes={suggestedSizes}
                    selected={data.medida || null}
                    onSelect={handleSizeSelect}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Necesitamos tu logo y el material para sugerirte medidas.
                    </p>
                    <div className="flex gap-4 justify-center">
                      {!logoFile && (
                        <button
                          onClick={() => setStep(1)}
                          className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-light transition-colors"
                        >
                          Subir logo
                        </button>
                      )}
                      {!data.material && (
                        <button
                          onClick={() => setStep(2)}
                          className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-light transition-colors"
                        >
                          Elegir material
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <SummaryStep data={data} />
                {!data.envio && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Tipo de envío</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleShippingSelect('domicilio')}
                        className="p-4 border-2 border-secondary-dark rounded-lg hover:border-accent transition-colors"
                      >
                        <div className="font-semibold">A domicilio</div>
                        <div className="text-sm text-gray-600">
                          ${(8000).toLocaleString('es-AR')}
                        </div>
                      </button>
                      <button
                        onClick={() => handleShippingSelect('sucursal')}
                        className="p-4 border-2 border-secondary-dark rounded-lg hover:border-accent transition-colors"
                      >
                        <div className="font-semibold">A sucursal</div>
                        <div className="text-sm text-gray-600">
                          ${(5000).toLocaleString('es-AR')}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
                {data.envio && (
                  <button
                    onClick={() => setStep(5)}
                    className="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-primary-light transition-colors"
                  >
                    Continuar
                  </button>
                )}
              </div>
            )}

            {step === 5 && <ActionsStep data={data} />}
          </div>

          {/* Navigation buttons */}
          {step > 1 && step < 5 && (
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(step - 1)}
                className="text-gray-600 hover:text-primary"
              >
                ← Atrás
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

