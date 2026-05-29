# Envíos en checkout — E-commerce Alcohn (Supabase compartido)

Documento autocontenido para implementar en **otro proyecto** (tienda web / e-commerce) el flujo en el que el **cliente carga y confirma datos de envío** que queden **validados** contra el mismo criterio que usa la app interna en `/envios`. No requiere acceso al código de Alcohn Ai Nueva.

**Idea central:** los datos no se guardan “a ojo”. Provincia, localidad y sucursal deben coincidir con el **padrón oficial de Correo Argentino (MiCorreo)** cargado en Supabase. Así el equipo puede generar etiquetas después sin reescribir direcciones.

---

## Objetivo en la tienda web

En el checkout (o paso “Envío”):

1. El cliente elige **Domicilio** o **Sucursal** (Correo Argentino).
2. Completa nombre, provincia, localidad, dirección (o sucursal), código postal, email y teléfono.
3. La web **valida** contra el padrón `correo_sucursales` antes de permitir continuar / pagar.
4. Al confirmar el pedido se **persiste** en `direcciones` y se **vincula** a `ordenes`.
5. (Opcional) Mostrar **costo de envío** leyendo `costos_de_envio`.

La app interna después usa esos mismos registros para armar el CSV de MiCorreo; la web **no tiene que generar CSV** en el checkout.

---

## Tablas Supabase involucradas

### `correo_sucursales` (padrón — solo lectura en la web)

Catálogo de sucursales MiCorreo. Es la **fuente de verdad** para validar y armar desplegables.

| Campo | Uso |
|-------|-----|
| `codigo` | Código de sucursal MiCorreo (obligatorio guardarlo en envío a sucursal) |
| `provincia` | Texto provincia |
| `localidad` | Localidad |
| `calle`, `numero` | Se unen en “domicilio” de la sucursal (`calle` + espacio + `numero`; si `numero` es `"0"`, ignorarlo) |
| `activa` | Filtrar `activa IS NULL OR activa = true` |

Cargar en páginas con paginación (ej. 1000 filas por request) hasta traer todo el padrón, o cachear en servidor 24 h.

**Permisos:** suele haber política `SELECT` para `authenticated` y/o `anon` (revisar RLS del proyecto). Desde API routes de Next.js con `SUPABASE_SERVICE_ROLE_KEY` también es válido.

---

### `direcciones` (donde quedan los datos del cliente)

| Campo | Obligatorio | Notas |
|-------|-------------|-------|
| `cliente_id` | Sí | UUID del cliente del pedido |
| `nombre`, `apellido` | Sí | Partir nombre completo: primera palabra → nombre, resto → apellido; si no hay apellido usar `'-'` |
| `provincia` | Sí | **Nombre canónico** (ver normalización) |
| `localidad` | Sí | Normalizada según provincia |
| `domicilio` | Sí | Calle + número (domicilio) o dirección textual de la sucursal elegida |
| `codigo_postal` | Sí | Si falta, se puede usar `'0000'` como en la app interna |
| `telefono` | Recomendado | Solo dígitos, normalizado (ver teléfono) |
| `codigo_sucursal_micorreo` | Sucursal | Código MiCorreo; **NULL** en domicilio |
| `activa` | Sí | `true` en alta nueva |
| `dni` | No | `null` |

Cada confirmación de envío en checkout suele ser un **INSERT nuevo** en `direcciones` (no actualizar direcciones viejas del cliente salvo que el negocio lo pida).

---

### `ordenes` (vinculación)

Al crear o actualizar la orden del checkout:

| Campo | Valor web típico |
|-------|------------------|
| `direccion_id` | UUID de la fila recién insertada en `direcciones` |
| `empresa_envio` | `'Correo Argentino'` |
| `tipo_envio` | `'Domicilio'` o `'Sucursal'` (exactamente así, con mayúscula inicial) |
| `origen` | `'Web'` (si la migración web está aplicada) |
| `estado_pago_web` | Según flujo de pago (`pendiente`, `pagado`, etc.) |

**No setear a mano** (los calculan triggers): `valor_total`, `senia_total`, `restante`, `cantidad_sellos`, `costo_envio` (este último se actualiza solo si `empresa_envio` + `tipo_envio` están seteados y existe fila en `costos_de_envio`).

---

### `clientes` (email)

- Email de envío: preferir `clientes.mail` si ya existe.
- Si el checkout captura un email nuevo y el cliente no tenía mail, actualizar `clientes.mail` (no guardar emails “placeholder” de la empresa).

Fallback solo para plantillas internas (ej. `alcohn.cnc@gmail.com`): **no** persistir ese fallback en `clientes.mail`.

---

### `costos_de_envio` (precio de envío en carrito)

Tabla de costos vigentes por empresa y servicio:

| Campo | Ejemplo |
|-------|---------|
| `empresa` | `'Correo Argentino'` |
| `servicio` | `'Domicilio'` o `'Sucursal'` |
| `costo` | Monto ARS |
| `activo` | `true` |
| `activo_desde` | Fecha; tomar la fila más reciente activa |

