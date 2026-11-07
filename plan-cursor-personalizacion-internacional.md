# Plan de implementación — Personalización por país (PE, CO, MX, CL)

> **Para Cursor.** Seguir este documento en orden. Cada cambio indica archivo exacto, código actual y código nuevo. No improvisar copy: usar los textos de la sección "Datos por país" tal cual están escritos.

---

## 0. Reglas globales (leer antes de tocar nada)

1. **NO modificar nada del mercado Argentina (`ar`).** Toda rama `market === 'ar'` debe quedar byte a byte igual. Los cambios solo afectan `cl`, `pe`, `co`, `mx`.
2. **NO cambiar layout ni estructura visual** (clases Tailwind, grids, animaciones GSAP, breakpoints). Solo cambian textos y se agregan bloques nuevos reutilizando patrones existentes.
3. **Tuteo en todo texto internacional nuevo o modificado.** Los 4 países usan tuteo, no voseo: escribir "sube tu logo", "elige", "mira", "paga", "escríbenos", "revisa". NUNCA "subí", "elegí", "mirá", "pagá", "escribinos" en strings que solo ven mercados internacionales. Los strings de Argentina conservan el voseo.
4. **Terminología local por país** (ya validada en `Keywords_Ads_v2_por_pais.md`):
   - Chile: **cuño** (término dominante)
   - México: **sello a fuego**, **hierro/fierro de marcar**, y **piel** en lugar de "cuero"
   - Colombia: **sello al calor**
   - Perú: sello (estándar), con "cuño" y "cliché" como variantes secundarias
5. **Después de cada cambio correr:** `npx vitest run` y `npx tsc --noEmit`. Los tests existentes de `src/lib/markets/__tests__/` no deben romperse.
6. Los valores marcados `[CONFIRMAR]` tienen un default provisorio. Implementarlos con el default, centralizados en `src/lib/markets/localCopy.ts` (archivo nuevo, ver Cambio 2) para que Julian los ajuste en un solo lugar.

---

## Cambio 1 — FAQ internacional (CRÍTICO, hacer primero)

**Problema:** `/pe/faq`, `/co/faq`, `/mx/faq`, `/cl/faq` muestran hoy el FAQ argentino completo, incluyendo:
- "El envio por correo argentino a sucursal sale $6000..." (falso para internacional)
- "¿Cómo pago?" con transferencia bancaria y seña en pesos argentinos (falso: internacional paga 100% online vía dLocal)
- "¿Puedo comprar un diseño estándar?" (el flujo estándar `/sellos/estandar` es solo AR)

### 1.1 — `src/data/faq.ts`

Mantener `export const faqs` intacto (lo usa Argentina). Agregar al final del archivo una función market-aware:

```ts
import type { MarketCode } from '@/lib/markets/types';
import { getMarketConfig } from '@/lib/markets/config';
import { formatMarketMoney } from '@/lib/markets/money';

/** FAQ adaptado por mercado. Para 'ar' devuelve el array original sin cambios. */
export function getFaqs(market: MarketCode): FAQ[] {
  if (market === 'ar') return faqs;

  const config = getMarketConfig(market);
  const country = config.countryName;
  const shippingPrice = formatMarketMoney(config.dhlShippingAmount, market);

  const overrides: Record<string, string> = {
    '¿Cuánto sale el envío?': `El envío internacional a ${country} se hace por DHL Express y cuesta ${shippingPrice}. Se muestra en el checkout antes de pagar y queda incluido en el total. No incluye impuestos ni aranceles de importación: si corresponden, DHL te contacta y los pagas directamente a DHL.`,
    '¿Cómo pago?': `Pagas online en el checkout, en moneda local (${config.currency}), con tarjeta de crédito o débito a través de nuestro procesador de pagos internacional. El total incluye el producto y el envío DHL a ${country}.`,
    '¿Cuánto tarda la fabricación?': `El plazo habitual de producción es de 72 horas hábiles desde que la muestra y el pago quedan confirmados. Después despachamos por DHL Express a ${country}, con seguimiento que te enviamos por email o WhatsApp.`,
    '¿Puedo comprar un diseño estándar?': `Para envíos a ${country} trabajamos con sellos personalizados: subes tu logo o texto, eliges medida y ves la muestra antes de fabricar. Puedes ver todos los usos disponibles en el catálogo.`,
  };

  return faqs.map((item) =>
    overrides[item.question] ? { ...item, answer: overrides[item.question] } : item
  );
}
```

