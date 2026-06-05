'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { StampUsageGuide, StampUsageMethod } from '@/data/stampUsageGuides';

type StampUsageGuideSectionProps = {
  guide: StampUsageGuide;
};

export default function StampUsageGuideSection({ guide }: StampUsageGuideSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const method = guide.methods[activeIndex];
  const showTabs = guide.methods.length > 1;

  return (
    <section id="guia-uso" className="technical-sheet blueprint-sheet overflow-hidden">
      <div className="relative z-10 box-border p-[var(--blueprint-inset)]">
        <div className="grid min-h-[300px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[auto_minmax(0,1fr)] lg:items-stretch">
          <header className="border-b border-[var(--alcohn-line)] px-5 py-4 lg:col-start-1 lg:row-start-1 lg:px-6 lg:py-5">
            <p className="craft-label mb-3">Técnica de marcado</p>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 md:text-3xl">
                Guía de uso.
              </h2>
              <span className="text-sm font-medium text-neutral-500">{guide.title}</span>
            </div>
          </header>

          <div className="flex h-full min-h-0 min-w-0 flex-col px-5 py-4 lg:col-start-1 lg:row-start-2 lg:px-6 lg:py-5">
            <div className="border border-[var(--alcohn-line)] lg:hidden">
              <UsageIllustrationFrame method={method} methodKey={`${method.id}-${activeIndex}-mobile`} />
            </div>

            <ul className="flex min-h-0 min-w-0 flex-1 flex-col divide-y divide-[var(--alcohn-line)] border border-[var(--alcohn-line)] border-t-0 bg-transparent lg:border-t">
              {method.bullets.map((bullet) => (
                <li key={bullet} className="flex min-w-0 flex-1 gap-3 px-4 py-3.5 sm:px-5 sm:py-4 md:gap-3.5 md:px-6">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--alcohn-bronze-dark)]"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 break-words text-sm leading-relaxed text-neutral-800 sm:text-[15px] md:leading-7">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>

            {method.note ? (
              <p className="mt-4 shrink-0 border-l-2 border-[var(--alcohn-bronze)] bg-[var(--alcohn-bronze)]/5 px-4 py-3 text-sm font-medium leading-relaxed text-neutral-900">
                {method.note}
              </p>
            ) : null}

            {showTabs ? (
              <div
                className="mt-4 shrink-0 flex flex-wrap gap-2 pt-4"
                role="tablist"
                aria-label="Método de marcado"
              >
                {guide.methods.map((item, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveIndex(index)}
                      className={[
                        'min-w-[5.5rem] border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors',
                        isActive
                          ? 'border-[var(--alcohn-bronze-dark)] bg-[var(--alcohn-bronze)]/12 text-neutral-950 shadow-sm'
                          : 'border-[var(--alcohn-line-strong)] bg-white/70 text-neutral-700 hover:border-neutral-950 hover:text-neutral-950',
                      ].join(' ')}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <aside className="hidden min-h-0 border-l border-[var(--alcohn-line)] bg-[var(--alcohn-paper-deep)]/55 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:flex">
            <UsageIllustrationFrame
              method={method}
              methodKey={`${method.id}-${activeIndex}`}
              fillHeight
            />
          </aside>
        </div>
      </div>
    </section>
  );
}

function UsageIllustrationFrame({
  method,
  methodKey,
  fillHeight = false,
}: {
  method: StampUsageMethod;
  methodKey: string;
  fillHeight?: boolean;
}) {
  return (
    <div
      className={[
        'flex items-center justify-center',
        fillHeight ? 'size-full min-h-0' : 'p-5',
      ].join(' ')}
    >
      <div
        className={[
          'relative border border-[var(--alcohn-line-strong)] bg-transparent',
          fillHeight
            ? 'aspect-square h-full max-h-full w-auto max-w-full shrink-0'
            : 'aspect-square w-full max-w-[260px]',
        ].join(' ')}
      >
        {method.image ? (
          <Image
            key={methodKey}
            src={method.image}
            alt={method.imageAlt ?? `Ilustración de uso para ${method.label}`}
            fill
            className="object-contain object-center p-5 mix-blend-multiply transition-opacity duration-300 md:p-6"
            sizes={fillHeight ? '480px' : '260px'}
          />
        ) : (
          <div className="flex size-full items-center justify-center p-6 text-center text-sm text-neutral-500">
            Ilustración en preparación.
          </div>
        )}
      </div>
    </div>
  );
}
