'use client';

import { FormEvent, useState } from 'react';
import { getMarketConfig } from '@/lib/markets/config';
import type { InternationalMarketCode } from '@/lib/markets/types';
import {
  emptyInternationalShippingForm,
  type InternationalShippingFormData,
  validateInternationalShippingForm,
} from '@/lib/shipping/international';

interface InternationalShippingFormProps {
  market: InternationalMarketCode;
  onSubmit: (form: InternationalShippingFormData, customsAccepted: boolean) => Promise<void>;
  submitting?: boolean;
  submitError?: string | null;
}

export default function InternationalShippingForm({
  market,
  onSubmit,
  submitting = false,
  submitError = null,
}: InternationalShippingFormProps) {
  const labels = getMarketConfig(market).addressLabels;
  const [form, setForm] = useState<InternationalShippingFormData>(emptyInternationalShippingForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customsAccepted, setCustomsAccepted] = useState(false);

  const updateField = (field: keyof InternationalShippingFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validation = validateInternationalShippingForm(market, form);
    if (!customsAccepted) {
      validation.customs = 'Debés aceptar el aviso de importación';
    }
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    await onSubmit(form, customsAccepted);
  };

  const inputClass =
    'w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
            Nombre completo
          </label>
          <input
            className={inputClass}
            value={form.nombreCompleto}
            onChange={(e) => updateField('nombreCompleto', e.target.value)}
          />
          {errors.nombreCompleto ? (
            <p className="mt-1 text-xs text-red-600">{errors.nombreCompleto}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
            Email
          </label>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
          {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
            Teléfono
          </label>
          <input
            className={inputClass}
            value={form.telefono}
            onChange={(e) => updateField('telefono', e.target.value)}
            placeholder={getMarketConfig(market).phoneExample}
          />
          {errors.telefono ? <p className="mt-1 text-xs text-red-600">{errors.telefono}</p> : null}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
            {labels.document} (opcional)
          </label>
          <input
            className={inputClass}
            value={form.documento}
            onChange={(e) => updateField('documento', e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
            Dirección
          </label>
          <input
            className={inputClass}
            value={form.direccion1}
            onChange={(e) => updateField('direccion1', e.target.value)}
          />
          {errors.direccion1 ? (
            <p className="mt-1 text-xs text-red-600">{errors.direccion1}</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
            Dirección línea 2 (opcional)
          </label>
          <input
            className={inputClass}
            value={form.direccion2}
            onChange={(e) => updateField('direccion2', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
            {labels.region}
          </label>
          <input
            className={inputClass}
            value={form.region}
            onChange={(e) => updateField('region', e.target.value)}
          />
          {errors.region ? <p className="mt-1 text-xs text-red-600">{errors.region}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
            {labels.city}
          </label>
          <input
            className={inputClass}
            value={form.ciudad}
            onChange={(e) => updateField('ciudad', e.target.value)}
          />
          {errors.ciudad ? <p className="mt-1 text-xs text-red-600">{errors.ciudad}</p> : null}
        </div>

        {labels.district ? (
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
              {labels.district} (opcional)
            </label>
            <input
              className={inputClass}
              value={form.distrito}
              onChange={(e) => updateField('distrito', e.target.value)}
            />
          </div>
        ) : null}

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
            {labels.postalCode}
          </label>
          <input
            className={inputClass}
            value={form.codigoPostal}
            onChange={(e) => updateField('codigoPostal', e.target.value)}
          />
          {errors.codigoPostal ? (
            <p className="mt-1 text-xs text-red-600">{errors.codigoPostal}</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
            Notas para DHL (opcional)
          </label>
          <textarea
            className={`${inputClass} min-h-[80px]`}
            value={form.notasDhl}
            onChange={(e) => updateField('notasDhl', e.target.value)}
          />
        </div>
      </div>

      <label className="flex items-start gap-3 text-sm leading-relaxed text-neutral-700">
        <input
          type="checkbox"
          className="mt-1"
          checked={customsAccepted}
          onChange={(e) => {
            setCustomsAccepted(e.target.checked);
            if (e.target.checked) {
              setErrors((prev) => {
                const next = { ...prev };
                delete next.customs;
                return next;
              });
            }
          }}
        />
        <span>
          Entiendo que los impuestos, aranceles y gastos de importación no están incluidos y, si
          corresponden, los pagaré directamente a DHL.
        </span>
      </label>
      {errors.customs ? <p className="text-xs text-red-600">{errors.customs}</p> : null}

      {submitError ? (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full border border-neutral-900 bg-neutral-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? 'Procesando...' : 'Pagar pedido internacional'}
      </button>
    </form>
  );
}
