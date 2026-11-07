# Plan de correcciones — Personalización de páginas por país (CL, PE, CO, MX)

> **Para Cursor.** Documento de ejecución. Cada corrección indica archivo, texto actual (hoy en prod) y texto nuevo. No improvisar copy: usar la sección **Datos por país**.
>
> Complementa y precisa `plan-cursor-personalizacion-internacional.md`. Si hay conflicto, **gana este archivo** (está auditado contra el código actual, agosto 2026).

---

## Estado actual (auditoría)

Los mercados `/cl`, `/pe`, `/co`, `/mx` ya tienen moneda, DHL, checkout dLocal y rutas propias. **La página se ve argentina**: mismos H1, FAQ, stats, proceso de compra y SEO. Nada de `localCopy.ts` existe todavía.

| Superficie | Qué ve hoy un comprador en `/pe` (igual en CL/CO/MX) | Por qué está mal |
|---|---|---|
| Home H1 | `Más que una herramienta, una forma de contar tu historia.` | Igual que AR. No usa cuño / sello a fuego / sello al calor. |
| Home subtítulo | `Subí tu logo, elegí uso y medida, mirá la muestra y comprá...` | Voseo argentino. Sin término local. |
| Home meta title | `Sellos de bronce CNC \| Logo a sello en 72hs \| Alcohn \| Envío DHL a Peru` | Genérico; **Peru/Mexico sin tilde**. |
| Home meta description | `Comprá sellos... Envío a todo Argentina. Envío internacional DHL a Peru.` | Se contradice: dice Argentina **y** DHL. Voseo. |
| Debajo del hero | Aviso amarillo `Impuestos de importación` | Primera personalización = advertencia. |
| Trust stats | `Envíos a todo el país` | Falso: el envío es DHL internacional. |
| FAQ `/pe/faq` | Correo Argentino `$6000`/`$9000`, seña, transferencia, Factura C, diseños estándar, calentador eléctrico | Copy de AR. JSON-LD también. |
| Proceso `/pe/proceso` | Timeline: BBVA, transferencia, “correo a domicilio o sucursal” | Flujo de pago y envío de Argentina. |
| Wizard (mobile) | `Envíos a todo el país` | Visible en el flujo de compra internacional. |
| Landings `/[market]/sellos/*` | SEO “Alcohn Argentina”, “envío a todo el país”, CTA `Diseñá` / `Subí` | Ads apunta a estas URLs con términos locales. |
| Nombres de país | `Peru`, `Mexico` en `MARKETS` | Sale en footer, legales, titles, avisos. |

**Argentina (`/` y todo `market === 'ar'`) no se toca.** Diff de comportamiento AR = 0.

---

## 0. Reglas (leer antes de tocar nada)

1. **NO modificar mercado `ar`.** Toda rama `market === 'ar'` queda byte a byte igual.
2. **NO cambiar layout** (clases Tailwind, grids, GSAP, breakpoints). Solo textos y bloques nuevos reutilizando patrones existentes.
3. **Tuteo** en todo string internacional nuevo o modificado: "sube", "elige", "mira", "paga", "escríbenos". Nunca "subí / elegí / mirá / pagá / escribinos" en lo que solo ven CL/PE/CO/MX.
4. **Terminología** (validada en `Keywords_Ads_v2_por_pais.md`):
   - Chile: **cuño** (dominante)
   - México: **sello a fuego**, **hierro/fierro de marcar**, y **piel** (no "cuero") en copy nuevo de `/mx`
   - Colombia: **sello al calor**
   - Perú: sello (estándar); "cuño" y "cliché" como variantes
5. Tras cada bloque: `npx vitest run` y `npx tsc --noEmit`.
6. Valores `[CONFIRMAR]`: implementar el default en `localCopy.ts` para ajustar después en un solo archivo.
7. No mostrar Yape / PSE / OXXO / Webpay hasta confirmarlos en dLocal. Default: `Tarjeta de crédito o débito`.

---

## Datos por país (fuente de verdad del copy)

