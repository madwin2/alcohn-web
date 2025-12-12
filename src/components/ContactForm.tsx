'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    whatsapp: '',
    email: '',
    mensaje: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar envío a webhook o email interno
    console.log('Formulario enviado:', formData);
    alert('Gracias por tu mensaje. Te contactaremos pronto.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium mb-2">
          Nombre
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          required
          value={formData.nombre}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-secondary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label htmlFor="whatsapp" className="block text-sm font-medium mb-2">
          WhatsApp
        </label>
        <input
          type="tel"
          id="whatsapp"
          name="whatsapp"
          required
          value={formData.whatsapp}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-secondary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-secondary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium mb-2">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={5}
          value={formData.mensaje}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-secondary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-accent text-primary py-3 rounded-md font-semibold hover:bg-accent-light transition-colors"
      >
        Enviar mensaje
      </button>
    </form>
  );
}

