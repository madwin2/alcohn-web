# Internacionalizacion LatAm Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build country-specific ecommerce versions for Chile, Peru, Colombia, and Mexico with local currency prices, DHL international shipping, country-aware checkout, SEO, Merchant feeds, and a payment-provider adapter ready for the selected LatAm gateway.

**Architecture:** Keep Argentina as the default existing market and add a market layer for `/cl`, `/pe`, `/co`, and `/mx`. Shared product/catalog components should use market-aware pricing, formatting, URLs, shipping, and checkout state. The payment provider is isolated behind an adapter so the selected gateway can be changed without rewriting pages or order creation.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind, Supabase, existing cart/checkout code, DHL as manual fulfillment carrier, chosen LatAm payment gateway through a server-side adapter.

---

## Business Decisions Already Made

- Markets: Chile, Peru, Colombia, Mexico.
- Each market has its own local currency: CLP, PEN, COP, MXN.
- International product prices are country-fixed and derived from the Argentina transfer price plus 15% commercial margin.
- DHL shipping is charged separately in local currency.
- DHL import duties, taxes, and customs fees are not charged by Alcohn. DHL contacts the buyer and the buyer pays DHL directly when applicable.
- Checkout must work from day one for international markets.
- International catalog v1 includes:
  - Custom/personalized stamps and stamp use-case pages.
  - Abecedarios.
  - Only the `mango-de-golpe` accessory.
- International catalog v1 excludes:
  - Argentina-only patriotic/football standard designs.
  - Electric heater.
  - Remachadora base.
  - Argentina-only shipping/pickup/payment flows.
- Internal order statuses remain the same as today.
- DHL label creation stays manual in v1.

## Decisions Required Before Executing Payment Tasks

Provide these values before starting Task 9 and Task 10:

| Decision | Accepted Format | Used By |
| --- | --- | --- |
| Payment provider | one of `dlocal`, `mercadopago`, `payu`, or another provider with equivalent hosted checkout/API support | payment adapter |
| Settlement entity | company/country/account that receives funds | provider onboarding |
| Provider currencies | enabled currencies for CLP, PEN, COP, MXN | payment payload validation |
| Provider success/failure webhook format | provider docs link and sample payload | payment confirmation route |
| Provider sandbox credentials | env vars supplied outside git | local QA |
| Provider production credentials | env vars supplied outside git | deployment |

Provide these commercial values before starting Task 1:

| Market | Input Needed | Accepted Format |
| --- | --- | --- |
| Chile | fixed ARS-to-CLP business rate and DHL shipping price | integer/decimal rate, integer CLP |
| Peru | fixed ARS-to-PEN business rate and DHL shipping price | integer/decimal rate, decimal PEN |
| Colombia | fixed ARS-to-COP business rate and DHL shipping price | integer/decimal rate, integer COP |
| Mexico | fixed ARS-to-MXN business rate and DHL shipping price | integer/decimal rate, decimal MXN |

The rate is not live FX. It is a manually approved business rate that stays fixed until Alcohn changes it.

## URL Strategy

Default Argentina remains unchanged:

- `/`
- `/productos`
- `/sellos/para-cuero`
- `/abecedarios`
- `/accesorios/mango-de-golpe`
- `/checkout`

International versions:

- `/cl`
- `/cl/productos`
- `/cl/sellos/[slug]`
- `/cl/abecedarios`
- `/cl/accesorios/mango-de-golpe`
- `/cl/carrito`
- `/cl/checkout`
- `/cl/checkout/success`
- `/cl/checkout/failed`
- `/cl/politica-envios`
- `/cl/politica-devoluciones`
- `/cl/terminos`
- `/cl/privacidad`

Repeat the same structure for `/pe`, `/co`, and `/mx`.

## File Structure

Create these files:

- `vitest.config.ts`: unit test config for pure TypeScript utilities.
- `src/lib/markets/types.ts`: market, currency, country, locale, URL, and checkout type definitions.
- `src/lib/markets/config.ts`: market configuration for AR, CL, PE, CO, MX.
- `src/lib/markets/paths.ts`: market detection and URL helpers.
- `src/lib/markets/money.ts`: local currency formatting and rounding.
- `src/lib/markets/pricing.ts`: fixed-rate international price conversion from AR transfer prices.
- `src/lib/markets/catalog.ts`: market catalog allowlist and product availability.
- `src/lib/markets/seo.ts`: hreflang, canonical, schema country/currency helpers.
- `src/contexts/MarketContext.tsx`: client-side market detection/provider.
- `src/components/market/MarketSwitcher.tsx`: country selector.
- `src/components/market/ImportDutiesNotice.tsx`: reusable DHL customs notice.
- `src/components/checkout/InternationalShippingForm.tsx`: DHL address form by country.
- `src/lib/shipping/international.ts`: DHL shipping config and validation.
- `src/lib/payments/international/types.ts`: provider-neutral payment contract.
- `src/lib/payments/international/provider.ts`: selected provider factory.
- `src/lib/payments/international/mockProvider.ts`: local development provider for non-production checkout testing.
- `src/app/api/checkout/international/pricing/route.ts`: market-aware checkout pricing endpoint.
- `src/app/api/checkout/international/intent/route.ts`: creates Supabase order for international checkout.
- `src/app/api/checkout/international/payment/route.ts`: creates hosted payment session through selected provider.
- `src/app/api/checkout/international/webhook/route.ts`: confirms payment through selected provider webhook.
- `src/app/[market]/layout.tsx`: validates market segment and provides market metadata shell.
- `src/app/[market]/page.tsx`: international landing entry.
- `src/app/[market]/productos/page.tsx`: market catalog page.
- `src/app/[market]/sellos/[slug]/page.tsx`: market stamp use-case page.
- `src/app/[market]/abecedarios/page.tsx`: market abecedarios page.
- `src/app/[market]/accesorios/mango-de-golpe/page.tsx`: market mango page.
- `src/app/[market]/carrito/page.tsx`: market cart page.
- `src/app/[market]/checkout/page.tsx`: market checkout page.
- `src/app/[market]/checkout/success/page.tsx`: payment success page.
- `src/app/[market]/checkout/failed/page.tsx`: payment failure page.
- `src/app/[market]/politica-envios/page.tsx`: DHL/import duties policy.
- `src/app/[market]/politica-devoluciones/page.tsx`: international returns policy.
- `src/app/[market]/terminos/page.tsx`: international terms.
- `src/app/[market]/privacidad/page.tsx`: international privacy page.
- `scripts/generate-merchant-feed-latam.ts`: generates one Merchant TSV per market.
- `docs/international-commerce-ops.md`: operations guide for DHL/manual fulfillment.

Modify these files:

- `package.json`: add test and international feed scripts.
- `src/app/layout.tsx`: wrap app with `MarketProvider`.
- `src/components/Header.tsx`: add market switcher and market-aware links.
- `src/components/Footer.tsx`: add international market links and market-aware policy links.
- `src/lib/cart.ts`: add optional `market` and `currency`; use market-specific storage.
- `src/contexts/CartContext.tsx`: use current market when loading/saving cart and when tracking AddToCart.
- `src/components/cart/CartItemRow.tsx`: format prices with current market currency.
- `src/components/cart/CartSummary.tsx`: format prices with current market currency.
- `src/components/PriceFrom.tsx`: format prices with market-aware helper.
- `src/lib/checkout/pricing.ts`: expose AR transfer-price resolution and market price conversion.
- `src/app/api/checkout/pricing/route.ts`: keep Argentina route working, optionally delegate shared logic.
- `src/app/sitemap.ts`: include international routes.
- `src/app/robots.ts`: no checkout indexing; include sitemap.
- `src/lib/seo.ts`: support market-aware metadata and Product schema currency/country.
- `src/app/manifest.ts`: keep default Spanish/Argentina, do not use it for market SEO.
- `scripts/generate-merchant-feed.ts`: keep Argentina feed unchanged.
- `docs/google-merchant-feed.md`: document AR feed plus new LatAm feeds.

Avoid modifying unrelated visual design unless needed for market labels, legal copy, or checkout clarity.

---

## Task 1: Add Test Harness

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install test dependency**

Run:

```bash
npm install -D vitest vite-tsconfig-paths
```

Expected: `package-lock.json` and `package.json` update with dev dependencies.

- [ ] **Step 2: Add Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Add package script**

Modify `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Keep existing scripts unchanged.

- [ ] **Step 4: Verify empty test suite behavior**

Run:

```bash
npm run test
```

Expected: Vitest exits cleanly or reports no test files. If Vitest exits non-zero because no tests exist, continue after Task 2 adds tests.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "test: add vitest harness"
```

