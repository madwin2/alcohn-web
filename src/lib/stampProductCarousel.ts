import type { StampUseCase } from '@/data/stampUseCases';

export type ProductCarouselImage = {
  id: number;
  src: string;
  alt: string;
};

const STAMP_PRODUCT_CAROUSEL_SRCS = [
  '/images/producto/1.webp',
  '/images/producto/2.webp',
  '/images/producto/3.webp',
  '/images/producto/4.webp',
  '/images/producto/5.webp',
] as const;

export function getProductCarouselImages(useCase: StampUseCase): ProductCarouselImage[] {
  return STAMP_PRODUCT_CAROUSEL_SRCS.map((src, index) => ({
    id: index + 1,
    src,
    alt: useCase.productAlt,
  }));
}
