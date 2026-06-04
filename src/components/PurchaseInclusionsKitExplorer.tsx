'use client';

import { useState } from 'react';
import Image from 'next/image';
import { KIT_ILLUSTRATION_SRC } from '@/components/PurchaseInclusions';
import MobileCarousel from '@/components/MobileCarousel';

const KIT_OVERLAY_SRC: Record<number, string> = {
  0: '/images/sello/kit-sello-pieza-01-cabezal.png',
  1: '/images/sello/kit-sello-pieza-02-mango.png',
  2: '/images/sello/kit-sello-pieza-03-varilla.png',
  3: '/images/sello/kit-sello-pieza-04-accesorios.png',
};

interface PurchaseInclusionsKitExplorerProps {
  items: Array<{ title: string; copy: string }>;
  className?: string;
}

export default function PurchaseInclusionsKitExplorer({
  items,
  className = '',
}: PurchaseInclusionsKitExplorerProps) {
  const [activeOverlay, setActiveOverlay] = useState<number | null>(null);
  const shortCopy = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length <= 84) return trimmed;
    return `${trimmed.slice(0, 81)}...`;
  };

  return (
    <section className={`technical-sheet blueprint-sheet overflow-hidden ${className}`}>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.36fr_0.64fr]">
        <div className="relative border-b border-[var(--alcohn-line)] p-6 md:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <p className="craft-label mb-5">Ficha de compra / Alcohn</p>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 md:text-4xl">
            Qué incluye tu compra
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-neutral-700">
            <span className="md:hidden">
              Tu compra llega lista para usar: sello, accesorios y guía rápida.
            </span>
            <span className="hidden md:inline">
              Además del sello, cada compra incluye los elementos necesarios para utilizar el sello en el
              material seleccionado.
            </span>
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-[10px] font-semibold uppercase text-neutral-500">
            <span className="border border-dashed border-[var(--alcohn-line)] bg-white/60 px-3 py-2">
              Bronce CNC
            </span>
            <span className="border border-dashed border-[var(--alcohn-line)] bg-white/60 px-3 py-2">
              Listo para taller
            </span>
          </div>
          <div className="relative mx-auto mt-8 hidden w-full max-w-[280px] md:block">
            <Image
              src={KIT_ILLUSTRATION_SRC}
              alt="Ilustración del sello de bronce con mango, varilla y cabezal de marcado"
              width={4502}
              height={2973}
              className="mx-auto h-auto w-full object-contain object-center mix-blend-multiply"
              sizes="(max-width: 1024px) 80vw, 280px"
            />
            {activeOverlay !== null && KIT_OVERLAY_SRC[activeOverlay] ? (
              <Image
                src={KIT_OVERLAY_SRC[activeOverlay]}
                alt=""
                width={4502}
                height={2973}
                aria-hidden
                className="pointer-events-none absolute inset-0 mx-auto h-full w-full object-contain object-center mix-blend-multiply transition-opacity duration-200"
                sizes="(max-width: 1024px) 80vw, 280px"
              />
            ) : null}
          </div>
          <p className="mt-4 hidden text-center text-[10px] font-semibold uppercase text-neutral-400 md:block">
            Pasá el cursor sobre cada ítem para ver la pieza
          </p>
          <p className="mt-4 text-center text-[10px] font-semibold uppercase text-neutral-400 md:hidden">
            Deslizá para ver todo lo incluido
          </p>
          <svg
            aria-hidden
            className="blueprint-annotation pointer-events-none absolute right-6 top-6 hidden h-24 w-24 text-neutral-950/60 md:block"
            viewBox="0 0 96 96"
            fill="none"
          >
            <path
              d="M13 53C21 31 43 18 73 22"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeDasharray="4 5"
            />
            <path
              d="M68 14L78 22L67 29"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M18 67C39 79 63 78 81 61" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>

        <div className="md:hidden">
          <MobileCarousel hint="Deslizá incluido">
            {items.map((item, index) => (
              <article
                key={`${item.title}-${index}-mobile`}
                className="mobile-snap-card purchase-inclusion-cell border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-5"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="flex h-9 w-9 items-center justify-center border border-[var(--alcohn-line-strong)] bg-white/80 text-xs font-semibold text-neutral-900">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-neutral-400">
                    KIT-{String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-700">{shortCopy(item.copy)}</p>
              </article>
            ))}
          </MobileCarousel>
        </div>

        <div className="hidden grid-cols-1 sm:grid sm:grid-cols-2">
          {items.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className={`purchase-inclusion-cell border-b border-[var(--alcohn-line)] p-5 transition-colors sm:border-r sm:even:border-r-0 md:p-6 ${
                activeOverlay === index ? 'bg-white/90' : ''
              } ${index < 4 ? 'cursor-default' : ''}`}
              onMouseEnter={() => {
                if (index < 4) setActiveOverlay(index);
              }}
              onMouseLeave={() => {
                if (index < 4) setActiveOverlay(null);
              }}
              onFocus={() => {
                if (index < 4) setActiveOverlay(index);
              }}
              onBlur={() => {
                if (index < 4) setActiveOverlay(null);
              }}
              tabIndex={index < 4 ? 0 : undefined}
            >
              <div className="mb-8 flex items-start justify-between gap-4">
                <span className="flex h-9 w-9 items-center justify-center border border-[var(--alcohn-line-strong)] bg-white/80 text-xs font-semibold text-neutral-900">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-semibold uppercase text-neutral-400">
                  KIT-{String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-neutral-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">{item.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
