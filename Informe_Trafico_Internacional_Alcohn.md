# Informe de comportamiento — Visitantes internacionales

**Alcohn Sellos · alcohnsellos.com**
Período analizado: **28/05/2026 → 18/08/2026** (83 días)
Fuente: tabla `web_analytics_events` de Supabase (28.195 eventos). Solo lectura, no se modificó nada.

---

## 0. Nota metodológica (importante)

La tabla `web_analytics_events` **no guarda el país del visitante**. Solo guarda la IP.
Para este informe geolocalicé las ~4.700 IPs distintas con una base GeoIP y después **validé país por país** cruzando contra los teléfonos y mails que dejaron en el cotizador.

Esa validación detectó **falsos positivos**: varios bloques de IP (`148.222.x`, `148.227.x`, `138.84.x`, `104.28.115`) figuran como México/Chile en la base GeoIP pero **son usuarios argentinos** (todos los teléfonos son +54: Córdoba, Rosario, Salta, Río Gallegos, Bariloche). Son rangos de un operador móvil argentino mal clasificados.

Los números de abajo ya están **corregidos** por eso.

> **Recomendación #0:** agregar una columna `pais` a `web_analytics_events` (por header `x-vercel-ip-country` o similar). Hoy no se puede segmentar por país sin este trabajo manual.

---

## 1. Resumen ejecutivo

| País | Sesiones | Páginas vistas | % Mobile | Llegaron al cotizador | Dejaron contacto | Llegaron a pago | **Compras** |
|------|---------:|---------------:|---------:|----------------------:|-----------------:|----------------:|------------:|
| 🇵🇪 Perú | 77 | 84 | 84% | 47 | 5 | 1 | **0** |
| 🇨🇱 Chile | 71 | 103 | 76% | ~7 | 3 | 0 | **0** |
| 🇲🇽 México | 28 | 37 | 75% | 5 | 3 | 2 | **0** |
| 🇨🇴 Colombia | 19 | 22 | 53% | 0 | 0 | 0 | **0** |
| **Total extranjero** | **195** | **246** | ~78% | ~59 | **11** | 3 | **0** |
| 🇦🇷 Argentina (referencia) | 6.087 | 10.872 | 90% | 3.764 | 1.402 | 306 | — |

### Los 3 hallazgos que importan

1. **No hay ninguna venta internacional.** Cero. Ni México, ni Perú, ni Chile, ni Colombia. Lo que sí hay son **11 leads reales con teléfono y mail** que quedaron sin cerrar.
2. **Los pagos internacionales están apuntando al entorno de prueba de dLocal** (`api-sbx.dlocalgo.com`). Aunque alguien quisiera pagar, no podría. Esto por sí solo explica el 0 de conversión.
3. **Chile y Colombia están cayendo en las landings de México.** El tráfico de Google Ads de esos países aterriza en `/mx/...`, no en `/cl/...` ni `/co/...`. Ven precios y contexto equivocados.

---

## 2. El tema México (verificación puntual)

**No tenemos ninguna venta de México.** Revisé una por una las sesiones mexicanas cruzadas contra `mockup_solicitudes` y `ordenes`:

- La **única** solicitud del período con `orden_id` cargada (27/06) corresponde al teléfono **+54 2964 515365 → Río Gallegos, Argentina**. La IP figuraba como mexicana pero es el falso positivo mencionado arriba. **No es una venta mexicana.**
- Las 3 solicitudes mexicanas genuinas **nunca iniciaron checkout** (`checkout_iniciado_at` en null):

| Fecha | Contacto | Estado del mockup | ¿Compró? |
|-------|----------|-------------------|----------|
| 12/07 | jony_orrantia@hotmail.com — +52 311 246 6647 | completado | No |
| 12/08 | compras@rivieraminerals.com — +52 871 116 5223 (Torreón) | completado | No |
| 14/08 | psicologojimeno@gmail.com — +52 729 876 1157 (Toluca) | procesando | No |

**Nota:** `compras@rivieraminerals.com` es una cuenta de empresa. Es el lead internacional de mayor valor potencial del período y quedó sin seguimiento.

### ⚠️ Bug detectado en el formulario de contacto

Los teléfonos internacionales se guardan con **el prefijo +54 pegado adelante del código real del país**:

- `+54 52 3112466647` → debería ser `+52 311 246 6647`
- `+54 871 116 5223` → debería ser `+52 871 116 5223`
- `+54 729 876 1157` → debería ser `+52 729 876 1157`

Con ese formato **el bot de WhatsApp no puede contactarlos**. Nunca les llegó el mensaje. Curiosamente los leads peruanos sí quedaron bien (`+51 956 774301`, `+51 928 555209`, etc.), así que el problema parece estar en cómo el campo interpreta ciertos formatos de entrada, no en todos.

---

## 3. Dónde se pierde cada país

### 🇵🇪 Perú — el mejor tráfico, el peor cierre

Es el único país con **campaña paga activa**: 59 de 77 sesiones vienen de `utm_source=meta / paid_social`.

El embudo:

```
77 sesiones que entran
   ↓
47 llegan a /pe/buy (61%)        ← el anuncio manda directo al cotizador
   ↓
33 suben el logo (70%)           ← bien
   ↓
11 eligen material (33%)         ← 🔴 SE CAEN 22 ACÁ (-67%)
   ↓
 5 dejan contacto (45%)
   ↓
 3 ven medidas
   ↓
 1 llega a pago
   ↓
 0 compran
```

