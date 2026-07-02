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
          alt={`${alt} - imagen ${index + 1}`}
          fill
          className={`object-contain p-4 transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={priority && index === 0}
        />
      ))}
    </div>
  );
}
