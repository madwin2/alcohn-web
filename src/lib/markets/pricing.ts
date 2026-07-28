import { getMarketConfig } from './config';
import { roundToIncrement } from './money';
import type { MarketCode, MarketPricingConfig } from './types';

export function convertTransferArsToMarketPrice(
  transferArs: number,
  market: MarketCode,
  overridePricing?: MarketPricingConfig
): number {
  if (!Number.isFinite(transferArs) || transferArs <= 0) return 0;
  if (market === 'ar') return Math.round(transferArs);

  const pricing = overridePricing ?? getMarketConfig(market).pricing;
  const raw = transferArs * pricing.arsToLocalRate * pricing.internationalMarkup;
  return roundToIncrement(raw, pricing.roundingIncrement);
}

/** Convierte un precio público ARS (link) al equivalente en moneda del mercado. */
export function convertPublicArsToMarketPrice(publicArs: number, market: MarketCode): number {
  if (!Number.isFinite(publicArs) || publicArs <= 0) return 0;
  if (market === 'ar') return Math.round(publicArs);

  const pricing = getMarketConfig(market).pricing;
  const raw = publicArs * pricing.arsToLocalRate;
  return roundToIncrement(raw, pricing.roundingIncrement);
}

/** Precio de producto a mostrar en wizard / catálogo según mercado. */
export function displayWizardProductPrice(
  linkArs: number,
  transferArs: number,
  market: MarketCode
): number {
  if (market === 'ar') return Math.round(linkArs);
  const transfer =
    Number.isFinite(transferArs) && transferArs > 0
      ? transferArs
      : Number.isFinite(linkArs) && linkArs > 0
        ? linkArs / 1.15
        : 0;
  return convertTransferArsToMarketPrice(transfer, market);
}

