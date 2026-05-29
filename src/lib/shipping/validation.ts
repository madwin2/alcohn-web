import type { ShippingCatalog, ShippingFormData, ShippingMetodoUi } from './types';
import {
  catalogKey,
  getBranchesFor,
} from './catalog';
import {
  normalizePhone,
  snapAddress,
  snapLocality,
  snapProvince,
} from './normalize';

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
    const dom = form.domicilio.trim();
    if (!dom) {
      errors.domicilio = 'La dirección es obligatoria';
    } else if (!/\d+\s*$/.test(dom)) {
      errors.domicilio = 'Incluí el número de calle al final (ej: Av. Colón 1234)';
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
      domicilio: form.domicilio.trim(),
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