Consulta:

```sql
SELECT costo FROM costos_de_envio
WHERE empresa = 'Correo Argentino'
  AND servicio = 'Domicilio'  -- o 'Sucursal'
  AND activo = true
ORDER BY activo_desde DESC
LIMIT 1;
```

Mostrar ese monto en el checkout cuando el usuario cambia Domicilio ↔ Sucursal.

---

## Tipos de envío en la UI

| UI | `ordenes.tipo_envio` | Comportamiento |
|----|----------------------|----------------|
| Envío a domicilio | `Domicilio` | Calle, número, localidad, CP; `codigo_sucursal_micorreo` = NULL |
| Retiro en sucursal Correo | `Sucursal` | Provincia + localidad + **sucursal del padrón** + código MiCorreo obligatorio |

Si la tienda **solo** usa Correo Argentino, fijar `empresa_envio = 'Correo Argentino'` siempre.

---

## Normalización (aplicar antes de validar y guardar)

### Provincia → nombre canónico

Mapear alias argentinos a un nombre estándar de 24 provincias, por ejemplo:

- `CABA`, `Capital`, `Ciudad Autónoma…` → **`Capital Federal`**
- `Bs As`, `PBA`, `Provincia de Buenos Aires` → **`Buenos Aires`**
- Quitar tildes para comparar, luego guardar con tildes correctas (`Córdoba`, `Entre Ríos`, etc.)

Si después de normalizar la provincia **no está** en la lista del padrón → **bloquear** guardado.

### Localidad

- Comparar sin distinguir mayúsculas/acentos (clave normalizada).
- Para **Capital Federal**: si no hay localidades en padrón, usar localidad fija tipo **`Ciudad Autónoma de Buenos Aires`** (como en integraciones Correo).

### Teléfono

- Extraer solo dígitos.
- Aceptar `+54…`, `15…`, etc.
- Guardar forma consistente (solo números; si empieza con 54, mantener).

### Nombre completo

- `trim`, colapsar espacios.
- Split: primera token = `nombre`, resto = `apellido`.

---

## Cargar el catálogo en memoria

Por cada fila de `correo_sucursales` construir un objeto unificado:

```
{
  codigo_sucursal: string,   // desde codigo
  provincia: string,
  localidad: string,
  domicilio: string,         // calle + numero (numero "0" ignorado)
  codigo_postal: ''          // el padrón MiCorreo no trae CP en esta tabla
}
```

A partir del array `rows`:

1. **`provinceOptions`**: provincias únicas canónicas presentes en el padrón.
2. **`localityOptions(provincia)`**: localidades de esa provincia (una etiqueta por localidad normalizada).
3. **`addressOptions(provincia, localidad)`**: domicilios de sucursales en esa provincia/localidad (solo filas con `codigo_sucursal`).
4. Para sucursal: cada opción de dirección lleva también el **código** (`codigo_sucursal`).

---

## Reglas de validación (“verificado”)

### Siempre (domicilio y sucursal)

1. Padrón `correo_sucursales` cargado (length > 0). Si no → error “catálogo no disponible”.
2. **Provincia** debe existir en `provinceOptions` (provincia canónica ∈ padrón).
3. Nombre, teléfono y email con formato mínimo (email con `@`).

### Modo **Sucursal** (estricto — igual que la app interna)

El cliente **no** puede escribir localidad/sucursal libre si no está en el padrón:

1. **Localidad** ∈ `localityOptions(provincia)`.
2. **Dirección de sucursal** ∈ `addressOptions(provincia, localidad)` **o** el usuario ingresa **código MiCorreo manual** que exista en el padrón.
3. Al guardar: `codigo_sucursal_micorreo` = código elegido (del desplegable o manual).
4. Tras parsear texto o autocompletar, **re-ajustar** (“snap”) provincia, localidad y dirección al valor más cercano **que exista en el padrón** — no inventar localidades.

**Snap / alineación al padrón (sucursal):**

- Provincia: mejor match por texto normalizado contra `provinceOptions`.
- Localidad: match exacto normalizado, o contención de strings; en Capital Federal usar localidad por defecto si hace falta.
- Dirección: match exacto o parcial contra direcciones del padrón en esa provincia/localidad.
- Código postal: opcional desde padrón; si no hay, dejar el que trajo el usuario o vacío.

### Modo **Domicilio** (más flexible en selects, estricto al “confirmar”)

En guardado directo la app interna exige sobre todo **provincia en padrón**. Para ecommerce conviene además:

1. **Localidad** y **domicilio** no vacíos.
2. **Código postal** presente (o default acordado).
3. **Pre-validación “como CSV”** (recomendada antes de pagar): simular que los datos servirían para una fila Correo Argentino:
   - Localidad no vacía.
   - Domicilio con calle reconocible y **número al final** del texto (regex: texto + dígitos al final), porque MiCorreo separa calle y altura así.
   - Código de letra de provincia derivable del nombre de provincia (tabla de códigos provincia Correo: A, B, C, …).

