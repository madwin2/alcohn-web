/**
 * Helpers del lado del cliente (browser) para llamar las API de mockups.
 * Usar desde BuyWizard / checkout cuando conectemos la UI.
 */

export type MockupUploadKind =
  | 'logo_original'
  | 'logo_optimizado'
  | 'mockup_cuero'
  | 'mockup_madera';

export interface MockupSolicitudCreateInput {
  cliente_id?: string;
  nombre_muestra?: string;
  material: string;
  whatsapp?: string;
  email?: string;
  metadata_web?: Record<string, unknown>;
  web_session_id?: string;
}

export async function createMockupSolicitud(
  input: MockupSolicitudCreateInput
): Promise<{ id: string; nombre_slug: string }> {
  const res = await fetch('/api/mockups/solicitudes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    nombre_slug?: string;
    error?: string;
  };
  if (!res.ok) throw new Error(data.error ?? 'No se pudo crear la solicitud de mockup');
  if (!data.id) throw new Error('Respuesta inválida del servidor');
  return { id: data.id, nombre_slug: data.nombre_slug ?? '' };
}

export async function patchMockupSolicitud(
  id: string,
  patch: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`/api/mockups/solicitudes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'No se pudo actualizar la solicitud');
}

/** Sube imagen vía data URL (típico del wizard). */
export async function uploadMockupImage(
  solicitudId: string,
  kind: MockupUploadKind,
  dataUrl: string
): Promise<{ path: string; url: string; bucket: string }> {
  const res = await fetch(`/api/mockups/solicitudes/${solicitudId}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, data_url: dataUrl }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    path?: string;
    url?: string;
    bucket?: string;
    error?: string;
    detail?: string;
  };
  if (!res.ok) {
    throw new Error(data.detail ?? data.error ?? 'Error al subir imagen');
  }
  if (!data.path || !data.url) throw new Error('Respuesta de subida inválida');
  return { path: data.path, url: data.url, bucket: data.bucket ?? '' };
}

export async function createCheckoutIntent(input: {
  metodo_pago: 'Openpay' | 'Transferencia';
  cliente?: {
    nombre: string;
    apellido?: string;
    telefono: string;
    email?: string;
  };
  cliente_id?: string;
  items: Array<{
    id: string;
    title: string;
    collection: string;
    material: string;
    process: string;
    variantSize: string;
    price: number;
    qty: number;
    image: string;
    designSlug: string;
  }>;
  mockup_solicitud_id?: string;
  provincia?: string;
  ciudad?: string;
  notas?: string;
  envio_costo?: number;
  envio_metodo?: 'domicilio' | 'sucursal' | 'retiro';
  envio?: {
    metodo: 'domicilio' | 'sucursal' | 'retiro';
    form: {
      nombreCompleto: string;
      email: string;
      telefono: string;
      provincia: string;
      localidad: string;
      domicilio: string;
      piso?: string;
      depto?: string;
      codigoPostal: string;
      codigoSucursal: string;
    };
  };
}): Promise<{
  orden_id: string;
  cliente_id: string;
  web_checkout_ref: string;
  estado_pago_web: string;
}> {
  const res = await fetch('/api/checkout/intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => ({}))) as {
    orden_id?: string;
    cliente_id?: string;
    web_checkout_ref?: string;
    estado_pago_web?: string;
    error?: string;
  };
  if (!res.ok) {
    const detail = (data as { detail?: string }).detail;
    throw new Error(
      detail ? `${data.error ?? 'Error'}: ${detail}` : (data.error ?? 'No se pudo registrar el pedido')
    );
  }
  if (!data.orden_id || !data.cliente_id) {
    throw new Error('Respuesta de checkout inválida');
  }
  return {
    orden_id: data.orden_id,
    cliente_id: data.cliente_id,
    web_checkout_ref: data.web_checkout_ref ?? '',
    estado_pago_web: data.estado_pago_web ?? '',
  };
}

export async function uploadComprobante(
  ordenId: string,
  file: File
): Promise<void> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`/api/orders/${ordenId}/comprobante`, {
    method: 'POST',
    body: form,
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'No se pudo subir el comprobante');
}

export async function upsertCliente(input: {
  nombre: string;
  apellido?: string;
  telefono: string;
  mail?: string;
  email?: string;
}): Promise<{ id: string; created: boolean }> {
  const res = await fetch('/api/clientes/upsert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    created?: boolean;
    error?: string;
  };
  if (!res.ok) throw new Error(data.error ?? 'No se pudo guardar el cliente');
  if (!data.id) throw new Error('Respuesta inválida del servidor');
  return { id: data.id, created: Boolean(data.created) };
}
