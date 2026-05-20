export interface CotizacionData {
  nombre?: string;
  telefono?: string;
  email?: string;
  logoUrl?: string;
  material?: "cuero" | "madera" | "alimentos" | "otro";
  medida?: string;
  precio?: number;
  envio?: "domicilio" | "sucursal";
}

export interface SizeOption {
  size: string;
  price: number;
}







