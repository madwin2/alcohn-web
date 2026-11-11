'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ActionButton from './ActionButton';
import { useMarket } from '@/contexts/MarketContext';
import { formatMarketMoney } from '@/lib/markets/money';
import { convertPublicArsToMarketPrice } from '@/lib/markets/pricing';
import AutoImageCarousel from './AutoImageCarousel';
import GoogleReviewsBadge from './GoogleReviewsBadge';
import InstallmentsNote from './InstallmentsNote';
import GuaranteeNote from './GuaranteeNote';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(useGSAP);

interface HeroProps {
  title: string;
  /** Título corto solo para celular (el largo ocupaba media pantalla). */
  mobileTitle?: string;
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
  /** Celular: un botón principal y un link chico, en lugar de dos botones del mismo peso. */
  mobileCta?: {
    primary: { text: string; href: string };
    secondary?: { text: string; href: string };
  };
}

export default function Hero({
  title,
  mobileTitle,
  subtitle,
  priceFrom,
  primaryCta,
  secondaryCta,
  mobileCta,
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { market } = useMarket();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const targets = sectionRef.current?.querySelectorAll('[data-hero-reveal]');
      if (!targets?.length) return;

      // Solo un desplazamiento corto: el texto y los botones quedan visibles desde el HTML.
      // Con opacidad 0 hasta hidratar, en 4G flojo se veía varios segundos solo la foto.
      gsap.from(targets, {
        y: 16,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
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
      className="min-h-[70svh] md:min-h-[calc(100svh-4.5rem)] md:h-[calc(100vh-7rem)] py-8 md:py-0 flex items-center justify-center relative text-white overflow-hidden"
      data-snap-section
    >
      <div className="absolute inset-0 z-0">
        <AutoImageCarousel
          images={[
            {
              id: 1,
              src: '/images/hero/sello-bronce-hero-taller-alcohn.webp',
              alt: 'Taller artesanal con sello de bronce personalizado Alcohn',
            },
          ]}
          priority
          imageClassName="hero-bg-image"
          sizes="100vw"
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
            {mobileTitle ? (
              <>
                <span className="md:hidden">{mobileTitle}</span>
                <span className="hidden md:inline">{title}</span>
              </>
            ) : (
              title
            )}
          </h1>
          <p
            data-hero-reveal
            className="font-abacaxi mb-6 max-w-2xl text-[15px] font-normal not-italic leading-relaxed text-white/95 sm:text-lg md:mb-10 md:text-xl md:font-thin md:italic md:text-white/90"
          >
            <span className="md:hidden">Sellos de bronce para cuero, madera, alimentos y packaging.</span>
            <span className="hidden md:inline">{subtitle}</span>
          </p>
          {priceFrom != null && (
            <div
              data-hero-reveal
              className="mb-6 text-[13px] font-semibold uppercase tracking-wide text-white/90 md:mb-8 md:text-base"
            >
              Desde {formatMarketMoney(convertPublicArsToMarketPrice(priceFrom, market), market)} ·
              <span className="md:hidden"> listo en 72 hs</span>
              <span className="hidden md:inline"> fabricación en 72hs hábiles</span>
              {/* Cuotas y garantía: en celular ya están en la barra superior y en cada ficha. */}
              <div className="hidden md:block">
                <InstallmentsNote
                  amount={priceFrom}
                  inverted
                  className="mt-1 font-normal normal-case tracking-normal"
                />
                <GuaranteeNote inverted className="mt-1 font-normal normal-case tracking-normal" />
              </div>
            </div>
          )}
          {mobileCta && (
            <div data-hero-reveal className="flex flex-col items-start gap-3 md:hidden">
              <ActionButton
                href={mobileCta.primary.href}
                variant="secondary"
                className="hero-cta hero-cta--solid w-full border-white bg-white text-neutral-900"
              >
                {mobileCta.primary.text}
              </ActionButton>
              {mobileCta.secondary && (
                <a
                  href={mobileCta.secondary.href}
                  className="inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold text-white underline decoration-[var(--alcohn-bronze)] underline-offset-4"
                >
                  {mobileCta.secondary.text} →
                </a>
              )}
            </div>
          )}
          {primaryCta && (
            <div
              data-hero-reveal
              className={`hero-cta-row flex flex-row flex-nowrap gap-2 sm:gap-3 ${mobileCta ? 'max-md:hidden' : ''}`}
            >
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
          <div data-hero-reveal className="mt-2 md:mt-6">
            <GoogleReviewsBadge tone="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
