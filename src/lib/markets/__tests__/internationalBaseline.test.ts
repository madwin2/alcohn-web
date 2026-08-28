import { describe, expect, it } from 'vitest';
import { getMarketConfig } from '../config';
import { roundToIncrement } from '../money';
import { convertPublicArsToMarketPrice, convertTransferArsToMarketPrice } from '../pricing';
import type { MarketCode } from '../types';

const INTERNATIONAL: MarketCode[] = ['cl', 'pe', 'co', 'mx'];

/** [precio ARS previo al aumento del 28/08/2026, precio ARS vigente] */
const GRUPOS: Array<[number, number]> = [
  [69500, 76000],
  [83500, 91500],
  [98500, 113000],
  [148500, 161000],
];

const MEDIDAS_FIJAS: Array<[number, number]> = [
  [161500, 166500],
  [183000, 189000],
  [189000, 195000],
  [205000, 210000],
  [218000, 221000],
  [232000, 238000],
  [246000, 251000],
  [260000, 265000],
  [165500, 171000],
  [187000, 192000],
  [194000, 199000],
  [210000, 214000],
  [224000, 229000],
  [239000, 243000],
  [253000, 259000],
  [267000, 275000],
];

const TODOS = [...GRUPOS, ...MEDIDAS_FIJAS];

const link = (transfer: number) => Math.round(transfer * 1.15);

/** Conversión sin la base congelada, tal como se calculaba antes del aumento. */
function convertirSinBaseline(ars: number, market: MarketCode, conMarkup: boolean): number {
  const { arsToLocalRate, internationalMarkup, roundingIncrement } =
    getMarketConfig(market).pricing;
  const raw = ars * arsToLocalRate * (conMarkup ? internationalMarkup : 1);
  return roundToIncrement(raw, roundingIncrement);
}

describe('base internacional congelada', () => {
  it('mantiene el precio de transferencia previo al aumento en cada mercado', () => {
    for (const [previo, vigente] of TODOS) {
      for (const market of INTERNATIONAL) {
        expect(convertTransferArsToMarketPrice(vigente, market)).toBe(
          convertirSinBaseline(previo, market, true)
        );
      }
    }
  });

  it('mantiene el precio público previo al aumento en cada mercado', () => {
    for (const [previo, vigente] of TODOS) {
      for (const market of INTERNATIONAL) {
        expect(convertPublicArsToMarketPrice(link(vigente), market)).toBe(
          convertirSinBaseline(link(previo), market, false)
        );
      }
    }
  });

  it('congela tambien el precio "desde", que se publica sin recargo', () => {
    for (const market of INTERNATIONAL) {
      expect(convertPublicArsToMarketPrice(76000, market)).toBe(
        convertirSinBaseline(69500, market, false)
      );
    }
  });

  it('no altera los precios de Argentina', () => {
    expect(convertTransferArsToMarketPrice(76000, 'ar')).toBe(76000);
    expect(convertPublicArsToMarketPrice(87400, 'ar')).toBe(87400);
  });

  it('deja pasar sin cambios los precios ajenos al aumento', () => {
    for (const market of INTERNATIONAL) {
      expect(convertTransferArsToMarketPrice(75000, market)).toBe(
        convertirSinBaseline(75000, market, true)
      );
    }
  });
});
