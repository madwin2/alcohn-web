'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { trustStats } from '@/data/trustStats';
import { prefersReducedMotion, revealEase } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function parseStatValue(value: string): { prefix: string; numeric: number; suffix: string } | null {
  const match = value.match(/^(\+?)(\d+)(.*)$/);
  if (!match) return null;
  return {
    prefix: match[1] ?? '',
    numeric: Number.parseInt(match[2], 10),
    suffix: match[3] ?? '',
  };
}

function formatCounterValue(prefix: string, amount: number, suffix: string) {
  const rounded = Math.round(amount);
  const body = rounded >= 1000 ? rounded.toLocaleString('es-AR') : String(rounded);
  return `${prefix}${body}${suffix}`;
}

export default function TrustStatsStrip() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || prefersReducedMotion()) return;

      const panel = section.querySelector<HTMLElement>('[data-trust-panel]');
      const items = gsap.utils.toArray<HTMLElement>('[data-trust-stat]', section);
      const labels = gsap.utils.toArray<HTMLElement>('[data-trust-label]', section);

      if (panel) gsap.set(panel, { opacity: 0, y: 14 });
      gsap.set(items, { y: 18, opacity: 0 });
      gsap.set(labels, { opacity: 0 });

      trustStats.forEach((stat, index) => {
        const parsed = parseStatValue(stat.value);
        if (!parsed) return;
        const valueEl = section.querySelector<HTMLElement>(`[data-trust-value="${index}"]`);
        if (valueEl) valueEl.textContent = formatCounterValue(parsed.prefix, 0, parsed.suffix);
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 88%',
          end: 'bottom 12%',
          toggleActions: 'play reverse play reverse',
        },
      });

      if (panel) {
        timeline.to(panel, { opacity: 1, y: 0, duration: 0.62, ease: revealEase }, 0);
      }

      timeline.to(
        items,
        {
          y: 0,
          opacity: 1,
          duration: 0.58,
          stagger: 0.09,
          ease: revealEase,
        },
        0.08
      );

      trustStats.forEach((stat, index) => {
        const parsed = parseStatValue(stat.value);
        if (!parsed) return;

        const valueEl = section.querySelector<HTMLElement>(`[data-trust-value="${index}"]`);
        if (!valueEl) return;

        const counter = { amount: 0 };
        timeline.to(
          counter,
          {
            amount: parsed.numeric,
            duration: 1.1,
            ease: 'power2.out',
            onUpdate: () => {
              valueEl.textContent = formatCounterValue(parsed.prefix, counter.amount, parsed.suffix);
            },
          },
          0.14 + index * 0.07
        );
      });

      timeline.to(
        labels,
        {
          opacity: 1,
          duration: 0.45,
          stagger: 0.07,
          ease: revealEase,
        },
        0.38
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Indicadores de confianza"
      className="trust-stats-strip w-full"
    >
      <div data-trust-grid className="trust-stats-strip__grid" aria-hidden="true" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        <div data-trust-panel className="trust-stats-strip__inner">
          {trustStats.map((stat, index) => (
            <div key={stat.label} data-trust-stat className="trust-stats-strip__cell">
              <p data-trust-value={index} className="trust-stats-strip__value tabular-nums">
                {stat.value}
              </p>
              <p data-trust-label className="trust-stats-strip__label">
                <span className="md:hidden">{stat.mobileLabel}</span>
                <span className="hidden md:inline">{stat.label}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
