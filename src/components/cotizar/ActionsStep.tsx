'use client';

import Link from 'next/link';
import WhatsappButton from '../WhatsappButton';
import { CotizacionData } from '@/types';

interface ActionsStepProps {
  data: CotizacionData;
}

export default function ActionsStep({ data }: ActionsStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">¿Qué querés hacer ahora?</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/checkout"
          className="flex-1 bg-accent text-primary px-8 py-4 rounded-md font-semibold text-center hover:bg-accent-light transition-colors"
        >
          Comprar ahora
        </Link>
        <div className="flex-1">
          <WhatsappButton data={data} className="w-full">
            Hablar por WhatsApp
          </WhatsappButton>
        </div>
      </div>
      <p className="text-sm text-gray-500 text-center">
        Podés comprar directamente o hablar con nosotros para resolver dudas
      </p>
    </div>
  );
}

