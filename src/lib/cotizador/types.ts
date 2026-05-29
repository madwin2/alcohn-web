export type GrupoCodigo = 'chicos' | 'medianos' | 'grandes' | 'xl';

export type FuentePrecio =
  | 'medida_fija'
  | 'grupo_exacto'
  | 'grupo_inferido'
  | 'grupo_aproximado';

export type MedidaGrupoFila = {
  ancho: number;
  largo: number;
  grupo_codigo: GrupoCodigo;
};

export type MedidaFijaFila = {
  ancho: number;
  largo: number;
  precio_transferencia: number;
};

export type CotizadorCatalog = {
  catalogUserId: string;
  precioPorGrupo: Record<GrupoCodigo, number>;
  medidaAGrupo: Record<string, GrupoCodigo>;
  precioFijoPorMedida: Record<string, number>;
  medidaGrupoFilas: MedidaGrupoFila[];
  medidaFijaFilas: MedidaFijaFila[];
};

export type CotizacionResult = {
  ancho_cm: number;
  alto_cm: number;
  precio_transferencia_ars: number;
  precio_link_ars: number;
  fuente: FuentePrecio;
};
