import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { buildShippingCatalog } from './catalog';
import type { CorreoSucursalRow, ShippingFormData, ShippingMetodoUi } from './types';
import { metodoToEmpresaEnvio, metodoToTipoEnvio } from './types';
import {
  normalizePhone,
  splitNombreCompleto,
} from './normalize';
import { resolveShippingSnap } from './validation';

export interface SaveShippingInput {
  ordenId: string;
  clienteId: string;
  metodo: ShippingMetodoUi;
  form: ShippingFormData;
  nombreCompletoFallback?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = SupabaseClient<any>;

export async function loadCorreoCatalog(supabase: AdminClient) {
  const PAGE = 1000;
  const all: CorreoSucursalRow[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from('correo_sucursales')
      .select('codigo, provincia, localidad, calle, numero, activa')
      .or('activa.is.null,activa.eq.true')
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    all.push(...(data as CorreoSucursalRow[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return buildShippingCatalog(all);
}

export async function fetchShippingCostServer(
  supabase: AdminClient,
  tipo: 'Domicilio' | 'Sucursal'
): Promise<number | null> {
  const { data, error } = await supabase
    .from('costos_de_envio')
    .select('costo')
    .eq('empresa', 'Correo Argentino')
    .eq('servicio', tipo)
    .eq('activo', true)
    .order('activo_desde', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('[shipping/cost]', error.message);
    return null;
  }
  const costo = data?.costo;
  return typeof costo === 'number' ? costo : costo != null ? Number(costo) : null;
}

export async function saveShippingForOrder(
  supabase: AdminClient,
  input: SaveShippingInput
): Promise<{ direccion_id: string | null }> {
  const { ordenId, clienteId, metodo, form, nombreCompletoFallback } = input;
  const tipoEnvio = metodoToTipoEnvio(metodo);
  const empresaEnvio = metodoToEmpresaEnvio(metodo);

  if (metodo === 'retiro') {
    const { error } = await supabase
      .from('ordenes')
      .update({
        empresa_envio: empresaEnvio,
        tipo_envio: tipoEnvio,
        direccion_id: null,
      })
      .eq('id', ordenId);
    if (error) throw new Error(error.message);
    return { direccion_id: null };
  }

  const catalog = await loadCorreoCatalog(supabase);
  const snap = resolveShippingSnap(metodo, form, catalog);
  if (!snap) {
    throw new Error('Los datos de envío no coinciden con el padrón de Correo Argentino');
  }

  const nombreCompleto = (form.nombreCompleto || nombreCompletoFallback || '').trim();
  const { nombre, apellido } = splitNombreCompleto(nombreCompleto);
  const telefono = normalizePhone(form.telefono);

  const { data: direccion, error: dirErr } = await supabase
    .from('direcciones')
    .insert({
      cliente_id: clienteId,
      activa: true,
      provincia: snap.provincia,
      localidad: snap.localidad,
      domicilio: snap.domicilio,
      codigo_postal: form.codigoPostal.trim() || '0000',
      nombre,
      apellido,
      telefono,
      codigo_sucursal_micorreo: snap.codigoSucursal,
      dni: null,
    })
    .select('id')
    .single();

  if (dirErr || !direccion) {
    throw new Error(dirErr?.message ?? 'No se pudo guardar la dirección');
  }

  const { error: ordErr } = await supabase
    .from('ordenes')
    .update({
      direccion_id: direccion.id,
      empresa_envio: empresaEnvio,
      tipo_envio: tipoEnvio,
    })
    .eq('id', ordenId);

  if (ordErr) throw new Error(ordErr.message);

  const email = form.email.trim();
  if (email) {
    const { data: cli } = await supabase
      .from('clientes')
      .select('mail')
      .eq('id', clienteId)
      .maybeSingle();
    if (!cli?.mail) {
      await supabase.from('clientes').update({ mail: email }).eq('id', clienteId);
    }
  }

  return { direccion_id: direccion.id };
}