**El punto de fuga es entre "subir logo" y "elegir material": se pierden 2 de cada 3.** Es el mismo paso donde Argentina también pierde gente, pero en Perú la caída es mucho más pronunciada.

**Leads peruanos sin cerrar (4):** cahuana.arq@gmail.com, alice.artexania@gmail.com, vasquezmoralesmireya@gmail.com, johanssalasb@gmail.com. Todos con teléfono +51 válido.

### 🇨🇱 Chile — llega a la página equivocada

71 sesiones, y el destino principal **no es `/cl/`**:

| Página | Sesiones |
|--------|---------:|
| `/mx/sellos/para-madera` | 28 |
| `/mx/sellos/para-cuero` | 23 |
| `/cl/sellos/para-pan` | 4 |
| `/cl/productos` | 3 |
| `/cl/abecedarios` | 3 |
| resto `/cl/...` | ~8 |

**Más de 50 de 71 sesiones chilenas terminan en la versión mexicana del sitio.** Los links traen `gad_campaignid=24109097473` — es una campaña de Google Ads apuntando a `/mx/` que está sirviendo a Chile.

Resultado: solo ~7 tocan el cotizador, 3 dejan contacto (2 con +56 válido: enzomorety@gmail.com, 24ramirezjhon@gmail.com), **0 compran**.

### 🇨🇴 Colombia — el caso más claro de desperdicio

19 sesiones. **Ninguna abrió el cotizador. Ninguna dejó contacto.** Cero eventos de wizard.

| Página | Sesiones |
|--------|---------:|
| `/mx/sellos/para-cuero` | 7 |
| `/mx/sellos/para-madera` | 6 |
| `/sellos/para-pan` (versión AR) | 3 |
| `/sellos/para-cuero` (versión AR) | 2 |
| `/co/sellos/para-madera` | **1** |

De 19 visitas colombianas, **una sola** vio la versión colombiana. El resto vio precios mexicanos o argentinos. Con eso, el rebote del 100% es esperable.

También es el único país mayoritariamente **desktop** (53% mobile vs 75-84% del resto).

### 🇲🇽 México — poco volumen, pero el que entra avanza

28 sesiones, todas orgánicas/directas (no hay campaña paga apuntando a México en el período).
Es el país con **mejor tasa de avance en el cotizador**: de 5 que entraron, 4 subieron logo, 3 dejaron contacto y 2 llegaron a pago. Se caen justo en el pago — que es exactamente donde está el sandbox de dLocal.

---

## 4. Problemas concretos, en orden de impacto

| # | Problema | Evidencia | Impacto |
|---|----------|-----------|---------|
| 1 | **dLocal en sandbox** | `DLOCAL_API_BASE=https://api-sbx.dlocalgo.com` en `.env.local` | Nadie del exterior puede pagar. 3 sesiones llegaron al paso de pago y ninguna pudo completar. |
| 2 | **Google Ads CL y CO apuntan a `/mx/`** | `gad_campaignid=24109097473` sirviendo a Chile y Colombia | ~50 sesiones CL + 13 CO viendo país y precios equivocados. Es plata gastada que rebota. |
| 3 | **Teléfonos internacionales se guardan con +54 adelante** | 3 leads MX inutilizables | El bot de WhatsApp no los alcanza. 11 leads internacionales, varios sin poder contactar. |
| 4 | **Caída fuerte en el paso logo → material** | Perú: 33 → 11 (-67%) | Es el cuello de botella del cotizador. Peor en mobile, que es el 78-84% del tráfico extranjero. |
| 5 | **Analytics sin campo país** | `web_analytics_events` no tiene columna de país | Hoy no se puede medir esto sin geolocalizar IPs a mano. |
| 6 | **11 leads internacionales sin seguimiento** | Ver detalle en secciones 2 y 3 | Incluye una cuenta corporativa mexicana (Riviera Minerals). |

---

## 5. Qué haría primero

**Esta semana**

1. Pasar dLocal a producción (o desactivar el checkout internacional y derivar a WhatsApp mientras tanto). Sin esto, todo lo demás no sirve.
2. Corregir el prefijo telefónico internacional en el formulario del cotizador.
3. Contactar a mano los 11 leads. Empezar por `compras@rivieraminerals.com`.

**Próximas dos semanas**

4. Reapuntar las campañas de Google Ads: Chile → `/cl/`, Colombia → `/co/`. Verificar que la geo-segmentación del anuncio coincida con la landing.
5. Agregar la columna `pais` a `web_analytics_events`.

**Después**

6. Atacar el paso logo → material del cotizador en mobile. Es donde se cae la mayoría, argentinos incluidos (2.773 → 2.144 en AR, 33 → 11 en PE). Vale la pena mirar ese paso en un celular real.

---

## 6. Advertencia de seguridad (no relacionada, pero la vi)

Supabase reporta **15 tablas con Row Level Security desactivado**, incluidas `clientes`, `ordenes`, `direcciones` y `web_analytics_events`. Con la clave pública (`anon`) cualquiera podría leerlas o modificarlas.

No apliqué ningún cambio (pediste solo lectura, y activar RLS sin políticas bloquearía el sitio). Pero conviene revisarlo pronto. El SQL de remediación queda a disposición si querés que lo preparemos con las políticas correspondientes.

---

*Informe generado el 18/08/2026. Datos leídos de Supabase sin modificaciones.*
