'use client';

import { useState } from 'react';

interface ContactStepProps {
  nombre: string;
  whatsapp: string;
  email: string;
  onSubmit: (nombre: string, whatsapp: string, email: string) => void;
}

export default function ContactStep({ nombre: initialNombre, whatsapp: initialWhatsapp, email: initialEmail, onSubmit }: ContactStepProps) {
  const [nombre, setNombre] = useState(initialNombre);
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp);
  const [email, setEmail] = useState(initialEmail);
  const [errors, setErrors] = useState<{ nombre?: string; whatsapp?: string; email?: string }>({});

  const validateWhatsApp = (value: string): boolean => {
    // Validar formato de WhatsApp (números, puede tener +, espacios, guiones)
    const cleaned = value.replace(/[\s\-\(\)]/g, '');
    return cleaned.length >= 10 && /^[\+]?[0-9]+$/.test(cleaned);
  };

  const validateEmail = (value: string): boolean => {
    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { nombre?: string; whatsapp?: string; email?: string } = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!whatsapp.trim()) {
      newErrors.whatsapp = 'El WhatsApp es requerido';
    } else if (!validateWhatsApp(whatsapp)) {
      newErrors.whatsapp = 'Ingresá un número de WhatsApp válido';
    }

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ingresá un email válido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(nombre.trim(), whatsapp.trim(), email.trim());
  };

  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900 md:text-2xl">
          Datos para guardar tu cotización
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 md:text-base">
          <span className="md:hidden">Completá estos 3 datos para seguir.</span>
          <span className="hidden md:inline">
            En 2 minutos ves medidas, muestra y precio. Guardamos estos datos para retomar el pedido y enviarte la muestra si hace falta revisión.
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-xs uppercase font-semibold text-gray-600 mb-2">
            Nombre completo
          </label>
          <input
            type="text"
            id="nombre"
            autoComplete="name"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (errors.nombre) setErrors({ ...errors, nombre: undefined });
            }}
            className={`w-full border bg-white px-3 py-3 text-base md:text-sm text-neutral-950 focus:outline-none focus:ring-2 focus:ring-[var(--alcohn-bronze)] md:px-4 md:py-3 ${
              errors.nombre ? 'border-red-500' : 'border-[var(--alcohn-line)]'
            }`}
            placeholder="Ej: Juan Pérez"
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-xs uppercase font-semibold text-gray-600 mb-2">
            WhatsApp
          </label>
          <input
            type="tel"
            id="whatsapp"
            autoComplete="tel"
            inputMode="tel"
            value={whatsapp}
            onChange={(e) => {
              setWhatsapp(e.target.value);
              if (errors.whatsapp) setErrors({ ...errors, whatsapp: undefined });
            }}
            className={`w-full border bg-white px-3 py-3 text-base md:text-sm text-neutral-950 focus:outline-none focus:ring-2 focus:ring-[var(--alcohn-bronze)] md:px-4 md:py-3 ${
              errors.whatsapp ? 'border-red-500' : 'border-[var(--alcohn-line)]'
            }`}
            placeholder="Ej: +54 9 223 123-4567"
          />
          {errors.whatsapp && (
            <p className="mt-1 text-sm text-red-600">{errors.whatsapp}</p>
          )}
          <p className="mt-1 text-[11px] text-gray-500 md:text-xs">
            Incluí el código de país. Ej: +54 9 223 123-4567
          </p>
        </div>

        <div>
          <label htmlFor="email" className="block text-xs uppercase font-semibold text-gray-600 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={`w-full border bg-white px-3 py-3 text-base md:text-sm text-neutral-950 focus:outline-none focus:ring-2 focus:ring-[var(--alcohn-bronze)] md:px-4 md:py-3 ${
              errors.email ? 'border-red-500' : 'border-[var(--alcohn-line)]'
            }`}
            placeholder="Ej: juan.perez@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <button
          type="submit"
          className="sticky bottom-0 z-20 w-full min-h-[44px] px-6 py-3 bg-[var(--alcohn-ink)] text-white border border-[var(--alcohn-ink)] font-semibold uppercase tracking-wider hover:bg-[var(--alcohn-ink-soft)] hover:border-[var(--alcohn-bronze)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--alcohn-bronze)] focus:ring-offset-2"
        >
          Continuar
        </button>
      </form>
    </div>
  );
}


