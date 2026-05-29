'use client';

import AutoImageCarousel from '@/components/AutoImageCarousel';
import MobileOverlayCarousel from '@/components/MobileOverlayCarousel';
import type { ProductCarouselImage } from '@/lib/stampProductCarousel';

interface StampProductCarouselProps {
  images: ProductCarouselImage[];
}

export default function StampProductCarousel({ images }: StampProductCarouselProps) {
  return (
    <>
      <div className="md:hidden">
        <MobileOverlayCarousel
          showDots
          squareMedia
          items={images.map((image) => ({
            key: String(image.id),
            image: image.src,
            alt: image.alt,
          }))}
        />
      </div>

      <div className="material-frame relative hidden aspect-[4/3] overflow-hidden md:block">
        <AutoImageCarousel images={images} interval={3500} />
      </div>
    </>
  );
}
