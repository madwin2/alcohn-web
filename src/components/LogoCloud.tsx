'use client';

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

const trustStats = [
  { value: '+7', label: 'años de experiencia' },
  { value: '+6000', label: 'sellos fabricados' },
  { value: '72hs', label: 'hábiles de fabricación' },
  { value: 'Envíos', label: 'a todo el país' },
];

const LOGOS_PER_ROW = 7;
const row1Brands = brands.slice(0, LOGOS_PER_ROW);
const row2Brands = brands.slice(LOGOS_PER_ROW);

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

  const brickCellClass =
    'col-span-2 flex min-h-[4.5rem] items-center justify-center border-b border-r border-[var(--alcohn-line)] p-3 sm:min-h-20 sm:p-4 lg:min-h-[5.25rem] lg:p-4';

  const renderLogoCell = (brand: (typeof brands)[number], extraClass = '') => (
    <div key={brand.name} className={`${brickCellClass} ${extraClass}`.trim()}>
      {brand.logo ? (
        <div className="flex h-11 w-full items-center justify-center px-1 sm:h-12 lg:h-[3.75rem]">
          <img
            src={brand.logo}
            alt={brand.name}
            className="max-h-full max-w-full object-contain object-center opacity-50 contrast-[1.05] grayscale transition duration-200 hover:opacity-90 hover:grayscale-0"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        <span className="craft-label">Logo</span>
      )}
    </div>
  );

  return (
    <section
      className={`${compact ? 'py-16' : 'py-16 md:py-24'} atelier-page border-y border-[var(--alcohn-line)] md:snap-start`}
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="technical-sheet">
          <div className="border-b border-[var(--alcohn-line)] p-6 text-center md:p-10 lg:p-12">
            <p className="craft-label mb-5">Trabajos Reales</p>
            <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-[0.98] tracking-tight text-neutral-950 md:text-6xl">
              <span className="block">En nosotros</span>
              <span className="block">confían</span>
              <span className="block min-h-[1em] text-neutral-950/72">
                {typedWord}<span className="type-caret">|</span>
              </span>
            </h2>
            <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
              {trustStats.map((stat) => (
                <div key={stat.label} className="technical-dash bg-white/50 p-4 text-center">
                  <p className="text-2xl font-semibold text-neutral-950">{stat.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-b border-[var(--alcohn-line)] bg-[var(--alcohn-surface)]">
            <div className="overflow-x-auto lg:overflow-visible">
              <div
                className="grid min-w-[42rem] grid-cols-[repeat(14,minmax(0,1fr))] lg:min-w-0"
              >
                {row1Brands.map((brand, index) =>
                  renderLogoCell(brand, index === 0 ? 'border-l' : '')
                )}

                <div
                  className="col-span-1 min-h-[4.5rem] border-b border-l border-r border-[var(--alcohn-line)] sm:min-h-20 lg:min-h-[5.25rem]"
                  aria-hidden="true"
                />
                {row2Brands.map((brand) => renderLogoCell(brand))}
                <div
                  className="col-span-1 min-h-[4.5rem] border-b border-r border-[var(--alcohn-line)] sm:min-h-20 lg:min-h-[5.25rem]"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.48fr_0.52fr]">
            <div className="min-h-[340px] border-b border-[var(--alcohn-line)] lg:border-b-0 lg:border-r">
              <img
                src="/images/inicio/ultima.png"
                alt="Billetera de cuero con marca aplicada en taller artesanal"
                className="h-full min-h-[340px] w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex flex-col justify-between p-6 md:p-10 lg:p-12">
              <div>
                <p className="craft-label mb-5">Caso aplicado</p>
                <p className="max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-4xl">
                  Una marca visible convierte una pieza artesanal en un producto más fácil de recordar, fotografiar y volver a comprar.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="technical-dash bg-white/50 p-4">
                  <p className="text-2xl font-semibold text-neutral-950">Un Sello</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-600">múltiples materiales</p>
                </div>
                <div className="technical-dash bg-white/50 p-4">
                  <p className="text-2xl font-semibold text-neutral-950">+5</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-600">materiales posibles</p>
                </div>
                <div className="technical-dash bg-white/50 p-4">
                  <p className="text-2xl font-semibold text-neutral-950">Durabilidad</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-600">varios años de uso</p>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
    </section>
  );
}
