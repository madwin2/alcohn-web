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
  variant?: 'default' | 'featured' | 'thumb';
  className?: string;
}

export default function ClienteCard({
  cliente,
  imageIndex,
  priority = false,
  onHoverStart,
  onHoverEnd,
  variant = 'default',
  className = '',
}: ClienteCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const frameClass =
    variant === 'featured'
      ? 'relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-neutral-200'
      : variant === 'thumb'
        ? 'relative aspect-square w-full overflow-hidden rounded-md border border-neutral-200'
        : 'relative aspect-square rounded-lg overflow-hidden border border-neutral-200 hover:border-neutral-300';

  return (
    <div
      className={`${frameClass} group cursor-pointer transition-all duration-300 ${className}`.trim()}
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
        } hidden md:flex items-center justify-center p-6`}
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

      {/* Label permanente en mobile (sin hover) */}
      <div
        className={`md:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent pointer-events-none ${
          variant === 'featured' ? 'pt-12 pb-4 px-4' : variant === 'thumb' ? 'pt-5 pb-1 px-1' : 'pt-8 pb-2 px-2'
        }`}
      >
        <p
          className={`font-semibold text-white tracking-tight leading-tight line-clamp-1 ${
            variant === 'featured' ? 'text-base' : 'text-[11px]'
          }`}
        >
          {cliente.data.nombre}
        </p>
        {cliente.data.instagram && (
          <p className={`text-white/75 truncate ${variant === 'featured' ? 'mt-1 text-xs' : 'text-[10px]'}`}>
            {cliente.data.instagram}
          </p>
        )}
      </div>
    </div>
  );
}