**Además:** revisar una por una las respuestas restantes de `faqs` buscando referencias exclusivas de Argentina (pesos, WhatsApp como canal de pago, empresas de correo locales). Si aparece alguna más, agregarla a `overrides` con redacción internacional en tuteo. No editar el array original.

### 1.2 — `src/components/pages/FaqPageContent.tsx`

Reemplazar el uso del array plano por la función:

```ts
// ANTES
import { faqs } from '@/data/faq';           // (línea de import actual)
const faqJsonLd = buildFaqJsonLd(faqs);
<FaqList faqs={faqs} />

// DESPUÉS
import { getFaqs } from '@/data/faq';
const marketFaqs = getFaqs(market);
const faqJsonLd = buildFaqJsonLd(marketFaqs);   // el JSON-LD también debe usar la versión del mercado
<FaqList faqs={marketFaqs} />
```

El componente ya recibe `market` por props; no hay que tocar las páginas que lo llaman.

### 1.3 — Tuteo en el copy fijo de la página FAQ (solo internacional)

En `FaqPageContent.tsx` el `SalesCtaBand` dice "Cuando ya entendés el producto..." (voseo). Condicionar:

```ts
title={market === 'ar'
  ? 'Cuando ya entendés el producto, el mejor paso es probar tu logo'
  : 'Cuando ya entiendes el producto, el mejor paso es probar tu logo'}
```

---

## Cambio 2 — Archivo central de copy por país: `src/lib/markets/localCopy.ts` (NUEVO)

Crear este archivo. Es la única fuente de verdad del copy internacional; todos los cambios siguientes lo importan.

```ts
import type { InternationalMarketCode } from './types';

export type MarketLocalCopy = {
  /** H1 del hero de la home. */
  heroTitle: string;
  /** Subtítulo del hero de la home (tuteo, terminología local). */
  heroSubtitle: string;
  /** Frase de moneda para CTAs: "paga en soles", etc. */
  currencyPhrase: string;
  /** Días hábiles estimados de tránsito DHL AR → país. [CONFIRMAR con historial DHL] */
  dhlDays: string;
  /** Métodos de pago locales visibles. [CONFIRMAR en panel dLocal antes de mostrar] */
  paymentMethods: string[];
  /** Término local principal del producto (para SEO y textos). */
  localTerm: string;
};

export const MARKET_LOCAL_COPY: Record<InternationalMarketCode, MarketLocalCopy> = {
  cl: {
    heroTitle: 'Cuños de bronce personalizados, hechos para durar toda la vida.',
    heroSubtitle:
      'Cuños (sellos) de bronce mecanizados en CNC para marcar cuero, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en pesos chilenos con envío DHL a Chile.',
    currencyPhrase: 'pagas en pesos chilenos',
    dhlDays: '4 a 7', // [CONFIRMAR]
    paymentMethods: ['Tarjeta de crédito o débito'], // [CONFIRMAR: ¿Webpay habilitado en dLocal?]
    localTerm: 'cuño de bronce',
  },
  pe: {
    heroTitle: 'Sellos de bronce personalizados, hechos para durar toda la vida.',
    heroSubtitle:
      'Sellos de bronce (también llamados cuños o clichés) mecanizados en CNC para marcar cuero, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en soles con envío DHL a Perú.',
    currencyPhrase: 'pagas en soles',
    dhlDays: '4 a 7', // [CONFIRMAR]
    paymentMethods: ['Tarjeta de crédito o débito'], // [CONFIRMAR: ¿Yape / PagoEfectivo habilitados en dLocal?]
    localTerm: 'sello de bronce',
  },
  co: {
    heroTitle: 'Sellos al calor de bronce personalizados, hechos para durar toda la vida.',
    heroSubtitle:
      'Sellos de bronce para marcar al calor, mecanizados en CNC: cuero, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en pesos colombianos con envío DHL a Colombia.',
    currencyPhrase: 'pagas en pesos colombianos',
    dhlDays: '4 a 7', // [CONFIRMAR]
    paymentMethods: ['Tarjeta de crédito o débito'], // [CONFIRMAR: ¿PSE / Nequi habilitados en dLocal?]
    localTerm: 'sello al calor',
  },
  mx: {
    heroTitle: 'Sellos a fuego de bronce personalizados, hechos para durar toda la vida.',
    heroSubtitle:
      'Sellos a fuego y hierros de marcar de bronce, mecanizados en CNC para marcar piel, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en pesos mexicanos con envío DHL a México.',
    currencyPhrase: 'pagas en pesos mexicanos',
    dhlDays: '3 a 6', // [CONFIRMAR]
    paymentMethods: ['Tarjeta de crédito o débito'], // [CONFIRMAR: ¿OXXO / SPEI habilitados en dLocal?]
    localTerm: 'sello a fuego',
  },
};

export function getMarketLocalCopy(market: InternationalMarketCode): MarketLocalCopy {
  return MARKET_LOCAL_COPY[market];
}
```

