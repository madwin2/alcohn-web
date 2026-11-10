import type { StampUseCase } from '@/data/stampUseCases';
import type { MarketCode } from './types';

/**
 * Terminología local en títulos y textos clave. En Chile se busca "cuño de bronce", no
 * "sello": las landings de /cl/ ponen "cuño" adelante y mantienen "sello" para no perder
 * esas búsquedas. El resto del texto sigue diciendo "sello", que también se usa allá.
 */
function materialLabel(material: string): string {
  // "Cuero y PU" -> "cuero y PU"; "Madera" -> "madera"
  return material.charAt(0).toLowerCase() + material.slice(1);
}

function usesCuno(market: MarketCode): boolean {
  return market === 'cl';
}

/** Título SEO de la landing de uso (antes de `marketSeoTitle`). */
export function localUseCaseSeoTitle(useCase: StampUseCase, market: MarketCode): string {
  if (!usesCuno(market)) return useCase.seoTitle;
  return `Cuño de bronce para ${materialLabel(useCase.material)} (sello personalizado) | Envío DHL a Chile | Alcohn`;
}

/** Descripción SEO de la landing de uso (antes de `marketSeoDescription`). */
export function localUseCaseSeoDescription(useCase: StampUseCase, market: MarketCode): string {
  const base = useCase.seoDescription ?? useCase.description;
  if (!usesCuno(market)) return base;
  const firstStop = base.indexOf('. ');
  const rest = firstStop === -1 ? '' : ` ${base.slice(firstStop + 2)}`;
  return `Cuño (sello) de bronce para ${materialLabel(useCase.material)}.${rest}`;
}

/** Título visible (H1) de la landing de uso. */
export function localUseCaseHeading(useCase: StampUseCase, market: MarketCode): string {
  if (!usesCuno(market)) return useCase.title;
  return `Cuños de bronce para ${materialLabel(useCase.material)}`;
}

/** Nombre del producto en los datos estructurados. */
export function localUseCaseProductName(useCase: StampUseCase, market: MarketCode): string {
  if (!usesCuno(market)) return `Sello de bronce para ${useCase.material}`;
  return `Cuño de bronce para ${materialLabel(useCase.material)}`;
}

/** Título SEO del catálogo /productos. */
export function localProductsSeoTitle(baseTitle: string, market: MarketCode): string {
  if (!usesCuno(market)) return baseTitle;
  return 'Cuños de bronce personalizados (sellos) | Cuero, madera y packaging | Alcohn';
}
