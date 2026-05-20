'use client';

import { CotizacionData } from '@/types';
import { config } from '@/lib/config';

interface WhatsappButtonProps {
  data?: CotizacionData;
  className?: string;
  children?: React.ReactNode;
  variant?: 'dark' | 'light';
}

export default function WhatsappButton({
  data,
  className = '',
  children,
  variant = 'dark',
}: WhatsappButtonProps) {
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

  const layoutStyles =
    'inline-flex min-h-[44px] items-center justify-center px-4 py-2 text-xs font-semibold uppercase transition-all';
  const variantStyles = {
    dark: 'border border-[var(--alcohn-line-strong)] bg-[var(--alcohn-ink)] text-white shadow-[0_16px_40px_rgba(17,16,14,0.18)] hover:border-[var(--alcohn-bronze)] hover:bg-[var(--alcohn-ink-soft)]',
    light:
      'border border-white bg-white text-black hover:bg-[var(--alcohn-paper)] hover:text-black',
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${layoutStyles} ${variantStyles[variant]} ${className}`.trim()}
    >
      {children || "Hablar por WhatsApp"}
    </a>
  );
}
