/** Método elegido en el wizard / checkout (UI). */
export type ShippingMetodoUi = 'domicilio' | 'sucursal' | 'retiro';

/** Valores persistidos en `ordenes` (Supabase). */
export type TipoEnvioDb = 'Domicilio' | 'Sucursal' | 'Retiro';

export type EmpresaEnvioDb = 'Correo Argentino' | 'Retiro';

export interface CorreoSucursalRow {
  codigo: string;
  provincia: string;
  localidad: string;
  calle: string;
  numero: string;
  activa: boolean | null;
}

export interface SucursalCatalogEntry {
  codigo_sucursal: string;
  provincia: string;
  localidad: string;
  domicilio: string;
}

export interface ShippingCatalog {
  provinces: string[];
  /** provincia canónica → localidades únicas */
  localitiesByProvince: Record<string, string[]>;
  /** "provincia|localidad" → sucursales */
  branchesByKey: Record<string, SucursalCatalogEntry[]>;
}

export interface ShippingSelectionStored {
  metodo: ShippingMetodoUi;
  costo: number;
  ts: number;
}

export interface ShippingFormData {
  nombreCompleto: string;
  email: string;
  telefono: string;
  provincia: string;
  localidad: string;
  /** Calle y número (sin piso/depto). */
  domicilio: string;
  /** Opcional; se concatena en `domicilio` al persistir. */
  piso: string;
  /** Opcional; se concatena en `domicilio` al persistir. */
  depto: string;
  codigoPostal: string;
  codigoSucursal: string;
}

export const RETIRO_OFICINA_LABEL =
  'Retiro Oficina Alcohn (Mar del Plata)';

export const SHIPPING_METODO_LABELS: Record<ShippingMetodoUi, string> = {
  domicilio: 'Domicilio',
  sucursal: 'Sucursal',
  retiro: RETIRO_OFICINA_LABEL,
};

/** Opciones del checkout: orden pensado para compradores online (domicilio primero). */
export const SHIPPING_METODO_OPTIONS: {
  id: ShippingMetodoUi;
  label: string;
  description: string;
}[] = [
  {
    id: 'domicilio',
    label: 'Envío a domicilio',
    description: 'Correo Argentino a tu casa. Completá tu dirección abajo.',
  },
  {
    id: 'sucursal',
    label: 'Sucursal Correo Argentino',
    description: 'Retirás en la sucursal que elijas. No llega a tu domicilio.',
  },
  {
    id: 'retiro',
    label: RETIRO_OFICINA_LABEL,
    description: 'Retirás en nuestra oficina en Mar del Plata. Sin costo de envío.',
  },
];

export function metodoToTipoEnvio(metodo: ShippingMetodoUi): TipoEnvioDb {
  if (metodo === 'domicilio') return 'Domicilio';
  if (metodo === 'sucursal') return 'Sucursal';
  return 'Retiro';
}

export function metodoToEmpresaEnvio(metodo: ShippingMetodoUi): EmpresaEnvioDb {
  return metodo === 'retiro' ? 'Retiro' : 'Correo Argentino';
}
