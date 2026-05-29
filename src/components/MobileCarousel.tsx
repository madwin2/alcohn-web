'use client';

import { Children, useEffect, useMemo, useRef, useState, type MutableRefObject, type Ref } from 'react';

interface MobileCarouselProps {
  children: React.ReactNode;
  rowClassName?: string;
  className?: string;
  hint?: string;
  mobileLayout?: 'grid' | 'scroll';
  onActiveIndexChange?: (index: number) => void;
  scrollRowRef?: Ref<HTMLDivElement>;
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as MutableRefObject<T | null>).current = node;
      }
    });
  };
}

export default function MobileCarousel({
  children,
  rowClassName = '',
  className = '',
  hint = 'Deslizá',
  mobileLayout = 'scroll',
  onActiveIndexChange,
  scrollRowRef,
}: MobileCarouselProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => Array.from(Children.toArray(children)), [children]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const updateActiveIndex = () => {
      const firstChild = row.children[0] as HTMLElement | undefined;
      if (!firstChild) return;

      const canScroll = row.scrollWidth - row.clientWidth > 12;
      setIsScrollable(canScroll);
      if (!canScroll) {
        setActiveIndex(0);
        return;
      }

      const rowStyles = window.getComputedStyle(row);
      const gap = Number.parseFloat(rowStyles.columnGap || rowStyles.gap || '0') || 0;
      const step = firstChild.offsetWidth + gap;
      if (step <= 0) return;

      const nextIndex = Math.round(row.scrollLeft / step);
      const maxIndex = Math.max(items.length - 1, 0);
      setActiveIndex(Math.min(Math.max(nextIndex, 0), maxIndex));
    };

    updateActiveIndex();
    row.addEventListener('scroll', updateActiveIndex, { passive: true });
    window.addEventListener('resize', updateActiveIndex);
    return () => {
      row.removeEventListener('scroll', updateActiveIndex);
      window.removeEventListener('resize', updateActiveIndex);
    };
  }, [items.length]);

  useEffect(() => {
    onActiveIndexChange?.(activeIndex);
  }, [activeIndex, onActiveIndexChange]);

  const scrollByOne = (direction: -1 | 1) => {
    const row = rowRef.current;
    if (!row) return;
    const firstChild = row.children[0] as HTMLElement | undefined;
    if (!firstChild) return;

    const rowStyles = window.getComputedStyle(row);
    const gap = Number.parseFloat(rowStyles.columnGap || rowStyles.gap || '0') || 0;
    const step = firstChild.offsetWidth + gap;
    row.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  const rowLayoutClass =
    mobileLayout === 'scroll' ? 'mobile-snap-row--scroll' : 'mobile-snap-row--grid';

  return (
    <div className={`mobile-carousel ${className}`.trim()}>
      <div ref={mergeRefs(rowRef, scrollRowRef)} className={`mobile-snap-row ${rowLayoutClass} ${rowClassName}`.trim()}>
        {children}
      </div>

      {mobileLayout === 'scroll' && items.length > 1 && isScrollable && (
        <div className="mobile-carousel-ui md:hidden">
          <button
            type="button"
            onClick={() => scrollByOne(-1)}
            className="mobile-carousel-arrow"
            aria-label="Ver elemento anterior"
          >
            ‹
          </button>

          <div className="mobile-carousel-center">
            <p className="mobile-carousel-hint">{hint}</p>
            <div className="mobile-carousel-dots" aria-hidden="true">
              {items.map((_, index) => (
                <span
                  key={`dot-${index}`}
                  className={`mobile-carousel-dot ${activeIndex === index ? 'is-active' : ''}`.trim()}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollByOne(1)}
            className="mobile-carousel-arrow"
            aria-label="Ver elemento siguiente"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
