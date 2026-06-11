'use client';

import { useRef, useState } from 'react';
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
      <div
        data-mosaic-image-wrap
        className="relative aspect-[3/2] shrink-0 overflow-hidden"
      >
        <div className="material-frame absolute inset-0">
          <img
            data-mosaic-image
            src={reason.image}
            alt={reason.alt}
            className="mosaic-card__img h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden="true"
          />
        </div>
        <p
          data-mosaic-index
          className="absolute bottom-3 left-4 text-xs font-semibold tabular-nums text-white/90 md:bottom-4 md:left-5"
        >
          {String(index + 1).padStart(2, '0')}
        </p>
      </div>

      <div data-mosaic-content className="flex flex-1 flex-col p-5 md:p-7 lg:p-8">
        <div
          data-mosaic-line
          className="mb-3 h-px w-10 origin-left bg-[var(--alcohn-bronze)]"
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

function MobilePanelCard({
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
    <article className="border-b border-[var(--alcohn-line)] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={[
          'group relative flex w-full flex-col overflow-hidden text-left',
          'transition-[min-height] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          isOpen ? 'min-h-[26rem]' : 'min-h-[5.5rem]',
        ].join(' ')}
      >
        <img
          src={reason.image}
          alt={reason.alt}
          className={[
            'absolute inset-0 h-full w-full object-cover',
            'transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            isOpen ? 'scale-100' : 'scale-[1.06]',
          ].join(' ')}
          loading="lazy"
          decoding="async"
        />

        {/* Capa base oscura — siempre legible en estado cerrado */}
        <div
          className={[
            'absolute inset-0 bg-neutral-950/65 transition-opacity duration-700 ease-out',
            isOpen ? 'opacity-40' : 'opacity-100',
          ].join(' ')}
          aria-hidden="true"
        />
        <div
          className={[
            'absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/60 to-neutral-950/35',
            'transition-opacity duration-700 ease-out',
            isOpen ? 'opacity-50' : 'opacity-100',
          ].join(' ')}
          aria-hidden="true"
        />

        {/* Degradé inferior global al expandir */}
        <div
          className={[
            'absolute inset-x-0 bottom-0 h-[72%]',
            'bg-gradient-to-t from-neutral-950 via-neutral-950/95 via-50% to-transparent',
            'transition-opacity duration-700 ease-out',
            isOpen ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          aria-hidden="true"
        />

        {/* Feedback al tocar */}
        <div
          className={[
            'absolute inset-0 bg-neutral-950 transition-opacity duration-300 ease-out',
            'opacity-0 group-active:opacity-25',
            isOpen ? 'opacity-0' : 'group-hover:opacity-10',
          ].join(' ')}
          aria-hidden="true"
        />

        <div className="relative flex min-h-[5.5rem] shrink-0 items-center justify-between gap-3 px-4 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="shrink-0 text-xs font-semibold tabular-nums text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.65)]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-base font-semibold leading-snug tracking-tight text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.7)]">
              {reason.title}
            </span>
          </div>
          <span className="shrink-0 text-lg text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
            {isOpen ? '−' : '+'}
          </span>
        </div>

        <div
          className={[
            'relative mt-auto grid w-full',
            'transition-[grid-template-rows] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          ].join(' ')}
        >
          <div className="overflow-hidden">
            <div
              className={[
                'relative px-4 pb-6 pt-10',
                'transition-[opacity,transform] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                isOpen ? 'translate-y-0 opacity-100 delay-100' : 'translate-y-3 opacity-0 delay-0',
              ].join(' ')}
            >
              {/* Scrim dedicado detrás del texto */}
              <div
                className="pointer-events-none absolute inset-x-0 -top-10 bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/98 to-neutral-950/75"
                aria-hidden="true"
              />
              <div className="relative">
                <div className="mb-3 h-px w-10 bg-[var(--alcohn-bronze)]" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">
                  {reason.copy}
                </p>
              </div>
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}

export default function WhyChooseDifferentiatorsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState<number | null>(0);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || prefersReducedMotion()) return;

      const intro = section.querySelector<HTMLElement>('[data-diff-intro]');
      if (intro) {
        bindScrollReveal(intro, {
          to: { y: 0, opacity: 1, duration: 0.8, ease: revealEase },
          start: 'top 88%',
        });
      }

      const mm = gsap.matchMedia();

      mm.add('(min-width: 768px)', () => {
        const tiles = gsap.utils.toArray<HTMLElement>('[data-mosaic-tile]', section);

        tiles.forEach((tile, index) => {
          const imageWrap = tile.querySelector<HTMLElement>('[data-mosaic-image-wrap]');
          const image = tile.querySelector<HTMLElement>('.mosaic-card__img');
          const content = tile.querySelector<HTMLElement>('[data-mosaic-content]');
          const line = tile.querySelector<HTMLElement>('[data-mosaic-line]');
          const indexEl = tile.querySelector<HTMLElement>('[data-mosaic-index]');

          if (imageWrap) gsap.set(imageWrap, { clipPath: 'inset(0 100% 0 0)' });
          if (image) gsap.set(image, { scale: 1.08 });
          if (content) gsap.set(content, { y: 24, opacity: 0 });
          if (line) gsap.set(line, { scaleX: 0 });
          if (indexEl) gsap.set(indexEl, { opacity: 0 });

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: tile,
              start: 'top 88%',
              toggleActions: 'play reverse play reverse',
            },
            delay: index * 0.06,
          });

          timeline
            .to(imageWrap, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power3.out' }, 0)
            .to(image, { scale: 1, duration: 1.05, ease: 'power3.out' }, 0)
            .to(indexEl, { opacity: 1, duration: 0.5, ease: revealEase }, 0.15)
            .to(line, { scaleX: 1, duration: 0.65, ease: revealEase }, 0.22)
            .to(content, { y: 0, opacity: 1, duration: 0.72, ease: revealEase }, 0.24);

          if (image) {
            gsap.to(image, {
              yPercent: 6,
              ease: 'none',
              scrollTrigger: {
                trigger: tile,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5,
              },
            });
          }
        });
      });

      mm.add('(max-width: 767px)', () => {
        const panels = gsap.utils.toArray<HTMLElement>('[data-mobile-panel]', section);
        if (!panels.length) return;
        gsap.set(panels, { y: 20, opacity: 0 });
        bindScrollReveal(panels, {
          from: { y: 20, opacity: 0 },
          to: { y: 0, opacity: 1, duration: 0.65, ease: revealEase },
          start: 'top 92%',
          stagger: 0.08,
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="mb-20" aria-labelledby="por-que-elegirnos-heading">
      <div className="technical-sheet">
        <WhyChooseIntro />

        <div className="relative z-10 hidden md:grid md:grid-cols-2">
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

        <div className="relative z-10 md:hidden">
          {whyChooseReasons.map((reason, index) => (
            <div key={reason.title} data-mobile-panel>
              <MobilePanelCard
                reason={reason}
                index={index}
                isOpen={mobileOpen === index}
                onToggle={() => setMobileOpen(mobileOpen === index ? null : index)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
