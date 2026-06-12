import type { ShippingCatalog, ShippingFormData, ShippingMetodoUi } from './types';
import {
  catalogKey,
  getBranchesFor,
} from './catalog';
import {
  buildDomicilioCompleto,
  normalizePhone,
  snapAddress,
  snapLocality,
  snapProvince,
} from './normalize';

const DOMICILIO_MAX_LENGTH = 255;

export function validateShippingForm(
  metodo: ShippingMetodoUi,
  form: ShippingFormData,
  catalog: ShippingCatalog | null,
  nombreCompletoFallback?: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  const nombre = (form.nombreCompleto || nombreCompletoFallback || '').trim();
  if (!nombre) errors.nombreCompleto = 'El nombre es obligatorio';

  const telefono = normalizePhone(form.telefono);
  if (!telefono || telefono.length < 8) {
    errors.telefono = 'Ingresá un teléfono válido';
  }

  const email = form.email.trim();
  if (!email || !email.includes('@')) {
    errors.email = 'Ingresá un email válido';
  }

  if (metodo === 'retiro') return errors;

  if (!catalog || catalog.provinces.length === 0) {
    errors._form = 'El catálogo de envíos no está disponible. Intentá más tarde.';
    return errors;
  }

  const provincia = snapProvince(form.provincia, catalog.provinces);
  if (!provincia) {
    errors.provincia = 'Elegí una provincia del listado';
  }

  if (metodo === 'domicilio') {
    if (!form.localidad.trim()) errors.localidad = 'La localidad es obligatoria';
    const calle = form.domicilio.trim();
    if (!calle) {
      errors.domicilio = 'La dirección es obligatoria';
    } else if (!/\d/.test(calle)) {
      errors.domicilio = 'Incluí el número de calle (ej: Av. Colón 1234)';
    }
    const domicilioCompleto = buildDomicilioCompleto(calle, form.piso, form.depto);
    if (domicilioCompleto.length > DOMICILIO_MAX_LENGTH) {
      errors.domicilio = `La dirección completa no puede superar ${DOMICILIO_MAX_LENGTH} caracteres`;
    }
    if (!form.codigoPostal.trim()) {
      errors.codigoPostal = 'El código postal es obligatorio';
    }
    return errors;
  }

  if (metodo === 'sucursal' && provincia) {
    const localities = catalog.localitiesByProvince[provincia] ?? [];
    const localidad = snapLocality(form.localidad, localities, provincia);
    if (!localidad) {
      errors.localidad = 'Elegí una localidad del listado';
      return errors;
    }
    const branches = getBranchesFor(catalog, provincia, localidad);
    const addresses = branches.map((b) => b.domicilio);
    const domicilioSnap = snapAddress(form.domicilio, addresses);
    const codigoManual = form.codigoSucursal.trim();
    const codigoExists = branches.some((b) => b.codigo_sucursal === codigoManual);
    if (!domicilioSnap && !codigoExists) {
      errors.domicilio = 'Elegí una sucursal del listado o ingresá un código MiCorreo válido';
    }
  }

  return errors;
}

export function resolveShippingSnap(
  metodo: ShippingMetodoUi,
  form: ShippingFormData,
  catalog: ShippingCatalog
): {
  provincia: string;
  localidad: string;
  domicilio: string;
  codigoSucursal: string | null;
} | null {
  const provincia = snapProvince(form.provincia, catalog.provinces);
  if (!provincia) return null;

  if (metodo === 'domicilio') {
    return {
      provincia,
      localidad: form.localidad.trim(),
      domicilio: buildDomicilioCompleto(form.domicilio, form.piso, form.depto),
      codigoSucursal: null,
    };
  }

  if (metodo === 'sucursal') {
    const localities = catalog.localitiesByProvince[provincia] ?? [];
    const localidad = snapLocality(form.localidad, localities, provincia);
    if (!localidad) return null;
    const branches = catalog.branchesByKey[catalogKey(provincia, localidad)] ?? [];
    const codigoManual = form.codigoSucursal.trim();
    let branch = branches.find((b) => b.codigo_sucursal === codigoManual);
    if (!branch) {
      const domSnap = snapAddress(
        form.domicilio,
        branches.map((b) => b.domicilio)
      );
      branch = branches.find((b) => b.domicilio === domSnap);
    }
    if (!branch) return null;
    return {
      provincia: branch.provincia,
      localidad: branch.localidad,
      domicilio: branch.domicilio,
      codigoSucursal: branch.codigo_sucursal,
    };
  }

  return null;
}
