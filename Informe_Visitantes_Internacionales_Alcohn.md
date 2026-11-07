# Informe de comportamiento — visitantes internacionales (Alcohn Sellos)

**Fecha:** 18 de agosto de 2026
**Fuente:** tabla `web_analytics_events` de Supabase (28.195 eventos)
**Período con datos:** 28/05/2026 → 18/08/2026 (~12 semanas)
**Alcance:** Perú, Chile, Colombia y México, comparados contra la base argentina
**Nota:** análisis de sólo lectura. No se modificó ningún dato.

---

## 0. Cómo se armó (y qué tan confiable es)

La tabla de analytics **no guarda el país del visitante**. No hay columna `pais`, `country` ni nada en `metadata`. Para poder segmentar, geolocalicé las 4.683 IPs distintas de la tabla contra una base GeoIP (bloques /24), y clasifiqué cada sesión por ahí.

Implicancias:

- La precisión a nivel país es alta (~95-98%) pero no perfecta.
- Hay **254 sesiones que aparecen como "US"**. Buena parte son probablemente usuarios reales de LatAm detrás de Apple iCloud Private Relay, VPN o proxies de apps (los rangos 149.87.x, 153.67.x, 172.225.x son típicos de eso). O sea: el tráfico extranjero real es algo mayor al que se ve acá.
- Se excluyeron bots (Googlebot y similares) y la IP local `::1`.

**Recomendación #1, antes que cualquier otra:** guardar el país (vía header `x-vercel-ip-country` o Cloudflare) como columna en `web_analytics_events`. Sin eso, todo análisis internacional futuro va a requerir este mismo laburo manual.

---

## 1. Volumen: cuánto tráfico extranjero hay realmente

| País | Sesiones | Visitantes | Pageviews | % Mobile | Primer registro |
|---|---:|---:|---:|---:|---|
| 🇦🇷 Argentina | 6.087 | 4.086 | 10.872 | 90,1% | 28/05 |
| 🇲🇽 México | 121 | 101 | 174 | 91,7% | 10/06 |
| 🇨🇱 Chile | 87 | 72 | 126 | 79,3% | 12/06 |
| 🇵🇪 Perú | 77 | 70 | 84 | 84,4% | **15/07** |
| 🇨🇴 Colombia | 19 | 17 | 22 | 52,6% | 09/07 |
| (US / VPN) | 254 | 220 | 349 | 70,5% | 06/06 |
| Otros (BR, PY, ES, CA…) | ~150 | — | — | — | — |

**Lectura:** el tráfico extranjero identificable es el **~5% del total** (304 sesiones de PE+CL+CO+MX contra 6.087 de AR). Es un volumen chico — cualquier conclusión sobre estos países tiene margen de error estadístico grande. Pero los patrones que aparecen son consistentes y accionables.

El tráfico es **abrumadoramente mobile** (80-92%), incluso más que en Argentina en el caso de México. Esto refuerza la prioridad del proyecto de optimización mobile: el mercado internacional es casi exclusivamente celular.

---

## 2. El hallazgo principal: los chilenos y colombianos aterrizan en páginas de México

Esto es lo más grave que encontré.

**Chile — páginas de aterrizaje más vistas:**

| Página | Sesiones |
|---|---:|
| `/mx/sellos/para-madera` | 29 |
| `/mx/sellos/para-cuero` | 25 |
| `/buy` (versión AR) | 7 |
| `/productos` (versión AR) | 5 |
| `/cl/sellos/para-pan` | 4 |
| `/cl/...` (todas las demás juntas) | ~10 |

**Colombia — páginas de aterrizaje más vistas:**

| Página | Sesiones |
|---|---:|
| `/mx/sellos/para-cuero` | 7 |
| `/mx/sellos/para-madera` | 6 |
| `/sellos/para-pan` (AR) | 3 |
| `/sellos/para-cuero` (AR) | 2 |
| `/co/sellos/para-madera` | **1** |

De 87 sesiones chilenas, **54 (62%) entran directo a la versión mexicana del sitio**. De 19 colombianas, 13 (68%) también. Sólo **una** sesión colombiana en todo el período vio una página `/co/`.

**Por qué pasa:** las URLs vienen con `gclid` y `gad_campaignid=24109097473` / `24109024705`. Son campañas de Google Ads apuntando a `/mx/...` que están sirviendo impresiones en Chile y Colombia. El usuario chileno hace clic, cae en la landing mexicana con precios en pesos mexicanos y referencias a México, y se va.

