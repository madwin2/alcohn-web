'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import WhyChooseIntro from '@/components/WhyChooseIntro';
import type { WhyChooseReason } from '@/data/aboutAlcohn';
import { whyChooseReasons } from '@/data/aboutAlcohn';
import { bindScrollReveal, prefersReducedMotion, revealEase } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function MosaicCard({
  reason,
  index,
  className = '',
}: {
  reason: WhyChooseReason;
  index: number;
  className?: string;
}) {
  return (
    <article
      data-mosaic-tile
      className={[
        'group flex h-full flex-col overflow-hidden border-b border-[var(--alcohn-line)]',
        className,
      ].join(' ')}
    >
      <div className="relative aspect-[3/2] shrink-0 overflow-hidden">
        <div className="material-frame absolute inset-0">
          <img
            src={reason.image}
            alt={reason.alt}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/30 via-transparent to-transparent"
            aria-hidden="true"
          />
        </div>
        <p className="absolute bottom-3 left-4 text-xs font-semibold tabular-nums text-white/90 md:bottom-4 md:left-5">
          {String(index + 1).padStart(2, '0')}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-7 lg:p-8">
        <div
          className="mb-3 h-px w-10 origin-left bg-[var(--alcohn-bronze)] transition-transform duration-500 group-hover:scale-x-125"
          aria-hidden="true"
        />
        <h3 className="text-lg font-semibold tracking-tight text-neutral-950 transition-colors duration-300 group-hover:text-[var(--alcohn-bronze-dark)] md:text-xl lg:text-2xl">
          {reason.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-700 md:text-[0.9375rem] md:leading-relaxed">
          {reason.copy}
        </p>
      </div>
    </article>
  );
}

export default function WhyChooseAlcohnSectionMosaic({
  embedded = false,
  playImmediately = false,
  compareMode = false,
}: {
  embedded?: boolean;
  playImmediately?: boolean;
  compareMode?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);

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

      const tiles = gsap.utils.toArray<HTMLElement>('[data-mosaic-tile]', section);
      bindScrollReveal(tiles, {
        from: { y: 32, opacity: 0 },
        to: { y: 0, opacity: 1, duration: 0.68, ease: revealEase },
        start: 'top 92%',
        stagger: 0.07,
        playImmediately: embedded || playImmediately,
      });
    },
    { scope: sectionRef, dependencies: [embedded, playImmediately, compareMode] }
  );

  const body = (
    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
      {whyChooseReasons.map((reason, index) => (
        <MosaicCard
          key={reason.title}
          reason={reason}
          index={index}
          className={[
            index % 2 === 0 ? 'md:border-r md:border-[var(--alcohn-line)]' : '',
            index < whyChooseReasons.length - 2 ? 'md:border-b md:border-[var(--alcohn-line)]' : '',
          ].join(' ')}
        />
      ))}
    </div>
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
