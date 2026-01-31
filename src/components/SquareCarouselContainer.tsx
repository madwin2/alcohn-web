'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface SquareCarouselContainerProps {
  children: ReactNode;
}

export default function SquareCarouselContainer({ children }: SquareCarouselContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState<number>(0);

  useEffect(() => {
    const updateDimension = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // El carrusel debe ser cuadrado: usar el mínimo entre ancho y alto
      const size = Math.min(width, height);
      setDimension(size);
    };

    updateDimension();
    
    const resizeObserver = new ResizeObserver(updateDimension);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimension);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimension);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex items-start justify-center">
      <div
        style={{
          width: dimension > 0 ? `${dimension}px` : '100%',
          height: dimension > 0 ? `${dimension}px` : '100%',
          aspectRatio: '1 / 1',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
        {children}
      </div>
    </div>
  );
}