| Dato | Chile `/cl` | Perú `/pe` | Colombia `/co` | México `/mx` |
|---|---|---|---|---|
| `countryName` (con tilde) | Chile | **Perú** | Colombia | **México** |
| Término principal | cuño de bronce | sello de bronce (cuño, cliché) | sello al calor | sello a fuego / hierro de marcar |
| Material cuero | cuero | cuero | cuero | **piel** |
| Frase moneda | pagas en pesos chilenos | pagas en soles | pagas en pesos colombianos | pagas en pesos mexicanos |
| Días DHL | 4 a 7 `[CONFIRMAR]` | 4 a 7 `[CONFIRMAR]` | 4 a 7 `[CONFIRMAR]` | 3 a 6 `[CONFIRMAR]` |
| Pagos a mostrar | Tarjeta de crédito o débito | igual | igual | igual |
| Envío DHL (ya en config) | CLP 37.000 | PEN 136 | COP 133.000 | MXN 700 |

**Hero (usar tal cual):**

- **CL title:** `Cuños de bronce personalizados, hechos para durar toda la vida.`
- **CL subtitle:** `Cuños (sellos) de bronce mecanizados en CNC para marcar cuero, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en pesos chilenos con envío DHL a Chile.`
- **PE title:** `Sellos de bronce personalizados, hechos para durar toda la vida.`
- **PE subtitle:** `Sellos de bronce (también llamados cuños o clichés) mecanizados en CNC para marcar cuero, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en soles con envío DHL a Perú.`
- **CO title:** `Sellos al calor de bronce personalizados, hechos para durar toda la vida.`
- **CO subtitle:** `Sellos de bronce para marcar al calor, mecanizados en CNC: cuero, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en pesos colombianos con envío DHL a Colombia.`
- **MX title:** `Sellos a fuego de bronce personalizados, hechos para durar toda la vida.`
- **MX subtitle:** `Sellos a fuego y hierros de marcar de bronce, mecanizados en CNC para marcar piel, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en pesos mexicanos con envío DHL a México.`

**SEO title home (usar tal cual, sin pasar por `marketSeoTitle`):**

- CL: `Cuños de bronce personalizados | Envío DHL a Chile | Alcohn`
- PE: `Sellos de bronce personalizados | Envío DHL a Perú | Alcohn`
- CO: `Sellos al calor de bronce personalizados | Envío DHL a Colombia | Alcohn`
- MX: `Sellos a fuego y hierros de marcar de bronce | Envío DHL a México | Alcohn`

---

## Orden de implementación

1. Nombres de país con tilde (Cambio A)
2. `localCopy.ts` (Cambio B)
3. FAQ (Cambio C) — el más falso para el comprador
4. Proceso / timeline (Cambio D) — igual de falso
5. Home: hero, strip, stats, sección 3 pasos, CTA, SEO (Cambios E–I)
6. Wizard trust strip + tuteo del resumen internacional (Cambio J)
7. Landings de uso + footer MX (Cambio K)
8. Legales tuteo (Cambio L)

---

## Cambio A — `countryName`: Perú y México con tilde

**Archivo:** `src/lib/markets/config.ts`

```ts
// HOY
countryName: 'Peru',
countryName: 'Mexico',

// DESPUÉS
countryName: 'Perú',
countryName: 'Mexico', // → 'México'
```

Este string se concatena en footer, `ImportDutiesNotice`, legales, `marketSeoTitle` y FAQ. Corregirlo primero evita copy “a Peru”.

**Test:** en `src/lib/markets/__tests__/config.test.ts` agregar:

```ts
expect(MARKETS.pe.countryName).toBe('Perú');
expect(MARKETS.mx.countryName).toBe('México');
```

Si algún test o analytics compara el string `'Peru'` / `'Mexico'`, actualizar solo aserciones. **No cambiar** `countryIso2`, `hreflang`, códigos de mercado ni slugs.

---

## Cambio B — Crear `src/lib/markets/localCopy.ts`

Única fuente de copy internacional. Todos los cambios siguientes lo importan.

