'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Cliente } from '@/lib/clientes';

interface ClienteCardProps {
  cliente: Cliente;
  interval?: number;
}

export default function ClienteCard({ cliente, interval = 4000 }: ClienteCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Carrusel automático de imágenes
  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % cliente.imagenes.length);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [cliente.imagenes.length, interval, isHovered]);

  return (
    <div
      className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer border border-neutral-200 hover:border-neutral-300 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carrusel de imágenes */}
      <div className="relative w-full h-full">
        {cliente.imagenes.map((imagen, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={imagen}
              alt={`${cliente.nombre} - Imagen ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>

      {/* Efecto glass con información del cliente */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 backdrop-blur-md transition-all duration-500 ease-in-out ${
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } flex items-center justify-center p-6`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Imagen de datos del cliente (contiene logo, nombre, instagram, página web) */}
          <div className="relative max-w-[85%] max-h-[85%] w-auto h-auto transform transition-transform duration-500">
            <Image
              src={cliente.imagenData}
              alt={`Información ${cliente.data.nombre}`}
              width={300}
              height={300}
              className="object-contain w-full h-full drop-shadow-2xl"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