**Notas obligatorias:**
- En México usar **"piel"** (no "cuero") en todo copy nuevo de `/mx`.
- No mostrar métodos de pago que no estén confirmados en dLocal: mientras tanto queda solo "Tarjeta de crédito o débito".

---

## Cambio 3 — Hero de la home por país

### 3.1 — `src/lib/markets/home.ts`

Agregar función de título y reescribir el subtítulo internacional usando `localCopy`:

```ts
import { getMarketLocalCopy } from './localCopy';
import { isInternationalMarket } from './config';

export function getHomeHeroTitle(market: MarketCode): string {
  if (!isInternationalMarket(market)) {
    return 'Más que una herramienta, una forma de contar tu historia.';
  }
  return getMarketLocalCopy(market).heroTitle;
}
```

Y en `getHomeHeroSubtitle`, reemplazar la rama internacional actual (que usa voseo "Subí... mirá... comprá") por:

```ts
export function getHomeHeroSubtitle(market: MarketCode): string {
  if (market === 'ar') {
    return 'Sellos de bronce personalizados para marcar cuero, madera, alimentos y packaging. Subí tu logo, elegí cómo lo vas a usar y recibí muestra, medida y precio antes de fabricar.';
  }
  return getMarketLocalCopy(market).heroSubtitle;
}
```

⚠️ La rama `ar` queda EXACTAMENTE con el string actual.

### 3.2 — `src/components/HomeLanding.tsx` (línea ~132)

```tsx
// ANTES
<Hero
  title="Más que una herramienta, una forma de contar tu historia."
  subtitle={getHomeHeroSubtitle(market)}

// DESPUÉS
<Hero
  title={getHomeHeroTitle(market)}
  subtitle={getHomeHeroSubtitle(market)}
```

Importar `getHomeHeroTitle` desde `@/lib/markets/home`. Nada más cambia en el `<Hero>`.

### 3.3 — CTAs del hero en tuteo (solo internacional)

En `src/lib/markets/home.ts`, `getHomePrimaryCta` devuelve "Subir logo y ver precio" para todos: es infinitivo, neutro, **dejarlo igual**. `getHomeSecondaryCta` internacional ("Cómo funciona") también queda igual.

---

## Cambio 4 — Reemplazar el aviso de impuestos del hero por un strip positivo

