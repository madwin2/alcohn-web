'use client';

import { useState } from 'react';
import Image from 'next/image';
import MobileCarousel from '@/components/MobileCarousel';
import VideoShowcasePanel from '@/components/abecedarios/VideoShowcasePanel';

export const KIT_ILLUSTRATION_SRC = '/images/sello/kit-sello-que-incluye.png';

export interface KitIllustration {
  baseSrc: string;
  /** Imagen superpuesta por índice de ítem (mismo encuadre que baseSrc). */
  overlays: Record<number, string>;
  width: number;
  height: number;
  alt: string;
}

const SELLO_KIT_ILLUSTRATION: KitIllustration = {
  baseSrc: KIT_ILLUSTRATION_SRC,
  overlays: {
    0: '/images/sello/kit-sello-pieza-01-cabezal.png',
    1: '/images/sello/kit-sello-pieza-02-mango.png',
    2: '/images/sello/kit-sello-pieza-03-varilla.png',
    3: '/images/sello/kit-sello-pieza-04-accesorios.png',
  },
  width: 4502,
  height: 2973,
  alt: 'Ilustración del sello de bronce con mango, varilla y cabezal de marcado',
};

export interface PurchaseInclusionsVideoPanel {
  posterSrc: string;
  posterAlt: string;
  videoSrc?: string;
}

interface PurchaseInclusionsKitExplorerProps {
  items: Array<{ title: string; copy: string }>;
  className?: string;
  illustration?: KitIllustration;
  copy?: string;
  mobileCopy?: string;
  /** Mobile: imagen + lista simple en lugar del carrusel con fichas KIT. */
  simpleMobile?: boolean;
  /** Layout mobile cuando simpleMobile está activo. */
  mobileLayout?: 'tiles' | 'list';
  /** Etiquetas cortas para la grilla mobile (misma longitud que items). */
  mobileLabels?: string[];
  /** Panel de video vertical a la derecha en desktop. */
  videoPanel?: PurchaseInclusionsVideoPanel;
}

