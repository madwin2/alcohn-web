'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Imagen provisoria: se reemplaza por la foto definitiva del hero.
const HERO_IMAGE = '/images/hero/sello-bronce-hero-taller-alcohn.jpeg';

export default function AboutHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || prefersReducedMotion()) return;

      gsap.set('.about-hero__media', { clipPath: 'inset(0% 0px 0% 0px)' });
      gsap.set('.about-hero__img', { scale: 1.12, transformOrigin: '50% 50%' });
      gsap.set('.about-hero__plate-label', { autoAlpha: 0, y: 14 });

      const headerOffset = () =>
        document.querySelector('header')?.offsetHeight ?? 0;

      // Inset lateral en px para que la "lámina" final quede alineada con el
      // contenido de la página (container max-w-7xl con px-4 / md:px-8).
      const sideInset = () => {
        const vw = section.offsetWidth;
        const pad = vw >= 768 ? 32 : 16;
        const contentWidth = Math.min(vw, 1280) - pad * 2;
        return Math.max((vw - contentWidth) / 2, 0);
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: () => `top ${headerOffset()}px`,
          end: '+=90%',
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        '.about-hero__content',
        { yPercent: -26, autoAlpha: 0, duration: 0.5, ease: 'power1.in' },
        0
      )
        .to('.about-hero__cue', { autoAlpha: 0, duration: 0.18, ease: 'power1.out' }, 0)
        .to(
          '.about-hero__media',
          {
            clipPath: () => `inset(13% ${sideInset()}px 12% ${sideInset()}px)`,
            duration: 1,
            ease: 'power2.inOut',
          },
          0
        )
        .to('.about-hero__img', { scale: 1, duration: 1, ease: 'power2.inOut' }, 0)
        .to('.about-hero__overlay', { opacity: 0.3, duration: 1, ease: 'power1.inOut' }, 0)
        .to(
          '.about-hero__plate-label',
          { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power1.out' },
          0.66
        );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Sobre Alcohn"
      className="about-hero relative h-[calc(100svh-3.5rem)] w-full overflow-hidden lg:h-[calc(100svh-4rem)]"
    >
      <div className="about-hero__media absolute inset-0 will-change-[clip-path]">
        <Image
          src={HERO_IMAGE}
          alt="Taller Alcohn en Mar del Plata, fabricación de sellos de bronce"
          fill
          priority
          sizes="100vw"
          className="about-hero__img object-cover will-change-transform"
        />
        <div className="about-hero__overlay absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/65" />
      </div>

      <div className="about-hero__content absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
        <p className="motion-reveal mb-5 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/85 md:mb-6 md:text-xs">
          <span className="h-px w-8 bg-white/40 md:w-12" aria-hidden="true" />
          Sobre Alcohn
          <span className="h-px w-8 bg-white/40 md:w-12" aria-hidden="true" />
        </p>
        <h1 className="motion-reveal-delay max-w-5xl text-balance text-4xl font-semibold leading-[1.04] tracking-tight text-white md:text-7xl md:leading-[0.98]">
          Diseño Industrial aplicado al{' '}
          <span className="text-[var(--alcohn-bronze)]">Oficio</span>
        </h1>
      </div>

      <div className="about-hero__cue absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
          Scroll
        </span>
        <span className="about-hero__cue-line" aria-hidden="true" />
      </div>

      <p className="about-hero__plate-label absolute inset-x-0 bottom-[3.5%] z-[5] text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-500 opacity-0 md:text-xs">
        Taller Alcohn · Mar del Plata
      </p>
    </section>
  );
}
