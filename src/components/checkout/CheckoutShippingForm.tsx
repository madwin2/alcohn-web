'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { fetchShippingCatalog } from '@/lib/shipping/client';
import { getBranchesFor } from '@/lib/shipping/catalog';
import type { ShippingCatalog, ShippingFormData, ShippingMetodoUi } from '@/lib/shipping/types';
import { RETIRO_OFICINA_LABEL, SHIPPING_METODO_LABELS } from '@/lib/shipping/types';
import { validateShippingForm } from '@/lib/shipping/validation';

export interface CheckoutShippingFormHandle {
  trySubmit: () => boolean;
}

interface CheckoutShippingFormProps {
  metodo: ShippingMetodoUi;
  nombreCompleto: string;
  telefono: string;
  email: string;
  onSubmit: (form: ShippingFormData) => void;
  onBack?: () => void;
  /** Oculta título y botones; el submit lo dispara el formulario padre vía ref. */
  embedded?: boolean;
  showActions?: boolean;
}

const emptyForm = (): ShippingFormData => ({
  nombreCompleto: '',
  email: '',
  telefono: '',
  provincia: '',
  localidad: '',
  domicilio: '',
  piso: '',
  depto: '',
  codigoPostal: '',
  codigoSucursal: '',
});

const CheckoutShippingForm = forwardRef<CheckoutShippingFormHandle, CheckoutShippingFormProps>(
  function CheckoutShippingForm(
    {
      metodo,
      nombreCompleto,
      telefono,
      email,
      onSubmit,
      onBack,
      embedded = false,
      showActions = true,
    },
    ref
  ) {
    const [catalog, setCatalog] = useState<ShippingCatalog | null>(null);
    const [catalogLoading, setCatalogLoading] = useState(metodo !== 'retiro');
    const [catalogError, setCatalogError] = useState<string | null>(null);
    const [form, setForm] = useState<ShippingFormData>(() => ({
      ...emptyForm(),
      nombreCompleto,
      telefono,
      email,
    }));
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
      setForm((f) => ({
        ...f,
        nombreCompleto: nombreCompleto || f.nombreCompleto,
        telefono: telefono || f.telefono,
        email: email || f.email,
      }));
    }, [nombreCompleto, telefono, email]);

    useEffect(() => {
      if (metodo === 'retiro') {
        setCatalogLoading(false);
        return;
      }
      setCatalogLoading(true);
      setCatalogError(null);
      fetchShippingCatalog()
        .then((c) => {
          if (!c) {
            setCatalogError('No pudimos cargar el catálogo de Correo Argentino. Intentá más tarde.');
            setCatalog(null);
          } else {
            setCatalog(c);
          }
        })
        .finally(() => setCatalogLoading(false));
    }, [metodo]);

    const branches = useMemo(() => {
      if (!catalog || metodo !== 'sucursal') return [];
      return getBranchesFor(catalog, form.provincia, form.localidad);
    }, [catalog, metodo, form.provincia, form.localidad]);

    const localities = useMemo(() => {
      if (!catalog || !form.provincia) return [];
      return catalog.localitiesByProvince[form.provincia] ?? [];
    }, [catalog, form.provincia]);

    const handleBranchSelect = (codigo: string) => {
      const branch = branches.find((b) => b.codigo_sucursal === codigo);
      if (!branch) return;
      setForm((f) => ({
        ...f,
        domicilio: branch.domicilio,
        codigoSucursal: branch.codigo_sucursal,
      }));
    };

    const trySubmit = (): boolean => {
      const mergedForm: ShippingFormData = {
        ...form,
        email: email || form.email,
        nombreCompleto: form.nombreCompleto || nombreCompleto,
        telefono: form.telefono || telefono,
      };
      if (metodo === 'retiro') {
        const errs = validateShippingForm('retiro', mergedForm, null, nombreCompleto);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return false;
        onSubmit(mergedForm);
        return true;
      }
      const errs = validateShippingForm(metodo, mergedForm, catalog, nombreCompleto);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return false;
      onSubmit(mergedForm);
      return true;
    };

    useImperativeHandle(ref, () => ({ trySubmit }), [
      metodo,
      form,
      catalog,
      nombreCompleto,
      onSubmit,
    ]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      trySubmit();
    };

    const Wrapper = embedded ? 'div' : 'form';
    const wrapperProps = embedded
      ? { className: 'space-y-6' }
      : { onSubmit: handleSubmit, className: 'space-y-6' };

    const inputClass = (field: keyof ShippingFormData) =>
      `w-full px-4 py-3 border text-base md:text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 ${
        errors[field] || errors._form ? 'border-red-500' : 'border-neutral-300'
      }`;

    return (
      <Wrapper {...wrapperProps}>
        {!embedded && (
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 tracking-tight">
              Datos de envío
            </h2>
            <p className="text-sm text-neutral-600">
              Elegiste: <strong>{SHIPPING_METODO_LABELS[metodo]}</strong>
            </p>
          </div>
        )}

        {embedded && (
          <p className="text-sm text-neutral-600">
            Envío: <strong>{SHIPPING_METODO_LABELS[metodo]}</strong>
          </p>
        )}

        {errors._form && (
          <p className="text-sm text-red-600" role="alert">
            {errors._form}
          </p>
        )}

        {metodo === 'retiro' ? (
          <div className="border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] px-4 py-4 text-sm text-neutral-700 space-y-2">
            <p>
              <strong>{RETIRO_OFICINA_LABEL}</strong>
            </p>
            <p>
              Retirá tu pedido en nuestra oficina en Mar del Plata. Te contactaremos por WhatsApp
              cuando esté listo para retirar.
            </p>
            <p className="text-xs text-neutral-500">No se cobra envío por este medio.</p>
          </div>
        ) : catalogLoading ? (
          <p className="text-sm text-neutral-600">Cargando catálogo de envíos…</p>
        ) : catalogError ? (
          <p className="text-sm text-red-600">{catalogError}</p>
        ) : (
          <>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                Provincia *
              </label>
              <select
                value={form.provincia}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    provincia: e.target.value,
                    localidad: '',
                    domicilio: '',
                    codigoSucursal: '',
                  }))
                }
                className={inputClass('provincia')}
                required
              >
                <option value="">Seleccioná provincia</option>
                {(catalog?.provinces ?? []).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.provincia && (
                <p className="mt-1 text-xs text-red-600">{errors.provincia}</p>
              )}
            </div>

            {metodo === 'sucursal' ? (
              <>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                    Localidad *
                  </label>
                  <select
                    value={form.localidad}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        localidad: e.target.value,
                        domicilio: '',
                        codigoSucursal: '',
                      }))
                    }
                    className={inputClass('localidad')}
                    disabled={!form.provincia}
                    required
                  >
                    <option value="">Seleccioná localidad</option>
                    {localities.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                  {errors.localidad && (
                    <p className="mt-1 text-xs text-red-600">{errors.localidad}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                    Sucursal Correo Argentino *
                  </label>
                  <select
                    value={form.codigoSucursal}
                    onChange={(e) => handleBranchSelect(e.target.value)}
                    className={inputClass('domicilio')}
                    disabled={!form.localidad}
                    required
                  >
                    <option value="">Seleccioná sucursal</option>
                    {branches.map((b) => (
                      <option key={b.codigo_sucursal} value={b.codigo_sucursal}>
                        {b.domicilio} ({b.codigo_sucursal})
                      </option>
                    ))}
                  </select>
                  {errors.domicilio && (
                    <p className="mt-1 text-xs text-red-600">{errors.domicilio}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                    Localidad *
                  </label>
                  <input
                    type="text"
                    value={form.localidad}
                    onChange={(e) => setForm((f) => ({ ...f, localidad: e.target.value }))}
                    className={inputClass('localidad')}
                    required
                  />
                  {errors.localidad && (
                    <p className="mt-1 text-xs text-red-600">{errors.localidad}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                    Calle y número *
                  </label>
                  <input
                    type="text"
                    value={form.domicilio}
                    onChange={(e) => setForm((f) => ({ ...f, domicilio: e.target.value }))}
                    className={inputClass('domicilio')}
                    placeholder="Ej: Av. Colón 1234"
                    required
                  />
                  <p className="mt-1.5 text-xs text-neutral-500">
                    Si no completás piso y depto abajo, podés incluirlos acá en la misma línea
                    (Correo Argentino los toma en este campo).
                  </p>
                  {errors.domicilio && (
                    <p className="mt-1 text-xs text-red-600">{errors.domicilio}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                      Piso <span className="normal-case tracking-normal text-neutral-400">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.piso}
                      onChange={(e) => setForm((f) => ({ ...f, piso: e.target.value }))}
                      className={inputClass('piso')}
                      placeholder="Ej: 3"
                      inputMode="text"
                      autoComplete="address-line2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                      Depto <span className="normal-case tracking-normal text-neutral-400">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.depto}
                      onChange={(e) => setForm((f) => ({ ...f, depto: e.target.value }))}
                      className={inputClass('depto')}
                      placeholder="Ej: B"
                      autoComplete="address-line3"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                    Código postal *
                  </label>
                  <input
                    type="text"
                    value={form.codigoPostal}
                    onChange={(e) => setForm((f) => ({ ...f, codigoPostal: e.target.value }))}
                    className={inputClass('codigoPostal')}
                    required
                  />
                  {errors.codigoPostal && (
                    <p className="mt-1 text-xs text-red-600">{errors.codigoPostal}</p>
                  )}
                </div>
              </>
            )}
          </>
        )}

        <div className="border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] px-4 py-3 text-sm text-neutral-700">
          <p>
            <strong>Email para envío:</strong> {email || form.email}
          </p>
        </div>

        {showActions && (
          <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="sm:flex-1 text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors py-3"
              >
                ← Volver
              </button>
            )}
            <button
              type="submit"
              disabled={catalogLoading && metodo !== 'retiro'}
              className="sm:flex-[2] border border-neutral-900 bg-neutral-900 text-white px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50"
            >
              Continuar al pago
            </button>
          </div>
        )}
      </Wrapper>
    );
  }
);

export default CheckoutShippingForm;
