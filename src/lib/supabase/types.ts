/**
 * Tipos mínimos para las tablas de Supabase que usa la web Alcohn.
 *
 * No es un dump completo del esquema (la app interna tiene más columnas y
 * triggers). Solo tipea lo que las API routes de la web necesitan leer/escribir.
 *
 * Referencia: supabase_schema.md y docs/sql/001_web_alcohn_integration.sql.
 */

export type MedioContacto =
  | 'Whatsapp'
  | 'Facebook'
  | 'Instagram'
  | 'Mail'
  | 'Web';

export type MockupEstado =
  | 'procesando'
  | 'pendiente_aprobacion'
  | 'completado'
  | 'error';

export type MockupMaterial =
  | 'cuero'
  | 'madera'
  | 'ambos'
  | 'ceramica'
  | 'alimentos'
  | 'otros';

export type MockupOrigen = 'app' | 'web';

export type OrdenOrigen = 'Web' | 'App';

export type MetodoPago = 'Openpay' | 'Transferencia';

export type EstadoPagoWeb =
  | 'pendiente'
  | 'pago_fallido'
  | 'esperando_comprobante'
  | 'pagado'
  | 'abandonado';

export type EstadoOrden =
  | 'Señado'
  | 'Hecho'
  | 'Foto'
  | 'Transferido'
  | 'Deudor'
  | 'Hacer Etiqueta'
  | 'Etiqueta Lista'
  | 'Despachado'
  | 'Seguimiento Enviado';

export type SelloItemType =
  | 'SELLO'
  | 'ABECEDARIO'
  | 'SOLDADOR'
  | 'MANGO_GOLPE'
  | 'BASE_REMACHADORA';

export type SelloEstadoFabricacion =
  | 'Sin Hacer'
  | 'Haciendo'
  | 'Hecho'
  | 'Rehacer'
  | 'Retocar'
  | 'Prioridad'
  | 'Verificar'
  | 'Programado';

export type SelloEstadoVenta = 'Señado' | 'Foto' | 'Transferido' | 'Deudor';