---

## Task 2: Create Market Model and Config

**Files:**
- Create: `src/lib/markets/types.ts`
- Create: `src/lib/markets/config.ts`
- Create: `src/lib/markets/__tests__/config.test.ts`

- [ ] **Step 1: Write failing config tests**

Create `src/lib/markets/__tests__/config.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MARKET,
  INTERNATIONAL_MARKETS,
  MARKETS,
  getMarketConfig,
  isInternationalMarket,
  isMarketCode,
} from '../config';

describe('market config', () => {
  it('keeps Argentina as the default market', () => {
    expect(DEFAULT_MARKET).toBe('ar');
    expect(getMarketConfig('ar').currency).toBe('ARS');
    expect(getMarketConfig('ar').basePath).toBe('');
  });

  it('supports Chile, Peru, Colombia, and Mexico as international markets', () => {
    expect(INTERNATIONAL_MARKETS).toEqual(['cl', 'pe', 'co', 'mx']);
    expect(INTERNATIONAL_MARKETS.every(isInternationalMarket)).toBe(true);
  });

  it('rejects unknown market segments', () => {
    expect(isMarketCode('cl')).toBe(true);
    expect(isMarketCode('productos')).toBe(false);
    expect(isMarketCode('us')).toBe(false);
  });

  it('has local currency and DHL shipping values for each international market', () => {
    for (const code of INTERNATIONAL_MARKETS) {
      const market = MARKETS[code];
      expect(market.currency).not.toBe('ARS');
      expect(market.dhlShippingAmount).toBeGreaterThan(0);
      expect(market.pricing.arsToLocalRate).toBeGreaterThan(0);
      expect(market.pricing.internationalMarkup).toBe(1.15);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- src/lib/markets/__tests__/config.test.ts
```

Expected: FAIL because `src/lib/markets/config.ts` does not exist.

- [ ] **Step 3: Add market types**

Create `src/lib/markets/types.ts`:

```ts
export type MarketCode = 'ar' | 'cl' | 'pe' | 'co' | 'mx';
export type InternationalMarketCode = Exclude<MarketCode, 'ar'>;
export type CurrencyCode = 'ARS' | 'CLP' | 'PEN' | 'COP' | 'MXN';

export interface MarketPricingConfig {
  /**
   * Fixed business rate from 1 ARS transfer-price peso to local currency.
   * This is manually approved by Alcohn and is not live FX.
   */
  arsToLocalRate: number;
  /** International margin over Argentina transfer price. Current business rule: 15%. */
  internationalMarkup: 1.15;
  /** Round final buyer-facing prices to this increment. */
  roundingIncrement: number;
}

export interface MarketConfig {
  code: MarketCode;
  countryName: string;
  countryIso2: 'AR' | 'CL' | 'PE' | 'CO' | 'MX';
  locale: 'es-AR' | 'es-CL' | 'es-PE' | 'es-CO' | 'es-MX';
  hreflang: 'es-AR' | 'es-CL' | 'es-PE' | 'es-CO' | 'es-MX';
  currency: CurrencyCode;
  basePath: '' | `/${InternationalMarketCode}`;
  dhlShippingAmount: number;
  pricing: MarketPricingConfig;
  phoneExample: string;
  addressLabels: {
    region: string;
    city: string;
    district?: string;
    postalCode: string;
    document: string;
  };
}
```

- [ ] **Step 4: Add config using approved business values**

Create `src/lib/markets/config.ts`.

Use the exact business-approved `arsToLocalRate` and `dhlShippingAmount` values supplied before implementation. The example below shows shape only; replace all numeric examples with approved Alcohn values in the same commit.

```ts
import type { InternationalMarketCode, MarketCode, MarketConfig } from './types';

export const DEFAULT_MARKET: MarketCode = 'ar';

export const INTERNATIONAL_MARKETS: InternationalMarketCode[] = ['cl', 'pe', 'co', 'mx'];

export const MARKETS: Record<MarketCode, MarketConfig> = {
  ar: {
    code: 'ar',
    countryName: 'Argentina',
    countryIso2: 'AR',
    locale: 'es-AR',
    hreflang: 'es-AR',
    currency: 'ARS',
    basePath: '',
    dhlShippingAmount: 0,
    pricing: {
      arsToLocalRate: 1,
      internationalMarkup: 1.15,
      roundingIncrement: 100,
    },
    phoneExample: '+54 9 223 620 9554',
    addressLabels: {
      region: 'Provincia',
      city: 'Localidad',
      postalCode: 'Codigo postal',
      document: 'DNI o CUIT',
    },
  },
  cl: {
    code: 'cl',
    countryName: 'Chile',
    countryIso2: 'CL',
    locale: 'es-CL',
    hreflang: 'es-CL',
    currency: 'CLP',
    basePath: '/cl',
    dhlShippingAmount: 1,
    pricing: {
      arsToLocalRate: 1,
      internationalMarkup: 1.15,
      roundingIncrement: 1000,
    },
    phoneExample: '+56 9 1234 5678',
    addressLabels: {
      region: 'Region',
      city: 'Comuna / ciudad',
      postalCode: 'Codigo postal',
      document: 'RUT o documento',
    },
  },
  pe: {
    code: 'pe',
    countryName: 'Peru',
    countryIso2: 'PE',
    locale: 'es-PE',
    hreflang: 'es-PE',
    currency: 'PEN',
    basePath: '/pe',
    dhlShippingAmount: 1,
    pricing: {
      arsToLocalRate: 1,
      internationalMarkup: 1.15,
      roundingIncrement: 1,
    },
    phoneExample: '+51 912 345 678',
    addressLabels: {
      region: 'Departamento',
      city: 'Provincia / ciudad',
      district: 'Distrito',
      postalCode: 'Codigo postal',
      document: 'DNI, RUC o documento',
    },
  },
  co: {
    code: 'co',
    countryName: 'Colombia',
    countryIso2: 'CO',
    locale: 'es-CO',
    hreflang: 'es-CO',
    currency: 'COP',
    basePath: '/co',
    dhlShippingAmount: 1,
    pricing: {
      arsToLocalRate: 1,
      internationalMarkup: 1.15,
      roundingIncrement: 1000,
    },
    phoneExample: '+57 300 123 4567',
    addressLabels: {
      region: 'Departamento',
      city: 'Ciudad / municipio',
      postalCode: 'Codigo postal',
      document: 'Cedula, NIT o documento',
    },
  },
  mx: {
    code: 'mx',
    countryName: 'Mexico',
    countryIso2: 'MX',
    locale: 'es-MX',
    hreflang: 'es-MX',
    currency: 'MXN',
    basePath: '/mx',
    dhlShippingAmount: 1,
    pricing: {
      arsToLocalRate: 1,
      internationalMarkup: 1.15,
      roundingIncrement: 10,
    },
    phoneExample: '+52 55 1234 5678',
    addressLabels: {
      region: 'Estado',
      city: 'Ciudad / municipio',
      district: 'Colonia',
      postalCode: 'Codigo postal',
      document: 'RFC o documento',
    },
  },
};

export function isMarketCode(value: string): value is MarketCode {
  return value === 'ar' || value === 'cl' || value === 'pe' || value === 'co' || value === 'mx';
}

export function isInternationalMarket(value: string): value is InternationalMarketCode {
  return value === 'cl' || value === 'pe' || value === 'co' || value === 'mx';
}

export function getMarketConfig(market: MarketCode): MarketConfig {
  return MARKETS[market];
}
```

Important: replace `dhlShippingAmount: 1` and non-Argentina `arsToLocalRate: 1` with approved business values before committing. The tests require values greater than zero but they do not validate commercial correctness.

- [ ] **Step 5: Run test**

```bash
npm run test -- src/lib/markets/__tests__/config.test.ts
```

Expected: PASS after approved positive values are in config.

- [ ] **Step 6: Commit**

```bash
git add src/lib/markets/types.ts src/lib/markets/config.ts src/lib/markets/__tests__/config.test.ts
git commit -m "feat: add market configuration"
```

---

## Task 3: Add Market Paths, Money Formatting, and Price Conversion

