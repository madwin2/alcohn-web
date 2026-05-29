'use client';

import { useRef } from 'react';
import SectionHeader from '@/components/SectionHeader';
import RecommendedSizes from '@/components/RecommendedSizes';
import CustomSizeInput from '@/components/CustomSizeInput';

export default function SizeRecommendationsSection() {
  const customSizeRef = useRef<HTMLDivElement>(null);

  const handleUnsureClick = () => {
    customSizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      const firstInput = customSizeRef.current?.querySelector('input');
      firstInput?.focus();
    }, 500);
  };

  return (
    <section className="mb-20 border-t border-neutral-300 pt-16">
      <div className="mb-6 text-center">
        <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
          Medidas disponibles: desde 10×10 mm hasta 150×60 mm (15×6 cm, rectangulares incluidos).
        </div>
        <div className="text-xs text-neutral-600">
          Si tu logo necesita otra proporción, lo hacemos a medida.
        </div>
      </div>

      <SectionHeader
        title="Tamaños recomendados"
        subtitle="Elegí una recomendación rápida o pedí tu medida exacta."
        align="center"
      />

      <RecommendedSizes
        sizes={[
          {
            title: 'Pequeño',
            subtitle: 'Para marcas discretas',
            idealFor: [
              'Tarjetería / packaging chico',
              'Billeteras / llaveros / detalles',
              'Etiquetas pequeñas',
            ],
            referenceRange: '20–30mm (según logo)',
            price: 44000,
            sizeKey: 'pequeño',
          },
          {
            title: 'Medio',
            subtitle: 'El estándar más versátil',
            idealFor: [
              'Marroquinería (carteras, fundas)',
              'Muebles / piezas medianas',
              'Packaging general',
            ],
            referenceRange: '35–45mm (según logo)',
            price: 55000,
            badge: 'Más elegido',
            sizeKey: 'medio',
          },
          {
            title: 'Grande',
            subtitle: 'Para marcas protagonistas',
            idealFor: [
              'Tablas de madera / piezas grandes',
              'Bolsos / productos premium',
              'Logos con mucho detalle',
            ],
            referenceRange: '50–70mm (según logo)',
            price: 66000,
            sizeKey: 'grande',
          },
        ]}
        onUnsureClick={handleUnsureClick}
      />

      <div ref={customSizeRef} className="mt-8">
        <CustomSizeInput />
      </div>

      <div className="mt-8 pt-6 border-t border-neutral-200">
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-neutral-900">¿Puedo hacer 23×67mm?</span>{' '}
            <span className="text-neutral-600">Sí, trabajamos todas las medidas rectangulares dentro del rango.</span>
          </div>
          <div>
            <span className="font-medium text-neutral-900">¿Y si no sé la medida?</span>{' '}
            <span className="text-neutral-600">Elegí un recomendado y te guiamos con tu logo.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

