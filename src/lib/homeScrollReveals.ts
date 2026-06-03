import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  cardFrom,
  cardHide,
  cardTo,
  introHide,
  panelFrom,
  panelHide,
  panelTo,
  prefersReducedMotion,
  revealFrom,
  revealTo,
} from '@/lib/motion';
import { bindTitleKeywordHighlights } from '@/lib/titleKeywordHighlight';

const scrollZone = {
  start: 'top 90%',
  end: 'bottom 12%',
} as const;

const panelZone = {
  start: 'top 92%',
  end: 'bottom 10%',
} as const;

function animateIn(targets: gsap.TweenTarget, vars: gsap.TweenVars = {}) {
  gsap.to(targets, { overwrite: 'auto', ...vars });
}

function isScrollTriggerTarget(el: HTMLElement) {
  const { display, visibility } = getComputedStyle(el);
  return display !== 'contents' && visibility !== 'hidden' && el.offsetHeight > 0;
}

function bindBidirectional(
  elements: HTMLElement[],
  showVars: gsap.TweenVars,
  hideVars: gsap.TweenVars,
  zone: { start: string; end: string },
  cleanups: Array<() => void>,
  batchOptions?: { interval?: number; batchMax?: number }
) {
  if (!elements.length) return;

  if (elements.length === 1) {
    const el = elements[0];
    const trigger = ScrollTrigger.create({
      trigger: el,
      ...zone,
      onEnter: () => animateIn(el, showVars),
      onLeave: () => animateIn(el, hideVars),
      onEnterBack: () => animateIn(el, showVars),
      onLeaveBack: () => animateIn(el, hideVars),
    });
    cleanups.push(() => trigger.kill());
    return;
  }

  const triggers = ScrollTrigger.batch(elements, {
    interval: batchOptions?.interval ?? 0.08,
    batchMax: batchOptions?.batchMax ?? 2,
    ...zone,
    onEnter: (batch) => animateIn(batch, { ...showVars, stagger: showVars.stagger ?? 0.08 }),
    onLeave: (batch) => animateIn(batch, { ...hideVars, stagger: hideVars.stagger ?? 0.05 }),
    onEnterBack: (batch) => animateIn(batch, { ...showVars, stagger: showVars.stagger ?? 0.08 }),
    onLeaveBack: (batch) => animateIn(batch, { ...hideVars, stagger: hideVars.stagger ?? 0.05 }),
  });
  cleanups.push(() => triggers.forEach((trigger) => trigger.kill()));
}

export function initHomeScrollReveals(scopeRoot: HTMLElement): () => void {
  if (prefersReducedMotion()) {
    return () => {};
  }

  const cleanups: Array<() => void> = [];

  const desktopPanels = gsap.utils
    .toArray<HTMLElement>('[data-scroll-panel]', scopeRoot)
    .filter(isScrollTriggerTarget);
  const mobilePanels = gsap.utils
    .toArray<HTMLElement>('[data-scroll-panel-mobile]', scopeRoot)
    .filter(isScrollTriggerTarget);

  const panelMedia = gsap.matchMedia();
  panelMedia.add('(min-width: 768px)', () => {
    if (mobilePanels.length) {
      gsap.set(mobilePanels, { opacity: 1, y: 0, scale: 1, clearProps: 'opacity,transform,filter' });
    }
    if (!desktopPanels.length) return;
    gsap.set(desktopPanels, panelFrom);
    bindBidirectional(desktopPanels, { ...panelTo }, { ...panelHide }, panelZone, cleanups, {
      interval: 0.12,
      batchMax: 1,
    });
  });
  panelMedia.add('(max-width: 767px)', () => {
    if (desktopPanels.length) {
      gsap.set(desktopPanels, { opacity: 1, y: 0, scale: 1, clearProps: 'opacity,transform,filter' });
    }
    if (!mobilePanels.length) return;
    gsap.set(mobilePanels, panelFrom);
    bindBidirectional(mobilePanels, { ...panelTo }, { ...panelHide }, panelZone, cleanups, {
      interval: 0.12,
      batchMax: 1,
    });
  });
  cleanups.push(() => panelMedia.revert());

  const intros = gsap.utils
    .toArray<HTMLElement>('[data-scroll-intro]', scopeRoot)
    .filter((el) => !el.closest('[data-scroll-panel]') && isScrollTriggerTarget(el));
  if (intros.length) {
    gsap.set(intros, revealFrom);
    bindBidirectional(intros, { ...revealTo, duration: 0.7 }, introHide, scrollZone, cleanups);
  }

  const cards = gsap.utils.toArray<HTMLElement>('[data-scroll-card]', scopeRoot);
  if (cards.length) {
    gsap.set(cards, cardFrom);
    bindBidirectional(
      cards,
      { ...cardTo, stagger: 0.09 },
      { ...cardHide, stagger: 0.05 },
      scrollZone,
      cleanups,
      { interval: 0.08, batchMax: 3 }
    );
  }

  bindTitleKeywordHighlights(scopeRoot, cleanups);

  const finalCta = scopeRoot.querySelector('[data-final-cta]');
  if (finalCta) {
    gsap.set(finalCta, revealFrom);
    const ctaTrigger = ScrollTrigger.create({
      trigger: finalCta,
      start: 'top 88%',
      end: 'bottom 15%',
      onEnter: () => animateIn(finalCta, { ...revealTo, duration: 0.65 }),
      onLeave: () => animateIn(finalCta, introHide),
      onEnterBack: () => animateIn(finalCta, { ...revealTo, duration: 0.65 }),
      onLeaveBack: () => animateIn(finalCta, introHide),
    });
    cleanups.push(() => ctaTrigger.kill());
  }

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
