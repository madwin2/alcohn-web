/** Normalización de texto para comparar provincias/localidades (sin acentos, minúsculas). */
export function normalizeKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
}

const PROVINCE_ALIASES: Record<string, string> = {
  caba: 'Capital Federal',
  'capital federal': 'Capital Federal',
  'ciudad autonoma de buenos aires': 'Capital Federal',
  'ciudad de buenos aires': 'Capital Federal',
  'bs as': 'Buenos Aires',
  'buenos aires provincia': 'Buenos Aires',
  pba: 'Buenos Aires',
  'provincia de buenos aires': 'Buenos Aires',
  cordoba: 'Córdoba',
  'entre rios': 'Entre Ríos',
  'rio negro': 'Río Negro',
  'neuquen': 'Neuquén',
  'tucuman': 'Tucumán',
  'jujuy': 'Jujuy',
  'san juan': 'San Juan',
  'san luis': 'San Luis',
  'santa fe': 'Santa Fe',
  'santiago del estero': 'Santiago del Estero',
  'tierra del fuego': 'Tierra del Fuego',
  chubut: 'Chubut',
  formosa: 'Formosa',
  misiones: 'Misiones',
  salta: 'Salta',
  catamarca: 'Catamarca',
  'la pampa': 'La Pampa',
  'la rioja': 'La Rioja',
  mendoza: 'Mendoza',
  corrientes: 'Corrientes',
  chaco: 'Chaco',
};

const CANONICAL_PROVINCES = [
  'Capital Federal',
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

export function canonicalizeProvince(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const key = normalizeKey(trimmed);
  const alias = PROVINCE_ALIASES[key];
  if (alias) return alias;
  const match = CANONICAL_PROVINCES.find((p) => normalizeKey(p) === key);
  if (match) return match;
  return trimmed;
}

export function snapProvince(input: string, options: string[]): string | null {
  const canon = canonicalizeProvince(input);
  if (!canon) return null;
  const canonKey = normalizeKey(canon);
  const exact = options.find((p) => normalizeKey(p) === canonKey);
  if (exact) return exact;
  const partial = options.find(
    (p) =>
      normalizeKey(p).includes(canonKey) || canonKey.includes(normalizeKey(p))
  );
  return partial ?? null;
}

export function snapLocality(
  input: string,
  options: string[],
  provincia: string
): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    if (normalizeKey(provincia) === normalizeKey('Capital Federal')) {
      return (
        options.find(
          (l) => normalizeKey(l) === normalizeKey('Ciudad Autónoma de Buenos Aires')
        ) ?? 'Ciudad Autónoma de Buenos Aires'
      );
    }
    return null;
  }
  const key = normalizeKey(trimmed);
  const exact = options.find((l) => normalizeKey(l) === key);
  if (exact) return exact;
  const partial = options.find(
    (l) => normalizeKey(l).includes(key) || key.includes(normalizeKey(l))
  );
  return partial ?? null;
}

export function snapAddress(input: string, options: string[]): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const key = normalizeKey(trimmed);
  const exact = options.find((a) => normalizeKey(a) === key);
  if (exact) return exact;
  const partial = options.find(
    (a) => normalizeKey(a).includes(key) || key.includes(normalizeKey(a))
  );
  return partial ?? null;
}

export function splitNombreCompleto(nombreCompleto: string): {
  nombre: string;
  apellido: string;
} {
  const parts = nombreCompleto.trim().replace(/\s+/g, ' ').split(' ');
  if (parts.length === 0) return { nombre: '-', apellido: '-' };
  if (parts.length === 1) return { nombre: parts[0], apellido: '-' };
  return { nombre: parts[0], apellido: parts.slice(1).join(' ') };
}

export function normalizePhone(input: string): string {
  return input.replace(/\D/g, '');
}

export function buildSucursalDomicilio(calle: string, numero: string): string {
  const c = calle.trim();
  const n = numero.trim();
  if (!n || n === '0') return c;
  return `${c} ${n}`.trim();
}

/** Une calle/número con piso y depto para Correo Argentino (una sola línea en DB). */
export function buildDomicilioCompleto(
  calleNumero: string,
  piso?: string,
  depto?: string
): string {
  let line = calleNumero.trim();
  const p = piso?.trim();
  const d = depto?.trim();
  if (p) line += `, Piso ${p}`;
  if (d) line += `, Dpto ${d}`;
  return line;
}
