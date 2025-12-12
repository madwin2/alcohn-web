'use client';

import { useState } from 'react';

interface HoverImageProps {
  defaultImage: { src?: string; alt: string; bgColor?: string };
  hoverImage: { src?: string; alt: string; bgColor?: string };
}

export default function HoverImage({ defaultImage, hoverImage }: HoverImageProps) {
  const [isHovered, setIsHovered] = useState(false);

  const currentImage = isHovered ? hoverImage : defaultImage;

  return (
    <div
      className="w-full h-full relative overflow-hidden transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {currentImage.src ? (
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
      ) : (
        <div
          className="w-full h-full transition-colors duration-500"
          style={{ backgroundColor: currentImage.bgColor || '#d1d5db' }}
        />
      )}
    </div>
  );
}



