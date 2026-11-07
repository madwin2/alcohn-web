# Guía de implementación: micro-conversiones para Google Ads (Muestra generada + Click WhatsApp)

**Objetivo:** medir los pasos intermedios del embudo (clic → muestra → compra) enviando dos eventos nuevos al dataLayer de GTM. Hoy solo se mide la compra internacional (`purchase_international`, ya implementado en `src/app/[market]/checkout/success/page.tsx`).

**Regla general:** usar SIEMPRE el helper existente `pushGtmEvent` de `src/lib/analytics/gtm.ts`. No agregar scripts nuevos, no tocar el Meta Pixel, no instalar dependencias. El tracking nunca debe romper el flujo (los helpers ya son fail-safe).

---

## Evento 1: `mockup_generado`

**Cuándo:** cada vez que un usuario genera exitosamente una muestra/mockup de su sello.

**Dónde:**

1. `src/components/BuyWizard.tsx` — función `generateMockup` (~línea 1273, llama a `/api/mockups/generate`). Disparar el evento cuando la respuesta es exitosa (cuando se obtiene la URL/imagen del mockup, antes de setear el estado). Si el wizard permite regenerar, disparar **solo la primera vez por sesión del wizard** (guard con `useRef`).
2. Buscar cualquier otro punto del front que llame a `/api/mockups/generate` o `/api/mockups/generate-ai` (ej: flujo de abecedarios si genera preview) y aplicar el mismo patrón.

**Payload:**

```ts
import { pushGtmEvent } from '@/lib/analytics/gtm';

pushGtmEvent('mockup_generado', {
  market,            // 'ar' | 'cl' | 'pe' | 'co' | 'mx' — obtener de useMarket() o params
  material,          // si está disponible en el estado del wizard (ej: 'cuero', 'madera')
  medida,            // si está disponible (ej: '4x2')
});
```

Si `market`/`material`/`medida` no están accesibles en ese scope, enviar el evento igual solo con los campos disponibles — no refactorizar el wizard para conseguirlos.

## Evento 2: `click_whatsapp`

**Cuándo:** el usuario hace clic en cualquier link/botón que abre WhatsApp (`wa.me`).

**Dónde (todos los touchpoints con `wa.me`):**

- `src/components/WhatsappButton.tsx` (~línea 71, `handleClick`) — el botón flotante principal.
- `src/components/buy/ContactStep.tsx`
- `src/components/ContactForm.tsx`
- `src/components/Footer.tsx`
- `src/components/pages/ContactoPageContent.tsx`
- `src/app/checkout/page.tsx`
- `src/components/BuyWizard.tsx` (si tiene CTA de WhatsApp propio)

**Payload:**

```ts
pushGtmEvent('click_whatsapp', {
  ubicacion: 'boton_flotante', // identificador del componente: 'footer', 'contacto', 'checkout', 'buy_wizard', etc.
  market,                      // si está disponible en el contexto
});
```

Disparar el evento de forma síncrona ANTES de abrir el link (el push a dataLayer es síncrono, no demora la navegación). No usar `setTimeout` ni bloquear la apertura de WhatsApp.

## Criterios de aceptación

1. `npx tsc --noEmit` sin errores.
2. En dev, con la consola abierta: generar un mockup → `window.dataLayer` contiene `{event: 'mockup_generado', ...}` una sola vez; clic en cada botón de WhatsApp → `{event: 'click_whatsapp', ubicacion: ...}`.
3. El Meta Pixel y el resto del analytics quedan sin cambios.
4. No se agregó ninguna librería ni script externo.

---

## Parte 2 — Configuración en Google Ads y GTM (la hace Julián, no Cursor)

### En Google Ads (Objetivos → Conversiones → Nueva acción → Sitio web → Manualmente con código):

| Conversión | Categoría | Recuento | Valor | Acción de optimización |
|---|---|---|---|---|
| Muestra generada | Enviar formulario de clientes potenciales | Una | Sin valor (o valor fijo bajo, ej. 5.000 ARS) | **Principal** (mientras no haya compras, es el proxy para que Smart Bidding aprenda) |
| Click WhatsApp | Contacto | Una | Sin valor | **Secundaria** (solo observación) |

Anotar el ID y la etiqueta de conversión de cada una (el ID es el mismo de la cuenta: 18358650286; cambia la etiqueta).

### En GTM (tagmanager.google.com):

1. **Activadores** (2 nuevos, tipo "Evento personalizado"): nombre del evento `mockup_generado` y `click_whatsapp`.
2. **Etiquetas** (2 nuevas, tipo "Seguimiento de conversiones de Google Ads"): ID de conversión `18358650286`, la etiqueta de conversión propia de cada una, sin valor ni transaction ID. Activador: su evento correspondiente.
3. **Publicar** el contenedor.
4. Verificar con Vista previa de GTM: generar una muestra y clickear WhatsApp deben disparar sus tags.

### Nota sobre Meta

Nada de esto toca las campañas de Meta: los eventos van al dataLayer y solo los consumen los tags de Google Ads en GTM. El Meta Pixel sigue funcionando igual. (Mejora opcional futura: espejar estos mismos eventos como `Lead` al Pixel para que Meta también optimice con ellos — no incluido en esta guía.)