```ts
import type { InternationalMarketCode } from './types';

export type MarketLocalCopy = {
  heroTitle: string;
  heroSubtitle: string;
  currencyPhrase: string;
  dhlDays: string;
  paymentMethods: string[];
  localTerm: string;
  /** Sustantivo del material de marroquinería en landings/footer. */
  leatherWord: 'cuero' | 'piel';
};

export const MARKET_LOCAL_COPY: Record<InternationalMarketCode, MarketLocalCopy> = {
  cl: {
    heroTitle: 'Cuños de bronce personalizados, hechos para durar toda la vida.',
    heroSubtitle:
      'Cuños (sellos) de bronce mecanizados en CNC para marcar cuero, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en pesos chilenos con envío DHL a Chile.',
    currencyPhrase: 'pagas en pesos chilenos',
    dhlDays: '4 a 7',
    paymentMethods: ['Tarjeta de crédito o débito'],
    localTerm: 'cuño de bronce',
    leatherWord: 'cuero',
  },
  pe: {
    heroTitle: 'Sellos de bronce personalizados, hechos para durar toda la vida.',
    heroSubtitle:
      'Sellos de bronce (también llamados cuños o clichés) mecanizados en CNC para marcar cuero, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en soles con envío DHL a Perú.',
    currencyPhrase: 'pagas en soles',
    dhlDays: '4 a 7',
    paymentMethods: ['Tarjeta de crédito o débito'],
    localTerm: 'sello de bronce',
    leatherWord: 'cuero',
  },
  co: {
    heroTitle: 'Sellos al calor de bronce personalizados, hechos para durar toda la vida.',
    heroSubtitle:
      'Sellos de bronce para marcar al calor, mecanizados en CNC: cuero, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en pesos colombianos con envío DHL a Colombia.',
    currencyPhrase: 'pagas en pesos colombianos',
    dhlDays: '4 a 7',
    paymentMethods: ['Tarjeta de crédito o débito'],
    localTerm: 'sello al calor',
    leatherWord: 'cuero',
  },
  mx: {
    heroTitle: 'Sellos a fuego de bronce personalizados, hechos para durar toda la vida.',
    heroSubtitle:
      'Sellos a fuego y hierros de marcar de bronce, mecanizados en CNC para marcar piel, madera, alimentos y packaging. Sube tu logo, elige uso y medida, mira la muestra y paga en pesos mexicanos con envío DHL a México.',
    currencyPhrase: 'pagas en pesos mexicanos',
    dhlDays: '3 a 6',
    paymentMethods: ['Tarjeta de crédito o débito'],
    localTerm: 'sello a fuego',
    leatherWord: 'piel',
  },
};

export function getMarketLocalCopy(market: InternationalMarketCode): MarketLocalCopy {
  return MARKET_LOCAL_COPY[market];
}
```

**Test nuevo** `src/lib/markets/__tests__/localCopy.test.ts`: cada mercado tiene `heroTitle`/`heroSubtitle` no vacíos; MX usa `piel` y no `cuero` en subtitle; ninguno usa `subí`/`elegí`/`mirá`/`pagá`.

---

## Cambio C — FAQ internacional (crítico)

### C.1 `src/data/faq.ts`

Dejar `export const faqs` intacto. Agregar `getFaqs(market)`.

**Overrides obligatorios** (pregunta → respuesta internacional). `shippingPrice = formatMarketMoney(config.dhlShippingAmount, market)` (ya sale con sufijo ISO, ej. `S/ 136.00 (PEN)`).

| Pregunta (key exacta del array) | Respuesta nueva (tuteo) |
|---|---|
| `¿Cuánto sale el envío?` | `El envío internacional a ${country} se hace por DHL Express y cuesta ${shippingPrice}. Se muestra en el checkout antes de pagar y queda incluido en el total. No incluye impuestos ni aranceles de importación: si corresponden, DHL te contacta y los pagas directamente a DHL.` |
| `¿Cómo pago?` | `Pagas online en el checkout, en moneda local (${config.currency}), con tarjeta de crédito o débito a través de nuestro procesador de pagos internacional. El total incluye el producto y el envío DHL a ${country}.` |
| `¿Cuánto tarda la fabricación?` | `El plazo habitual de producción es de 72 horas hábiles desde que la muestra y el pago quedan confirmados. Después despachamos por DHL Express a ${country}, con seguimiento que te enviamos por email o WhatsApp.` |
| `¿Puedo comprar un diseño estándar?` | `Para envíos a ${country} trabajamos con sellos personalizados: subes tu logo o texto, eliges medida y ves la muestra antes de fabricar. Puedes ver todos los usos disponibles en el catálogo.` |
| `¿Hacen factura?` | `Sí. En compras internacionales emitimos comprobante fiscal argentino de exportación. Si necesitas un dato específico en la factura, indícalo en el checkout o escríbenos.` |
| `¿Solo hacen sellos?` | `Fabricamos sellos de bronce personalizados y abecedarios. En envíos a ${country} el accesorio disponible es el mango de golpe. El calentador eléctrico y la base para remachadora se venden solo en Argentina.` |
| `¿Puedo comprar sin hablar por WhatsApp?` | `Sí. El objetivo de la web es que subas tu logo, elijas uso y medida, veas muestra y precio, y pagues online. WhatsApp queda como ayuda para casos puntuales o pedidos fuera del flujo.` |
| `¿No tengo logo, ustedes me lo diseñan?` | `Podemos armarte un diseño sencillo acorde a tus necesidades. Te enviaríamos muestra y presupuesto del diseño. Para eso puedes contactarnos por WhatsApp y te asesoramos.` |

