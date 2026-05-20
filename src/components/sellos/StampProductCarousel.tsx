'use client';

import AutoImageCarousel from '@/components/AutoImageCarousel';
import type { ProductCarouselImage } from '@/lib/stampProductCarousel';

interface StampProductCarouselProps {
  images: ProductCarouselImage[];
}

export default function StampProductCarousel({ images }: StampProductCarouselProps) {
  return (
    <div className="material-frame relative aspect-[4/3] overflow-hidden">
      <AutoImageCarousel images={images} interval={3500} />
    </div>
  );
}
