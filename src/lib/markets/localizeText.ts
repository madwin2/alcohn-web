import type { MarketCode } from './types';

/**
 * Textos para mercados internacionales (CL, PE, CO, MX).
 *
 * La web está escrita en español rioplatense (voseo: "Subí tu logo", "podés"). Afuera se
 * habla de tú, así que los textos compartidos se pasan por `localizeText` antes de mostrarse
 * en /{market}. El diccionario es cerrado a propósito: solo formas verbales de voseo, que no
 * se confunden con otras palabras (ej. "Marcá" sí, "marca" no).
 */
const VOSEO_TO_TU: Record<string, string> = {
  // Imperativos
  acompañá: 'acompaña',
  agregá: 'agrega',
  ajustá: 'ajusta',
  alineá: 'alinea',
  apoyá: 'apoya',
  armá: 'arma',
  arrastrá: 'arrastra',
  aumentá: 'aumenta',
  avanzá: 'avanza',
  bajá: 'baja',
  buscá: 'busca',
  calentá: 'calienta',
  calibrá: 'calibra',
  cambiá: 'cambia',
  cargá: 'carga',
  colocá: 'coloca',
  compará: 'compara',
  completá: 'completa',
  comprá: 'compra',
  configurá: 'configura',
  confirmá: 'confirma',
  consultá: 'consulta',
  contá: 'cuenta',
  continuá: 'continúa',
  convertí: 'convierte',
  copiá: 'copia',
  corregí: 'corrige',
  cotizá: 'cotiza',
  creá: 'crea',
  definí: 'define',
  dejá: 'deja',
  descubrí: 'descubre',
  deslizá: 'desliza',
  diseñá: 'diseña',
  elegí: 'elige',
  empezá: 'empieza',
  encargá: 'encarga',
  encendé: 'enciende',
  entrá: 'entra',
  enviá: 'envía',
  esperá: 'espera',
  evitá: 'evita',
  fabricá: 'fabrica',
  finalizá: 'finaliza',
  guardá: 'guarda',
  hacé: 'haz',
  humedecé: 'humedece',
  incluí: 'incluye',
  ingresá: 'ingresa',
  intentá: 'intenta',
  limpiá: 'limpia',
  llevá: 'lleva',
  mandá: 'manda',
  marcá: 'marca',
  mirá: 'mira',
  pagá: 'paga',
  pasá: 'pasa',
  pedí: 'pide',
  personalizá: 'personaliza',
  prepará: 'prepara',
  presioná: 'presiona',
  probá: 'prueba',
  recibí: 'recibe',
  registrá: 'registra',
  reiniciá: 'reinicia',
  repetí: 'repite',
  retirá: 'retira',
  revisá: 'revisa',
  seguí: 'sigue',
  seleccioná: 'selecciona',
  subí: 'sube',
  sumá: 'suma',
  tocá: 'toca',
  transferí: 'transfiere',
  usá: 'usa',
  verificá: 'verifica',
  volvé: 'vuelve',
  // Presente
  aceptás: 'aceptas',
  agregás: 'agregas',
  buscás: 'buscas',
  cambiás: 'cambias',
  cargás: 'cargas',
  completás: 'completas',
  confirmás: 'confirmas',
  debés: 'debes',
  declarás: 'declaras',
  dudás: 'dudas',
  elegís: 'eliges',
  entendés: 'entiendes',
  enviás: 'envías',
  necesitás: 'necesitas',
  pagás: 'pagas',
  podés: 'puedes',
  preferís: 'prefieres',
  querés: 'quieres',
  recibís: 'recibes',
  retirás: 'retiras',
  revisás: 'revisas',
  sabés: 'sabes',
  seguís: 'sigues',
  seleccionás: 'seleccionas',
  sos: 'eres',
  subís: 'subes',
  sumás: 'sumas',
  tenés: 'tienes',
  usás: 'usas',
  vendés: 'vendes',
  // Imperativo con pronombre
  agregalo: 'agrégalo',
  apoyalo: 'apóyalo',
  armalo: 'ármalo',
  calentalo: 'caliéntalo',
  completalo: 'complétalo',
  confirmalo: 'confírmalo',
  dejalo: 'déjalo',
  elegilo: 'elígelo',
  guardalo: 'guárdalo',
  hacelo: 'hazlo',
  limpialo: 'límpialo',
  mandalo: 'mándalo',
  miralo: 'míralo',
  pedilo: 'pídelo',
  probalo: 'pruébalo',
  retiralo: 'retíralo',
  revisalo: 'revísalo',
  subilo: 'súbelo',
  usalo: 'úsalo',
  asegurate: 'asegúrate',
  avisanos: 'avísanos',
  consultanos: 'consúltanos',
  contactanos: 'contáctanos',
  contanos: 'cuéntanos',
  dejanos: 'déjanos',
  escribinos: 'escríbenos',
  fijate: 'fíjate',
  mandanos: 'mándanos',
  sumate: 'súmate',
};

/** Frases que no se resuelven palabra por palabra. */
const PHRASES: Array<[RegExp, string]> = [
  [/\bpara vos\b/g, 'para ti'],
  [/\bPara vos\b/g, 'Para ti'],
  [/\bcon vos\b/g, 'contigo'],
  [/\ba vos\b/g, 'a ti'],
  [/\bvos\b/g, 'tú'],
  [/\bVos\b/g, 'Tú'],
  // Referencias a "nacional" que afuera significan Argentina.
  [/\bmarcas nacionales\b/g, 'marcas argentinas'],
  [/\bIndustria Nacional\b/g, 'industria argentina'],
  [/\bindustria nacional\b/g, 'industria argentina'],
  [/\bde todo el país\b/g, 'de toda Argentina'],
];

const WORD = /[A-Za-zÁÉÍÓÚáéíóúÑñ]+/g;

function matchCase(source: string, replacement: string): string {
  if (source === source.toUpperCase() && source.length > 1) return replacement.toUpperCase();
  if (source[0] === source[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

/** Convierte voseo rioplatense a tuteo. No toca palabras fuera del diccionario. */
export function toTuteo(text: string): string {
  let out = text;
  for (const [pattern, replacement] of PHRASES) out = out.replace(pattern, replacement);
  return out.replace(WORD, (word) => {
    const replacement = VOSEO_TO_TU[word.toLowerCase()];
    return replacement ? matchCase(word, replacement) : word;
  });
}

/** Devuelve el texto adaptado al mercado: igual en Argentina, en tú afuera. */
export function localizeText(text: string, market: MarketCode): string {
  if (market === 'ar') return text;
  return toTuteo(text);
}

/**
 * Aplica `localizeText` a todos los strings de un objeto de datos (arrays y objetos
 * planos), por ejemplo un caso de uso o una lista de FAQ. Deja intactos URLs y rutas.
 */
export function localizeDeep<T>(value: T, market: MarketCode): T {
  if (market === 'ar') return value;
  return walk(value) as T;
}

function walk(value: unknown): unknown {
  if (typeof value === 'string') {
    if (/^(\/|https?:|mailto:|tel:|#)/.test(value)) return value;
    return toTuteo(value);
  }
  if (Array.isArray(value)) return value.map(walk);
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]));
  }
  return value;
}
