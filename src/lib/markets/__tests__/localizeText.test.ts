import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { localizeDeep, localizeText, toTuteo } from '../localizeText';
import { localizeTree } from '../localizeTree';

describe('toTuteo', () => {
  it('convierte voseo a tú respetando mayúsculas', () => {
    expect(toTuteo('Subí tu logo, elegí la medida y revisá la muestra.')).toBe(
      'Sube tu logo, elige la medida y revisa la muestra.'
    );
    expect(toTuteo('Si querés, podés pedir ayuda. ¿Tenés dudas? Escribinos.')).toBe(
      'Si quieres, puedes pedir ayuda. ¿Tienes dudas? Escríbenos.'
    );
    expect(toTuteo('Hacé una prueba y probá de nuevo.')).toBe('Haz una prueba y prueba de nuevo.');
    expect(toTuteo('Menos incertidumbre para vos y lo que vos querés.')).toBe(
      'Menos incertidumbre para ti y lo que tú quieres.'
    );
    expect(toTuteo('DISEÑÁ TU SELLO')).toBe('DISEÑA TU SELLO');
  });

  it('no toca palabras que no son voseo', () => {
    const text = 'La marca se marca con calor. Más detalles después, envío a través de DHL.';
    expect(toTuteo(text)).toBe(text);
  });

  it('no cambia nada en Argentina', () => {
    expect(localizeText('Subí tu logo', 'ar')).toBe('Subí tu logo');
    expect(localizeText('Subí tu logo', 'mx')).toBe('Sube tu logo');
  });

  it('adapta datos anidados sin tocar rutas', () => {
    const data = { title: 'Marcá madera', href: '/sellos/para-madera', items: ['Elegí la medida'] };
    expect(localizeDeep(data, 'cl')).toEqual({
      title: 'Marca madera',
      href: '/sellos/para-madera',
      items: ['Elige la medida'],
    });
  });
});

describe('localizeTree', () => {
  it('adapta textos y props de texto del JSX sin tocar clases ni enlaces', () => {
    const tree = createElement(
      'div',
      { className: 'Subí' },
      createElement('a', { href: '/buy', title: 'Diseñá tu sello' }, 'Subí tu logo'),
      ['Podés ', createElement('strong', { key: 'x' }, 'elegir')]
    );
    expect(renderToStaticMarkup(localizeTree(tree, 'co'))).toBe(
      '<div class="Subí"><a href="/buy" title="Diseña tu sello">Sube tu logo</a>Puedes <strong>elegir</strong></div>'
    );
    expect(localizeTree(tree, 'ar')).toBe(tree);
  });
});
