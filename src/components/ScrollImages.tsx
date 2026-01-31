'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollImagesProps {
  images: Array<{ 
    id: number; 
    top: string; 
    right?: string; 
    left?: string; 
    rotation?: number;
    bgColor?: string; 
    src?: string; 
    alt?: string 
  }>;
  sectionId?: string;
}

interface ImageHoverState {
  x: number;
  y: number;
  isHovering: boolean;
}

export default function ScrollImages({ images, sectionId }: ScrollImagesProps) {
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const [hoverStates, setHoverStates] = useState<Map<number, ImageHoverState>>(new Map());
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const currentIndexRef = useRef(-1);
  const isProcessing = useRef(false);
  const visibleImagesRef = useRef<Set<number>>(new Set());

  // Detectar tamaño de ventana para responsive
  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Sincronizar refs
  useEffect(() => {
    currentIndexRef.current = currentImageIndex;
    visibleImagesRef.current = visibleImages;
  }, [currentImageIndex, visibleImages]);

  // Inicializar sectionRef
  useEffect(() => {
    const updateSectionRef = () => {
      let found = null;
      
      if (sectionId) {
        found = document.getElementById(sectionId);
      }
      
      if (!found && containerRef.current) {
        found = containerRef.current.closest('section');
      }
      
      if (!found && sectionId) {
        found = document.querySelector(`[id="${sectionId}"]`);
      }
      
      sectionRef.current = found;
    };
    
    updateSectionRef();
    const timeout1 = setTimeout(updateSectionRef, 300);
    const timeout2 = setTimeout(updateSectionRef, 800);
    const timeout3 = setTimeout(updateSectionRef, 1500);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [sectionId]);

  // Mostrar primeras imágenes (2 a la vez: izquierda y derecha)
  useEffect(() => {
    if (images.length === 0 || currentImageIndex >= 0) return;

    const showFirstImages = () => {
      // Encontrar primera imagen de izquierda y primera de derecha
      const leftImage = images.find(img => img.left !== undefined);
      const rightImage = images.find(img => img.right !== undefined);
      
      const firstIds = new Set<number>();
      if (leftImage) firstIds.add(leftImage.id);
      if (rightImage) firstIds.add(rightImage.id);
      
      // Si no hay pares, mostrar la primera imagen
      if (firstIds.size === 0 && images.length > 0) {
        firstIds.add(images[0].id);
      }
      
      currentIndexRef.current = firstIds.size - 1;
      setCurrentImageIndex(firstIds.size - 1);
      setVisibleImages(firstIds);
    };

    const timeoutId = setTimeout(showFirstImages, 500);

    const checkVisibility = () => {
      const section = sectionRef.current;
      if (!section || currentImageIndex >= 0) return;

      const rect = section.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible) {
        clearTimeout(timeoutId);
        showFirstImages();
      }
    };

    checkVisibility();

    const section = sectionRef.current;
    let observer: IntersectionObserver | null = null;
    
    if (section) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && currentImageIndex === -1) {
              clearTimeout(timeoutId);
              showFirstImages();
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(section);
    }

    window.addEventListener('scroll', checkVisibility, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', checkVisibility);
    };
  }, [images, currentImageIndex]);

  // Mostrar imágenes automáticamente cuando la sección está visible
  useEffect(() => {
    if (images.length === 0) return;

    const showNextImages = () => {
      if (isProcessing.current) return;
      
      isProcessing.current = true;
      
      // Usar función de actualización para obtener el estado actual
      setVisibleImages((prev) => {
        const visibleIds = Array.from(prev);
        
        // Si todas las imágenes ya están visibles, no hacer nada
        if (visibleIds.length >= images.length) {
          isProcessing.current = false;
          return prev;
        }
        
        // Encontrar las siguientes 2 imágenes no visibles (una de izquierda y una de derecha)
        const nextLeftImage = images.find(img => 
          !visibleIds.includes(img.id) && img.left !== undefined
        );
        const nextRightImage = images.find(img => 
          !visibleIds.includes(img.id) && img.right !== undefined
        );
        
        const newIds: number[] = [];
        if (nextLeftImage) newIds.push(nextLeftImage.id);
        if (nextRightImage) newIds.push(nextRightImage.id);
        
        // Si no hay pares, mostrar la siguiente imagen disponible
        if (newIds.length === 0) {
          const nextImage = images.find(img => !visibleIds.includes(img.id));
          if (nextImage) newIds.push(nextImage.id);
        }
        
        if (newIds.length > 0) {
          const currentIndex = currentIndexRef.current;
          const nextIndex = currentIndex + newIds.length;
          currentIndexRef.current = nextIndex;
          setCurrentImageIndex(nextIndex);
          
          const newSet = new Set(prev);
          newIds.forEach(id => newSet.add(id));
          
          // Desbloquear después de un breve delay para la animación
          setTimeout(() => {
            isProcessing.current = false;
          }, 300);
          
          return newSet;
        }
        
        // Desbloquear si no hay nuevas imágenes
        isProcessing.current = false;
        return prev;
      });
    };

    let intervalId: NodeJS.Timeout | null = null;
    const IMAGE_INTERVAL = 350; // Milisegundos entre cada aparición (rápido pero suave)

    // Función para iniciar el intervalo de aparición de imágenes
    const startImageSequence = () => {
      // Verificar si ya hay un intervalo corriendo
      if (intervalId) return;
      
      // Verificar si todas las imágenes ya están visibles
      if (visibleImagesRef.current.size >= images.length) {
        return;
      }
      
      // Mostrar las primeras imágenes inmediatamente si aún no se han mostrado
      if (visibleImagesRef.current.size === 0) {
        showNextImages();
      }
      
      // Iniciar intervalo para mostrar el resto de imágenes
      intervalId = setInterval(() => {
        // Verificar si todas las imágenes están visibles
        if (visibleImagesRef.current.size >= images.length) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          return;
        }
        
        showNextImages();
      }, IMAGE_INTERVAL);
    };

    // Función para detener el intervalo
    const stopImageSequence = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Usar IntersectionObserver para detectar cuando la sección está visible
    let observer: IntersectionObserver | null = null;
    
    const setupObserver = () => {
      const section = sectionRef.current;
      if (!section) {
        // Intentar encontrar la sección
        if (sectionId) {
          sectionRef.current = document.getElementById(sectionId);
        }
        if (!sectionRef.current && containerRef.current) {
          sectionRef.current = containerRef.current.closest('section');
        }
      }
      
      const targetSection = sectionRef.current;
      if (!targetSection) return;
      
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Sección visible: iniciar secuencia de imágenes
              startImageSequence();
            } else {
              // Sección no visible: detener secuencia
              stopImageSequence();
            }
          });
        },
        { 
          threshold: 0.1, 
          rootMargin: '100px' // Empezar un poco antes de que entre completamente
        }
      );
      observer.observe(targetSection);
    };

    // Configurar observer con delays para asegurar que el DOM esté listo
    setupObserver();
    const timeout1 = setTimeout(setupObserver, 100);
    const timeout2 = setTimeout(setupObserver, 500);

    return () => {
      stopImageSequence();
      if (observer) observer.disconnect();
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [images, sectionId]);

  // Manejar hover de imágenes con efecto elevado
  const handleMouseEnter = (imageId: number) => {
    setHoverStates((prev) => {
      const newMap = new Map(prev);
      newMap.set(imageId, { x: 0, y: 0, isHovering: true });
      return newMap;
    });
  };

  const handleMouseMove = (imageId: number, e: React.MouseEvent<HTMLDivElement>) => {
    const imageElement = imageRefs.current.get(imageId);
    if (!imageElement) return;

    const rect = imageElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calcular distancia normalizada desde el centro (-1 a 1)
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    
    // Parámetros del efecto mejorado
    const maxMove = 20; // píxeles de movimiento máximo (aumentado)
    const liftOffset = -15; // efecto de elevación (movimiento hacia arriba)
    const maxTilt = 8; // grados de rotación máxima (aumentado)
    
    setHoverStates((prev) => {
      const newMap = new Map(prev);
      newMap.set(imageId, {
        x: deltaX * maxMove,
        y: deltaY * maxMove * 0.5 + liftOffset, // Elevación: empuja hacia arriba
        isHovering: true,
      });
      return newMap;
    });
  };

  const handleMouseLeave = (imageId: number) => {
    setHoverStates((prev) => {
      const newMap = new Map(prev);
      newMap.delete(imageId);
      return newMap;
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {images.map((image) => {
        const isVisible = visibleImages.has(image.id);
        const hoverState = hoverStates.get(image.id);
        const baseRotation = image.rotation || 0;
        
        // Calcular transformaciones
        let transform = '';
        
        if (!isVisible) {
          transform = `translateY(20px) scale(0.95) rotate(${baseRotation}deg)`;
        } else if (hoverState?.isHovering) {
          // Efecto elevado moderno: movimiento, rotación 3D y escala aumentada
          const maxTilt = 8;
          const tiltX = (hoverState.x / 20) * maxTilt; // Rotación basada en movimiento horizontal
          const tiltY = (hoverState.y / 20) * maxTilt * 0.5; // Rotación 3D más pronunciada
          
          transform = `translate(${hoverState.x}px, ${hoverState.y}px) scale(1.15) rotate(${baseRotation + tiltX}deg) rotateY(${tiltY}deg) rotateX(${-tiltY * 0.3}deg)`;
        } else {
          transform = `translateY(0) scale(1) rotate(${baseRotation}deg)`;
        }
        
        // Hacer las imágenes responsive basado en el ancho de ventana
        const getResponsiveSize = () => {
          if (windowWidth === 0) {
            // Default mientras se carga
            return image.id >= 4 ? '320px' : '400px';
          }
          
          if (windowWidth < 1024) {
            // Pantallas pequeñas (mobile/tablet)
            return image.id >= 4 ? '200px' : '240px';
          } else if (windowWidth < 1440) {
            // Pantallas medianas
            return image.id >= 4 ? '280px' : '360px';
          }
          // Pantallas grandes (default)
          return image.id >= 4 ? '320px' : '400px';
        };
        
        const maxWidth = getResponsiveSize();
        const maxHeight = image.id >= 4 
          ? (windowWidth < 1024 ? '300px' : '400px')
          : (windowWidth < 1024 ? '360px' : '500px');
        
        // Calcular posición para evitar que se salga del viewport
        const getPosition = () => {
          const style: React.CSSProperties = {};
          
          if (image.left !== undefined) {
            const leftValue = parseFloat(image.left);
            // Limitar a valores razonables que no se salgan del contenedor
            style.left = `${Math.max(0, Math.min(50, leftValue))}%`;
          }
          
          if (image.right !== undefined) {
            const rightValue = parseFloat(image.right);
            // Limitar a valores razonables que no se salgan del contenedor
            style.right = `${Math.max(0, Math.min(50, rightValue))}%`;
          }
          
          if (image.top !== undefined) {
            style.top = image.top;
          }
          
          return style;
        };
        
        return (
          <div
            key={image.id}
            ref={(el) => {
              if (el) imageRefs.current.set(image.id, el);
            }}
            className="absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer"
            style={{
              ...getPosition(),
              backgroundColor: image.bgColor,
              opacity: isVisible ? 1 : 0,
              transform: transform,
              zIndex: hoverState?.isHovering ? 9999 : image.id,
              maxWidth: maxWidth,
              width: 'auto',
              height: 'auto',
              pointerEvents: isVisible ? 'auto' : 'none',
              transformStyle: 'preserve-3d',
              filter: hoverState?.isHovering ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' : 'none',
            }}
            onMouseEnter={() => handleMouseEnter(image.id)}
            onMouseMove={(e) => handleMouseMove(image.id, e)}
            onMouseLeave={() => handleMouseLeave(image.id)}
          >
            {image.src ? (
              <img
                src={image.src}
                alt={image.alt || 'Imagen'}
                className="block w-full h-auto"
                style={{ 
                  maxWidth: maxWidth,
                  maxHeight: maxHeight,
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
