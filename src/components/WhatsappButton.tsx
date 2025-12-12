'use client';

import { CotizacionData } from '@/types';
import { config } from '@/lib/config';

interface WhatsappButtonProps {
  data?: CotizacionData;
  className?: string;
  children?: React.ReactNode;
}

export default function WhatsappButton({ data, className = "", children }: WhatsappButtonProps) {
  const buildMessage = () => {
    const baseMessage = config.whatsapp.message.base;
    
    const parts: string[] = [];
    
    if (data?.material) {
      parts.push(`Material a marcar: ${data.material}`);
    }
    
    if (data?.medida) {
      parts.push(`Medida aproximada: ${data.medida}`);
    }
    
    if (data?.logoUrl) {
      parts.push("Tengo el logo en: (foto/vector)");
    }
    
    if (data?.nombre) {
      parts.push(`Soy: ${data.nombre}`);
    }
    
    const fullMessage = [baseMessage, ...parts].join(". ");
    
    return encodeURIComponent(fullMessage);
  };

  const message = buildMessage();
  const whatsappUrl = `https://wa.me/${config.whatsapp.number}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block bg-green-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-600 transition-colors text-center ${className}`}
    >
      {children || "Hablar por WhatsApp"}
    </a>
  );
}

