'use client';

import { useState, useEffect } from 'react';

interface AutoImageCarouselProps {
  images: Array<{ id: number; src?: string; alt: string; bgColor?: string }>;
  interval?: number;
}

export default function AutoImageCarousel({ images, interval = 4000 }: AutoImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {image.src ? (
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ backgroundColor: image.bgColor || '#d1d5db' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}