**Problema:** en la home internacional, el único bloque específico del país es el aviso amarillo de impuestos (`ImportDutiesNotice`) justo debajo del hero. La primera impresión personalizada es una advertencia.

### 4.1 — Crear `src/components/market/MarketTrustStrip.tsx` (NUEVO)

```tsx
import Link from 'next/link';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { getMarketConfig } from '@/lib/markets/config';
import { getMarketLocalCopy } from '@/lib/markets/localCopy';
import { marketPath } from '@/lib/markets/paths';

export default function MarketTrustStrip({ market }: { market: InternationalMarketCode }) {
  const country = getMarketConfig(market).countryName;
  const copy = getMarketLocalCopy(market);

  const items = [
    `Envío DHL Express a ${country} en ${copy.dhlDays} días hábiles`,
    `Fabricación en 72 h hábiles`,
    copy.currencyPhrase.charAt(0).toUpperCase() + copy.currencyPhrase.slice(1),
  ];

  return (
    <div className="border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] px-4 py-3 text-sm leading-relaxed text-neutral-800">
      <ul className="flex flex-col gap-1 md:flex-row md:flex-wrap md:items-center md:gap-x-6 md:gap-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span aria-hidden="true" className="text-[var(--alcohn-bronze)]">●</span>
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-neutral-500">
        El total no incluye impuestos de importación del país de destino.{' '}
        <Link href={marketPath(market, '/politica-envios')} className="underline underline-offset-2">
          Ver detalle
        </Link>
      </p>
    </div>
  );
}
```

(Usar las CSS variables y patrones de borde existentes; ajustar clases si el design system tiene un patrón de strip ya definido, sin inventar estilos nuevos.)

### 4.2 — `src/components/HomeLanding.tsx` (líneas ~139–145)

```tsx
// ANTES
{market !== 'ar' && (
  <section className="relative z-[1] -mt-px border-t border-[var(--alcohn-line)] bg-[var(--alcohn-paper)] py-4 md:py-5">
    <div className="container mx-auto max-w-7xl px-4 md:px-8">
      <ImportDutiesNotice market={market} />
    </div>
  </section>
)}

// DESPUÉS — misma section, solo cambia el componente interior
{market !== 'ar' && (
  <section className="relative z-[1] -mt-px border-t border-[var(--alcohn-line)] bg-[var(--alcohn-paper)] py-4 md:py-5">
    <div className="container mx-auto max-w-7xl px-4 md:px-8">
      <MarketTrustStrip market={market as InternationalMarketCode} />
    </div>
  </section>
)}
```

⚠️ **`ImportDutiesNotice` NO se elimina del proyecto.** Sigue usándose en: `BuyWizard.tsx`, `checkout/page.tsx`, `InternationalShippingForm.tsx`, `productos/page.tsx`, `sellos/[slug]/page.tsx`, `abecedarios/page.tsx`, `accesorios/mango-de-golpe/page.tsx`. Esos usos quedan intactos (ahí el aviso legal es apropiado). Solo se reemplaza en la home.

---

## Cambio 5 — TrustStatsStrip: "Envíos a todo el país" es incorrecto en internacional

**Problema:** `src/data/trustStats.ts` tiene `{ value: 'Envíos', label: 'a todo el país', mobileLabel: 'todo el país' }` y `TrustStatsStrip` lo muestra igual en `/pe`, `/co`, `/mx`, `/cl`.

### 5.1 — `src/data/trustStats.ts`

```ts
import type { MarketCode } from '@/lib/markets/types';

// ...interface y array actuales SIN CAMBIOS...

/** Stats por mercado. AR conserva el array original. */
export function getTrustStats(market: MarketCode): TrustStat[] {
  if (market === 'ar') return trustStats;
  return trustStats.map((stat) =>
    stat.value === 'Envíos'
      ? { value: 'Envíos', label: 'DHL a 5 países', mobileLabel: 'DHL a 5 países' }
      : stat
  );
}
```

