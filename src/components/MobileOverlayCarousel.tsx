'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface MobileOverlayCarouselItem {
  key: string;
  image: string;
  alt: string;
  href?: string;
  caption?: { label: string; title: string };
  overlay?: ReactNode;
}

interface MobileOverlayCarouselProps {
  items: MobileOverlayCarouselItem[];
  showDots?: boolean;
  onLinkClick?: () => void;
  squareMedia?: boolean;
}

export default function MobileOverlayCarousel({
  items,
  showDots = false,
  onLinkClick,
  squareMedia = false,
}: MobileOverlayCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length <= 1) return;

    const updateActiveIndex = () => {
      const slide = track.children[0] as HTMLElement | undefined;
      if (!slide) return;
      const step = slide.offsetWidth;
      if (step <= 0) return;
      const nextIndex = Math.round(track.scrollLeft / step);
      setActiveIndex(Math.min(Math.max(nextIndex, 0), items.length - 1));
    };

    updateActiveIndex();
    track.addEventListener('scroll', updateActiveIndex, { passive: true });
    window.addEventListener('resize', updateActiveIndex);
    return () => {
      track.removeEventListener('scroll', updateActiveIndex);
      window.removeEventListener('resize', updateActiveIndex);
    };
  }, [items.length]);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[0] as HTMLElement | undefined;
    if (!slide) return;
    const clamped = Math.min(Math.max(index, 0), items.length - 1);
    track.scrollTo({ left: clamped * slide.offsetWidth, behavior: 'smooth' });
    setActiveIndex(clamped);
  };

  const scrollByOne = (direction: -1 | 1) => {
    scrollToIndex(activeIndex + direction);
  };

  if (items.length === 0) return null;

  const hasControls = items.length > 1;

  return (
    <div className="mobile-story-carousel">
      <div ref={trackRef} className="mobile-story-track">
        {items.map((item) => {
          const mediaContent = (
            <>
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
              {item.overlay && (
                <>
                  <div className="mobile-story-media-gradient" />
                  <div className="mobile-story-overlay">{item.overlay}</div>
                </>
              )}
            </>
          );

          const mediaAspectClass = item.overlay
            ? 'mobile-story-media--overlay'
            : squareMedia || item.caption
              ? 'mobile-story-media--square'
              : '';

          const media = (
            <div className={`mobile-story-media ${mediaAspectClass}`.trim()}>
              {item.href ? (
                <Link href={item.href} className="absolute inset-0 block" onClick={onLinkClick}>
                  {mediaContent}
                </Link>
              ) : (
                mediaContent
              )}
              {hasControls && (
                <>
                  <button
                    type="button"
                    onClick={() => scrollByOne(-1)}
                    className="mobile-story-arrow mobile-story-arrow--left"
                    aria-label="Anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollByOne(1)}
                    className="mobile-story-arrow mobile-story-arrow--right"
                    aria-label="Siguiente"
                  >
                    ›
                  </button>
                  {showDots && (
                    <div className="mobile-story-dots" aria-hidden="true">
                      {items.map((dotItem, index) => (
                        <button
                          key={dotItem.key}
                          type="button"
                          className={`mobile-story-dot ${activeIndex === index ? 'is-active' : ''}`.trim()}
                          onClick={() => scrollToIndex(index)}
                          tabIndex={-1}
                          aria-label={`Ir a ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );

          return (
            <article key={item.key} className="mobile-story-slide">
              {media}
              {item.caption && (
                <div className="mobile-story-caption">
                  {item.caption.label ? (
                    <p className="craft-label mb-2">{item.caption.label}</p>
                  ) : null}
                  <h3 className="text-[0.97rem] font-semibold leading-snug text-neutral-950">{item.caption.title}</h3>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
