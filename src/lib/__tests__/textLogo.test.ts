import { describe, expect, it } from 'vitest';
import {
  TEXT_LOGO_MAX_CHARS,
  TEXT_LOGO_MAX_FONT_SIZE,
  TEXT_LOGO_MIN_CANVAS_WIDTH,
  TEXT_LOGO_TARGET_TEXT_WIDTH,
  applyTextLogoCase,
  computeTextLogoLayout,
  getTextLogoStyle,
  lineWidthWithSpacing,
  normalizeTextLogoLines,
  textLogoFileName,
} from '../textLogo';

/** Medición falsa: 50 px por carácter a 100 px de cuerpo. */
const measure = (line: string) => Array.from(line).length * 50;

describe('logo de texto', () => {
  it('normaliza las líneas: espacios, vacías y máximo de caracteres', () => {
    expect(normalizeTextLogoLines(['  Casa   Lupe ', ''])).toEqual(['Casa Lupe']);
    expect(normalizeTextLogoLines(['', 'Talabartería'])).toEqual(['Talabartería']);
    expect(normalizeTextLogoLines(['Uno', 'Dos', 'Tres'])).toEqual(['Uno', 'Dos']);
    const long = normalizeTextLogoLines(['A'.repeat(20), 'B'.repeat(20)]);
    expect(long.join('').length).toBe(TEXT_LOGO_MAX_CHARS);
  });

  it('aplica mayúsculas solo en los estilos que las usan', () => {
    expect(applyTextLogoCase('Ñandú', getTextLogoStyle('moderna'))).toBe('ÑANDÚ');
    expect(applyTextLogoCase('Ñandú', getTextLogoStyle('clasica'))).toBe('Ñandú');
    expect(getTextLogoStyle('no-existe').id).toBe('clasica');
  });

  it('suma el espaciado entre letras', () => {
    expect(lineWidthWithSpacing(100, 5, 10)).toBe(140);
    expect(lineWidthWithSpacing(100, 1, 10)).toBe(100);
  });

  it('ajusta el cuerpo para que la línea más larga llegue al ancho objetivo', () => {
    const layout = computeTextLogoLayout(['Mi marca linda'], getTextLogoStyle('clasica'), measure);
    // 14 caracteres → 700 px a 100 px de cuerpo → 200 px de cuerpo para llegar a 1400 px
    expect(layout.fontSize).toBe(200);
    expect(Math.round(layout.lineWidths[0])).toBe(TEXT_LOGO_TARGET_TEXT_WIDTH);
    expect(layout.canvasWidth).toBeGreaterThanOrEqual(TEXT_LOGO_MIN_CANVAS_WIDTH);
  });

  it('limita el cuerpo en marcas cortas y mantiene el ancho mínimo del PNG', () => {
    const layout = computeTextLogoLayout(['Ana'], getTextLogoStyle('clasica'), measure);
    expect(layout.fontSize).toBe(TEXT_LOGO_MAX_FONT_SIZE);
    expect(layout.canvasWidth).toBe(TEXT_LOGO_MIN_CANVAS_WIDTH);
  });

  it('dos líneas suman alto', () => {
    const style = getTextLogoStyle('moderna');
    const one = computeTextLogoLayout(['Casa Lupe'], style, measure);
    const two = computeTextLogoLayout(['Casa Lupe', 'Cueros'], style, measure);
    expect(two.canvasHeight).toBeGreaterThan(one.canvasHeight);
  });

  it('arma el nombre de archivo texto-<marca>.png', () => {
    expect(textLogoFileName(['Talabartería Ñandú', 'Cueros & Co'])).toBe(
      'texto-talabarteria-nandu-cueros-co.png'
    );
    expect(textLogoFileName(['★★★'])).toBe('texto-marca.png');
  });
});
