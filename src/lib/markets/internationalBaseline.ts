import { precioLinkDesdeTransferencia } from '@/lib/cotizador/utils';

/**
 * Base de precios ARS congelada para los mercados internacionales.
 *
 * Los precios de CL, PE, CO y MX se calculan convirtiendo el precio argentino, así que
 * un aumento en Argentina arrastraría al resto de los mercados. Estas equivalencias
 * mapean cada precio ARS vigente al que regía antes del aumento del 28/08/2026, de modo
 * que el exterior se mueva solo cuando se decida explícitamente.
 *
 * Para trasladar un aumento al exterior, borrar la entrada correspondiente (o el mapa
 * completo) y volver a congelar con los valores que queden vigentes.
 */
const TRANSFER_BASELINE_ARS: Record<number, number> = {
  // Grupos
  76000: 69500,
  91500: 83500,
  113000: 98500,
  161000: 148500,
  // Medidas fijas de 5 cm
  166500: 161500,
  189000: 183000,
  195000: 189000,
  210000: 205000,
  221000: 218000,
  238000: 232000,
  251000: 246000,
  265000: 260000,
  // Medidas fijas de 6 cm
  171000: 165500,
  192000: 187000,
  199000: 194000,
  214000: 210000,
  229000: 224000,
  243000: 239000,
  259000: 253000,
  275000: 267000,
};

const LINK_BASELINE_ARS: Record<number, number> = Object.fromEntries(
  Object.entries(TRANSFER_BASELINE_ARS).map(([vigente, base]) => [
    precioLinkDesdeTransferencia(Number(vigente)),
    precioLinkDesdeTransferencia(base),
  ])
);

/** Precio de transferencia ARS a usar como base de conversión internacional. */
export function internationalBaselineTransferArs(transferArs: number): number {
  return TRANSFER_BASELINE_ARS[Math.round(transferArs)] ?? transferArs;
}

/**
 * Precio público (link) ARS a usar como base de conversión internacional.
 * Cae al mapa de transferencia porque los precios "desde" del catálogo se publican
 * con el valor de transferencia, sin el recargo del 15%.
 */
export function internationalBaselinePublicArs(publicArs: number): number {
  const key = Math.round(publicArs);
  return LINK_BASELINE_ARS[key] ?? TRANSFER_BASELINE_ARS[key] ?? publicArs;
}
