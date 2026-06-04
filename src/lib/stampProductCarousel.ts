import type { StampUseCase } from '@/data/stampUseCases';

export type ProductCarouselImage = {
  id: number;
  src: string;
  alt: string;
};

const STAMP_PRODUCT_CAROUSEL_SRCS = [
  '/images/producto/sello-bronce-galeria-01.webp',
  '/images/producto/sello-bronce-galeria-02.webp',
  '/images/producto/sello-bronce-galeria-03.webp',
  '/images/producto/sello-bronce-galeria-04.webp',
  '/images/producto/sello-bronce-galeria-05.webp',
] as const;

export function getProductCarouselImages(useCase: StampUseCase): ProductCarouselImage[] {
  return STAMP_PRODUCT_CAROUSEL_SRCS.map((src, index) => ({
    id: index + 1,
    src,
    alt: useCase.productAlt,
  }));
}