**Files:**
- Create: `src/lib/markets/paths.ts`
- Create: `src/lib/markets/money.ts`
- Create: `src/lib/markets/pricing.ts`
- Create: `src/lib/markets/__tests__/paths.test.ts`
- Create: `src/lib/markets/__tests__/money.test.ts`
- Create: `src/lib/markets/__tests__/pricing.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/markets/__tests__/paths.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { marketPath, marketFromPathname, stripMarketFromPathname } from '../paths';

describe('market paths', () => {
  it('keeps Argentina URLs unchanged', () => {
    expect(marketPath('ar', '/productos')).toBe('/productos');
    expect(marketPath('ar', '/')).toBe('/');
  });

  it('prefixes international URLs', () => {
    expect(marketPath('cl', '/productos')).toBe('/cl/productos');
    expect(marketPath('mx', '/sellos/para-cuero')).toBe('/mx/sellos/para-cuero');
  });

  it('detects market from pathname', () => {
    expect(marketFromPathname('/cl/productos')).toBe('cl');
    expect(marketFromPathname('/productos')).toBe('ar');
    expect(marketFromPathname('/unknown')).toBe('ar');
  });

  it('strips market prefix', () => {
    expect(stripMarketFromPathname('/cl/productos')).toBe('/productos');
    expect(stripMarketFromPathname('/productos')).toBe('/productos');
    expect(stripMarketFromPathname('/cl')).toBe('/');
  });
});
```

Create `src/lib/markets/__tests__/money.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatMarketMoney, roundToIncrement } from '../money';

describe('market money', () => {
  it('rounds to configured increments', () => {
    expect(roundToIncrement(1234, 100)).toBe(1200);
    expect(roundToIncrement(1499, 1000)).toBe(1000);
    expect(roundToIncrement(1500, 1000)).toBe(2000);
  });

  it('formats local currency', () => {
    expect(formatMarketMoney(125000, 'cl')).toContain('$');
    expect(formatMarketMoney(125.5, 'pe')).toContain('S/');
    expect(formatMarketMoney(1250, 'mx')).toContain('$');
  });
});
```

Create `src/lib/markets/__tests__/pricing.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { convertTransferArsToMarketPrice } from '../pricing';

describe('international pricing', () => {
  it('does not convert Argentina prices', () => {
    expect(convertTransferArsToMarketPrice(100000, 'ar')).toBe(100000);
  });

  it('applies market rate, 15 percent margin, and rounding', () => {
    const price = convertTransferArsToMarketPrice(100000, 'mx', {
      arsToLocalRate: 0.02,
      internationalMarkup: 1.15,
      roundingIncrement: 10,
    });
    expect(price).toBe(2300);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

```bash
npm run test -- src/lib/markets/__tests__/paths.test.ts src/lib/markets/__tests__/money.test.ts src/lib/markets/__tests__/pricing.test.ts
```

Expected: FAIL because helpers do not exist.

- [ ] **Step 3: Implement path helpers**

Create `src/lib/markets/paths.ts`:

```ts
import { DEFAULT_MARKET, getMarketConfig, isInternationalMarket } from './config';
import type { MarketCode } from './types';

function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

export function marketPath(market: MarketCode, path: string): string {
  const normalized = normalizePath(path);
  const basePath = getMarketConfig(market).basePath;
  if (!basePath) return normalized;
  if (normalized === '/') return basePath;
  return `${basePath}${normalized}`;
}

export function marketFromPathname(pathname: string): MarketCode {
  const first = pathname.split('/').filter(Boolean)[0] ?? '';
  return isInternationalMarket(first) ? first : DEFAULT_MARKET;
}

export function stripMarketFromPathname(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return '/';
  if (!isInternationalMarket(parts[0])) return normalizePath(pathname);
  const rest = parts.slice(1).join('/');
  return rest ? `/${rest}` : '/';
}
```

- [ ] **Step 4: Implement money helpers**

Create `src/lib/markets/money.ts`:

```ts
import { getMarketConfig } from './config';
import type { MarketCode } from './types';

export function roundToIncrement(value: number, increment: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (!Number.isFinite(increment) || increment <= 1) return Math.round(value);
  return Math.round(value / increment) * increment;
}

export function formatMarketMoney(value: number, market: MarketCode): string {
  const config = getMarketConfig(market);
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    maximumFractionDigits: config.currency === 'PEN' || config.currency === 'MXN' ? 2 : 0,
  }).format(value);
}
```

- [ ] **Step 5: Implement pricing helper**

Create `src/lib/markets/pricing.ts`:

```ts
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
```

- [ ] **Step 6: Run tests**

```bash
npm run test -- src/lib/markets/__tests__/paths.test.ts src/lib/markets/__tests__/money.test.ts src/lib/markets/__tests__/pricing.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/markets/paths.ts src/lib/markets/money.ts src/lib/markets/pricing.ts src/lib/markets/__tests__
git commit -m "feat: add market path and pricing helpers"
```

---

## Task 4: Add Market Catalog Rules

**Files:**
- Create: `src/lib/markets/catalog.ts`
- Create: `src/lib/markets/__tests__/catalog.test.ts`
- Modify: `src/data/accessories.ts`

- [ ] **Step 1: Write failing catalog tests**

Create `src/lib/markets/__tests__/catalog.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  isAccessoryAvailableInMarket,
  isProductSlugAvailableInMarket,
  isStampUseCaseAvailableInMarket,
} from '../catalog';

