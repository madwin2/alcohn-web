'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollImagesProps {
  images: Array<{ id: number; top: string; right: string; bgColor?: string; src?: string; alt?: string }>;
  sectionId?: string;
}

export default function ScrollImages({ images, sectionId }: ScrollImagesProps) {
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const isProcessing = useRef(false);
  const lockedScrollY = useRef(0);

  useEffect(() => {
    sectionRef.current = sectionId 
      ? document.getElementById(sectionId) 
      : containerRef.current?.closest('section') || null;
  }, [sectionId]);

  useEffect(() => {
    const showNextImage = () => {
      if (currentImageIndex < images.length - 1 && !isProcessing.current) {
        isProcessing.current = true;
        const nextIndex = currentImageIndex + 1;
        setCurrentImageIndex(nextIndex);
        
        const newVisibleImages = new Set<number>();
        for (let i = 0; i <= nextIndex; i++) {
          newVisibleImages.add(images[i].id);
        }
        setVisibleImages(newVisibleImages);
        
        // Desbloquear después de la animación
        setTimeout(() => {
          isProcessing.current = false;
        }, 700);
        
        return true;
      }
      return false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!sectionRef.current || isProcessing.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;

      // Calcular posición óptima para ver las imágenes (30% desde arriba)
      const optimalTop = windowHeight * 0.3;
      const optimalBottom = windowHeight * 0.7;
      
      // Verificar si la sección está en la zona óptima (con un margen de tolerancia)
      const isInOptimalZone = sectionTop <= optimalTop + 50 && sectionBottom >= optimalBottom - 50;
      
      // Si estamos scrolleando hacia abajo
      if (e.deltaY > 0) {
        // Si estamos en la zona óptima y no todas las imágenes están visibles, bloquear scroll
        if (isInOptimalZone && currentImageIndex < images.length - 1) {
          e.preventDefault();
          e.stopPropagation();
          
          // Guardar la posición actual si es la primera vez
          if (lockedScrollY.current === 0) {
            lockedScrollY.current = window.scrollY;
          }
          
          // Mostrar siguiente imagen
          showNextImage();
          
          return false;
        }
        // Si todas las imágenes están visibles o no estamos en la zona óptima, permitir scroll normal
        if (currentImageIndex >= images.length - 1) {
          lockedScrollY.current = 0;
        }
      }
      // Si scrolleamos hacia arriba, permitir scroll normal y resetear
      else if (e.deltaY < 0) {
        lockedScrollY.current = 0;
      }
    };

    const handleScroll = () => {
      if (!sectionRef.current || isProcessing.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionTop = rect.top;

      // Calcular posición óptima
      const optimalTop = windowHeight * 0.3;
      const optimalBottom = windowHeight * 0.7;
      const isInOptimalZone = sectionTop <= optimalTop + 50 && sectionTop + rect.height >= optimalBottom - 50;

      // Solo bloquear si estamos en la zona óptima y no todas las imágenes están visibles
      if (isInOptimalZone && currentImageIndex < images.length - 1 && lockedScrollY.current > 0) {
        // Mantener la posición bloqueada (con pequeña tolerancia para evitar jitter)
        if (Math.abs(window.scrollY - lockedScrollY.current) > 5) {
          window.scrollTo({
            top: lockedScrollY.current,
            behavior: 'auto'
          });
        }
      } else {
        lockedScrollY.current = 0;
      }
    };

    // Usar wheel event para detectar intentos de scroll
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [images, currentImageIndex]);

  return (
    <div ref={containerRef} className="relative w-full min-h-[600px]">
      {images.map((image) => (
        <div
          key={image.id}
          className="absolute transition-all duration-700 ease-out"
          style={{
            top: image.top,
            right: image.right,
            backgroundColor: image.bgColor,
            opacity: visibleImages.has(image.id) ? 1 : 0,
            transform: visibleImages.has(image.id) ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            zIndex: image.id,
            maxWidth: image.id >= 4 ? '320px' : '400px',
            width: 'auto',
            height: 'auto',
          }}
        >
          {image.src ? (
            <img
              src={image.src}
              alt={image.alt || 'Imagen'}
              className="block"
              style={{ 
                maxWidth: image.id >= 4 ? '320px' : '400px',
                maxHeight: image.id >= 4 ? '400px' : '500px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