### 5.2 — `src/components/TrustStatsStrip.tsx`

Es un client component. Obtener el market desde el contexto existente:

```ts
import { useMarket } from '@/contexts/MarketContext';
import { getTrustStats } from '@/data/trustStats';

// dentro del componente:
const { market } = useMarket();
const stats = getTrustStats(market);
```

Y reemplazar todas las referencias al import `trustStats` por la variable `stats`. **No tocar** la lógica GSAP ni el markup. Verificar que las animaciones de contador (`parseStatValue`) sigan funcionando: el nuevo stat "Envíos" no es numérico, igual que antes, así que no debería afectar.

---

## Cambio 6 — Nueva sección en home internacional: "Comprar desde {País}"

**Objetivo:** responder las 3 dudas del comprador internacional (¿cuánto tarda? ¿cómo pago? ¿qué pasa con aduana?) que hoy la home no responde.

### 6.1 — Crear `src/components/market/InternationalBuySteps.tsx` (NUEVO)

Server component (sin `'use client'`). Reutilizar el patrón visual de las sections existentes de `HomeLanding` (container + `technical-sheet` / borders con `--alcohn-line`).

```tsx
import Link from 'next/link';
import ActionButton from '@/components/ActionButton';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { getMarketConfig } from '@/lib/markets/config';
import { getMarketLocalCopy } from '@/lib/markets/localCopy';
import { marketBuyPath, marketPath } from '@/lib/markets/paths';

export default function InternationalBuySteps({ market }: { market: InternationalMarketCode }) {
  const country = getMarketConfig(market).countryName;
  const copy = getMarketLocalCopy(market);

  const steps = [
    {
      number: '01',
      title: 'Sube tu logo y mira la muestra',
      body: 'Eliges uso y medida en el diseñador online y ves cómo queda tu marca antes de pagar. El precio final aparece al instante, con envío incluido.',
    },
    {
      number: '02',
      title: 'Fabricamos tu sello en 72 h hábiles',
      body: `Mecanizamos el bronce en CNC en nuestro taller de Mar del Plata, Argentina. Pagas online en moneda local (${copy.paymentMethods.join(', ').toLowerCase()}).`,
    },
    {
      number: '03',
      title: `DHL lo lleva a tu puerta en ${country}`,
      body: `Despachamos por DHL Express con seguimiento: llega en ${copy.dhlDays} días hábiles desde el despacho. Si tu país aplica impuestos de importación, DHL te contacta y los pagas directo a DHL.`,
    },
  ];

  return (
    <section className="atelier-page border-b border-[var(--alcohn-line)] py-6 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-4 md:technical-sheet md:blueprint-sheet md:mobile-clean-sheet md:gap-0">
          <div className="max-md:border max-md:border-[var(--alcohn-line)] max-md:bg-[var(--alcohn-surface)] p-4 md:p-10 lg:p-12">
            <p className="craft-label mb-4">Compra internacional</p>
            <h2 className="max-w-2xl text-[1.6rem] font-semibold leading-tight tracking-tight text-neutral-950 md:text-5xl">
              Comprar desde {country} es simple.
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3 md:gap-8">
              {steps.map((step) => (
                <article key={step.number} className="border-t border-[var(--alcohn-line)] pt-4">
                  <p className="craft-label mb-2">{step.number}</p>
                  <h3 className="text-base font-semibold leading-snug text-neutral-950 md:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">{step.body}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row md:mt-8 md:gap-3">
              <ActionButton href={marketBuyPath(market)} variant="primary">
                Subir logo y ver precio
              </ActionButton>
              <ActionButton href={marketPath(market, '/politica-envios')} variant="ghost">
                Ver política de envíos
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### 6.2 — Insertarla en `src/components/HomeLanding.tsx`

Ubicación: **después de `<TrustStatsStrip />` (línea ~222) y antes de la section `#lo-transforma`**:

```tsx
<TrustStatsStrip />

{market !== 'ar' && <InternationalBuySteps market={market as InternationalMarketCode} />}

<section id="lo-transforma" ...>
```

Importar el componente y el tipo `InternationalMarketCode`. En `/` (Argentina) no se renderiza nada — cero impacto en AR.

---

## Cambio 7 — CTA final de la home con moneda local

`src/lib/markets/home.ts`, función `getHomeFinalCta`. La rama internacional actual usa voseo y dice "moneda local" genérico. Reemplazar SOLO la rama internacional:

```ts
export function getHomeFinalCta(market: MarketCode) {
  if (market === 'ar') {
    return {
      href: marketBuyPath(market),
      label: 'Diseñar y comprar online',
      description: 'Subí tu logo, mirá una muestra, confirmá medida y avanzá al pago online.',
      descriptionMobile: 'Subí tu logo, revisá la muestra y avanzá al pago.',
    };
  }

  const copy = getMarketLocalCopy(market);
  return {
    href: marketBuyPath(market),
    label: 'Diseñar y comprar online',
    description: `Sube tu logo, mira la muestra, confirma la medida y ${copy.currencyPhrase}, con envío DHL incluido.`,
    descriptionMobile: `Sube tu logo, revisa la muestra y ${copy.currencyPhrase}.`,
  };
}
```

⚠️ Los strings de la rama `ar` deben quedar idénticos a los actuales (compararlos antes de commitear).

---

## Cambio 8 — SEO: title de la home por país con término local

`src/app/[market]/page.tsx` usa `marketSeoTitle(SITE_DEFAULT_TITLE, market)`, que genera un title genérico "... | Envío DHL a Chile". Mejorarlo SOLO para la home (no tocar `marketSeoTitle`, que usan otras páginas):

En `generateMetadata` de `src/app/[market]/page.tsx`:

```ts
import { getMarketLocalCopy } from '@/lib/markets/localCopy';
import { getMarketConfig } from '@/lib/markets/config';

const HOME_TITLES: Record<InternationalMarketCode, string> = {
  cl: 'Cuños de bronce personalizados | Envío DHL a Chile | Alcohn',
  pe: 'Sellos de bronce personalizados | Envío DHL a Perú | Alcohn',
  co: 'Sellos al calor de bronce personalizados | Envío DHL a Colombia | Alcohn',
  mx: 'Sellos a fuego y hierros de marcar de bronce | Envío DHL a México | Alcohn',
};

// en generateMetadata:
return createPageMetadata({
  title: HOME_TITLES[market as InternationalMarketCode],
  description: getMarketLocalCopy(market as InternationalMarketCode).heroSubtitle,
  path: '/',
  market,
});
```

No tocar hreflang, sitemap ni `alternateLanguages` — ya funcionan bien.

---

## Cambio 9 (menor) — Footer y textos sueltos en voseo visibles en internacional

Buscar y condicionar por market SOLO estos strings que ven los 4 países (mantener versión AR intacta):

1. `src/components/market/ImportDutiesNotice.tsx`: "DHL te avisará... y los pagarás" — ya es neutro, no tocar.
2. `src/lib/markets/legal.ts`: "Revisá el paquete... escribinos", "Contactanos dentro de los 10 días..." → estas secciones son SOLO internacionales, reescribir en tuteo: "Revisa el paquete al recibirlo... escríbenos", "Contáctanos dentro de los 10 días...".
3. `src/components/pages/FaqPageContent.tsx`: cubierto en Cambio 1.3.

**No hacer** una migración masiva de voseo→tuteo en el resto del sitio en este PR. Queda para una fase 2 (los componentes compartidos con AR requieren decidir estrategia de strings por market).

---

## Datos por país — referencia rápida

