'use client';

import { useState } from 'react';

interface ContactStepProps {
  nombre: string;
  whatsapp: string;
  email: string;
  onSubmit: (nombre: string, whatsapp: string, email: string) => void;
  isProcessing?: boolean;
  processingMessage?: string;
}

export default function ContactStep({
  nombre: initialNombre,
  whatsapp: initialWhatsapp,
  email: initialEmail,
  onSubmit,
  isProcessing = false,
  processingMessage = 'Optimizando tu logo… Generando tu muestra…',
}: ContactStepProps) {
  const [nombre, setNombre] = useState(initialNombre);
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp);
  const [email, setEmail] = useState(initialEmail);
  const [errors, setErrors] = useState<{ nombre?: string; whatsapp?: string; email?: string }>({});

  const validateWhatsApp = (value: string): boolean => {
    const cleaned = value.replace(/[\s\-\(\)]/g, '');
    return cleaned.length >= 10 && /^[\+]?[0-9]+$/.test(cleaned);
  };

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { nombre?: string; whatsapp?: string; email?: string } = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'Ingresá tu nombre';
    }

    if (!whatsapp.trim()) {
      newErrors.whatsapp = 'Ingresá tu WhatsApp';
    } else if (!validateWhatsApp(whatsapp)) {
      newErrors.whatsapp = 'Revisá el número (con código de área)';
    }

    if (!email.trim()) {
      newErrors.email = 'Ingresá tu email';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Revisá el email';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(nombre.trim(), whatsapp.trim(), email.trim());
  };

  if (isProcessing) {
    return (
      <div className="wizard-step flex min-h-[280px] flex-col justify-center md:min-h-[360px] md:items-center md:space-y-5 md:px-2 md:py-12 md:text-center md:[animation:none]">
        <div className="wizard-step-heading md:max-w-md md:space-y-2 md:text-center">
          <h2 className="text-[21px] font-semibold tracking-tight text-neutral-950 md:text-2xl">
            Preparando tu muestra…
          </h2>
          <p className="mt-1 text-[13.5px] text-neutral-600 md:text-base">
            Tarda unos segundos. No cierres la página.
          </p>
        </div>
        <div className="wizard-sheet mt-2 space-y-1 border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-4 md:mt-0 md:max-w-md md:border-0 md:bg-transparent md:p-0 md:shadow-none">
          <div className="flex items-center gap-2.5 py-1.5 text-[13.5px] text-neutral-900">
            <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-700 text-[10px] text-white">
              ✓
            </span>
            <span>Analizando tu logo</span>
          </div>
          <div className="flex items-center gap-2.5 py-1.5 text-[13.5px] font-semibold text-neutral-900">
            <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[var(--alcohn-line)] border-t-[var(--alcohn-ink)]" />
            <span>{processingMessage}</span>
          </div>
          <div className="flex items-center gap-2.5 py-1.5 text-[13.5px] text-neutral-400">
            <span className="h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] border-[var(--alcohn-line-strong)]" />
            <span>Generando muestra digital</span>
          </div>
        </div>
        <div className="mx-auto mt-4 hidden h-12 w-12 animate-spin rounded-full border-4 border-[var(--alcohn-line)] border-t-[var(--alcohn-bronze)] md:block" />
      </div>
    );
  }

  return (
    <div className="wizard-step md:space-y-6 md:[animation:none]">
      <div className="wizard-step-heading">
        <h2 className="text-[21px] font-semibold tracking-tight text-neutral-950 md:mb-2 md:text-2xl">
          <span className="md:hidden">¿A dónde te enviamos la muestra?</span>
          <span className="hidden md:inline">Dejanos tus datos y generamos tu muestra ahora</span>
        </h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-neutral-600 md:text-base">
          <span className="md:hidden">
            Es gratis y sin compromiso. Te la mandamos también por WhatsApp para que la tengas a mano.
          </span>
          <span className="hidden md:inline">
            Ya elegiste material y subiste tu logo. Dejanos tus datos y en segundos generamos la muestra digital, medidas y precio.
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 md:space-y-4">
        <div className={`wizard-field ${errors.nombre ? 'has-error' : ''}`}>
          <label htmlFor="nombre" className="mb-1.5 block text-xs font-semibold uppercase text-gray-600 md:mb-2">
            Nombre
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
            className={`w-full border bg-white px-3.5 py-3 text-base text-neutral-950 focus:outline-none md:px-4 md:py-3 md:text-sm md:focus:ring-2 md:focus:ring-[var(--alcohn-bronze)] ${
              errors.nombre ? 'border-red-500' : 'border-[var(--alcohn-line-strong)] md:border-[var(--alcohn-line)]'
            }`}
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>

        <div className={`wizard-field ${errors.whatsapp ? 'has-error' : ''}`}>
          <label htmlFor="whatsapp" className="mb-1.5 block text-xs font-semibold uppercase text-gray-600 md:mb-2">
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
            className={`w-full border bg-white px-3.5 py-3 text-base text-neutral-950 focus:outline-none md:px-4 md:py-3 md:text-sm md:focus:ring-2 md:focus:ring-[var(--alcohn-bronze)] ${
              errors.whatsapp ? 'border-red-500' : 'border-[var(--alcohn-line-strong)] md:border-[var(--alcohn-line)]'
            }`}
            placeholder="+54 9 223 123-4567"
          />
          {errors.whatsapp ? (
            <p className="mt-1 text-sm text-red-600">{errors.whatsapp}</p>
          ) : (
            <p className="mt-1 text-[11.5px] text-neutral-500 md:text-xs">
              Con código de país y área
            </p>
          )}
        </div>

        <div className={`wizard-field ${errors.email ? 'has-error' : ''}`}>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase text-gray-600 md:mb-2">
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
            className={`w-full border bg-white px-3.5 py-3 text-base text-neutral-950 focus:outline-none md:px-4 md:py-3 md:text-sm md:focus:ring-2 md:focus:ring-[var(--alcohn-bronze)] ${
              errors.email ? 'border-red-500' : 'border-[var(--alcohn-line-strong)] md:border-[var(--alcohn-line)]'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="wizard-notice md:hidden">
          <span aria-hidden>🔒</span>
          <span>Usamos tus datos solo para la muestra y tu pedido. Sin spam.</span>
        </div>

        <button type="submit" className="wizard-cta-btn md:min-h-[44px] md:border md:border-[var(--alcohn-ink)] md:tracking-wider">
          Ver mi muestra gratis →
        </button>
      </form>
    </div>
  );
}