Las demás preguntas del array se **mapean** (mismo `question`) con la respuesta original, salvo tuteo mínimo si el string internacional queda en voseo fuerte **y** es visible en FAQ. Prioridad: no reescribir las de materiales/medidas salvo que mencionen AR.

Implementación:

```ts
export function getFaqs(market: MarketCode): FAQ[] {
  if (market === 'ar') return faqs;
  // map + overrides como arriba
}
```

### C.2 `src/components/pages/FaqPageContent.tsx`

Hoy (líneas 4, 19, 47): `import { faqs }` y `buildFaqJsonLd(faqs)` / `<FaqList faqs={faqs} />`.

```ts
import { getFaqs } from '@/data/faq';
const marketFaqs = getFaqs(market);
const faqJsonLd = buildFaqJsonLd(marketFaqs);
<FaqList faqs={marketFaqs} />
```

CTA voseo línea 51:

```ts
title={market === 'ar'
  ? 'Cuando ya entendés el producto, el mejor paso es probar tu logo'
  : 'Cuando ya entiendes el producto, el mejor paso es probar tu logo'}
```

---

## Cambio D — Página Proceso (crítico)

`/cl/proceso` (y PE/CO/MX) usa `src/data/process.ts` **sin market**. El paso 3 habla de transferencia + **BBVA**. El paso 5: `Por correo a domicilio o sucursal`. Falso.

### D.1 `src/data/process.ts`

Mantener `processSteps` para AR. Agregar:

```ts
export function getProcessSteps(market: MarketCode): ProcessStep[] {
  if (market === 'ar') return processSteps;

  return [
    {
      step: 1,
      title: 'Subes tu logo',
      description:
        'Eliges el material a marcar y subes tu logo. El sistema lo procesa, verifica que sea factible de fabricar y lo prepara para la muestra.',
    },
    {
      step: 2,
      title: 'Ves cómo quedaría',
      description:
        'En minutos ves cómo quedaría en el material que elegiste. Sirve para verificar que el diseño esté bien antes de pagar.',
    },
    {
      step: 3,
      title: 'Confirmas medida y pagas online',
      description:
        'El sistema muestra las medidas posibles. Eliges la tuya y pagas el total (producto + envío DHL) con tarjeta de crédito o débito en moneda local.',
    },
    {
      step: 4,
      title: 'Fabricamos el sello en CNC',
      description:
        'Precisión milimétrica en nuestro taller de Mar del Plata. Se prueba, se verifica y te enviamos una foto para que veas cómo quedó.',
    },
    {
      step: 5,
      title: 'DHL lo lleva a tu puerta',
      description:
        'Despachamos por DHL Express con seguimiento por email o WhatsApp. El precio de envío ya está en el checkout.',
    },
    {
      step: 6,
      title: 'Lo usas',
      description:
        'Te llega listo para usar. Después de la compra tienes a nuestro equipo para asesorarte cuando lo necesites.',
    },
  ];
}
```

### D.2 `src/components/pages/ProcesoPageContent.tsx`

- `Timeline steps={getProcessSteps(market)}` en lugar de `processSteps`.
- Facto “Calor o presión”: si `market !== 'ar'`, tuteo: `Puedes usarlo con hornalla, soplete, prensa o remachadora...`
- CTA final (líneas 99–101), solo internacional:

```ts
title={market === 'ar'
  ? 'Empezá por el diseñador y dejá que el sistema ordene el pedido'
  : 'Empieza por el diseñador y deja que el sistema ordene el pedido'}
copy={market === 'ar'
  ? 'Subí tu logo, elegí uso, cargá datos y avanzá con muestra, medida y precio antes de fabricar.'
  : 'Sube tu logo, elige uso, carga tus datos y avanza con muestra, medida y precio antes de fabricar.'}
```

