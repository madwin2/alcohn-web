/**
 * "No tengo logo": logo armado con el nombre de la marca en el generador.
 *
 * Acá vive solo la lógica pura (sin DOM): normalizar el texto, los estilos tipográficos,
 * el tamaño de fuente para que entre y el nombre del archivo. El dibujo en canvas está en
 * `src/components/buy/WizardTextLogo.tsx`.
 */

/** Largo máximo de la marca (sumando las dos líneas). En bronce, más texto se vuelve ilegible. */
export const TEXT_LOGO_MAX_CHARS = 28;
export const TEXT_LOGO_MAX_LINES = 2;

/** Ancho mínimo del PNG que entra al generador (la muestra y el vendedor lo necesitan nítido). */
export const TEXT_LOGO_MIN_CANVAS_WIDTH = 1200;
/** Ancho al que se lleva la línea más larga. */
export const TEXT_LOGO_TARGET_TEXT_WIDTH = 1400;
export const TEXT_LOGO_PADDING = 80;
/** Tope de cuerpo: una marca corta ("ANA") no necesita un PNG gigante. */
export const TEXT_LOGO_MAX_FONT_SIZE = 420;
export const TEXT_LOGO_MIN_FONT_SIZE = 60;

export type TextLogoStyleId = 'clasica' | 'moderna' | 'script' | 'condensada';

export type TextLogoStyle = {
  id: TextLogoStyleId;
  label: string;
  /** Peso CSS/canvas. */
  weight: number;
  uppercase: boolean;
  /** Espaciado entre letras, en em. */
  letterSpacingEm: number;
  /** Alto de línea, en múltiplos del cuerpo. */
  lineHeight: number;
  /** Respaldo si la fuente web no llegó a cargar. */
  fallbackStack: string;
};

export const TEXT_LOGO_STYLES: readonly TextLogoStyle[] = [
  {
    id: 'clasica',
    label: 'Clásica',
    weight: 700,
    uppercase: false,
    letterSpacingEm: 0,
    lineHeight: 1.15,
    fallbackStack: "Georgia, 'Times New Roman', serif",
  },
  {
    id: 'moderna',
    label: 'Moderna',
    weight: 700,
    uppercase: true,
    letterSpacingEm: 0.08,
    lineHeight: 1.15,
    fallbackStack: "system-ui, 'Helvetica Neue', Arial, sans-serif",
  },
  {
    id: 'script',
    label: 'Cursiva',
    weight: 700,
    uppercase: false,
    letterSpacingEm: 0,
    lineHeight: 1.25,
    fallbackStack: "'Snell Roundhand', 'Segoe Script', cursive",
  },
  {
    id: 'condensada',
    label: 'Condensada',
    weight: 600,
    uppercase: true,
    letterSpacingEm: 0.04,
    lineHeight: 1.1,
    fallbackStack: "'Arial Narrow', 'Roboto Condensed', sans-serif",
  },
];

export function getTextLogoStyle(id: string): TextLogoStyle {
  return TEXT_LOGO_STYLES.find((s) => s.id === id) ?? TEXT_LOGO_STYLES[0];
}

/** Junta espacios repetidos y recorta cada línea. */
function cleanLine(line: string): string {
  return line.replace(/\s+/g, ' ').trim();
}

/**
 * Líneas listas para dibujar: sin vacías, como mucho 2, y en total hasta
 * `TEXT_LOGO_MAX_CHARS` caracteres (lo que sobra se corta).
 */
export function normalizeTextLogoLines(lines: readonly string[]): string[] {
  const out: string[] = [];
  let remaining = TEXT_LOGO_MAX_CHARS;
  for (const raw of lines) {
    if (out.length >= TEXT_LOGO_MAX_LINES || remaining <= 0) break;
    const line = cleanLine(raw).slice(0, remaining).trim();
    if (!line) continue;
    out.push(line);
    remaining -= line.length;
  }
  return out;
}

export function applyTextLogoCase(line: string, style: TextLogoStyle): string {
  return style.uppercase ? line.toLocaleUpperCase('es') : line;
}

/** Ancho de una línea con espaciado manual entre letras (el canvas no lo soporta en todos los navegadores). */
export function lineWidthWithSpacing(
  textWidth: number,
  charCount: number,
  letterSpacingPx: number
): number {
  if (charCount <= 1 || letterSpacingPx <= 0) return textWidth;
  return textWidth + letterSpacingPx * (charCount - 1);
}

export type TextLogoLayout = {
  fontSize: number;
  canvasWidth: number;
  canvasHeight: number;
  lineHeightPx: number;
  letterSpacingPx: number;
  /** Ancho de cada línea al cuerpo elegido (con espaciado). */
  lineWidths: number[];
};

/**
 * Elige el cuerpo y el tamaño del canvas.
 *
 * `measureAt100(line)` devuelve el ancho de la línea (sin espaciado) a 100 px de cuerpo;
 * el ancho escala lineal con el cuerpo, así que alcanza con una medición por línea.
 */
export function computeTextLogoLayout(
  lines: readonly string[],
  style: TextLogoStyle,
  measureAt100: (line: string) => number
): TextLogoLayout {
  const REF = 100;
  const spacingAtRef = style.letterSpacingEm * REF;
  const widthsAtRef = lines.map((line) =>
    lineWidthWithSpacing(measureAt100(line), Array.from(line).length, spacingAtRef)
  );
  const widest = Math.max(1, ...widthsAtRef);

  const ideal = (TEXT_LOGO_TARGET_TEXT_WIDTH / widest) * REF;
  const fontSize = Math.round(
    Math.max(TEXT_LOGO_MIN_FONT_SIZE, Math.min(TEXT_LOGO_MAX_FONT_SIZE, ideal))
  );
  const scale = fontSize / REF;
  const lineWidths = widthsAtRef.map((w) => w * scale);
  const lineHeightPx = Math.round(fontSize * style.lineHeight);
  const textBlockHeight = lineHeightPx * Math.max(1, lines.length);

  return {
    fontSize,
    canvasWidth: Math.max(
      TEXT_LOGO_MIN_CANVAS_WIDTH,
      Math.ceil(Math.max(...lineWidths, 0) + TEXT_LOGO_PADDING * 2)
    ),
    canvasHeight: Math.ceil(textBlockHeight + TEXT_LOGO_PADDING * 2),
    lineHeightPx,
    letterSpacingPx: style.letterSpacingEm * fontSize,
    lineWidths,
  };
}

/** `texto-<marca>.png`: así el vendedor sabe que es un logo armado con texto. */
export function textLogoFileName(lines: readonly string[]): string {
  const slug = lines
    .join(' ')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
  return `texto-${slug || 'marca'}.png`;
}