**Consecuencia medible:** Chile rebota al **72,4%** y Colombia al **84,2%**, contra 40,5% de México y 42,9% de Perú. El tiempo promedio en sitio de Colombia es de **18 segundos** — entran, ven que dice "México", se van.

---

## 3. El embudo: dónde exactamente se pierde el cliente

Sesiones que llegan a cada paso del wizard de compra (`/buy`):

| Paso | 🇦🇷 AR | 🇲🇽 MX | 🇨🇱 CL | 🇵🇪 PE | 🇨🇴 CO |
|---|---:|---:|---:|---:|---:|
| **Sesiones totales** | 6.087 | 121 | 87 | 77 | 19 |
| Entra al wizard | 3.764 (62%) | 65 (54%) | 18 (21%) | 38 (49%) | **0** |
| `logo` (subir logo) | 2.773 | 52 | 15 | 33 | 0 |
| `material` | 2.144 | 35 | 16 | 11 | 0 |
| `contact` | 1.402 | 32 | 7 | 5 | 0 |
| `preview` (ve el mockup) | 873 | 19 | 5 | 4 | 0 |
| `size` (elige medida) | 716 | 14 | 3 | 3 | 0 |
| `payment` (llega a pagar) | **306** | **7** | **1** | **1** | **0** |
| Llega a `/checkout` | — | 3 | 2 | 0 | 0 |
| Mockups generados | — | 52 | 14 | 33 | 0 |
| Órdenes concretadas | — | **1** | 0 | 0 | 0 |

### Las tres caídas, por país

**🇨🇴 Colombia — se pierde antes de empezar.**
Cero sesiones entraron al wizard. Cero mockups. El problema no es el checkout ni el pago: es que nunca llegan a una página que les hable a ellos. Colombia está esencialmente sin atender.

**🇨🇱 Chile — se pierde en la landing.**
Sólo el 21% entra al wizard (contra 62% en AR). Los que entran avanzan razonablemente, pero son pocos. El cuello de botella está arriba de todo: la landing equivocada (`/mx/`) los expulsa. 72% de rebote lo confirma.

**🇵🇪 Perú — se pierde entre el mockup y el pago.** ⚠️ Este es el caso más frustrante.
Perú tiene la mejor entrada de todas: 47 de sus 77 sesiones caen directo en `/pe/buy` (localizada, correcta), traídas por campañas de Meta (`utm_source=meta`, `utm_medium=paid_social`). El 49% entra al wizard y **33 personas subieron su logo y generaron un mockup**. Y después:

- de 33 que subieron logo → **4 llegaron a ver el preview** (88% de caída)
- de 4 → 1 llegó a `payment`
- **0 llegaron a `/checkout`. 0 órdenes.**

Es decir: Perú tiene demanda real y comprobada (33 personas se tomaron el trabajo de subir un archivo), y el sitio los pierde íntegramente entre el paso "logo" y el paso "preview". Vale la pena revisar específicamente ese tramo del wizard en mobile para tráfico peruano — puede ser tiempo de generación del mockup, un error silencioso, o el salto de precio/moneda al ver la cotización.

**🇲🇽 México — el único que funciona, y apenas.**
Mejor embudo del grupo: 54% entra al wizard, 52 mockups, 7 llegan a pagar, 3 al checkout, **1 orden concretada**. Es el único país extranjero con una venta registrada en el período. Aún así la conversión final es ~0,8% de las sesiones.

---

## 4. De dónde vienen (y por qué importa)

| País | Fuente principal | Detalle |
|---|---|---|
| 🇵🇪 Perú | **Meta pago** (59 de 77 ses.) | `meta/paid_social` → `/pe/buy`. Instagram 26 ses., Facebook 25 ses. Bien segmentado. |
| 🇲🇽 México | **Mixto**: 56 directo/orgánico, 43 IG pago, 25 FB pago | Instagram 37 ses., Google 25, Facebook 24. |
| 🇨🇱 Chile | **Google** (62 de 87 ses.) | Casi todo orgánico/Ads sin UTM → cae en `/mx/`. Sólo 11 ses. de Meta pago. |
| 🇨🇴 Colombia | **Google** (17 de 19 ses.) | Sin campañas de Meta activas. Todo orgánico/Ads a `/mx/`. |

**Lectura:** hay dos motores distintos y desalineados.