export interface ClienteRow {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  medio_contacto: MedioContacto | null;
  dni: string | null;
  mail: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ClienteInsert {
  nombre: string;
  apellido: string;
  telefono: string;
  medio_contacto?: MedioContacto | null;
  dni?: string | null;
  mail?: string | null;
}

export interface ClienteUpdate {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  medio_contacto?: MedioContacto | null;
  dni?: string | null;
  mail?: string | null;
}

export interface MockupSolicitudRow {
  id: string;
  nombre_muestra: string | null;
  nombre_slug: string;
  whatsapp: string | null;
  material: MockupMaterial;
  estado: MockupEstado;
  archivo_base_url: string | null;
  archivo_base_path: string | null;
  imagen_optimizada_url: string | null;
  imagen_optimizada_path: string | null;
  mockup_cuero_url: string | null;
  mockup_cuero_path: string | null;
  mockup_madera_url: string | null;
  mockup_madera_path: string | null;
  cliente_id: string | null;
  orden_id: string | null;
  origen: MockupOrigen;
  email: string | null;
  checkout_iniciado_at: string | null;
  checkout_completado_at: string | null;
  carrito_json: unknown | null;
  metadata_web: Record<string, unknown>;
  web_session_id: string | null;
  medidas_cotizacion_json: unknown | null;
  created_at: string;
  updated_at: string;
}

export interface MockupSolicitudInsert {
  nombre_muestra?: string | null;
  nombre_slug: string;
  whatsapp?: string | null;
  material: MockupMaterial;
  estado?: MockupEstado;
  cliente_id?: string | null;
  origen?: MockupOrigen;
  email?: string | null;
  archivo_base_url?: string | null;
  archivo_base_path?: string | null;
  metadata_web?: Record<string, unknown>;
  web_session_id?: string | null;
  medidas_cotizacion_json?: unknown | null;
}

export interface MockupSolicitudUpdate {
  estado?: MockupEstado;
  cliente_id?: string | null;
  orden_id?: string | null;
  email?: string | null;
  archivo_base_url?: string | null;
  archivo_base_path?: string | null;
  imagen_optimizada_url?: string | null;
  imagen_optimizada_path?: string | null;
  mockup_cuero_url?: string | null;
  mockup_cuero_path?: string | null;
  mockup_madera_url?: string | null;
  mockup_madera_path?: string | null;
  checkout_iniciado_at?: string | null;
  checkout_completado_at?: string | null;
  carrito_json?: unknown | null;
  metadata_web?: Record<string, unknown>;
  medidas_cotizacion_json?: unknown | null;
}

export interface OrdenRow {
  id: string;
  cliente_id: string;
  direccion_id: string | null;
  estado_orden: EstadoOrden | null;
  estado_envio: string | null;
  cantidad_sellos: number | null;
  senia_total: number | null;
  valor_total: number | null;
  restante: number | null;
  fecha: string | null;
  origen: OrdenOrigen | null;
  metodo_pago: MetodoPago | null;
  estado_pago_web: EstadoPagoWeb | null;
  mockup_solicitud_id: string | null;
  web_checkout_ref: string | null;
  openpay_order_id: string | null;
  pago_error_codigo: string | null;
  pago_error_mensaje: string | null;
  ultimo_intento_pago_at: string | null;
  pago_confirmado_at: string | null;
  comprobante_path: string | null;
  comprobante_url: string | null;
  comprobante_subido_at: string | null;
  comprobante_validado_at: string | null;
  comprobante_validado_por: string | null;
  notas_web: Record<string, unknown>;
  carrito_json: unknown | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface OrdenInsert {
  cliente_id: string;
  origen?: OrdenOrigen | null;
  metodo_pago?: MetodoPago | null;
  estado_pago_web?: EstadoPagoWeb | null;
  estado_orden?: EstadoOrden | null;
  mockup_solicitud_id?: string | null;
  web_checkout_ref?: string | null;
  notas_web?: Record<string, unknown>;
  carrito_json?: unknown | null;
}

export interface OrdenUpdate {
  estado_orden?: EstadoOrden | null;
  estado_pago_web?: EstadoPagoWeb | null;
  metodo_pago?: MetodoPago | null;
  openpay_order_id?: string | null;
  pago_error_codigo?: string | null;
  pago_error_mensaje?: string | null;
  ultimo_intento_pago_at?: string | null;
  pago_confirmado_at?: string | null;
  comprobante_path?: string | null;
  comprobante_url?: string | null;
  comprobante_subido_at?: string | null;
  comprobante_validado_at?: string | null;
  comprobante_validado_por?: string | null;
  notas_web?: Record<string, unknown>;
  carrito_json?: unknown | null;
}

export interface SelloInsert {
  orden_id: string;
  valor: number;
  item_type?: SelloItemType;
  estado_fabricacion?: SelloEstadoFabricacion;
  estado_venta?: SelloEstadoVenta;
  tipo?: 'Clasico' | '3mm' | 'Lacre' | 'Alimento' | 'ABC' | null;
  diseno?: string | null;
  nota?: string | null;
  archivo_base?: string | null;
  largo_real?: number | null;
  ancho_real?: number | null;
  item_config?: Record<string, unknown>;
  mockup_solicitud_id?: string | null;
  senia?: number;
}

/**
 * Tipado mínimo para que el cliente Supabase devuelva tipos correctos en
 * `from('clientes')`, etc. No incluye todas las relaciones / RPC del proyecto.
 */
export interface AlcohnDatabase {
  public: {
    Tables: {
      clientes: {
        Row: ClienteRow;
        Insert: ClienteInsert;
        Update: ClienteUpdate;
      };
      mockup_solicitudes: {
        Row: MockupSolicitudRow;
        Insert: MockupSolicitudInsert;
        Update: MockupSolicitudUpdate;
      };
      ordenes: {
        Row: OrdenRow;
        Insert: OrdenInsert;
        Update: OrdenUpdate;
      };
      sellos: {
        Row: SelloInsert & { id: string };
        Insert: SelloInsert;
        Update: Partial<SelloInsert>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
