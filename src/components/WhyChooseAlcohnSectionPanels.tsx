'use client';

import { useCallback, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import WhyChooseIntro from '@/components/WhyChooseIntro';
import type { WhyChooseReason } from '@/data/aboutAlcohn';
import { whyChooseReasons } from '@/data/aboutAlcohn';
import { bindScrollReveal, prefersReducedMotion, revealEase } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function DesktopPanel({
  reason,
  index,
  isActive,
  isLast,
  onSelect,
}: {
  reason: WhyChooseReason;
  index: number;
  isActive: boolean;
  isLast: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <button
      type="button"
      data-panel-item
      aria-expanded={isActive}
      onClick={() => onSelect(index)}
      className={[
        'group relative min-h-[30rem] min-w-[4.25rem] flex-1 basis-0 cursor-pointer overflow-hidden text-left',
        'transition-[flex-grow] duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
        isActive ? 'z-10 grow-[4]' : 'z-20 grow-[0.55]',
        isLast ? '' : 'border-r border-[var(--alcohn-line)]',
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-0">
        <img
          src={reason.image}
          alt={reason.alt}
          className={[
            'h-full w-full object-cover transition-transform duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            isActive ? 'scale-100' : 'scale-110 group-hover:scale-105',
          ].join(' ')}
          loading="lazy"
          decoding="async"
        />
        <div
          className={[
            'absolute inset-0 transition-[background,opacity] duration-700 ease-out',
            isActive
              ? 'bg-gradient-to-t from-neutral-950/95 via-neutral-950/55 via-40% to-neutral-950/10'
              : 'bg-neutral-950/62 group-hover:bg-neutral-950/48',
          ].join(' ')}
          aria-hidden="true"
        />
        <div
          className={[
            'pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-neutral-950/85 to-transparent transition-opacity duration-700',
            isActive ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          aria-hidden="true"
        />
      </div>

      <div
        className={[
          'pointer-events-none absolute inset-0 flex flex-col justify-end p-7 transition-[opacity,transform] duration-500 ease-out xl:p-9',
          isActive ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        ].join(' ')}
      >
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.04em] text-white/80">
          {String(index + 1).padStart(2, '0')} / {String(whyChooseReasons.length).padStart(2, '0')}
        </p>
        <h3 className="max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.55)] xl:text-4xl">
          {reason.title}
        </h3>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.5)] md:text-base md:leading-relaxed">
          {reason.copy}
        </p>
      </div>

      <div
        className={[
          'pointer-events-none absolute inset-0 flex flex-col items-center justify-between px-2 py-5 transition-opacity duration-500 ease-out xl:px-3',
          isActive ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
        aria-hidden={isActive}
      >
        <span className="text-xs font-semibold tabular-nums text-white/90">
          {String(index + 1).padStart(2, '0')}
        </span>
        <p className="max-h-[72%] text-[10px] font-semibold uppercase leading-tight tracking-[0.16em] text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.5)] [writing-mode:vertical-rl] rotate-180 xl:text-[11px]">
          {reason.title}
        </p>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60 transition-colors group-hover:text-[var(--alcohn-bronze)]">
          Ver
        </span>
      </div>

      <span
        className={[
          'pointer-events-none absolute inset-y-0 left-0 w-[2px] origin-top bg-[var(--alcohn-bronze)] transition-transform duration-500',
          isActive ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-100',
        ].join(' ')}
        aria-hidden="true"
      />
    </button>
  );
}

function MobileAccordionItem({
  reason,
  index,
  isOpen,
  onToggle,
}: {
  reason: WhyChooseReason;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <article data-panel-item className="border-b border-[var(--alcohn-line)] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="relative flex w-full items-end overflow-hidden text-left"
      >
        <div className="absolute inset-0">
          <img
            src={reason.image}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-neutral-950/50" aria-hidden="true" />
        </div>
        <div className="relative flex min-h-[5.5rem] w-full items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tabular-nums text-white/85">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-base font-semibold tracking-tight text-white">{reason.title}</span>
          </div>
          <span className="text-lg text-white/70">{isOpen ? '−' : '+'}</span>
        </div>
      </button>

      {isOpen ? (
        <div className="border-t border-[var(--alcohn-line)] bg-neutral-950 p-5 md:p-6">
          <div className="mb-3 h-px w-10 bg-[var(--alcohn-bronze)]" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-white/92 md:text-[0.9375rem]">{reason.copy}</p>
        </div>
      ) : null}
    </article>
  );
}

export default function WhyChooseAlcohnSectionPanels({
  embedded = false,
  playImmediately = false,
  compareMode = false,
}: {
  embedded?: boolean;
  playImmediately?: boolean;
  compareMode?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState<number | null>(0);

  const selectPanel = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || prefersReducedMotion() || compareMode) return;

      if (!embedded) {
        const intro = section.querySelector<HTMLElement>('[data-diff-intro]');
        if (intro) {
          bindScrollReveal(intro, {
            to: { y: 0, opacity: 1, duration: 0.8, ease: revealEase },
            start: 'top 88%',
          });
        }
      }

      const track = trackRef.current;
      if (track) {
        bindScrollReveal(track, {
          from: { y: 36, opacity: 0 },
          to: { y: 0, opacity: 1, duration: 0.85, ease: revealEase },
          start: 'top 88%',
          playImmediately: embedded || playImmediately,
        });
      }
    },
    { scope: sectionRef, dependencies: [embedded, playImmediately, compareMode] }
  );

  const body = (
    <>
      <div
        ref={trackRef}
        data-panel-track
        className="relative z-10 hidden min-h-[30rem] md:flex"
        role="tablist"
        aria-label="Paneles de diferenciadores Alcohn"
      >
        {whyChooseReasons.map((reason, index) => (
          <DesktopPanel
            key={reason.title}
            reason={reason}
            index={index}
            isActive={index === activeIndex}
            isLast={index === whyChooseReasons.length - 1}
            onSelect={selectPanel}
          />
        ))}
      </div>

      <div className="relative z-10 md:hidden">
        {whyChooseReasons.map((reason, index) => (
          <MobileAccordionItem
            key={reason.title}
            reason={reason}
            index={index}
            isOpen={mobileOpen === index}
            onToggle={() => setMobileOpen(mobileOpen === index ? null : index)}
          />
        ))}
      </div>
    </>
  );

  if (embedded) {
    return <div ref={sectionRef as React.RefObject<HTMLDivElement>}>{body}</div>;
  }

  return (
    <section ref={sectionRef} className="mb-20" aria-labelledby="por-que-elegirnos-heading">
      <div className="technical-sheet">
        <WhyChooseIntro />
        {body}
      </div>
    </section>
  );
}