Strings AR = los actuales, carácter por carácter.

### D.3 Metadata `src/app/[market]/proceso/page.tsx`

Hoy: `subí tu logo, elegí medida...`

```ts
const DESCRIPTION =
  'Pasos para comprar un sello personalizado: sube tu logo, elige medida y material, revisa la muestra y recíbelo por DHL Express.';
```

Este archivo **solo** corre en mercados internacionales (`requireInternationalMarket`), así que se puede tuteo directo sin ramificar AR.

---

## Cambio E — Hero home + CTA final

### E.1 `src/lib/markets/home.ts`

Agregar `getHomeHeroTitle`. Reescribir **solo** ramas internacionales de subtitle y final CTA.

```ts
export function getHomeHeroTitle(market: MarketCode): string {
  if (!isInternationalMarket(market)) {
    return 'Más que una herramienta, una forma de contar tu historia.';
  }
  return getMarketLocalCopy(market).heroTitle;
}

export function getHomeHeroSubtitle(market: MarketCode): string {
  if (market === 'ar') {
    return 'Sellos de bronce personalizados para marcar cuero, madera, alimentos y packaging. Subí tu logo, elegí cómo lo vas a usar y recibí muestra, medida y precio antes de fabricar.';
  }
  return getMarketLocalCopy(market).heroSubtitle;
}

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

`getHomePrimaryCta` / `getHomeSecondaryCta` no se tocan (infinitivos / “Cómo funciona”).

`buildHomeWebsiteJsonLd` description internacional: usar `getMarketLocalCopy(market).heroSubtitle` (o al menos `localTerm` + país). Hoy dice solo `Sellos de bronce personalizados con envío DHL a ${country}`.

### E.2 `src/components/HomeLanding.tsx` ~línea 132

```tsx
<Hero
  title={getHomeHeroTitle(market)}
  subtitle={getHomeHeroSubtitle(market)}
```

---

## Cambio F — Strip positivo en lugar del aviso amarillo (solo home)

**Problema:** `HomeLanding.tsx` líneas 139–145 renderizan `ImportDutiesNotice` debajo del hero.

### F.1 Nuevo `src/components/market/MarketTrustStrip.tsx`

Server component. Mismos tokens (`--alcohn-line`, `--alcohn-surface`, `--alcohn-bronze`):

- Ítems: `Envío DHL Express a ${country} en ${dhlDays} días hábiles` · `Fabricación en 72 h hábiles` · `Pagas en …` (capitalizar `currencyPhrase`)
- Nota chica: `El total no incluye impuestos de importación del país de destino.` + link `Ver detalle` → `marketPath(market, '/politica-envios')`

### F.2 Home: misma `<section>`, cambiar el interior a `<MarketTrustStrip market={...} />`.

**NO borrar** `ImportDutiesNotice`. Sigue en wizard, checkout, productos, sellos, abecedarios, mango-de-golpe.

---

## Cambio G — Trust stats

### G.1 `src/data/trustStats.ts`

Array original intacto. Agregar:

```ts
export function getTrustStats(market: MarketCode): TrustStat[] {
  if (market === 'ar') return trustStats;
  return trustStats.map((stat) =>
    stat.value === 'Envíos'
      ? { value: 'Envíos', label: 'DHL a 5 países', mobileLabel: 'DHL a 5 países' }
      : stat
  );
}
```

### G.2 `src/components/TrustStatsStrip.tsx`

Es client: `useMarket()` + `getTrustStats(market)`. No tocar GSAP. `parseStatValue('Envíos')` sigue dando `null` (igual que hoy).

---

## Cambio H — Sección “Comprar desde {País}”

Nuevo `src/components/market/InternationalBuySteps.tsx` (server). Patrón visual de sections de `HomeLanding` (`atelier-page`, `technical-sheet`, `craft-label`).

Pasos:

1. **Sube tu logo y mira la muestra** — Eliges uso y medida en el diseñador online y ves cómo queda tu marca antes de pagar. El precio final aparece al instante, con envío incluido.
2. **Fabricamos tu sello en 72 h hábiles** — Mecanizamos el bronce en CNC en Mar del Plata, Argentina. Pagas online en moneda local (tarjeta de crédito o débito). En el título de esta card, CL puede decir “tu cuño”; MX “tu sello a fuego”; CO “tu sello al calor”; PE “tu sello”. Si se unifica, usar “tu sello” en los 4 para no ramificar markup.
3. **DHL lo lleva a tu puerta en {country}** — Llega en `{dhlDays}` días hábiles desde el despacho. Impuestos de importación: DHL te contacta y los pagas directo a DHL.

CTAs: `Subir logo y ver precio` → `marketBuyPath`; `Ver política de envíos` → `/politica-envios`.

Insertar en `HomeLanding.tsx` **después** de `<TrustStatsStrip />` y **antes** de `#lo-transforma`. `market === 'ar'` → no renderizar.