export default function PurchaseInclusionsKitExplorer({
  items,
  className = '',
  illustration = SELLO_KIT_ILLUSTRATION,
  copy = 'Además del sello, cada compra incluye los elementos necesarios para utilizar el sello en el material seleccionado.',
  mobileCopy = 'Tu compra llega lista para usar: sello, accesorios y guía rápida.',
  simpleMobile = false,
  mobileLayout = 'tiles',
  mobileLabels,
  videoPanel,
}: PurchaseInclusionsKitExplorerProps) {
  const [activeOverlay, setActiveOverlay] = useState<number | null>(null);
  const shortCopy = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length <= 84) return trimmed;
    return `${trimmed.slice(0, 81)}...`;
  };

  const labelForItem = (item: { title: string }, index: number) =>
    mobileLabels?.[index] ?? item.title.replace(' de bronce', '').replace(' de madera', '');

  const hasVideoPanel = Boolean(videoPanel);

  return (
    <section className={`technical-sheet blueprint-sheet overflow-hidden ${className}`}>
      <div
        className={`relative z-10 grid grid-cols-1 ${
          hasVideoPanel
            ? 'lg:grid-cols-[0.34fr_0.34fr_0.32fr]'
            : 'lg:grid-cols-[0.36fr_0.64fr]'
        }`}
      >
        <div
          className={`relative border-b border-[var(--alcohn-line)] p-4 md:p-8 lg:border-b-0 lg:border-r lg:p-10 ${
            simpleMobile ? 'md:p-8' : ''
          }`}
        >
          <p className="craft-label mb-2 md:mb-5">Ficha de compra / Alcohn</p>
          <h2
            className={`font-semibold tracking-tight text-neutral-950 ${
              simpleMobile ? 'text-xl md:text-4xl' : 'text-2xl md:text-4xl'
            }`}
          >
            Qué incluye tu compra
          </h2>
          <p className="mt-2 text-xs leading-snug text-neutral-600 md:mt-5 md:text-sm md:leading-relaxed md:text-neutral-700">
            <span className="md:hidden">{mobileCopy}</span>
            <span className="hidden md:inline">{copy}</span>
          </p>
          <div className="mt-5 hidden grid-cols-2 gap-3 text-[10px] font-semibold uppercase text-neutral-500 md:grid">
            <span className="border border-dashed border-[var(--alcohn-line)] bg-white/60 px-3 py-2">
              Bronce CNC
            </span>
            <span className="border border-dashed border-[var(--alcohn-line)] bg-white/60 px-3 py-2">
              Listo para taller
            </span>
          </div>

          {simpleMobile && mobileLayout === 'tiles' && (
            <div className="mt-3 md:hidden">
              <div className="grid grid-cols-[minmax(0,34%)_1fr] gap-2.5">
                <div className="material-frame relative min-h-[148px] overflow-hidden bg-white">
                  <Image
                    src={illustration.baseSrc}
                    alt={illustration.alt}
                    width={illustration.width}
                    height={illustration.height}
                    className="h-full w-full object-contain object-center mix-blend-multiply p-1.5"
                    sizes="120px"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {items.map((item, index) => (
                    <div
                      key={`${item.title}-${index}-tile`}
                      className="flex min-h-[44px] items-center justify-center border border-[var(--alcohn-line)] bg-white px-2 py-2 text-center"
                    >
                      <span className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-neutral-800">
                        {labelForItem(item, index)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {simpleMobile && mobileLayout === 'list' && (
            <div className="mt-4 border-t border-[var(--alcohn-line)] pt-4 md:hidden">
              <div className="grid grid-cols-[minmax(0,42%)_1fr] items-center gap-3">
                <div className="material-frame relative aspect-[4/5] overflow-hidden bg-white">
                  <Image
                    src={illustration.baseSrc}
                    alt={illustration.alt}
                    width={illustration.width}
                    height={illustration.height}
                    className="h-full w-full object-contain object-center mix-blend-multiply p-2"
                    sizes="140px"
                  />
                </div>
                <ul className="space-y-1.5 text-[12px] leading-snug text-neutral-800">
                  {items.map((item, index) => (
                    <li key={`${item.title}-${index}-bullet`} className="flex gap-2">
                      <span className="mt-[0.35rem] h-1 w-1 shrink-0 rounded-full bg-neutral-400" aria-hidden />
                      <span>{item.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="relative mx-auto mt-8 hidden w-full max-w-[280px] md:block">
            <Image
              src={illustration.baseSrc}
              alt={illustration.alt}
              width={illustration.width}
              height={illustration.height}
              className="mx-auto h-auto w-full object-contain object-center mix-blend-multiply"
              sizes="(max-width: 1024px) 80vw, 280px"
            />
            {activeOverlay !== null && illustration.overlays[activeOverlay] ? (
              <Image
                src={illustration.overlays[activeOverlay]}
                alt=""
                width={illustration.width}
                height={illustration.height}
                aria-hidden
                className="pointer-events-none absolute inset-0 mx-auto h-full w-full object-contain object-center mix-blend-multiply transition-opacity duration-200"
                sizes="(max-width: 1024px) 80vw, 280px"
              />
            ) : null}
          </div>
          <p className="mt-4 hidden text-center text-[10px] font-semibold uppercase text-neutral-400 md:block">
            Pasá el cursor sobre cada ítem para ver la pieza
          </p>
          {!simpleMobile && (
            <p className="mt-4 text-center text-[10px] font-semibold uppercase text-neutral-400 md:hidden">
              Deslizá para ver todo lo incluido
            </p>
          )}
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

        {!simpleMobile && (
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
        )}

        <div
          className={
            hasVideoPanel
              ? 'hidden border-[var(--alcohn-line)] lg:block lg:border-r'
              : simpleMobile
                ? 'hidden md:grid md:grid-cols-2'
                : 'hidden grid-cols-1 sm:grid sm:grid-cols-2'
          }
        >
          {items.map((item, index) => {
            const hasOverlay = illustration.overlays[index] != null;
            return (
            <article
              key={`${item.title}-${index}`}
              className={`purchase-inclusion-cell border-b border-[var(--alcohn-line)] p-5 transition-colors md:p-6 ${
                hasVideoPanel ? 'last:border-b-0' : 'sm:border-r sm:even:border-r-0'
              } ${activeOverlay === index ? 'bg-white/90' : ''} ${hasOverlay ? 'cursor-default' : ''}`}
              onMouseEnter={() => {
                if (hasOverlay) setActiveOverlay(index);
              }}
              onMouseLeave={() => {
                if (hasOverlay) setActiveOverlay(null);
              }}
              onFocus={() => {
                if (hasOverlay) setActiveOverlay(index);
              }}
              onBlur={() => {
                if (hasOverlay) setActiveOverlay(null);
              }}
              tabIndex={hasOverlay ? 0 : undefined}
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
            );
          })}
        </div>

        {hasVideoPanel && videoPanel ? (
          <>
            <div className="border-t border-[var(--alcohn-line)] p-4 lg:hidden">
              <VideoShowcasePanel
                posterSrc={videoPanel.posterSrc}
                posterAlt={videoPanel.posterAlt}
                videoSrc={videoPanel.videoSrc}
                className="aspect-[3/4] w-full"
              />
            </div>
            <div className="hidden min-h-[420px] lg:block">
              <VideoShowcasePanel
                posterSrc={videoPanel.posterSrc}
                posterAlt={videoPanel.posterAlt}
                videoSrc={videoPanel.videoSrc}
                className="h-full min-h-[420px]"
              />
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
