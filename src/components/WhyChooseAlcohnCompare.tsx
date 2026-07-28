'use client';

import { useId, useState } from 'react';
import WhyChooseIntro from '@/components/WhyChooseIntro';
import WhyChooseAlcohnSection from '@/components/WhyChooseAlcohnSection';
import WhyChooseAlcohnSectionMosaic from '@/components/WhyChooseAlcohnSectionMosaic';
import WhyChooseAlcohnSectionPanels from '@/components/WhyChooseAlcohnSectionPanels';

type LayoutVariant = 'dossier' | 'mosaic' | 'panels';

const variants: { id: LayoutVariant; label: string; description: string }[] = [
  {
    id: 'dossier',
    label: 'Dossier',
    description: 'Menú lateral + imagen focal',
  },
  {
    id: 'mosaic',
    label: 'Mosaico',
    description: 'Grilla 2×2 simultánea',
  },
  {
    id: 'panels',
    label: 'Paneles',
    description: 'Tiras expandibles tipo acordeón',
  },
];

export default function WhyChooseAlcohnCompare() {
  const groupId = useId();
  const [variant, setVariant] = useState<LayoutVariant>('dossier');

  return (
    <section className="mb-20" aria-labelledby="por-que-elegirnos-heading">
      <div className="technical-sheet">
        <div className="relative z-20 border-b border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="craft-label mb-1">Comparar diseños</p>
              <p className="text-sm text-neutral-600">
                Elegí una versión para previsualizar. Solo visible mientras decidimos.
              </p>
            </div>

            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Variantes de diseño">
              {variants.map((item) => {
                const isActive = variant === item.id;
                const inputId = `${groupId}-${item.id}`;

                return (
                  <label
                    key={item.id}
                    htmlFor={inputId}
                    className={[
                      'min-w-[8.5rem] cursor-pointer border px-4 py-2.5 text-left transition-colors',
                      isActive
                        ? 'border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] text-white'
                        : 'border-[var(--alcohn-line)] bg-white text-neutral-700 hover:border-neutral-950',
                    ].join(' ')}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name={groupId}
                      value={item.id}
                      checked={isActive}
                      onChange={() => setVariant(item.id)}
                      className="sr-only"
                    />
                    <span className="block text-xs font-semibold uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-[11px] ${isActive ? 'text-white/80' : 'text-neutral-500'}`}
                    >
                      {item.description}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <WhyChooseIntro />

        <div key={variant} className="relative z-10">
          {variant === 'dossier' && <WhyChooseAlcohnSection />}
          {variant === 'mosaic' && <WhyChooseAlcohnSectionMosaic embedded compareMode />}
          {variant === 'panels' && <WhyChooseAlcohnSectionPanels embedded compareMode />}
        </div>
      </div>
    </section>
  );
}
