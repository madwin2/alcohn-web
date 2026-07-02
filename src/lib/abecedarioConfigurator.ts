// Lógica de precios, opciones y muestra de texto para el configurador de Abecedarios.

export type AbecedarioTipo = 'completo' | 'personalizado';

export type AbecedarioFontKey = 'arial' | 'verdana' | 'times' | 'georgia' | 'courier';

export interface AbecedarioFontOption {
  key: AbecedarioFontKey;
  label: string;
  /** font-family lista para usar en CSS/canvas (fuentes web estándar, sin carga de archivos). */
  family: string;
}

export const ABECEDARIO_FONTS: AbecedarioFontOption[] = [
  { key: 'arial', label: 'Arial', family: 'Arial, Helvetica, sans-serif' },
  { key: 'verdana', label: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
  { key: 'times', label: 'Times New Roman', family: '"Times New Roman", Times, serif' },
  { key: 'georgia', label: 'Georgia', family: 'Georgia, "Times New Roman", serif' },
  { key: 'courier', label: 'Courier New', family: '"Courier New", Courier, monospace' },
];

export const ABECEDARIO_TAMANOS_MM = [3, 4, 5, 6, 7, 8, 9, 10] as const;
export type AbecedarioTamanoMm = (typeof ABECEDARIO_TAMANOS_MM)[number];

export interface AbecedarioPrecios {
  mayuscula: number;
  minuscula: number;
  numero: number;
  extra: number;
  soporte: number;
}

/** Relación precio link de pago / transferencia usada en todo el sitio. */
export const ABECEDARIO_LINK_FACTOR = 1.15;

function precioLink(transferencia: number): number {
  return Math.round(transferencia * ABECEDARIO_LINK_FACTOR);
}

/**
 * Precios por TRANSFERENCIA (valores reales de lista). Mayúsculas, minúsculas y
 * letras extra tienen dos escalas: hasta 6mm y de 7 a 10mm.
 */
export function getAbecedarioPreciosTransferencia(tamanoMm: AbecedarioTamanoMm): AbecedarioPrecios {
  const tierGrande = tamanoMm >= 7;
  return {
    mayuscula: tierGrande ? 245000 : 237000,
    minuscula: tierGrande ? 245000 : 237000,
    numero: 109000,
    extra: tierGrande ? 7300 : 6900,
    soporte: 45000,
  };
}

/** Precios de link de pago (tarjeta/cuotas): transferencia + 15%. Son los que van al carrito. */
export function getAbecedarioPrecios(tamanoMm: AbecedarioTamanoMm): AbecedarioPrecios {
  const t = getAbecedarioPreciosTransferencia(tamanoMm);
  return {
    mayuscula: precioLink(t.mayuscula),
    minuscula: precioLink(t.minuscula),
    numero: precioLink(t.numero),
    extra: precioLink(t.extra),
    soporte: precioLink(t.soporte),
  };
}

/** Precios de referencia (escala más baja) para mostrar "desde" antes de elegir tamaño. */
export const ABECEDARIO_PRECIOS_DESDE: AbecedarioPrecios = getAbecedarioPrecios(3);

/** El set Completo también tiene dos escalas (transferencia): $450.000 hasta 6mm, $518.000 de 7 a 10mm. */
export function getAbecedarioCompletoPrecioTransferencia(tamanoMm: AbecedarioTamanoMm): number {
  return tamanoMm >= 7 ? 518000 : 450000;
}

/** Precio de link de pago del set Completo. */
export function getAbecedarioCompletoPrecio(tamanoMm: AbecedarioTamanoMm): number {
  return precioLink(getAbecedarioCompletoPrecioTransferencia(tamanoMm));
}

export const ABECEDARIO_COMPLETO_PRECIO_DESDE = getAbecedarioCompletoPrecio(3);

export const ABECEDARIO_QTY_LIMITS = {
  mayuscula: { min: 0, max: 5 },
  minuscula: { min: 0, max: 5 },
  numero: { min: 0, max: 5 },
  extra: { min: 0, max: 12 },
  soporte: { min: 0, max: 3 },
} as const;

export interface AbecedarioPersonalizadoState {
  mayusculas: number;
  minusculas: number;
  numeros: number;
  extrasQty: number;
  extrasChars: string;
  soportes: number;
  tamanoMm: AbecedarioTamanoMm;
  fuente: AbecedarioFontKey;
}

export const DEFAULT_PERSONALIZADO_STATE: AbecedarioPersonalizadoState = {
  mayusculas: 1,
  minusculas: 1,
  numeros: 1,
  extrasQty: 0,
  extrasChars: '',
  soportes: 0,
  tamanoMm: 5,
  fuente: 'arial',
};

export interface PresupuestoLinea {
  label: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

export interface Presupuesto {
  lineas: PresupuestoLinea[];
  total: number;
}

export function getFontOption(key: AbecedarioFontKey): AbecedarioFontOption {
  return ABECEDARIO_FONTS.find((f) => f.key === key) ?? ABECEDARIO_FONTS[0];
}

export function calcularPresupuestoPersonalizado(state: AbecedarioPersonalizadoState): Presupuesto {
  const precios = getAbecedarioPrecios(state.tamanoMm);
  const lineas: PresupuestoLinea[] = [
    {
      label: 'Abecedario en Mayúscula',
      qty: state.mayusculas,
      unitPrice: precios.mayuscula,
      subtotal: state.mayusculas * precios.mayuscula,
    },
    {
      label: 'Abecedario en Minúscula',
      qty: state.minusculas,
      unitPrice: precios.minuscula,
      subtotal: state.minusculas * precios.minuscula,
    },
    {
      label: 'Números (0 al 9)',
      qty: state.numeros,
      unitPrice: precios.numero,
      subtotal: state.numeros * precios.numero,
    },
    {
      label: 'Caracteres extra',
      qty: state.extrasQty,
      unitPrice: precios.extra,
      subtotal: state.extrasQty * precios.extra,
    },
    {
      label: 'Soporte de Bronce',
      qty: state.soportes,
      unitPrice: precios.soporte,
      subtotal: state.soportes * precios.soporte,
    },
  ];

  const total = lineas.reduce((acc, l) => acc + l.subtotal, 0);
  return { lineas, total };
}

/** Convierte un precio de link de pago al precio por transferencia. */
export function precioTransferencia(precio: number): number {
  return Math.round(precio / ABECEDARIO_LINK_FACTOR);
}

export function clampQty(value: number, kind: keyof typeof ABECEDARIO_QTY_LIMITS): number {
  const { min, max } = ABECEDARIO_QTY_LIMITS[kind];
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

const ALPHA = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

/**
 * Genera la muestra de texto según las cantidades elegidas: por cada letra del abecedario
 * se repite tantas veces como juegos de mayúscula/minúscula se hayan elegido (ej. 2 mayús + 1
 * minús → "AAaBBbCCc..."), y agrega números y caracteres extra al final.
 */
export function buildAbecedarioSampleText(state: AbecedarioPersonalizadoState): string {
  const blocks: string[] = [];

  if (state.mayusculas > 0 || state.minusculas > 0) {
    const letterBlocks: string[] = [];
    for (const ch of ALPHA) {
      if (state.mayusculas > 0) letterBlocks.push(ch.repeat(state.mayusculas));
      if (state.minusculas > 0) letterBlocks.push(ch.toLocaleLowerCase('es-AR').repeat(state.minusculas));
    }
    blocks.push(letterBlocks.join(''));
  }

  if (state.numeros > 0) {
    const digitBlocks = Array.from({ length: 10 }, (_, i) => String(i).repeat(state.numeros));
    blocks.push(digitBlocks.join(''));
  }

  if (state.extrasQty > 0 && state.extrasChars.trim()) {
    const extras = state.extrasChars.trim().replace(/\s+/g, ' ');
    blocks.push(extras);
  }

  const result = blocks.join('   ');
  return result || 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
}

/** Muestra fija del set Completo (1 juego de mayúsculas, minúsculas y números). */
export function buildAbecedarioCompletoSampleText(): string {
  return buildAbecedarioSampleText({
    mayusculas: 1,
    minusculas: 1,
    numeros: 1,
    extrasQty: 0,
    extrasChars: '',
    soportes: 0,
    tamanoMm: 5,
    fuente: 'arial',
  });
}

export function formatArs(value: number): string {
  return `$${Math.round(value).toLocaleString('es-AR')}`;
}
