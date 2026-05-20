'use client';

import { useState, useEffect, useRef } from 'react';

interface AutoImageCarouselProps {
  images: Array<{ id: number; src?: string; alt: string; bgColor?: string; label?: string; tip?: string }>;
  interval?: number;
  priority?: boolean;
  showCaption?: boolean;
}

export default function AutoImageCarousel({ images, interval = 4000, priority = false, showCaption = false }: AutoImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentImage = images[currentIndex] || images[0];

  useEffect(() => {
    if (priority) {
      setIsVisible(true);
      return;
    }

    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (!isVisible || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval, isVisible]);

  const imageContent = isVisible && currentImage?.src ? (
    <img
      key={currentImage.id}
      src={currentImage.src}
      alt={currentImage.alt}
      className="h-full w-full object-cover transition-transform duration-[1800ms] ease-out"
      loading={priority && currentIndex === 0 ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority && currentIndex === 0 ? 'high' : 'auto'}
    />
  ) : (
    <div
      key={currentImage?.id || 'placeholder'}
      className="h-full w-full"
      style={{ backgroundColor: currentImage?.bgColor || '#d1d5db' }}
    />
  );

  if (showCaption && currentImage) {
    return (
      <div ref={containerRef} className="flex h-full w-full flex-col bg-[var(--alcohn-surface)]">
        <div className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-square">
          {imageContent}
        </div>
        <div className="border-t border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-4 md:p-5">
          <div className="grid grid-cols-[1fr_auto] items-end gap-4">
            <div>
              <p className="craft-label mb-1">Aplicación real</p>
              <p className="text-lg font-semibold leading-tight text-neutral-950">{currentImage.label || currentImage.alt}</p>
              {currentImage.tip ? (
                <p className="mt-1 text-xs leading-relaxed text-neutral-600">{currentImage.tip}</p>
              ) : null}
            </div>
            <p className="shrink-0 text-xs font-semibold text-neutral-500">
              {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-8 gap-1" aria-hidden="true">
            {images.map((item, index) => (
              <span
                key={item.id}
                className={`h-0.5 ${index === currentIndex ? 'bg-[var(--alcohn-bronze)]' : 'bg-neutral-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {imageContent}
    </div>
  );
}





