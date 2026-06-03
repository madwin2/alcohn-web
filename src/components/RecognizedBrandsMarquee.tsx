'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { brands, type Brand } from '@/data/brands';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(useGSAP);

const VISIBLE_COUNT = 6;
const DWELL_SECONDS = 4.2;

function buildBrandSets(items: Brand[], size: number): Brand[][] {
  if (items.length === 0) return [];

  const sets: Brand[][] = [];
  for (let i = 0; i < items.length; i += size) {
    sets.push(items.slice(i, i + size));
  }

  const last = sets[sets.length - 1];
  if (last.length < size) {
    let fill = 0;
    while (last.length < size) {
      last.push(items[fill % items.length]);
      fill += 1;
    }
  }

  return sets;
}

export default function RecognizedBrandsMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const brandSets = useMemo(() => buildBrandSets(brands, VISIBLE_COUNT), []);
  const [setIndex, setSetIndex] = useState(0);
  const activeBrands = brandSets[setIndex] ?? brandSets[0] ?? [];

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      const slots = gsap.utils.toArray<HTMLElement>('[data-brand-slot]', root);
      if (!slots.length) return;

      if (prefersReducedMotion()) {
        if (brandSets.length <= 1) return;
        const interval = window.setInterval(() => {
          setSetIndex((index) => (index + 1) % brandSets.length);
        }, DWELL_SECONDS * 1000);
        return () => window.clearInterval(interval);
      }

      gsap.set(slots, { transformPerspective: 700, transformOrigin: '50% 100%' });

      gsap.fromTo(
        slots,
        {
          opacity: 0,
          y: 26,
          scale: 0.72,
          rotationX: -22,
          filter: 'blur(5px)',
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          filter: 'blur(0px)',
          duration: 0.82,
          ease: 'power3.out',
          stagger: {
            each: 0.09,
            from: 'center',
          },
        }
      );

      if (brandSets.length <= 1) return;

      const exitTimer = gsap.delayedCall(DWELL_SECONDS, () => {
        gsap.to(slots, {
          opacity: 0,
          y: 18,
          scaleY: 0.35,
          scaleX: 0.9,
          rotationX: 16,
          filter: 'blur(4px)',
          duration: 0.58,
          ease: 'power4.in',
          stagger: {
            each: 0.065,
            from: 'random',
          },
          onComplete: () => {
            setSetIndex((index) => (index + 1) % brandSets.length);
          },
        });
      });

      return () => {
        exitTimer.kill();
      };
    },
    { dependencies: [setIndex], scope: containerRef, revertOnUpdate: true }
  );

  return (
    <section
      className="recognized-brands-showcase mb-14 md:mb-20"
      aria-label="Marcas y talleres que ya marcan con Alcohn"
    >
      <h2 className="recognized-brands-showcase__title mx-auto mb-6 max-w-4xl text-center text-2xl font-semibold leading-tight tracking-tight text-neutral-900 md:mb-8 md:text-4xl lg:text-5xl">
        Marcas y talleres que ya marcan con Alcohn
      </h2>

      <div ref={containerRef} className="recognized-brands-showcase__stage -mx-4 md:-mx-8">
        <div
          className="recognized-brands-grid border-y border-[var(--alcohn-line)]"
          role="region"
          aria-live="polite"
          aria-label={`Grupo ${setIndex + 1} de ${brandSets.length} marcas`}
        >
          {activeBrands.map((brand) => (
            <div key={`${setIndex}-${brand.name}`} data-brand-slot className="recognized-brands-grid__cell">
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={180}
                  height={72}
                  className="logo-cloud-brand"
                />
              ) : (
                <span className="craft-label normal-case tracking-normal">{brand.name}</span>
              )}
            </div>
          ))}
        </div>

        {brandSets.length > 1 && (
          <p className="craft-label mt-4 text-center normal-case tracking-normal text-neutral-500">
            {String(setIndex + 1).padStart(2, '0')} / {String(brandSets.length).padStart(2, '0')}
          </p>
        )}
      </div>
    </section>
  );
}
