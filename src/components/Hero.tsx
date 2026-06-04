'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ActionButton from './ActionButton';
import { formatPriceFrom } from '@/lib/formatPrice';
import AutoImageCarousel from './AutoImageCarousel';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(useGSAP);

interface HeroProps {
  title: string;
  subtitle: string;
  priceFrom?: number;
  primaryCta?: {
    text: string;
    mobileText?: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    mobileText?: string;
    href: string;
  };
}

export default function Hero({ title, subtitle, priceFrom, primaryCta, secondaryCta }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const targets = sectionRef.current?.querySelectorAll('[data-hero-reveal]');
      if (!targets?.length) return;

      gsap.set(targets, { y: 32, opacity: 0 });
      gsap.to(targets, {
        y: 0,
        opacity: 1,
        duration: 0.95,
        stagger: 0.11,
        ease: 'power3.out',
        delay: 0.12,
      });

      const bgImage = sectionRef.current?.querySelector('.hero-bg-image');
      if (bgImage) {
        gsap.fromTo(
          bgImage,
          { scale: 1.08 },
          { scale: 1, duration: 2.4, ease: 'power2.out', delay: 0.05 }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="min-h-[78svh] md:min-h-[calc(100svh-4.5rem)] md:h-[calc(100vh-7rem)] py-8 md:py-0 flex items-center justify-center relative text-white overflow-hidden"
      data-snap-section
    >
      <div className="absolute inset-0 z-0">
        <AutoImageCarousel
          images={[
            {
              id: 1,
              src: '/images/hero/sello-bronce-hero-taller-alcohn.jpeg',
              alt: 'Taller artesanal con sello de bronce personalizado Alcohn',
            },
          ]}
          priority
          imageClassName="hero-bg-image"
        />
      </div>

      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(17,16,14,0.78)_0%,rgba(17,16,14,0.66)_55%,rgba(17,16,14,0.5)_100%)] md:bg-[linear-gradient(90deg,rgba(17,16,14,0.82)_0%,rgba(17,16,14,0.58)_45%,rgba(17,16,14,0.34)_100%)]" />
      <div className="hero-bottom-bridge" aria-hidden="true">
        <div className="hero-bottom-bridge__paper" />
        <div className="hero-bottom-bridge__grid" />
      </div>

      <div className="container mx-auto px-4 md:px-8 w-full relative z-20">
        <div className="max-w-5xl">
          <h1
            data-hero-reveal
            className="font-abacaxi text-[1.95rem] sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 md:mb-8 leading-[1.06] md:leading-[1.08] text-white tracking-tight drop-shadow-[0_12px_30px_rgba(0,0,0,0.55)]"
          >
            {title}
          </h1>
          <p
            data-hero-reveal
            className="font-abacaxi mb-6 max-w-2xl text-[15px] font-normal not-italic leading-relaxed text-white/95 sm:text-lg md:mb-10 md:text-xl md:font-thin md:italic md:text-white/90"
          >
            <span className="md:hidden">Sellos de bronce para cuero, madera, alimentos y packaging.</span>
            <span className="hidden md:inline">{subtitle}</span>
          </p>
          {priceFrom != null && (
            <p
              data-hero-reveal
              className="mb-6 text-sm font-semibold uppercase tracking-wide text-white/90 md:mb-8 md:text-base"
            >
              {formatPriceFrom(priceFrom)} · fabricación en 72hs hábiles
            </p>
          )}
          {primaryCta && (
            <div data-hero-reveal className="hero-cta-row flex flex-row flex-nowrap gap-2 sm:gap-3">
              <ActionButton
                href={primaryCta.href}
                variant="secondary"
                className="hero-cta hero-cta--solid min-w-0 flex-1 sm:w-auto sm:flex-none border-white bg-white text-neutral-900 hover:bg-[var(--alcohn-paper)] hover:border-[var(--alcohn-bronze)]"
              >
                <span className="md:hidden">{primaryCta.mobileText ?? primaryCta.text}</span>
                <span className="hidden md:inline">{primaryCta.text}</span>
              </ActionButton>
              {secondaryCta && (
                <ActionButton
                  href={secondaryCta.href}
                  variant="primary"
                  className="hero-cta hero-cta--frosted min-w-0 flex-1 sm:w-auto sm:flex-none md:bg-[var(--alcohn-ink)] md:border-[var(--alcohn-ink)]"
                >
                  <span className="md:hidden">{secondaryCta.mobileText ?? secondaryCta.text}</span>
                  <span className="hidden md:inline">{secondaryCta.text}</span>
                </ActionButton>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