- Donde hay **campaña de Meta con UTM y landing localizada** (Perú), el tráfico llega bien y entra al wizard.
- Donde el tráfico llega por **Google** (Chile, Colombia), cae en páginas mexicanas o argentinas y rebota.

Perú demuestra que la infraestructura de localización *funciona* cuando se la usa. Chile y Colombia demuestran qué pasa cuando no.

---

## 5. Contexto mobile (relevante para el proyecto actual)

| País | % sesiones mobile |
|---|---:|
| México | 91,7% |
| Argentina | 90,1% |
| Perú | 84,4% |
| Chile | 79,3% |
| Colombia | 52,6% |

El tráfico internacional es tan mobile como el argentino, o más. Cualquier fricción en la versión mobile del wizard —especialmente en el paso de **subir el logo** y en la **generación del preview**, que es donde se cae Perú— está afectando al 85-90% de los visitantes extranjeros.

Duración promedio de sesión: MX 96 s, CL 54 s, PE 48 s, CO 18 s. Son sesiones cortas; la primera pantalla en mobile decide casi todo.

---

## 6. Acciones sugeridas, por impacto

### Prioridad alta

1. **Cortar la sangría de Chile y Colombia.** Las campañas de Google Ads (`gad_campaignid=24109097473` y `24109024705`) están mandando tráfico chileno y colombiano a `/mx/...`. O se segmentan por país con landing propia (`/cl/`, `/co/`), o se excluyen esos países de la campaña MX. Hoy se está pagando por clics que rebotan al 72-84%.

2. **Auditar el tramo `logo` → `preview` en Perú (mobile).** 33 personas subieron logo, 4 vieron el preview. Es la caída más severa y la que más valor tira a la basura, porque son usuarios ya comprometidos. Revisar: tiempo de generación del mockup en conexiones móviles peruanas, errores en `mockup_solicitudes` con `estado` fallido para esas sesiones, y qué se muestra mientras se procesa.

3. **Replicar el modelo peruano de adquisición en México y Chile.** Perú es el único con campaña Meta + UTM + landing localizada, y es el que mejor entra al wizard. México tiene volumen pero la mitad de su tráfico cae en `/buy` genérico (AR) en vez de `/mx/buy`.

### Prioridad media

4. **Colombia: decidir si se atiende o no.** Hoy hay 19 sesiones, 1 sola vio una página `/co/`, y 0 entraron al wizard. Es un mercado no atendido, no un mercado que falla. Si se quiere abrir, necesita campaña propia y landing propia.

5. **Guardar el país en `web_analytics_events`.** Sin esto no hay forma práctica de monitorear esto mes a mes.

6. **Revisar por qué 254 sesiones caen en rangos "US".** Si son Private Relay/VPN de usuarios latinoamericanos, el volumen extranjero real es mayor y parte de la segmentación por IP del sitio (si existe) les está mostrando contenido equivocado.

---

## 7. Nota de seguridad (no relacionada al análisis, pero importante)

Supabase reporta que **15 tablas tienen Row Level Security desactivado**, incluidas `clientes` (4.639 filas), `ordenes` (3.390), `direcciones` (845) y `web_analytics_events`. Con RLS desactivado, cualquiera que tenga la clave `anon` (que es pública, va en el bundle del frontend) puede leer y modificar todas esas filas.

No apliqué ningún cambio. Activar RLS sin políticas definidas bloquearía el acceso legítimo y rompería el sitio, así que es algo a planificar con cuidado. Las tablas afectadas son: `clientes`, `direcciones`, `costos_de_envio`, `ordenes`, `programa`, `sellos`, `solicitudes_registro`, `vistas_tabla`, `webhook_logs`, `fotos_pendientes`, `catalogo_items`, `fabricacion_parametros`, `vector_jobs`, `web_analytics_events`, `comercial_cliente_seguimientos`.

---

## Limitaciones del informe

- Los volúmenes por país son chicos (19 a 121 sesiones). Los porcentajes de embudo de Colombia y Chile se apoyan en pocas decenas de casos.
- El país se infiere por IP, no está registrado en la base.
- El período arranca el 28/05/2026; Perú recién aparece el 15/07, así que su ventana es de ~5 semanas, no 12.
- No hay eventos de error en la tabla, así que la caída `logo` → `preview` en Perú es una hipótesis que hay que confirmar mirando `mockup_solicitudes.estado` y `mensaje_error` para esas sesiones específicas.
