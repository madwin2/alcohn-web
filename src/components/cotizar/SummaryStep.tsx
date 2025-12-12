'use client';

import { CotizacionData } from '@/types';
import { config } from '@/lib/config';

interface SummaryStepProps {
  data: CotizacionData;
}

export default function SummaryStep({ data }: SummaryStepProps) {
  const calculateShipping = () => {
    if (data.envio === 'domicilio') {
      return config.shipping.domicilio;
    }
    if (data.envio === 'sucursal') {
      return config.shipping.sucursal;
    }
    return 0;
  };

  const shipping = calculateShipping();
  const total = (data.precio || 0) + shipping;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Resumen de tu cotización</h3>
      <div className="bg-secondary rounded-lg p-6 space-y-4">
        {data.material && (
          <div className="flex justify-between">
            <span className="text-gray-600">Material:</span>
            <span className="font-semibold capitalize">{data.material}</span>
          </div>
        )}
        {data.medida && (
          <div className="flex justify-between">
            <span className="text-gray-600">Medida:</span>
            <span className="font-semibold">{data.medida}</span>
          </div>
        )}
        {data.precio && (
          <div className="flex justify-between">
            <span className="text-gray-600">Sello:</span>
            <span className="font-semibold">${data.precio.toLocaleString('es-AR')}</span>
          </div>
        )}
        {data.envio && (
          <div className="flex justify-between">
            <span className="text-gray-600">Envío ({data.envio}):</span>
            <span className="font-semibold">${shipping.toLocaleString('es-AR')}</span>
          </div>
        )}
        <div className="border-t border-gray-300 pt-4 flex justify-between text-lg">
          <span className="font-semibold">Total:</span>
          <span className="font-bold text-xl">${total.toLocaleString('es-AR')}</span>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tiempo estimado:</strong> 10 días hábiles de producción + envío
        </p>
      </div>
    </div>
  );
}

