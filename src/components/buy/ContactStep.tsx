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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Contacto
        </h2>
        <p className="text-gray-600">
          Necesitamos tus datos de contacto para poder enviarte la muestra del sello.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre completo
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (errors.nombre) setErrors({ ...errors, nombre: undefined });
            }}
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Juan Pérez"
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp
          </label>
          <input
            type="tel"
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => {
              setWhatsapp(e.target.value);
              if (errors.whatsapp) setErrors({ ...errors, whatsapp: undefined });
            }}
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.whatsapp ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: +54 9 223 123-4567"
          />
          {errors.whatsapp && (
            <p className="mt-1 text-sm text-red-600">{errors.whatsapp}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Incluí el código de país. Ej: +54 9 223 123-4567
          </p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: juan.perez@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Continuar
        </button>
      </form>
    </div>
  );
}


