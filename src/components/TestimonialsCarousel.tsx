'use client';

import { useState, useEffect } from 'react';
import { Testimonial } from '@/data/testimonials';

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(2);

  // Ajustar items por vista según el tamaño de pantalla
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else {
        setItemsPerView(2);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const totalSlides = Math.ceil(testimonials.length / itemsPerView);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-play opcional (comentado por ahora)
  // useEffect(() => {
  //   const interval = setInterval(nextSlide, 5000);
  //   return () => clearInterval(interval);
  // }, [totalSlides]);

  const getCurrentTestimonials = () => {
    const start = currentIndex * itemsPerView;
    return testimonials.slice(start, start + itemsPerView);
  };

  return (
    <div className="relative">
      {/* Carrusel */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div
              key={slideIndex}
              className="min-w-full grid grid-cols-1 md:grid-cols-2 gap-6 px-2"
            >
              {testimonials
                .slice(slideIndex * itemsPerView, slideIndex * itemsPerView + itemsPerView)
                .map((testimonial, index) => (
                  <div
                    key={slideIndex * itemsPerView + index}
                    className="bg-secondary rounded-lg p-6 border-l-4 border-bronce hover:shadow-md transition-shadow"
                  >
                    {/* Estrellas */}
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5 text-accent fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      — {testimonial.name}
                    </p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Controles de navegación */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-secondary hover:bg-secondary-dark transition-colors"
          aria-label="Testimonio anterior"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Indicadores */}
        <div className="flex gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-bronce w-8'
                  : 'bg-secondary-dark w-2 hover:bg-gray-400'
              }`}
              aria-label={`Ir a testimonio ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-secondary hover:bg-secondary-dark transition-colors"
          aria-label="Siguiente testimonio"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Contador */}
      <div className="text-center mt-4 text-sm text-gray-500">
        {currentIndex + 1} de {totalSlides}
      </div>
    </div>
  );
}

