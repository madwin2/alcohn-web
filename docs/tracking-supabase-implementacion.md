# Tracking de potenciales clientes con Supabase

Fecha: 2026-05-28

## Objetivo

Implementar un sistema base de medicion del comportamiento de potenciales clientes:
- Con consentimiento de cookies.
- Con eventos guardados en Supabase.
- Con eventos de conversion iniciales (page view, clicks y formulario de contacto).

## Lo que habia que hacer

- [x] Diseñar modelo de eventos para guardar navegacion y UTMs.
- [x] Crear endpoint server-side para persistir eventos en Supabase.
- [x] Implementar consentimiento de cookies en frontend.
- [x] Instrumentar eventos base de conversion.
- [x] Dejar SQL de creacion de tabla e indices para Supabase.
- [x] Documentar estado, pendientes y verificacion.

## Lo que se hizo en esta iteracion

### 1) Consentimiento de cookies

- Se creo `src/components/CookieConsentBanner.tsx`.
- Muestra banner con dos opciones:
  - Solo necesarias.
  - Aceptar analitica.
- Se guarda estado en cookie `alcohn_cookie_consent_v1`.
- Si acepta analitica, se registra evento `cookie_consent_accepted`.

### 2) Tracking frontend

- Se agrego `src/lib/analytics/cookies.ts`:
  - Gestion de consentimiento.
  - Generacion de `visitor_id` (cookie persistente).
  - Generacion de `session_id` (sessionStorage, expira por inactividad).
- Se agrego `src/lib/analytics/client.ts`:
  - Funcion `trackEvent(...)`.
  - Envio a `/api/analytics/events`.
  - Captura automatica de URL, referrer y UTMs.
- Se agrego `src/components/AnalyticsProvider.tsx`:
  - Registra `page_view` cuando hay consentimiento analitico.

### 3) Instrumentacion de eventos de negocio

- `src/components/WhatsappButton.tsx`
  - Registra `whatsapp_click`.
- `src/components/ContactForm.tsx`
  - Registra `lead_form_start` en la primera interaccion del usuario.
  - Registra `lead_form_submit` al enviar la consulta.

### 4) Persistencia en Supabase

- Se agrego endpoint `src/app/api/analytics/events/route.ts`.
- Valida payload minimo (`eventName`, `pagePath`) y longitudes.
- Persiste en tabla `public.web_analytics_events`.
- Guarda `ip` y `user_agent` desde headers.

### 5) Esquema SQL y tipado

- Se agrego `docs/sql/002_web_analytics_events.sql` con:
  - `CREATE TABLE public.web_analytics_events`.
  - Indices por fecha, evento, visitante, sesion y campaña.
- Se extendio `src/lib/supabase/types.ts` con tipos de la tabla:
  - `WebAnalyticsEventRow`
  - `WebAnalyticsEventInsert`
  - Registro en `AlcohnDatabase.public.Tables`.

### 6) Integracion en layout global

- `src/app/layout.tsx` ahora monta:
  - `<AnalyticsProvider />`
  - `<CookieConsentBanner />`

## Que falta para cerrar al 100%

- [ ] Ejecutar `docs/sql/002_web_analytics_events.sql` en Supabase (si aun no se corrio).
- [ ] Publicar/actualizar pagina de Politica de Cookies y privacidad en el sitio.
- [ ] Agregar opcion visible para revocar/cambiar consentimiento luego de aceptar.
- [ ] Definir dashboard en Supabase/Metabase con embudo:
      `page_view -> whatsapp_click/lead_form_start -> lead_form_submit`.
- [ ] (Opcional) Unificar eventos anonimos con `cliente_id` cuando el lead se identifica.

## Como verificar rapido

1. Levantar web y entrar en una pagina.
2. Confirmar que aparece banner de cookies.
3. Elegir "Solo necesarias":
   - No deberian guardarse eventos nuevos.
4. Recargar, limpiar cookies y elegir "Aceptar analitica":
   - Debe registrarse `cookie_consent_accepted` y luego `page_view`.
5. Hacer click en un boton de WhatsApp:
   - Debe registrarse `whatsapp_click`.
6. Completar formulario de contacto:
   - Deben registrarse `lead_form_start` y `lead_form_submit`.

## Notas

- El tracking esta pensado para no romper UX: si falla la API, no bloquea la navegacion.
- Se evita tracking analitico si no hay consentimiento.
