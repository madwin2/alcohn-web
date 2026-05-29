'use client';

import { useState } from 'react';
import { config } from '@/lib/config';
import { trackEvent } from '@/lib/analytics/client';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    whatsapp: '',
    email: '',
    mensaje: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void trackEvent('lead_form_submit', {
      metadata: {
        channel: 'whatsapp',
      },
    });
    const message = [
      'Hola Alcohn, tengo una consulta desde la web.',
      `Nombre: ${formData.nombre}`,
      `WhatsApp: ${formData.whatsapp}`,
      `Email: ${formData.email}`,
      `Mensaje: ${formData.mensaje}`,
    ].join('\n');
    const whatsappUrl = `https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!hasStarted) {
      setHasStarted(true);
      void trackEvent('lead_form_start', {
        metadata: {
          formId: 'contact_whatsapp_form',
        },
      });
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (submitted) setSubmitted(false);
  };

  const inputClass = 'w-full border border-[var(--alcohn-line-strong)] bg-white px-4 py-3 text-base md:text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:ring-offset-1';
  const labelClass = 'block craft-label mb-2';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nombre" className={labelClass}>
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            required
            value={formData.nombre}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="whatsapp" className={labelClass}>
            WhatsApp
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            required
            value={formData.whatsapp}
            onChange={handleChange}
            className={inputClass}
            placeholder="+54 9 223 123-4567"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="mensaje" className={labelClass}>
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={5}
          value={formData.mensaje}
          onChange={handleChange}
          className={inputClass}
          placeholder="Contanos material, medida aproximada o qué intentaste hacer en la web."
        />
      </div>

      <button
        type="submit"
        className="inline-flex min-h-[44px] w-full items-center justify-center border border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] px-6 py-3 text-xs font-semibold uppercase text-white transition-colors hover:border-[var(--alcohn-bronze)] hover:bg-[var(--alcohn-ink-soft)]"
      >
        Enviar consulta por WhatsApp
      </button>

      {submitted && (
        <p className="border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-3 text-center text-sm text-neutral-700">
          Abrimos WhatsApp con tu consulta prearmada para que puedas enviarla.
        </p>
      )}
    </form>
  );
}
