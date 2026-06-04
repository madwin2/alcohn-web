'use client';

import { useState } from 'react';
import Image from 'next/image';
import MaterialSelectionModal from '@/components/sellos/MaterialSelectionModal';
import PriceFrom from '@/components/PriceFrom';

interface PersonalizadoProductCardProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  priceFrom: number;
  priority?: boolean;
}

export default function PersonalizadoProductCard({
  title,
  description,
  image,
  imageAlt,
  priceFrom,
  priority = false,
}: PersonalizadoProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const mobileDescription = description.split('. ')[0]?.trim();

  return (
    <>
      <div className="material-card flex flex-col p-3">
        <div className="material-frame relative aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
          />
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-9">
          <div className="mb-6">
            <h3 className="mb-4 text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
              {title}
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-neutral-600">
              <span className="md:hidden">{mobileDescription?.endsWith('.') ? mobileDescription : `${mobileDescription}.`}</span>
              <span className="hidden md:inline">{description}</span>
            </p>
            <PriceFrom amount={priceFrom} className="mt-4" size="sm" />
          </div>

          <div className="mt-auto border-t border-[var(--alcohn-line)] pt-6">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex w-full items-center justify-center border border-neutral-950 bg-neutral-950 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-neutral-800 sm:w-auto"
            >
              Elegir material de uso
            </button>
          </div>
        </div>
      </div>

      <MaterialSelectionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