Si la pre-validación falla → mostrar error claro (“Falta número en la calle”, “Provincia no reconocida para Correo”, etc.) y no avanzar al pago.

---

## Flujo UX recomendado en el e-commerce

```
1. Cliente elige: [ Domicilio ] [ Sucursal Correo ]
2. Formulario:
   - Nombre y apellido (o nombre completo)
   - Provincia (select desde padrón)
   - Localidad (select en Sucursal; input o select en Domicilio)
   - Dirección / Sucursal (select en Sucursal; input libre en Domicilio con hint "Calle 123")
   - Código postal
   - Email, Teléfono
   - (Sucursal) Código sucursal: auto al elegir sucursal; opcional edición manual
3. Botón "Continuar" → validación local (reglas arriba)
4. (Opcional) Paso confirmación: resumen legible
5. Al confirmar pedido / pago OK:
   - INSERT direcciones
   - UPDATE ordenes SET direccion_id, empresa_envio, tipo_envio
   - UPDATE clientes.mail si corresponde
```

**Opcional — pegar texto:** si querés ayudar al usuario que pega un WhatsApp, podés parsear líneas con etiquetas (`Provincia:`, `Localidad:`, `Sucursal:`, email, teléfono) y luego pasar por el mismo **snap al padrón**. La app interna usa además IA en `/api/parse-shipping`; en ecommerce un formulario guiado + snap suele alcanzar.

---

## Persistencia en checkout (pseudocódigo)

```
function guardarEnvioCheckout(ordenId, clienteId, form, tipo: 'Domicilio' | 'Sucursal'):
  validar(form, tipo, catalogo)  // lanza error si falla

  provincia = canonicalizeProvince(form.provincia)
  localidad = normalizeLocalidad(provincia, form.localidad)
  telefono = normalizePhone(form.telefono)
  [nombre, apellido] = splitNombre(form.nombreCompleto)

  codigoSucursal = (tipo === 'Sucursal') ? form.codigoSucursal : null

  direccion = INSERT direcciones {
    cliente_id: clienteId,
    activa: true,
    provincia,
    localidad,
    domicilio: form.domicilio,
    codigo_postal: form.cp || '0000',
    nombre, apellido,
    telefono,
    codigo_sucursal_micorreo: codigoSucursal,
    dni: null
  }

  UPDATE ordenes SET
    direccion_id = direccion.id,
    empresa_envio = 'Correo Argentino',
    tipo_envio = tipo
  WHERE id = ordenId

  si cliente sin mail y form.email válido:
    UPDATE clientes SET mail = form.email WHERE id = clienteId
```

**Cuándo guardar:** idealmente al **confirmar checkout** (junto con la orden), o al paso “Envío” si ya tenés `orden_id` creada en estado `pendiente`. No hace falta tocar `estado_envio` desde la web al cargar datos; eso lo maneja operaciones al generar etiquetas.

---

## Costo de envío en el carrito

```
costo = consultar costos_de_envio('Correo Argentino', tipoEnvio)
total_carrito = suma_productos + costo
```

Recalcular cuando el usuario cambia Domicilio ↔ Sucursal.

---

## Qué NO debe hacer la tienda web

| Acción | Motivo |
|--------|--------|
| Generar CSV MiCorreo en checkout | Lo hace el equipo en la app interna |
| Cambiar `estado_envio` a “Etiqueta Lista” / “Despachado” | Flujo operativo interno |
| Aceptar sucursal/localidad que no esté en `correo_sucursales` | Rompe etiquetas |
| Guardar `direccion_id` sin validar sucursal | Mismo problema |
| Inventar códigos de provincia Correo sin validar nombre | Falla CSV después |

---

## Checklist implementación

- [ ] Cargar y cachear `correo_sucursales` (filtro activas).
- [ ] Select provincia / localidad / sucursal en modo Sucursal.
- [ ] Modo Domicilio con provincia del padrón + validación calle con número.
- [ ] Guardar `codigo_sucursal_micorreo` solo en Sucursal.
- [ ] INSERT `direcciones` + UPDATE `ordenes.direccion_id`, `empresa_envio`, `tipo_envio`.
- [ ] `origen = 'Web'` y flujo de pago según `web-alcohn-integracion.md`.
- [ ] Mostrar costo desde `costos_de_envio`.
- [ ] Mensajes de error claros si el padrón no carga o la sucursal no matchea.

---

## Resumen en una frase

El checkout debe obligar a que provincia y (en sucursal) localidad y oficina existan en `correo_sucursales`, guardar eso en `direcciones` con el código MiCorreo cuando corresponda, vincular `ordenes.direccion_id` con `empresa_envio = 'Correo Argentino'` y `tipo_envio` Domicilio o Sucursal, y mostrar el costo desde `costos_de_envio` — así los datos quedan verificados y listos para etiquetas sin reingreso manual.

---

## Relación con integración web general

Para órdenes, pagos y sellos ver también `web-alcohn-integracion.md` (cuándo crear `sellos`, `estado_pago_web`, buckets, etc.). Este documento cubre **solo el bloque de envío verificado** en checkout.
