'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ClienteCard from '@/components/ClienteCard';
import { Cliente } from '@/lib/clientes';
import MobileCarousel from './MobileCarousel';

interface ClienteGalleryProps {
  clientes: Cliente[];
  interval?: number;
}

export default function ClienteGallery({
  clientes,
  interval = 4000,
}: ClienteGalleryProps) {
  const [tick, setTick] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbRowRef = useRef<HTMLDivElement>(null);
  const thumbScrollLeft = useRef(0);
  const isPaused = pauseCount > 0;

  const handleSelectThumb = (clienteIndex: number) => {
    if (thumbRowRef.current) {
      thumbScrollLeft.current = thumbRowRef.current.scrollLeft;
    }
    setActiveIndex(clienteIndex);
  };

  useLayoutEffect(() => {
    const row = thumbRowRef.current;
    if (!row) return;
    row.scrollLeft = thumbScrollLeft.current;
  }, [activeIndex]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, isPaused]);

  const handleHoverStart = useCallback(() => {
    setPauseCount((count) => count + 1);
  }, []);

  const handleHoverEnd = useCallback(() => {
    setPauseCount((count) => Math.max(0, count - 1));
  }, []);

  const featuredCliente = clientes[activeIndex] ?? clientes[0];
  const thumbIndices = clientes
    .map((_, index) => index)
    .filter((index) => index !== activeIndex);

  return (
    <>
      <div className="space-y-3 md:hidden">
        {featuredCliente && (
          <ClienteCard
            cliente={featuredCliente}
            imageIndex={tick % featuredCliente.imagenes.length}
            priority
            variant="featured"
          />
        )}

        {thumbIndices.length > 0 && (
          <MobileCarousel hint="Deslizá casos" mobileLayout="scroll" scrollRowRef={thumbRowRef}>
            {thumbIndices.map((clienteIndex) => {
              const cliente = clientes[clienteIndex];
              return (
                <button
                  key={cliente.nombre}
                  type="button"
                  onClick={() => handleSelectThumb(clienteIndex)}
                  className="mobile-snap-card cliente-gallery-thumb block shrink-0 text-left"
                  aria-label={`Ver caso de ${cliente.data.nombre}`}
                >
                  <ClienteCard
                    cliente={cliente}
                    imageIndex={tick % cliente.imagenes.length}
                    variant="thumb"
                  />
                </button>
              );
            })}
          </MobileCarousel>
        )}
      </div>

      <div className="hidden md:block">
        <MobileCarousel rowClassName="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8" hint="Deslizá casos">
          {clientes.map((cliente, index) => (
            <div key={cliente.nombre} className="mobile-snap-card md:min-w-0">
              <ClienteCard
                cliente={cliente}
                imageIndex={tick % cliente.imagenes.length}
                priority={index < 3}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
              />
            </div>
          ))}
        </MobileCarousel>
      </div>
    </>
  );
}
