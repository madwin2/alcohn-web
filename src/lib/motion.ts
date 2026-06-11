import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const revealEase = 'power2.out';

export const revealFrom = {
  y: 22,
  opacity: 0,
} as const;

export const revealTo = {
  y: 0,
  opacity: 1,
  duration: 0.72,
  ease: revealEase,
} as const;

export const cardFrom = {
  y: 28,
  opacity: 0,
  scale: 0.97,
} as const;

export const cardTo = {
  y: 0,
  opacity: 1,
  scale: 1,
  duration: 0.62,
  ease: revealEase,
} as const;

export const cardHide = {
  y: 20,
  opacity: 0,
  scale: 0.98,
  duration: 0.48,
  ease: 'power2.in',
} as const;

export const introHide = {
  y: 16,
  opacity: 0,
  duration: 0.42,
  ease: 'power2.in',
} as const;

export const panelFrom = {
  y: 40,
  opacity: 0,
  scale: 0.985,
} as const;

export const panelTo = {
  y: 0,
  opacity: 1,
  scale: 1,
  duration: 0.78,
  ease: revealEase,
} as const;

export const panelHide = {
  y: 28,
  opacity: 0,
  scale: 0.99,
  duration: 0.52,
  ease: 'power2.in',
} as const;

type ScrollRevealOptions = {
  from?: gsap.TweenVars;
  to: gsap.TweenVars;
  start?: string;
  stagger?: number;
  playImmediately?: boolean;
};

export function bindScrollReveal(
  targets: gsap.DOMTarget,
  { from = { y: 28, opacity: 0 }, to, start = 'top 88%', stagger = 0, playImmediately = false }: ScrollRevealOptions
) {
  const list = gsap.utils.toArray<HTMLElement>(targets);

  list.forEach((el, index) => {
    const delay = typeof to.delay === 'number' ? to.delay : stagger * index;

    if (playImmediately) {
      gsap.fromTo(el, from, { ...to, delay });
      return;
    }

    gsap.set(el, from);
    const tween = gsap.to(el, {
      ...to,
      delay,
      scrollTrigger: {
        trigger: el,
        start,
        once: true,
        toggleActions: 'play none none none',
      },
    });

    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) {
      tween.progress(1);
    }
  });
}
