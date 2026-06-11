'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { brands } from '@/data/brands';
import ActionButton from './ActionButton';

interface LogoCloudProps {
  compact?: boolean;
}

const trustWords = [
  'marcas nacionales',
  'importantes talleres',
  'empresas reconocidas',
  'artesanos',
  'emprendedores',
];

const mobileBrands = brands.slice(0, 12);

const longestTrustWord = trustWords.reduce(
  (longest, word) => (word.length > longest.length ? word : longest),
  trustWords[0]
);

export default function LogoCloud({ compact = false }: LogoCloudProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [visibleLetters, setVisibleLetters] = useState(trustWords[0].length);
  const [isDeleting, setIsDeleting] = useState(false);
  const currentWord = trustWords[wordIndex];

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const isComplete = visibleLetters === currentWord.length;
    const isEmpty = visibleLetters === 0;
    const delay = isComplete && !isDeleting ? 1400 : isEmpty && isDeleting ? 220 : isDeleting ? 34 : 58;

    const timer = window.setTimeout(() => {
      if (isComplete && !isDeleting) {
        setIsDeleting(true);
        return;
      }

      if (isEmpty && isDeleting) {
        setIsDeleting(false);
        setWordIndex((index) => (index + 1) % trustWords.length);
        return;
      }

      setVisibleLetters((letters) => letters + (isDeleting ? -1 : 1));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [currentWord.length, isDeleting, visibleLetters]);

  const typedWord = useMemo(
    () => currentWord.slice(0, visibleLetters),
    [currentWord, visibleLetters]
  );

  return (
    <section
      className={`${compact ? 'py-10 md:py-16' : 'py-10 md:py-24'} atelier-page border-y border-[var(--alcohn-line)]`}
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div data-scroll-panel className="technical-sheet">
          <div className="border-b border-[var(--alcohn-line)] p-6 pb-5 text-center sm:pb-6 md:p-10 lg:p-12">
            <p className="craft-label mb-5">Trabajos Reales</p>
            <h2 className="mx-auto max-w-3xl text-[2rem] font-semibold leading-[1.04] tracking-tight text-neutral-950 md:text-6xl md:leading-[0.98]">
              <span className="block">En nosotros</span>
              <span className="block">confían</span>
              <span className="logo-cloud-typed-line block">
                <span aria-hidden="true" className="logo-cloud-typed-line__reserve">
                  {longestTrustWord}
                </span>
                <span className="logo-cloud-typed-line__value text-neutral-950/72">
                  {typedWord}
                  <span className="type-caret">|</span>
                </span>
              </span>
            </h2>
          </div>

          <div className="bg-[var(--alcohn-surface)]">
            <div className="brand-marquee brand-marquee--mobile sm:hidden">
              <div className="brand-marquee-track flex w-max flex-nowrap">
                {[...mobileBrands, ...mobileBrands].map((brand, index) => (
                  <div key={`${brand.name}-mobile-${index}`} className="brand-marquee-item shrink-0">
                    {brand.logo ? (
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={160}
                        height={50}
                        className="logo-cloud-brand"
                      />
                    ) : (
                      <span className="craft-label">Logo</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="brand-marquee brand-marquee--desktop hidden sm:block"
              aria-label="Marcas que confían en Alcohn"
            >
              <div className="brand-marquee-track brand-marquee-track--desktop flex w-max flex-nowrap">
                {[...brands, ...brands].map((brand, index) => (
                  <div
                    key={`${brand.name}-desktop-${index}`}
                    className="brand-marquee-item brand-marquee-item--desktop shrink-0"
                  >
                    {brand.logo ? (
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={180}
                        height={72}
                        className="logo-cloud-brand"
                      />
                    ) : (
                      <span className="craft-label">Logo</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 pt-7 md:pt-9 lg:grid-cols-[0.48fr_0.52fr] lg:items-stretch lg:pt-10">
            <div
              data-scroll-card
              className="relative min-h-[250px] md:min-h-[340px] lg:min-h-0 lg:border-r lg:border-[var(--alcohn-line)]"
            >
              <Image
                src="/images/inicio/billetera-cuero-marca-taller.webp"
                alt="Billetera de cuero con marca aplicada en taller artesanal"
                width={1200}
                height={720}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between p-6 md:p-10 lg:p-12">
              <div className="flex flex-col items-center text-center md:hidden">
                <blockquote className="max-w-md text-[1.35rem] font-semibold italic leading-snug tracking-tight text-neutral-950">
                  &ldquo;El sello quedó nítido desde el primer uso. Mis clientes reconocen la marca al toque la pieza.&rdquo;
                </blockquote>
                <p className="mt-4 text-sm text-neutral-600">
                  Lucía M. — Marroquinería artesanal, Córdoba
                </p>
              </div>

              <div className="hidden md:flex md:h-full md:w-full md:flex-col md:justify-between">
                <div>
                  <p className="craft-label mb-5">Caso aplicado</p>
                  <p className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-neutral-950">
                    Una marca visible convierte una pieza artesanal en un producto más fácil de recordar, fotografiar y volver a comprar.
                  </p>
                </div>

                <div className="mt-10 grid grid-cols-3 gap-3">
                  <div data-scroll-card className="technical-dash border border-dashed border-[var(--alcohn-line)] bg-white/50 p-4 text-left">
                    <p className="text-2xl font-semibold text-neutral-950">Un sello</p>
                    <p className="mt-1 text-xs leading-snug text-neutral-600">múltiples materiales</p>
                  </div>
                  <div data-scroll-card className="technical-dash border border-dashed border-[var(--alcohn-line)] bg-white/50 p-4 text-left">
                    <p className="text-2xl font-semibold text-neutral-950">+9</p>
                    <p className="mt-1 text-xs leading-snug text-neutral-600">usos y materiales</p>
                  </div>
                  <div data-scroll-card className="technical-dash border border-dashed border-[var(--alcohn-line)] bg-white/50 p-4 text-left">
                    <p className="text-2xl font-semibold text-neutral-950">Bronce</p>
                    <p className="mt-1 text-xs leading-snug text-neutral-600">para toda la vida</p>
                  </div>
                </div>

                <div className="mt-10 flex flex-row gap-3">
                  <ActionButton href="/buy?mode=custom" variant="primary">
                    Diseñar el mío
                  </ActionButton>
                  <ActionButton href="/casos-reales" variant="ghost">
                    Ver casos reales
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
