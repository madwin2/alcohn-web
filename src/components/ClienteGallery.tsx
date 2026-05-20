'use client';

import { useCallback, useEffect, useState } from 'react';
import ClienteCard from '@/components/ClienteCard';
import { Cliente } from '@/lib/clientes';

interface ClienteGalleryProps {
  clientes: Cliente[];
  interval?: number;
}

export default function ClienteGallery({ clientes, interval = 4000 }: ClienteGalleryProps) {
  const [tick, setTick] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const isPaused = pauseCount > 0;

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {clientes.map((cliente, index) => (
        <ClienteCard
          key={cliente.nombre}
          cliente={cliente}
          imageIndex={tick % cliente.imagenes.length}
          priority={index < 3}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
        />
      ))}
    </div>
  );
}