describe('market catalog', () => {
  it('keeps all current products available in Argentina', () => {
    expect(isProductSlugAvailableInMarket('sello-personalizado-cuero', 'ar')).toBe(true);
    expect(isAccessoryAvailableInMarket('calentador-electrico', 'ar')).toBe(true);
  });

  it('allows only international catalog products outside Argentina', () => {
    expect(isProductSlugAvailableInMarket('sello-personalizado-cuero', 'cl')).toBe(true);
    expect(isProductSlugAvailableInMarket('abecedario-bronce-completo', 'mx')).toBe(true);
    expect(isAccessoryAvailableInMarket('mango-de-golpe', 'co')).toBe(true);
    expect(isAccessoryAvailableInMarket('calentador-electrico', 'co')).toBe(false);
    expect(isAccessoryAvailableInMarket('base-aluminio-remachadora', 'pe')).toBe(false);
  });

  it('allows all stamp use-case landing pages internationally', () => {
    expect(isStampUseCaseAvailableInMarket('para-cuero', 'cl')).toBe(true);
    expect(isStampUseCaseAvailableInMarket('para-madera', 'mx')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
npm run test -- src/lib/markets/__tests__/catalog.test.ts
```

Expected: FAIL because `catalog.ts` does not exist.

- [ ] **Step 3: Implement catalog allowlist**

Create `src/lib/markets/catalog.ts`:

```ts
import type { MarketCode } from './types';

const INTERNATIONAL_PRODUCT_SLUGS = new Set([
  'sello-personalizado-cuero',
  'sello-personalizado-madera',
  'sello-personalizado-universal',
  'sello-para-alimentos',
  'sello-personalizado-ceramica',
  'sello-personalizado-lacre',
  'abecedario-bronce-completo',
  'abecedario-bronce-numeros',
]);

const INTERNATIONAL_ACCESSORY_SLUGS = new Set(['mango-de-golpe']);

export function isProductSlugAvailableInMarket(slug: string, market: MarketCode): boolean {
  if (market === 'ar') return true;
  return INTERNATIONAL_PRODUCT_SLUGS.has(slug);
}

export function isAccessoryAvailableInMarket(slug: string, market: MarketCode): boolean {
  if (market === 'ar') return true;
  return INTERNATIONAL_ACCESSORY_SLUGS.has(slug);
}

export function isStampUseCaseAvailableInMarket(slug: string, market: MarketCode): boolean {
  if (market === 'ar') return true;
  return slug.startsWith('para-');
}
```

- [ ] **Step 4: Run test**

```bash
npm run test -- src/lib/markets/__tests__/catalog.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/markets/catalog.ts src/lib/markets/__tests__/catalog.test.ts
git commit -m "feat: define international catalog scope"
```

---

## Task 5: Add Market Context and Market-Specific Cart Storage

**Files:**
- Create: `src/contexts/MarketContext.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/lib/cart.ts`
- Modify: `src/contexts/CartContext.tsx`
- Modify: `src/components/cart/CartItemRow.tsx`
- Modify: `src/components/cart/CartSummary.tsx`
- Modify: `src/components/PriceFrom.tsx`

- [ ] **Step 1: Add market client context**

Create `src/contexts/MarketContext.tsx`:

```tsx
'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { getMarketConfig } from '@/lib/markets/config';
import { marketFromPathname } from '@/lib/markets/paths';
import type { MarketCode, MarketConfig } from '@/lib/markets/types';

interface MarketContextValue {
  market: MarketCode;
  config: MarketConfig;
}

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const market = marketFromPathname(pathname);
  const value = useMemo(
    () => ({
      market,
      config: getMarketConfig(market),
    }),
    [market]
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within MarketProvider');
  }
  return context;
}
```

- [ ] **Step 2: Wrap root layout**

Modify `src/app/layout.tsx`:

```tsx
import { MarketProvider } from '@/contexts/MarketContext';
```

Wrap the existing cart/header/footer block:

```tsx
<MarketProvider>
  <CartProvider>
    <Suspense fallback={null}>
      <AnalyticsProvider />
    </Suspense>
    <Header />
    <main className="w-full max-w-full">{children}</main>
    <ConditionalFooter />
    <ConditionalWhatsapp />
    <CookieConsentBanner />
  </CartProvider>
</MarketProvider>
```

- [ ] **Step 3: Extend cart types and storage**

Modify `src/lib/cart.ts`:

```ts
import type { CurrencyCode, MarketCode } from '@/lib/markets/types';

export interface CartItem {
  id: string;
  title: string;
  collection: string;
  material: string;
  process: string;
  variantSize: string;
  price: number;
  qty: number;
  image: string;
  designSlug: string;
  market?: MarketCode;
  currency?: CurrencyCode;
}
```

Replace the storage key logic with:

```ts
const CART_STORAGE_KEY = 'alcohn_cart';

export const cartStorageKeyForMarket = (market: MarketCode): string =>
  market === 'ar' ? CART_STORAGE_KEY : `${CART_STORAGE_KEY}_${market}`;

export const loadCartFromStorage = (market: MarketCode = 'ar'): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(cartStorageKeyForMarket(market));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveCartToStorage = (items: CartItem[], market: MarketCode = 'ar'): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(cartStorageKeyForMarket(market), JSON.stringify(items));
  } catch {
  }
};
```

- [ ] **Step 4: Update CartProvider**

Modify `src/contexts/CartContext.tsx`:

```tsx
import { useMarket } from '@/contexts/MarketContext';
```

Inside `CartProvider`:

```tsx
const { market, config: marketConfig } = useMarket();
```

Update load/save effects to include market:

```tsx
useEffect(() => {
  const loadedItems = loadCartFromStorage(market);
  setItems(loadedItems);
  setIsHydrated(true);
}, [market]);

useEffect(() => {
  if (isHydrated) {
    saveCartToStorage(items, market);
  }
}, [items, isHydrated, market]);
```

When adding a new item:

```tsx
return [...prevItems, { ...item, id, qty: 1, market, currency: marketConfig.currency }];
```

- [ ] **Step 5: Update price display components**

Modify `src/components/cart/CartItemRow.tsx`, `src/components/cart/CartSummary.tsx`, and `src/components/PriceFrom.tsx` to use:

```tsx
import { useMarket } from '@/contexts/MarketContext';
import { formatMarketMoney } from '@/lib/markets/money';
```

Replace AR-only formatting like:

```tsx
${subtotal.toLocaleString('es-AR')}
```

with:

```tsx
{formatMarketMoney(subtotal, market)}
```

For server components that cannot call `useMarket`, pass `market` as a prop from the page.

- [ ] **Step 6: Verify**

Run:

```bash
npm run build
```

Expected: build succeeds. Visit `/carrito` and `/cl/carrito` after routes exist in later tasks to confirm carts stay separate.

- [ ] **Step 7: Commit**

```bash
git add src/contexts/MarketContext.tsx src/app/layout.tsx src/lib/cart.ts src/contexts/CartContext.tsx src/components/cart/CartItemRow.tsx src/components/cart/CartSummary.tsx src/components/PriceFrom.tsx
git commit -m "feat: add market context and market carts"
```

---

## Task 6: Expose Transfer-Price Base for International Pricing

**Files:**
- Modify: `src/lib/checkout/pricing.ts`
- Modify: `src/app/api/checkout/pricing/route.ts`
- Create: `src/lib/checkout/__tests__/market-pricing.test.ts`

- [ ] **Step 1: Write failing pricing tests**

Create `src/lib/checkout/__tests__/market-pricing.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { CartItem } from '@/lib/cart';
import { computeMarketCheckoutPricing } from '../pricing';

const item: CartItem = {
  id: 'abecedario-5mm',
  title: 'Abecedario',
  collection: 'Abecedarios',
  material: 'Bronce',
  process: 'CNC',
  variantSize: '5 mm',
  price: 115000,
  qty: 1,
  image: '/images/abecedario/abecedario.webp',
  designSlug: 'abecedario-bronce-completo',
};

describe('market checkout pricing', () => {
  it('keeps Argentina link and transfer subtotals', () => {
    const result = computeMarketCheckoutPricing([item], null, 'ar');
    expect(result.currency).toBe('ARS');
    expect(result.marketSubtotal).toBeGreaterThan(0);
  });

  it('returns local currency market line items outside Argentina', () => {
    const result = computeMarketCheckoutPricing([item], null, 'mx');
    expect(result.currency).toBe('MXN');
    expect(result.marketItems[0].currency).toBe('MXN');
    expect(result.marketItems[0].market).toBe('mx');
    expect(result.marketSubtotal).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
npm run test -- src/lib/checkout/__tests__/market-pricing.test.ts
```

Expected: FAIL because `computeMarketCheckoutPricing` does not exist.

- [ ] **Step 3: Implement market checkout pricing**

In `src/lib/checkout/pricing.ts`, keep existing `computeCheckoutPricing` unchanged for Argentina and add:

```ts
import { convertTransferArsToMarketPrice } from '@/lib/markets/pricing';
import { getMarketConfig } from '@/lib/markets/config';
import type { MarketCode } from '@/lib/markets/types';
```

Add this interface and function:

```ts
export interface MarketCheckoutPricing {
  market: MarketCode;
  currency: string;
  marketSubtotal: number;
  marketItems: CartItem[];
}

export function computeMarketCheckoutPricing(
  items: CartItem[],
  catalog: CotizadorCatalog | null,
  market: MarketCode
): MarketCheckoutPricing {
  const currency = getMarketConfig(market).currency;
  const base = computeCheckoutPricing(items, catalog);
  const sourceItems = market === 'ar' ? base.linkItems : base.transferItems;

  const marketItems = sourceItems.map((item) => {
    const price =
      market === 'ar'
        ? item.price
        : convertTransferArsToMarketPrice(item.price, market);
    return { ...item, price, market, currency };
  });

  return {
    market,
    currency,
    marketItems,
    marketSubtotal: marketItems.reduce((sum, item) => sum + item.price * item.qty, 0),
  };
}
```

- [ ] **Step 4: Extend API route without breaking AR**

Modify `src/app/api/checkout/pricing/route.ts` body type:

```ts
import { isMarketCode } from '@/lib/markets/config';
import type { MarketCode } from '@/lib/markets/types';
```

Read `market` from body:

```ts
let body: { items?: unknown; market?: unknown };
```

After parsing items:

```ts
const market: MarketCode =
  typeof body.market === 'string' && isMarketCode(body.market) ? body.market : 'ar';
```

Return old fields plus market fields:

```ts
const marketPricing = computeMarketCheckoutPricing(items, catalog, market);

return NextResponse.json({
  openpaySubtotal: pricing.openpaySubtotal,
  transferSubtotal: pricing.transferSubtotal,
  linkLineItems: pricing.linkItems.map((item) => ({
    id: item.id,
    title: item.title,
    price: item.price,
    qty: item.qty,
  })),
  market,
  currency: marketPricing.currency,
  marketSubtotal: marketPricing.marketSubtotal,
  marketLineItems: marketPricing.marketItems.map((item) => ({
    id: item.id,
    title: item.title,
    price: item.price,
    qty: item.qty,
    market: item.market,
    currency: item.currency,
  })),
});
```

- [ ] **Step 5: Run tests and build**

```bash
npm run test -- src/lib/checkout/__tests__/market-pricing.test.ts
npm run build
```

Expected: PASS and build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/lib/checkout/pricing.ts src/app/api/checkout/pricing/route.ts src/lib/checkout/__tests__/market-pricing.test.ts
git commit -m "feat: compute market checkout prices"
```

---

## Task 7: Add International SEO Helpers and Routes

**Files:**
- Create: `src/lib/markets/seo.ts`
- Create: `src/app/[market]/layout.tsx`
- Create: `src/app/[market]/page.tsx`
- Create: `src/app/[market]/productos/page.tsx`
- Create: `src/app/[market]/sellos/[slug]/page.tsx`
- Create: `src/app/[market]/abecedarios/page.tsx`
- Create: `src/app/[market]/accesorios/mango-de-golpe/page.tsx`
- Modify: `src/lib/seo.ts`
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Add SEO helper**

Create `src/lib/markets/seo.ts`:

```ts
import { INTERNATIONAL_MARKETS, MARKETS, getMarketConfig } from './config';
import { marketPath } from './paths';
import type { MarketCode } from './types';
import { SITE_URL } from '@/lib/seo';

export function marketAbsoluteUrl(market: MarketCode, path: string): string {
  return `${SITE_URL}${encodeURI(marketPath(market, path))}`;
}

export function alternateLanguages(path: string) {
  const languages: Record<string, string> = {
    'es-AR': marketAbsoluteUrl('ar', path),
    'x-default': marketAbsoluteUrl('ar', path),
  };
  for (const market of INTERNATIONAL_MARKETS) {
    const config = getMarketConfig(market);
    languages[config.hreflang] = marketAbsoluteUrl(market, path);
  }
  return languages;
}

export function marketSeoTitle(baseTitle: string, market: MarketCode): string {
  if (market === 'ar') return baseTitle;
  return `${baseTitle} | Envio DHL a ${MARKETS[market].countryName}`;
}
```

- [ ] **Step 2: Update metadata helper**

Modify `src/lib/seo.ts` `PageMetadataOptions`:

```ts
import type { MarketCode } from '@/lib/markets/types';
import { alternateLanguages, marketAbsoluteUrl } from '@/lib/markets/seo';
```

Add optional `market?: MarketCode`.

In `createPageMetadata`, compute canonical:

```ts
const canonicalPath = market ? marketAbsoluteUrl(market, path) : path;
```

Set:

```ts
alternates: {
  canonical: canonicalPath,
  ...(market ? { languages: alternateLanguages(path) } : {}),
},
```

For Open Graph locale use:

```ts
locale: market ? getMarketConfig(market).locale.replace('-', '_') : 'es_AR',
url: canonicalPath,
```

- [ ] **Step 3: Add market layout**

Create `src/app/[market]/layout.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { INTERNATIONAL_MARKETS, isInternationalMarket } from '@/lib/markets/config';

export function generateStaticParams() {
  return INTERNATIONAL_MARKETS.map((market) => ({ market }));
}

export default function MarketLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { market: string };
}) {
  if (!isInternationalMarket(params.market)) {
    notFound();
  }
  return children;
}
```

- [ ] **Step 4: Add market pages**

For each new page under `src/app/[market]/...`, reuse the existing Argentina component structure where practical, but pass `market` into price formatting and metadata.

Minimum page requirements:

- `/[market]`: international landing with product CTA links to market paths.
- `/[market]/productos`: show only personalized stamps, abecedarios, and mango de golpe.
- `/[market]/sellos/[slug]`: reuse `stampUseCases`, guard with `isStampUseCaseAvailableInMarket`.
- `/[market]/abecedarios`: reuse abecedario page sections and market prices.
- `/[market]/accesorios/mango-de-golpe`: reuse accessory page for only this accessory.

Each page must:

- Validate `params.market` with `isInternationalMarket`.
- Call `createPageMetadata({ market, path: ... })`.
- Use `marketPath(market, ...)` for internal links.
- Display `ImportDutiesNotice` near the primary CTA or price area.
- Use local currency via `formatMarketMoney`.

- [ ] **Step 5: Update sitemap**

Modify `src/app/sitemap.ts` to append international route entries:

```ts
import { INTERNATIONAL_MARKETS } from '@/lib/markets/config';
import { marketPath } from '@/lib/markets/paths';
```

For each static route that should exist internationally:

```ts
const internationalStaticRoutes = [
  '/',
  '/productos',
  '/abecedarios',
  '/accesorios/mango-de-golpe',
  '/politica-envios',
  '/politica-devoluciones',
  '/terminos',
  '/privacidad',
];
```

Add stamp use-case routes for each market. Do not add excluded accessory or Argentina-only standard stamp routes.

- [ ] **Step 6: Verify**

Run:

```bash
npm run build
```

Expected: build succeeds and static params generate `/cl`, `/pe`, `/co`, `/mx` routes.

- [ ] **Step 7: Commit**

```bash
git add src/lib/markets/seo.ts src/lib/seo.ts src/app/[market] src/app/sitemap.ts
git commit -m "feat: add international market routes and seo"
```

---

## Task 8: Add DHL International Shipping Form and Customs Notice

**Files:**
- Create: `src/components/market/ImportDutiesNotice.tsx`
- Create: `src/components/checkout/InternationalShippingForm.tsx`
- Create: `src/lib/shipping/international.ts`
- Create: `src/lib/shipping/__tests__/international.test.ts`

- [ ] **Step 1: Write failing validation tests**

Create `src/lib/shipping/__tests__/international.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { validateInternationalShippingForm } from '../international';

describe('international shipping', () => {
  it('requires DHL destination address fields', () => {
    const errors = validateInternationalShippingForm('cl', {
      nombreCompleto: '',
      email: '',
      telefono: '',
      documento: '',
      direccion1: '',
      direccion2: '',
      region: '',
      ciudad: '',
      distrito: '',
      codigoPostal: '',
      notasDhl: '',
    });

    expect(errors.nombreCompleto).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.telefono).toBeTruthy();
    expect(errors.direccion1).toBeTruthy();
    expect(errors.region).toBeTruthy();
    expect(errors.ciudad).toBeTruthy();
    expect(errors.codigoPostal).toBeTruthy();
  });

  it('accepts optional document and address line 2', () => {
    const errors = validateInternationalShippingForm('mx', {
      nombreCompleto: 'Juan Perez',
      email: 'juan@example.com',
      telefono: '+52 55 1234 5678',
      documento: '',
      direccion1: 'Av Reforma 123',
      direccion2: '',
      region: 'Ciudad de Mexico',
      ciudad: 'Cuauhtemoc',
      distrito: 'Centro',
      codigoPostal: '06000',
      notasDhl: '',
    });

    expect(errors).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
npm run test -- src/lib/shipping/__tests__/international.test.ts
```

Expected: FAIL because `international.ts` does not exist.

- [ ] **Step 3: Implement shipping types and validation**

Create `src/lib/shipping/international.ts`:

```ts
import { getMarketConfig, isInternationalMarket } from '@/lib/markets/config';
import type { InternationalMarketCode } from '@/lib/markets/types';

export interface InternationalShippingFormData {
  nombreCompleto: string;
  email: string;
  telefono: string;
  documento: string;
  direccion1: string;
  direccion2: string;
  region: string;
  ciudad: string;
  distrito: string;
  codigoPostal: string;
  notasDhl: string;
}

export function emptyInternationalShippingForm(): InternationalShippingFormData {
  return {
    nombreCompleto: '',
    email: '',
    telefono: '',
    documento: '',
    direccion1: '',
    direccion2: '',
    region: '',
    ciudad: '',
    distrito: '',
    codigoPostal: '',
    notasDhl: '',
  };
}

export function getDhlShippingAmount(market: InternationalMarketCode): number {
  return getMarketConfig(market).dhlShippingAmount;
}

export function validateInternationalShippingForm(
  market: InternationalMarketCode,
  form: InternationalShippingFormData
): Record<string, string> {
  if (!isInternationalMarket(market)) return { market: 'Pais no soportado' };

  const errors: Record<string, string> = {};
  if (!form.nombreCompleto.trim()) errors.nombreCompleto = 'Ingresa nombre completo';
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Ingresa un email valido';
  }
  const phone = form.telefono.replace(/[\s\-()]/g, '');
  if (!phone || !/^\+?[0-9]{8,15}$/.test(phone)) {
    errors.telefono = 'Ingresa un telefono valido para DHL';
  }
  if (!form.direccion1.trim()) errors.direccion1 = 'Ingresa direccion';
  if (!form.region.trim()) errors.region = `Ingresa ${getMarketConfig(market).addressLabels.region.toLowerCase()}`;
  if (!form.ciudad.trim()) errors.ciudad = `Ingresa ${getMarketConfig(market).addressLabels.city.toLowerCase()}`;
  if (!form.codigoPostal.trim()) errors.codigoPostal = 'Ingresa codigo postal';
  return errors;
}
```

- [ ] **Step 4: Add customs notice component**

Create `src/components/market/ImportDutiesNotice.tsx`:

```tsx
import type { InternationalMarketCode } from '@/lib/markets/types';
import { getMarketConfig } from '@/lib/markets/config';

export default function ImportDutiesNotice({ market }: { market: InternationalMarketCode }) {
  const country = getMarketConfig(market).countryName;

  return (
    <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
      <p className="font-semibold">Impuestos de importacion</p>
      <p className="mt-1">
        El precio incluye producto y envio internacional DHL a {country}. No incluye impuestos,
        aranceles ni gastos de importacion del pais de destino. Si corresponden, DHL te avisara
        por email o telefono y los pagaras directamente en la pagina de DHL.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Add international form component**

Create `src/components/checkout/InternationalShippingForm.tsx` as a client component. It must:

- Receive `market`, contact defaults, and `onSubmit`.
- Use `getMarketConfig(market).addressLabels`.
- Render required inputs: nombre completo, email, telefono, direccion1, region, ciudad, codigo postal.
- Render optional inputs: documento, direccion2, distrito when the market label has `district`, notasDhl.
- Call `validateInternationalShippingForm`.
- Show `ImportDutiesNotice`.

- [ ] **Step 6: Run tests**

```bash
npm run test -- src/lib/shipping/__tests__/international.test.ts
npm run build
```

Expected: PASS and build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/lib/shipping/international.ts src/lib/shipping/__tests__/international.test.ts src/components/market/ImportDutiesNotice.tsx src/components/checkout/InternationalShippingForm.tsx
git commit -m "feat: add international DHL shipping form"
```

---

## Task 9: Build International Checkout Pages and Order Intent

**Files:**
- Create: `src/app/[market]/checkout/page.tsx`
- Create: `src/app/[market]/checkout/success/page.tsx`
- Create: `src/app/[market]/checkout/failed/page.tsx`
- Create: `src/app/api/checkout/international/pricing/route.ts`
- Create: `src/app/api/checkout/international/intent/route.ts`
- Modify: `src/lib/supabase/types.ts`

- [ ] **Step 1: Implement international pricing API**

Create `src/app/api/checkout/international/pricing/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { getCotizadorCatalog } from '@/lib/cotizador';
import { computeMarketCheckoutPricing } from '@/lib/checkout/pricing';
import { isInternationalMarket } from '@/lib/markets/config';
import { getDhlShippingAmount } from '@/lib/shipping/international';
import { parseCartItemsFromBody } from '@/lib/supabase/cartItems';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { items?: unknown; market?: unknown };
  try {
    body = (await req.json()) as { items?: unknown; market?: unknown };
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 });
  }

  if (typeof body.market !== 'string' || !isInternationalMarket(body.market)) {
    return NextResponse.json({ error: 'Pais internacional invalido' }, { status: 400 });
  }

  const items = parseCartItemsFromBody(body.items);
  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Carrito vacio o invalido' }, { status: 400 });
  }

  const catalog = await getCotizadorCatalog();
  const pricing = computeMarketCheckoutPricing(items, catalog, body.market);
  const shipping = getDhlShippingAmount(body.market);

  return NextResponse.json({
    market: body.market,
    currency: pricing.currency,
    subtotal: pricing.marketSubtotal,
    shipping,
    total: pricing.marketSubtotal + shipping,
    lineItems: pricing.marketItems.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      qty: item.qty,
      market: item.market,
      currency: item.currency,
    })),
  });
}
```

- [ ] **Step 2: Extend payment method type**

Modify `src/lib/supabase/types.ts`:

```ts
export type MetodoPago = 'Openpay' | 'Transferencia' | 'Internacional';
```

- [ ] **Step 3: Implement international order intent**

Create `src/app/api/checkout/international/intent/route.ts`.

It must:

- Validate `market` with `isInternationalMarket`.
- Validate cart with `parseCartItemsFromBody`.
- Recompute prices server-side with `computeMarketCheckoutPricing`.
- Add DHL shipping from config server-side.
- Upsert cliente with existing `upsertClienteServer`.
- Insert `ordenes` with:
  - `origen: 'Web'`
  - `metodo_pago: 'Internacional'`
  - `estado_pago_web: 'pendiente'`
  - `carrito_json`: market-priced line items
  - `notas_web.international`: market, currency, subtotal, shipping, total, DHL address, import-duties disclaimer accepted timestamp.

Use this `notas_web` shape:

```ts
const notasWeb = {
  international: {
    market,
    country: getMarketConfig(market).countryName,
    countryIso2: getMarketConfig(market).countryIso2,
    currency: pricing.currency,
    subtotal: pricing.marketSubtotal,
    shipping: dhlShipping,
    total: pricing.marketSubtotal + dhlShipping,
    carrier: 'DHL',
    customsDutiesPaidByBuyer: true,
    customsNoticeAcceptedAt: new Date().toISOString(),
    shippingForm,
  },
  subtotal_carrito: pricing.marketSubtotal,
  items_count: pricing.marketItems.reduce((n, i) => n + i.qty, 0),
  envio_costo: dhlShipping,
  envio_metodo: 'DHL Internacional',
};
```

Do not call `saveShippingForOrder`; that function validates Correo Argentino and is Argentina-only.

- [ ] **Step 4: Implement checkout UI**

Create `src/app/[market]/checkout/page.tsx`.

It must:

- Validate market param.
- Read current market cart from `useCart`.
- Fetch `/api/checkout/international/pricing` with `{ market, items }`.
- Show subtotal, DHL shipping, total in local currency.
- Render `InternationalShippingForm`.
- Require explicit checkbox:
  - Text: `Entiendo que los impuestos, aranceles y gastos de importacion no estan incluidos y, si corresponden, los pagare directamente a DHL.`
- On submit:
  - Create order through `/api/checkout/international/intent`.
  - Create payment session through Task 10 endpoint.
  - Clear cart only after redirect URL is received or mock provider success is returned.

- [ ] **Step 5: Add success and failure pages**

Create success page copy:

```tsx
Gracias por tu compra. Recibimos el pedido y el pago esta siendo confirmado. Te vamos a contactar por email o WhatsApp para continuar con la muestra y la fabricacion. Cuando el envio llegue a aduana, DHL te avisara si corresponde pagar impuestos o aranceles de importacion.
```

Create failure page copy:

```tsx
No pudimos confirmar el pago. Tu carrito puede recuperarse desde esta version del sitio. Si el cobro aparece en tu medio de pago, escribinos con el comprobante para revisarlo.
```

- [ ] **Step 6: Verify**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/app/[market]/checkout src/app/api/checkout/international src/lib/supabase/types.ts
git commit -m "feat: add international checkout intent"
```

---

## Task 10: Add Payment Provider Adapter

**Files:**
- Create: `src/lib/payments/international/types.ts`
- Create: `src/lib/payments/international/mockProvider.ts`
- Create: `src/lib/payments/international/provider.ts`
- Create: `src/app/api/checkout/international/payment/route.ts`
- Create: `src/app/api/checkout/international/webhook/route.ts`

- [ ] **Step 1: Add provider-neutral contract**

Create `src/lib/payments/international/types.ts`:

```ts
import type { CurrencyCode, InternationalMarketCode } from '@/lib/markets/types';

export interface InternationalPaymentLine {
  id: string;
  title: string;
  unitPrice: number;
  qty: number;
}

export interface CreateInternationalPaymentInput {
  orderId: string;
  market: InternationalMarketCode;
  currency: CurrencyCode;
  amount: number;
  buyer: {
    name: string;
    email: string;
    phone: string;
  };
  lines: InternationalPaymentLine[];
  successUrl: string;
  failureUrl: string;
}

export interface CreateInternationalPaymentResult {
  provider: string;
  providerPaymentId: string;
  checkoutUrl: string;
  raw?: unknown;
}

export interface VerifyInternationalPaymentWebhookResult {
  provider: string;
  providerPaymentId: string;
  orderId: string;
  paid: boolean;
  raw?: unknown;
}

export interface InternationalPaymentProvider {
  name: string;
  createCheckout(input: CreateInternationalPaymentInput): Promise<CreateInternationalPaymentResult>;
  verifyWebhook(req: Request): Promise<VerifyInternationalPaymentWebhookResult>;
}
```

- [ ] **Step 2: Add mock provider for local testing**

Create `src/lib/payments/international/mockProvider.ts`:

```ts
import type {
  CreateInternationalPaymentInput,
  CreateInternationalPaymentResult,
  InternationalPaymentProvider,
  VerifyInternationalPaymentWebhookResult,
} from './types';

export const mockInternationalPaymentProvider: InternationalPaymentProvider = {
  name: 'mock',
  async createCheckout(
    input: CreateInternationalPaymentInput
  ): Promise<CreateInternationalPaymentResult> {
    return {
      provider: 'mock',
      providerPaymentId: `mock_${input.orderId}`,
      checkoutUrl: input.successUrl,
      raw: { simulated: true },
    };
  },
  async verifyWebhook(req: Request): Promise<VerifyInternationalPaymentWebhookResult> {
    const body = (await req.json().catch(() => ({}))) as { orderId?: string; providerPaymentId?: string };
    return {
      provider: 'mock',
      providerPaymentId: body.providerPaymentId ?? 'mock_unknown',
      orderId: body.orderId ?? '',
      paid: Boolean(body.orderId),
      raw: body,
    };
  },
};
```

- [ ] **Step 3: Add provider factory**

Create `src/lib/payments/international/provider.ts`:

```ts
import { mockInternationalPaymentProvider } from './mockProvider';
import type { InternationalPaymentProvider } from './types';

export function getInternationalPaymentProvider(): InternationalPaymentProvider {
  const provider = process.env.INTERNATIONAL_PAYMENT_PROVIDER?.trim().toLowerCase();

  if (!provider || provider === 'mock') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('INTERNATIONAL_PAYMENT_PROVIDER must be configured in production');
    }
    return mockInternationalPaymentProvider;
  }

  throw new Error(`Unsupported international payment provider: ${provider}`);
}
```

After Alcohn chooses the real gateway, add exactly one real provider file, for example:

- `src/lib/payments/international/dlocalProvider.ts`
- or `src/lib/payments/international/mercadoPagoProvider.ts`
- or `src/lib/payments/international/payuProvider.ts`

Then update the factory to return that provider when the matching env value is present.

- [ ] **Step 4: Add payment session API**

Create `src/app/api/checkout/international/payment/route.ts`.

It must:

- Validate Supabase configured.
- Read `orden_id`.
- Fetch order from Supabase.
- Read `notas_web.international`.
- Reject missing/invalid market, currency, total, buyer.
- Call `getInternationalPaymentProvider().createCheckout`.
- Save provider payment id inside `notas_web.internationalPayment`.
- Return `{ checkoutUrl }`.

- [ ] **Step 5: Add webhook API**

Create `src/app/api/checkout/international/webhook/route.ts`.

It must:

- Call `getInternationalPaymentProvider().verifyWebhook(req)`.
- If paid:
  - Update order `estado_pago_web` to `pagado`.
  - Set `pago_confirmado_at`.
  - Add provider result to `notas_web.internationalPayment`.
- If not paid:
  - Keep `estado_pago_web` as `pendiente` or set `pago_fallido` depending on provider status.

- [ ] **Step 6: Verify mock flow**

Use local env:

```bash
INTERNATIONAL_PAYMENT_PROVIDER=mock npm run dev
```

Manual check:

- Add an item on `/cl`.
- Go to `/cl/checkout`.
- Complete DHL form.
- Submit checkout.
- Confirm redirect lands on `/cl/checkout/success`.
- Confirm Supabase order has market/currency/shipping data in `notas_web`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/payments/international src/app/api/checkout/international/payment src/app/api/checkout/international/webhook
git commit -m "feat: add international payment adapter"
```

---

## Task 11: Add Real Payment Provider

**Files:**
- Create one provider file under `src/lib/payments/international/`
- Modify: `src/lib/payments/international/provider.ts`
- Modify: `.env.example`
- Modify: `docs/international-commerce-ops.md`

- [ ] **Step 1: Select provider**

Use the provider selected by Alcohn after commercial research. Confirm it supports hosted checkout or equivalent card/local payment checkout for CLP, PEN, COP, and MXN with the account Alcohn will use.

- [ ] **Step 2: Implement provider module**

Create one real provider file matching the contract from Task 10.

The provider must:

- Keep secret keys server-side only.
- Send amount in the unit expected by the provider.
- Send currency exactly as `CLP`, `PEN`, `COP`, `MXN`.
- Send order id in provider metadata/reference.
- Use success and failure URLs from input.
- Verify webhook signature using the provider's documented method.
- Return normalized paid/not-paid result.

- [ ] **Step 3: Wire provider factory**

Modify `src/lib/payments/international/provider.ts`:

```ts
if (provider === 'dlocal') return dlocalInternationalPaymentProvider;
if (provider === 'mercadopago') return mercadoPagoInternationalPaymentProvider;
if (provider === 'payu') return payuInternationalPaymentProvider;
```

Only include the provider that was implemented.

- [ ] **Step 4: Add env docs**

Modify `.env.example`:

```bash
INTERNATIONAL_PAYMENT_PROVIDER=mock
# Provider-specific credentials are server-only.
# Example names must match the provider file implemented in this task.
```

- [ ] **Step 5: Verify sandbox**

Run:

```bash
npm run build
```

Then complete one sandbox payment per market:

- `/cl/checkout`
- `/pe/checkout`
- `/co/checkout`
- `/mx/checkout`

Expected:

- Hosted checkout opens.
- Success URL returns to the correct market.
- Webhook marks order paid.
- Cart clears only after checkout session is created.

- [ ] **Step 6: Commit**

```bash
git add src/lib/payments/international/provider.ts src/lib/payments/international/*Provider.ts .env.example docs/international-commerce-ops.md
git commit -m "feat: integrate international payment provider"
```

---

## Task 12: Add International Legal and Policy Pages

**Files:**
- Create: `src/app/[market]/politica-envios/page.tsx`
- Create: `src/app/[market]/politica-devoluciones/page.tsx`
- Create: `src/app/[market]/terminos/page.tsx`
- Create: `src/app/[market]/privacidad/page.tsx`
- Modify: `src/components/Footer.tsx`
- Create: `docs/international-commerce-ops.md`

- [ ] **Step 1: Shipping policy page**

Each market page must say:

```text
El precio de envio internacional corresponde a DHL y se muestra antes de pagar. El envio se realiza desde Argentina al pais seleccionado. El precio pagado en Alcohn incluye producto y envio DHL, pero no incluye impuestos, aranceles ni gastos de importacion del pais de destino. Si corresponden, DHL contactara al comprador por email o telefono y el comprador los pagara directamente a DHL.
```

- [ ] **Step 2: Returns policy page**

Each market page must say:

```text
Los sellos personalizados se fabrican a pedido con el logo, medida o configuracion elegida por el comprador. Por ese motivo no admiten devolucion por arrepentimiento una vez aprobada la muestra o iniciada la fabricacion. Si el producto llega dañado o hay un error atribuible a Alcohn, se revisara el caso con fotos, numero de pedido y constancia de DHL.
```

- [ ] **Step 3: Terms page**

Each market page must include:

- Seller is Alcohn, based in Argentina.
- Buyer chooses market/country and pays in local currency through the selected payment provider.
- Product price and DHL shipping are paid at checkout.
- Import duties/taxes are paid by buyer to DHL when applicable.
- Buyer is responsible for correct address, email, and phone.
- If DHL cannot deliver because address/contact/import payment is missing, Alcohn will review reshipment costs case by case.
- Custom products start after payment and sample approval when applicable.

- [ ] **Step 4: Privacy page**

Each market page must explain:

- Data collected: contact, shipping, order, payment provider reference, uploaded logo/design.
- Data use: manufacturing, payment, DHL shipping, support, analytics.
- Data shared with payment provider and DHL only as needed.

- [ ] **Step 5: Footer links**

Modify `src/components/Footer.tsx` to use `marketPath(market, '/politica-envios')`, etc. Use `useMarket` because Footer is a client-visible component; if converting Footer to client is undesirable, create a small client `FooterLegalLinksClient` component for market links.

- [ ] **Step 6: Ops guide**

Create `docs/international-commerce-ops.md` with:

- Order location: Supabase `ordenes.notas_web.international`.
- DHL data fields.
- Customs disclaimer text.
- Payment provider environment variables.
- Manual DHL label process.
- Customer message template after dispatch:

```text
Hola, tu pedido Alcohn ya fue despachado por DHL. Cuando el envio llegue a aduana, DHL puede contactarte por email o telefono para pagar impuestos/aranceles de importacion si corresponden. Ese pago se realiza directamente a DHL.
```

- [ ] **Step 7: Commit**

```bash
git add src/app/[market]/politica-envios src/app/[market]/politica-devoluciones src/app/[market]/terminos src/app/[market]/privacidad src/components/Footer.tsx docs/international-commerce-ops.md
git commit -m "feat: add international policies"
```

---

## Task 13: Add Market Switcher and Market-Aware Navigation

**Files:**
- Create: `src/components/market/MarketSwitcher.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/ActionButton.tsx` only if it blocks market links

- [ ] **Step 1: Add switcher**

Create `src/components/market/MarketSwitcher.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { INTERNATIONAL_MARKETS, MARKETS } from '@/lib/markets/config';
import { marketPath } from '@/lib/markets/paths';
import { stripMarketFromPathname } from '@/lib/markets/paths';
import { useMarket } from '@/contexts/MarketContext';
import type { MarketCode } from '@/lib/markets/types';

const MARKET_OPTIONS: MarketCode[] = ['ar', ...INTERNATIONAL_MARKETS];

export default function MarketSwitcher() {
  const pathname = usePathname() ?? '/';
  const currentPath = stripMarketFromPathname(pathname);
  const { market } = useMarket();

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="market-switcher">
        Pais
      </label>
      <select
        id="market-switcher"
        value={market}
        onChange={(event) => {
          window.location.href = marketPath(event.target.value as MarketCode, currentPath);
        }}
        className="border border-neutral-700 bg-neutral-900 px-2 py-2 text-xs text-white"
      >
        {MARKET_OPTIONS.map((code) => (
          <option key={code} value={code}>
            {MARKETS[code].countryName}
          </option>
        ))}
      </select>
      <noscript>
        <div className="mt-2 flex flex-wrap gap-2">
          {MARKET_OPTIONS.map((code) => (
            <Link key={code} href={marketPath(code, currentPath)}>
              {MARKETS[code].countryName}
            </Link>
          ))}
        </div>
      </noscript>
    </div>
  );
}
```

- [ ] **Step 2: Update Header links**

Modify `src/components/Header.tsx`:

- Import `useMarket` and `marketPath`.
- Convert nav hrefs with `marketPath(market, item.href)`.
- Logo href becomes `marketPath(market, '/')`.
- Design CTA href becomes `marketPath(market, '/buy?mode=custom')` for Argentina and `marketPath(market, '/productos')` or international custom flow route for international. If `/buy` is not internationalized in v1, send international users to `/${market}/productos`.
- Add `MarketSwitcher` near cart/action buttons.

- [ ] **Step 3: Verify navigation**

Manual check:

- On `/cl/productos`, header product link stays under `/cl/productos`.
- Switching from `/cl/sellos/para-cuero` to Mexico goes to `/mx/sellos/para-cuero`.
- Switching to Argentina goes to `/sellos/para-cuero`.

- [ ] **Step 4: Commit**

```bash
git add src/components/market/MarketSwitcher.tsx src/components/Header.tsx src/components/Footer.tsx
git commit -m "feat: add market-aware navigation"
```

---

## Task 14: Add International Merchant Feeds

**Files:**
- Create: `scripts/generate-merchant-feed-latam.ts`
- Modify: `package.json`
- Modify: `docs/google-merchant-feed.md`

- [ ] **Step 1: Add package script**

Modify `package.json`:

```json
{
  "scripts": {
    "feed:merchant:latam": "tsx scripts/generate-merchant-feed-latam.ts"
  }
}
```

- [ ] **Step 2: Create LatAm feed script**

Create `scripts/generate-merchant-feed-latam.ts`.

It must:

- Generate:
  - `feeds/google-merchant-products-cl.tsv`
  - `feeds/google-merchant-products-pe.tsv`
  - `feeds/google-merchant-products-co.tsv`
  - `feeds/google-merchant-products-mx.tsv`
- Use `MARKETS`.
- Use local market paths.
- Use local currency.
- Include only international catalog products:
  - stamp use cases
  - abecedarios
  - mango de golpe
- Use local "desde" price from `convertTransferArsToMarketPrice`.
- Keep Argentina script unchanged.

Headers can match current feed:

```ts
const HEADERS = [
  'id',
  'title',
  'description',
  'link',
  'image_link',
  'availability',
  'price',
  'brand',
  'condition',
  'google_product_category',
  'identifier_exists',
];
```

Price format:

```ts
function formatPrice(amount: number, currency: string) {
  return `${Number(amount).toFixed(2)} ${currency}`;
}
```

- [ ] **Step 3: Run feed generation**

```bash
npm run feed:merchant:latam
```

Expected:

- Four TSV files created.
- Every link starts with `https://www.alcohnsellos.com/cl`, `/pe`, `/co`, or `/mx`.
- Every price uses CLP, PEN, COP, or MXN.

- [ ] **Step 4: Update docs**

Modify `docs/google-merchant-feed.md`:

- Argentina feed remains `feeds/google-merchant-products.tsv`.
- LatAm feeds are separate per country.
- Merchant Center country/language/currency must match each feed.
- Shipping cost is configured per country or included in Merchant Center settings.
- Landing page, checkout, and feed currency must match.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-merchant-feed-latam.ts package.json package-lock.json feeds/google-merchant-products-cl.tsv feeds/google-merchant-products-pe.tsv feeds/google-merchant-products-co.tsv feeds/google-merchant-products-mx.tsv docs/google-merchant-feed.md
git commit -m "feat: generate LatAm merchant feeds"
```

---

## Task 15: Analytics and Tracking

**Files:**
- Modify: `src/lib/analytics/types.ts`
- Modify: `src/lib/analytics/client.ts`
- Modify: `src/lib/analytics/purchaseSnapshot.ts`
- Modify: `src/components/AnalyticsProvider.tsx`
- Modify: `src/components/MetaPixel.tsx`

- [ ] **Step 1: Add market/currency to purchase snapshot**

Extend purchase snapshot objects with:

```ts
market: MarketCode;
currency: CurrencyCode;
shipping: number;
```

- [ ] **Step 2: Track international checkout**

When international checkout creates payment session, save:

- orderId
- market
- currency
- value
- shipping
- line items

- [ ] **Step 3: Verify Meta/GA events**

Manual browser check:

- `AddToCart` includes local price and currency.
- `InitiateCheckout` includes local total and currency.
- `Purchase` after success includes local total and currency.

- [ ] **Step 4: Commit**

```bash
git add src/lib/analytics src/components/AnalyticsProvider.tsx src/components/MetaPixel.tsx
git commit -m "feat: track international market purchases"
```

---

## Task 16: End-to-End QA

**Files:**
- No required file changes unless defects are found.

- [ ] **Step 1: Run automated checks**

```bash
npm run test
npm run build
npm run feed:merchant
npm run feed:merchant:latam
```

Expected:

- Tests pass.
- Build succeeds.
- Argentina feed generated.
- Four LatAm feeds generated.

- [ ] **Step 2: Manual market smoke test**

For each market `/cl`, `/pe`, `/co`, `/mx`:

- Product page renders.
- Stamp page renders.
- Abecedarios page renders.
- Mango de golpe page renders.
- Excluded accessories do not appear in international catalog.
- Prices show local currency.
- DHL shipping is separate in checkout.
- Customs notice appears before payment.
- Checkout cannot continue without accepting customs notice.
- Order is created with `notas_web.international`.
- Payment redirects to provider or mock success.
- Success page is market-specific.

- [ ] **Step 3: SEO QA**

Check generated page source for:

- canonical URL includes country prefix.
- hreflang contains `es-AR`, `es-CL`, `es-PE`, `es-CO`, `es-MX`, and `x-default`.
- Product schema uses local currency outside Argentina.
- Sitemap contains international pages.
- Robots still disallows checkout/cart routes.

- [ ] **Step 4: Commit QA fixes**

If fixes were required:

```bash
git add <changed-files>
git commit -m "fix: polish international checkout qa"
```

---

## Acceptance Criteria

- Argentina website keeps existing routes and checkout behavior.
- `/cl`, `/pe`, `/co`, `/mx` each have product, stamp, abecedario, mango, cart, checkout, success/failure, policy, terms, and privacy pages.
- International prices display in local currency and are derived from Argentina transfer price plus 15% using fixed country config.
- DHL shipping displays as a separate line item in local currency.
- Customs/import duties notice is shown before checkout and accepted by the buyer.
- Supabase order stores market, country, currency, DHL shipping, total, and international address in `notas_web.international`.
- International payment provider is isolated behind `src/lib/payments/international`.
- Merchant feeds exist per country and use matching country URLs/currencies.
- Sitemap and hreflang include the new markets.
- `npm run test` and `npm run build` pass.

## Known Risks

- Payment provider onboarding may require separate merchant accounts, local entities, or settlement restrictions. Keep provider code isolated.
- Local payment methods may have per-country settlement and refund rules. Confirm before production.
- DHL import duties are buyer-paid. The site must make this clear in product pages, checkout, policies, and confirmation pages.
- Fixed exchange rates will need a review process. Add a recurring business task outside the codebase to review market config.
- Current checkout is Argentina-specific. International checkout should be built separately first, then shared abstractions can be extracted after it works.

## Self-Review Notes

- Scope covers markets, routing, pricing, DHL shipping, checkout, provider adapter, SEO, Merchant feeds, legal copy, analytics, and QA.
- Argentina behavior is explicitly preserved.
- Payment-provider implementation is gated on a business decision, but the adapter contract and mock provider make the rest of the system implementable before the real provider is chosen.
- No Supabase schema migration is required for v1 because international shipping and customs details are stored in `notas_web.international`.
