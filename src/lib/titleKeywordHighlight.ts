import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function ensureFillElement(keyword: HTMLElement): HTMLElement {
  const existing = keyword.querySelector<HTMLElement>('.title-keyword__fill');
  if (existing) return existing;

  const fill = document.createElement('span');
  fill.className = 'title-keyword__fill';
  fill.setAttribute('aria-hidden', 'true');
  keyword.prepend(fill);
  return fill;
}

function scrubDistance(keywordCount: number): number {
  const vh = window.innerHeight;
  const perKeyword = window.matchMedia('(max-width: 767px)').matches ? 0.28 : 0.38;
  return Math.round(vh * perKeyword * keywordCount);
}

function groupByHeadline(keywords: HTMLElement[]) {
  const groups = new Map<HTMLElement, HTMLElement[]>();

  keywords.forEach((keyword) => {
    const headline = keyword.closest<HTMLElement>('h2') ?? keyword;
    const list = groups.get(headline) ?? [];
    list.push(keyword);
    groups.set(headline, list);
  });

  return groups;
}

export function bindTitleKeywordHighlights(
  scopeRoot: HTMLElement,
  cleanups: Array<() => void>
) {
  const keywords = gsap.utils.toArray<HTMLElement>('[data-title-keyword]', scopeRoot);
  const groups = groupByHeadline(keywords);

  groups.forEach((groupKeywords, headline) => {
    const fills = groupKeywords.map((keyword) => {
      const fill = ensureFillElement(keyword);
      gsap.set(fill, { scaleX: 0, transformOrigin: 'left center' });
      return fill;
    });

    const scrollSpan = scrubDistance(groupKeywords.length);
    const segment = 1 / fills.length;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: headline,
        start: 'top 78%',
        end: `+=${scrollSpan}`,
        scrub: 0.65,
        invalidateOnRefresh: true,
      },
    });

    fills.forEach((fill, index) => {
      tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: segment }, index * segment);
    });

    cleanups.push(() => tl.scrollTrigger?.kill());
  });
}