---

## Cambio I — SEO home internacional

`src/app/[market]/page.tsx` hoy:

```ts
title: marketSeoTitle(SITE_DEFAULT_TITLE, market),
description: marketSeoDescription(SITE_DEFAULT_DESCRIPTION, market),
```

Eso produce description con **“Envío a todo Argentina” + “Envío DHL a Chile”**.

```ts
const HOME_TITLES: Record<InternationalMarketCode, string> = {
  cl: 'Cuños de bronce personalizados | Envío DHL a Chile | Alcohn',
  pe: 'Sellos de bronce personalizados | Envío DHL a Perú | Alcohn',
  co: 'Sellos al calor de bronce personalizados | Envío DHL a Colombia | Alcohn',
  mx: 'Sellos a fuego y hierros de marcar de bronce | Envío DHL a México | Alcohn',
};

return createPageMetadata({
  title: HOME_TITLES[market],
  description: getMarketLocalCopy(market).heroSubtitle,
  path: '/',
  market,
});
```

No tocar `marketSeoTitle` (lo usan otras páginas). No tocar hreflang / sitemap.

`src/app/[market]/buy/layout.tsx` es solo internacional: cambiar description de `Subí tu logo, elegí...` a `Sube tu logo, elige material y medida. Cotiza y fabrica tu sello de bronce CNC en minutos.`

---

## Cambio J — Wizard (solo strings ya ramificados o claramente internacionales)

No migrar todo el wizard (fase 2). Sí corregir mentiras visibles:

1. **`src/components/BuyWizard.tsx` ~1998** (mobile trust strip, todos los mercados):

```tsx
<span>{market === 'ar' ? 'Envíos a todo el país' : 'Envío DHL internacional'}</span>
```

`market` ya está en el wizard. Si en ese bloque no está en scope, usar `useMarket()`.

2. **Resumen internacional ~2876–2880** (este bloque ya es solo intl):

```ts
// HOY
Confirmá tu pedido internacional
Revisá el resumen y continuá al checkout para pagar en moneda local con envío DHL.

// DESPUÉS
Confirma tu pedido internacional
Revisa el resumen y continúa al checkout para pagar en moneda local con envío DHL.
```

No tocar ramas AR de transferencia / Factura C / seña.

---

## Cambio K — Landings `/[market]/sellos/[slug]` + footer MX

Estas URLs son destino de Ads (`Keywords_Ads_v2_por_pais.md`). Hoy el H1/SEO es el de AR.

### K.1 Helper en `localCopy.ts` o `src/lib/markets/useCaseCopy.ts`

No clonar todo `stampUseCases.ts`. Wrapper:

