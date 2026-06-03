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