| Dato | Chile `/cl` | Perú `/pe` | Colombia `/co` | México `/mx` |
|---|---|---|---|---|
| Término principal | cuño de bronce | sello de bronce (cuño, cliché) | sello al calor | sello a fuego / hierro de marcar |
| "Cuero" se dice | cuero | cuero | cuero | **piel** |
| Moneda (frase) | pagas en pesos chilenos | pagas en soles | pagas en pesos colombianos | pagas en pesos mexicanos |
| Días DHL (default) | 4 a 7 `[CONFIRMAR]` | 4 a 7 `[CONFIRMAR]` | 4 a 7 `[CONFIRMAR]` | 3 a 6 `[CONFIRMAR]` |
| Pagos locales | `[CONFIRMAR]` Webpay | `[CONFIRMAR]` Yape/PagoEfectivo | `[CONFIRMAR]` PSE/Nequi | `[CONFIRMAR]` OXXO/SPEI |
| Envío DHL (config) | CLP 37.000 | PEN 136 | COP 133.000 | MXN 700 |

---

## Orden de commits sugerido

1. `fix(intl): FAQ internacional con envío DHL y pago en moneda local` (Cambio 1)
2. `feat(intl): copy local por país en lib/markets/localCopy.ts` (Cambio 2)
3. `feat(intl): hero de home con terminología local por país` (Cambio 3)
4. `feat(intl): MarketTrustStrip reemplaza aviso de impuestos en home` (Cambio 4)
5. `fix(intl): trust stats sin "a todo el país" en mercados internacionales` (Cambio 5)
6. `feat(intl): sección "Comprar desde {país}" en home internacional` (Cambio 6)
7. `feat(intl): CTA final y SEO title por país + tuteo en legales` (Cambios 7, 8, 9)

---

## QA final (obligatorio, no saltear)

1. `npx tsc --noEmit` sin errores. `npx vitest run` en verde.
2. **Argentina intacta:** `git diff` no debe mostrar ningún cambio de comportamiento para `market === 'ar'`. Abrir `/`, `/faq`, `/proceso` y comparar contra `main`: idénticos.
3. Abrir `/cl`, `/pe`, `/co`, `/mx` y verificar:
   - H1 y subtítulo con terminología del país (cuño en CL, sello a fuego + "piel" en MX, sello al calor en CO).
   - Strip positivo debajo del hero (sin el aviso amarillo) con link a política de envíos.
   - Sección "Comprar desde {País}" con 3 pasos, después del strip de stats.
   - Stats: "Envíos DHL a 5 países" (no "a todo el país").
   - CTA final con la frase de moneda del país.
   - Ningún "subí/elegí/mirá/pagá" en el contenido nuevo.
4. Abrir `/cl/faq`, `/pe/faq`, `/co/faq`, `/mx/faq`: no debe aparecer "correo argentino", "$6000", "seña" ni "transferencia bancaria". El precio de envío debe mostrarse en moneda local con sufijo ISO, ej: `S/ 136.00 (PEN)`.
5. El aviso de impuestos (`ImportDutiesNotice`) sigue apareciendo en: wizard de compra, checkout, `/[market]/productos`, `/[market]/sellos/[slug]`, `/[market]/abecedarios`, `/[market]/accesorios/mango-de-golpe`.
6. Ver source de `/cl` (view-source): `<title>` con "Cuños de bronce...", JSON-LD del FAQ internacional (no el argentino), hreflang sin cambios.
7. **Mobile:** revisar las 4 homes en viewport 390px — el strip nuevo y la sección de 3 pasos deben verse correctas sin scroll horizontal (regla del proyecto: no romper mobile).

---

## Fase 2 (NO implementar ahora — solo dejar anotado)

- Migración completa voseo→tuteo de componentes compartidos (BuyWizard, Proceso, Sobre Alcohn) vía strings por market.
- Confirmar y mostrar métodos de pago locales reales (Yape, PSE, OXXO, Webpay) cuando dLocal los confirme.
- Prueba social por país: casos reales / contador de envíos por destino.
- Terminología local en landings `/[market]/sellos/para-cuero` etc. (alinear con grupos de Ads de `Keywords_Ads_v2_por_pais.md`).