```ts
export function getStampUseCaseSeo(useCase: StampUseCase, market: MarketCode): { title: string; description: string } {
  if (market === 'ar') {
    return { title: useCase.seoTitle, description: useCase.seoDescription ?? useCase.description };
  }
  const copy = getMarketLocalCopy(market);
  const country = getMarketConfig(market).countryName;
  const leather = copy.leatherWord;
  // reemplazar "envío a todo el país" / "Alcohn Argentina" en description
  const description = (useCase.seoDescription ?? useCase.description)
    .replace(/envío a todo el país/gi, `envío DHL a ${country}`)
    .replace(/Alcohn Argentina/gi, `Alcohn · ${country}`)
    .replace(/\bcuero\b/gi, market === 'mx' ? 'piel' : '$&'); // solo MX; cuidado de no romper "cuerina" — usar word boundary y no tocar cuerina

  const titleByMarket: Partial<Record<string, Partial<Record<InternationalMarketCode, string>>>> = {
    'para-cuero': {
      cl: `Cuño de bronce para cuero personalizado | Envío DHL a Chile | Alcohn`,
      pe: `Sello de bronce para cuero personalizado | Envío DHL a Perú | Alcohn`,
      co: `Sello al calor para cuero personalizado | Envío DHL a Colombia | Alcohn`,
      mx: `Sello a fuego y hierro de marcar para piel | Envío DHL a México | Alcohn`,
    },
    'para-madera': {
      cl: `Cuño de bronce para madera personalizado | Envío DHL a Chile | Alcohn`,
      pe: `Sello de bronce para madera personalizado | Envío DHL a Perú | Alcohn`,
      co: `Sello al calor para madera personalizado | Envío DHL a Colombia | Alcohn`,
      mx: `Sello a fuego para madera personalizado | Envío DHL a México | Alcohn`,
    },
    'para-pan': {
      cl: `Cuño de bronce para pan personalizado | Envío DHL a Chile | Alcohn`,
      pe: `Sello de bronce para pan personalizado | Envío DHL a Perú | Alcohn`,
      co: `Sello al calor para pan personalizado | Envío DHL a Colombia | Alcohn`,
      mx: `Sello a fuego para pan y tortilla | Envío DHL a México | Alcohn`,
    },
  };

  const override = titleByMarket[useCase.slug]?.[market];
  return {
    title: override ?? `${copy.localTerm} personalizado | Envío DHL a ${country} | Alcohn`,
    description,
  };
}
```

Usar en `generateMetadata` de `src/app/[market]/sellos/[slug]/page.tsx` **en lugar de** `marketSeoTitle(useCase.seoTitle)` + `marketSeoDescription(description)` (evita “Alcohn Argentina | Envío DHL a México”).

### K.2 CTA de esa página (~322–324)

Archivo `[market]/sellos/[slug]/page.tsx` es solo internacional:

```ts
title={`Diseña tu ${/* localTerm corto */} para ${materialLabel} con envío DHL`}
copy="Sube tu logo, elige medida, revisa la muestra y compra en moneda local con envío DHL a tu país."
```

Para MX, `materialLabel` de `para-cuero` → `piel` (no `cuero`).

### K.3 Footer `FooterProductLinks`

```tsx
<Link href={marketPath(market, '/sellos/para-cuero')}>
  {market === 'mx' ? 'Para piel' : 'Para cuero'}
</Link>
```

El slug `/sellos/para-cuero` **no se cambia** (rompe Ads y sitemap). Solo el label visible.

---

## Cambio L — Legales (ya son solo internacionales)

`src/lib/markets/legal.ts` — estas funciones no las usa AR:

| Hoy | Después |
|---|---|
| `Revisá el paquete al recibirlo... escribinos con fotos...` | `Revisa el paquete al recibirlo. Si llega dañado o incompleto, escríbenos con fotos del embalaje, del contenido y del número de pedido.` |
| `Contactanos dentro de los 10 días...` | `Contáctanos dentro de los 10 días corridos desde la recepción del paquete para reportar defectos de fabricación.` |
| `Para envíos dañados, escribinos dentro de las 72 horas...` | `Para envíos dañados, escríbenos dentro de las 72 horas de recibido con evidencia del embalaje.` |

`ImportDutiesNotice` (“DHL te avisará… y los pagarás”) es neutro: no tocar.

Checkout failed/success internacionales (`escribinos`): tuteo `escríbenos` en `src/app/[market]/checkout/failed/page.tsx` y `success/page.tsx` (rutas solo intl).

---

## Tests a agregar / no romper

- Existentes en `src/lib/markets/__tests__/` deben seguir verdes.
- Nuevos:
  - `localCopy.test.ts` (términos, tuteo, piel en MX).
  - `getFaqs('ar')` === `faqs` (referencia).
  - `getFaqs('pe')` no contiene `correo argentino`, `$6000`, `seña`, `Factura C`, `BBVA`.
  - `getProcessSteps('ar')` === `processSteps`.
  - `getProcessSteps('cl')` no contiene `BBVA` ni `sucursal`.
  - `getHomeHeroTitle('ar')` string actual; `'cl'` empieza con `Cuños`.
  - `MARKETS.pe.countryName === 'Perú'`.

