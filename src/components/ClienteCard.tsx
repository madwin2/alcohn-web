'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Cliente } from '@/lib/clientes';

interface ClienteCardProps {
  cliente: Cliente;
  imageIndex: number;
  priority?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export default function ClienteCard({
  cliente,
  imageIndex,
  priority = false,
  onHoverStart,
  onHoverEnd,
}: ClienteCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer border border-neutral-200 hover:border-neutral-300 transition-all duration-300"
      onMouseEnter={() => {
        setIsHovered(true);
        onHoverStart?.();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHoverEnd?.();
      }}
    >
      <div className="relative w-full h-full">
        {cliente.imagenes.map((imagen, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === imageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={imagen}
              alt={`${cliente.nombre} - Imagen ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority && index === 0}
            />
          </div>
        ))}
      </div>

      <div
        className={`absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/75 backdrop-blur-md transition-all duration-500 ease-in-out ${
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } flex items-center justify-center p-6`}
      >
        <div className="text-center max-w-[90%]">
          <p className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight">
            {cliente.data.nombre}
          </p>
          {cliente.data.instagram && (
            <p className="mt-3 text-sm md:text-base text-white/75 font-medium tracking-wide">
              {cliente.data.instagram}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}