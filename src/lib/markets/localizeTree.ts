import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { toTuteo } from './localizeText';
import type { MarketCode } from './types';

/** Props que nunca son texto visible (rutas, clases, ids, valores técnicos). */
const SKIP_PROPS = new Set([
  'children',
  'className',
  'href',
  'src',
  'srcSet',
  'id',
  'htmlFor',
  'name',
  'type',
  'value',
  'defaultValue',
  'style',
  'target',
  'rel',
  'role',
  'sizes',
  'market',
  'slug',
]);

function walkValue(value: unknown, depth: number): unknown {
  if (depth > 40) return value;
  if (typeof value === 'string') {
    if (/^(\/|https?:|mailto:|tel:|#|data:)/.test(value)) return value;
    return toTuteo(value);
  }
  if (Array.isArray(value)) return value.map((item) => walkValue(item, depth + 1));
  if (isValidElement(value)) return walkElement(value, depth + 1);
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SKIP_PROPS.has(key) && key !== 'children' ? item : walkValue(item, depth + 1),
      ])
    );
  }
  return value;
}

function walkElement(element: ReactElement, depth: number): ReactElement {
  const props = (element.props ?? {}) as Record<string, unknown>;
  const nextProps: Record<string, unknown> = {};
  let changed = false;

  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || SKIP_PROPS.has(key) || key.startsWith('data-') || typeof value === 'function') {
      continue;
    }
    const next = walkValue(value, depth);
    if (next !== value) {
      nextProps[key] = next;
      changed = true;
    }
  }

  const children = props.children;
  const nextChildren = children === undefined ? undefined : walkValue(children, depth);
  if (nextChildren !== children) changed = true;

  if (!changed) return element;
  return nextChildren === undefined
    ? cloneElement(element, nextProps)
    : cloneElement(element, nextProps, ...(Array.isArray(nextChildren) ? nextChildren : [nextChildren]));
}

/**
 * Adapta al mercado todos los textos del JSX que devuelve un componente: children de texto,
 * props de texto (title, alt, placeholder, label…) y datos planos pasados como props.
 * No entra en lo que renderizan los componentes hijos por dentro: cada componente
 * compartido con textos propios aplica su propio `localizeTree`.
 * En Argentina devuelve el mismo nodo, sin cambios.
 */
export function localizeTree<T extends ReactNode>(node: T, market: MarketCode): T {
  if (market === 'ar') return node;
  return walkValue(node, 0) as T;
}
