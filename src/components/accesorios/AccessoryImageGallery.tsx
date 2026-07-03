'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface AccessoryImageGalleryProps {
  images: string[];
  alt: string;
  interval?: number;
  priority?: boolean;
  className?: string;
}

function altFromImagePath(src: string, fallback: string): string {
  const filename = src.split('/').pop()?.replace(/\.[^.]+$/, '').replace(/-/g, ' ');
  if (!filename) return fallback;
  return filename.charAt(0).toUpperCase() + filename.slice(1);
}

export default function AccessoryImageGallery({
  images,
  alt,
  interval = 4000,
  priority = true,
  className = '',
}: AccessoryImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [images.length, interval]);

  if (images.length === 0) return null;

  return (
    <div className={`relative aspect-square w-full overflow-hidden bg-[var(--alcohn-surface)] ${className}`}>
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={altFromImagePath(src, `${alt} - imagen ${index + 1}`)}
          fill
          className={`object-contain p-4 transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={priority && index === 0}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 px-4" aria-hidden="true">
          {images.map((src, index) => (
            <span
              key={src}
              className={`h-1 flex-1 max-w-8 transition-colors duration-300 ${
                index === currentIndex ? 'bg-[var(--alcohn-bronze)]' : 'bg-neutral-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