---

## QA final (obligatorio)

1. `npx tsc --noEmit` y `npx vitest run` verdes.
2. `git diff`: cero cambio de comportamiento para `market === 'ar'`. Comparar `/`, `/faq`, `/proceso` contra `main`.
3. Abrir `/cl` `/pe` `/co` `/mx`:
   - H1 + subtítulo con término del país; MX dice **piel**.
   - Strip positivo (no amarillo) + link política de envíos.
   - Stats: `DHL a 5 países`.
   - Sección “Comprar desde {País}”.
   - CTA final con frase de moneda.
   - Footer: “Perú” / “México” con tilde; MX “Para piel”.
   - Ningún `subí/elegí/mirá/pagá` en bloques nuevos.
4. `/cl/faq` … `/mx/faq`: no correo argentino, `$6000`, seña, transferencia bancaria, Factura C, calentador eléctrico como producto a la venta. Precio DHL con ISO (`$ 37.000 (CLP)`, `S/ 136.00 (PEN)`, etc.).
5. `/cl/proceso` …: no BBVA, no sucursal Correo Argentino.
6. View-source `/cl`: title con “Cuños de bronce…”; description **sin** “todo Argentina”; JSON-LD FAQ internacional.
7. `ImportDutiesNotice` sigue en wizard, checkout, productos, sellos, abecedarios, mango-de-golpe.
8. Mobile 390px: strip y 3 pasos sin scroll horizontal.
9. Wizard mobile en `/pe/buy`: trust strip no dice “todo el país”.

---

## Commits sugeridos

1. `fix(intl): tildes en Perú y México + localCopy por país`
2. `fix(intl): FAQ y proceso sin copy argentino en CL/PE/CO/MX`
3. `feat(intl): home personalizada por país (hero, strip, stats, 3 pasos, SEO)`
4. `fix(intl): wizard, landings de uso, footer MX y legales en tuteo`

---

## Fuera de alcance (fase 2 — no implementar ahora)

- Migración masiva voseo→tuteo del wizard completo, Sobre Alcohn, Casos reales, Cómo usar, materialUsageGuide.
- Mostrar Yape / PagoEfectivo / PSE / Nequi / OXXO / SPEI / Webpay antes de confirmar dLocal.
- Renombrar slug `/sellos/para-cuero` → `/para-piel` (rompería Ads).
- Prueba social por país / contador de envíos por destino.
- Catálogo estándar internacional.

---

## Checklist de archivos

| Archivo | Acción |
|---|---|
| `src/lib/markets/config.ts` | Perú / México con tilde |
| `src/lib/markets/localCopy.ts` | **Nuevo** |
| `src/lib/markets/useCaseCopy.ts` | **Nuevo** (SEO landings) |
| `src/lib/markets/home.ts` | title, subtitle, final CTA, json-ld |
| `src/lib/markets/legal.ts` | tuteo |
| `src/data/faq.ts` | `getFaqs` |
| `src/data/process.ts` | `getProcessSteps` |
| `src/data/trustStats.ts` | `getTrustStats` |
| `src/components/pages/FaqPageContent.tsx` | getFaqs + tuteo CTA |
| `src/components/pages/ProcesoPageContent.tsx` | steps + tuteo CTA |
| `src/components/HomeLanding.tsx` | hero title, TrustStrip, BuySteps |
| `src/components/TrustStatsStrip.tsx` | stats por market |
| `src/components/market/MarketTrustStrip.tsx` | **Nuevo** |
| `src/components/market/InternationalBuySteps.tsx` | **Nuevo** |
| `src/components/market/FooterMarketClient.tsx` | label piel en MX |
| `src/components/BuyWizard.tsx` | trust strip + resumen intl |
| `src/app/[market]/page.tsx` | titles/descriptions home |
| `src/app/[market]/proceso/page.tsx` | meta tuteo |
| `src/app/[market]/buy/layout.tsx` | meta tuteo |
| `src/app/[market]/sellos/[slug]/page.tsx` | SEO local + CTA tuteo |
| `src/app/[market]/checkout/failed/page.tsx` | escríbenos |
| `src/app/[market]/checkout/success/page.tsx` | escríbenos |
| `src/lib/markets/__tests__/localCopy.test.ts` | **Nuevo** |
| tests config / faq / process / home | aserciones nuevas |
