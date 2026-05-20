'use client';

import { useState } from 'react';

interface HoverImageProps {
  defaultImage: { src?: string; alt: string; bgColor?: string };
  hoverImage: { src?: string; alt: string; bgColor?: string };
}

export default function HoverImage({ defaultImage, hoverImage }: HoverImageProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative h-full w-full cursor-pointer overflow-hidden bg-[var(--alcohn-paper-deep)]"
      role="button"
      tabIndex={0}
      aria-label={`${defaultImage.alt}. Ver resultado marcado.`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onClick={() => setIsHovered((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setIsHovered((value) => !value);
        }
      }}
    >
      {defaultImage.src ? (
        <img
          src={defaultImage.src}
          alt={defaultImage.alt}
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${isHovered ? 'scale-[1.02] opacity-0' : 'scale-100 opacity-100'}`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          style={{ backgroundColor: defaultImage.bgColor || '#d1d5db' }}
        />
      )}

      {hoverImage.src ? (
        <img
          src={hoverImage.src}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${isHovered ? 'scale-100 opacity-100' : 'scale-[1.02] opacity-0'}`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundColor: hoverImage.bgColor || '#d1d5db' }}
        />
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 border border-white/45 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase text-white backdrop-blur-sm transition-opacity duration-300">
        {isHovered ? 'Con sello' : 'Sin marca'}
      </div>
    </div>
  );
}





