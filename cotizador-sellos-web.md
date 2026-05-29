# Cotizador online de sellos rectangulares Alcohn (Supabase)

Documento autocontenido para implementar un **cotizador de sellos clásicos rectangulares** en otro proyecto (web, app, etc.) usando el **mismo proyecto Supabase** que la app interna Alcohn. No requiere acceso al código de este repositorio.

---

## Objetivo

Dado **ancho** y **alto** del sello (en centímetros; el usuario puede escribirlos en cualquier orden), calcular:

1. **Precio transferencia** (ARS, entero): precio de lista para transferencia / presupuesto.
2. **Precio link** (ARS, entero): precio para cobro con tarjeta / link de pago.

Fórmula del precio link (no está en la base):

```
precio_link = redondear(precio_transferencia × 1.15)
```

---

## Fuente de datos: tablas Supabase

El catálogo está en el schema `public`. Todas las filas pertenecen a un **único dueño** (`user_id` = UUID de la cuenta que carga los precios en la app interna). La otra app debe leer **solo las filas de ese dueño**.

### Cómo obtener el `user_id` del catálogo

```sql
SELECT user_id FROM precios_sello_grupo LIMIT 1;
```

Alternativa si existe en el proyecto:

```sql
SELECT precios_catalog_owner_user_id();
```

### Tablas a leer

Siempre filtrando `user_id = <catalog_owner_id>`:

| Tabla | Campos relevantes | Rol |
|-------|-------------------|-----|
| `precios_sello_grupo` | `codigo`, `precio_transferencia` | Precio por **grupo** de tamaño |
| `precios_sello_medida_grupo` | `ancho`, `largo`, `grupo_codigo` | Medida exacta (cm) → grupo |
| `precios_sello_medida_fija` | `ancho`, `largo`, `precio_transferencia` | Medida exacta (cm) → precio fijo (**tiene prioridad** sobre el grupo) |

### Códigos de grupo

Siempre uno de estos cuatro:

- `chicos`
- `medianos`
- `grandes`
- `xl`

Cada grupo tiene un `precio_transferencia` en `precios_sello_grupo`. **No hardcodear** valores: leerlos de la BD (ej. chicos ~69500, medianos ~83500; los números reales cambian cuando el equipo actualiza precios).

### Unidades

- En BD: **centímetros**, hasta 4 decimales (ej. ancho `8`, largo `1.4`, o largo `4.3333` para “11×4/3”).
- Si la UI pide **milímetros**: `anchoCm = anchoMm / 10`, `altoCm = altoMm / 10` antes de cotizar.

### Autenticación

- Lectura del catálogo: usuario autenticado con políticas de lectura del dueño, o **API route server** con `SUPABASE_SERVICE_ROLE_KEY`.
- No duplicar precios en JSON en el frontend: consultar Supabase al iniciar el cotizador (cachear 5–10 minutos si conviene).

---

## Estructuras en memoria (después del fetch)

Construir tres estructuras:

### 1. `precioPorGrupo`

Objeto desde `precios_sello_grupo`:

```ts
{ chicos: number, medianos: number, grandes: number, xl: number }
```

### 2. `medidaAGrupo`

Mapa `string → grupo`:

- Clave: `claveMedida(ancho, largo)` = `"${ancho}:${largo}"` (ancho y largo redondeados a 4 decimales).
- Valor: `grupo_codigo`.
- Una entrada por fila de `precios_sello_medida_grupo`.

### 3. `precioFijoPorMedida`

Mapa `string → number`:

- Misma clave `claveMedida(ancho, largo)`.
- Valor: `precio_transferencia` redondeado a entero.
- Una entrada por fila de `precios_sello_medida_fija`.

### Función auxiliar `claveMedida`

```
function claveMedida(ancho, largo):
  a = redondear(ancho, 4 decimales)
  l = redondear(largo, 4 decimales)
  return a + ":" + l
```

---

## Algoritmo de cotización (un sello)

**Entrada:** `anchoCm`, `altoCm` (números positivos, centímetros).

**Salida:** `{ precioTransferencia, precioLink, anchoNormalizado, altoNormalizado }` o `null` si no se puede cotizar.

### Paso A — Orientar (largo × corto)

El catálogo guarda **lado largo × lado corto**. Si el usuario puso al revés:

```
ancho = max(anchoCm, altoCm)
largo = min(anchoCm, altoCm)
```

### Paso B — Reglas de “planchuela”

Aplicar sobre `(ancho, largo)` ya orientados:

**Regla ancho ≈ 5 cm** (si `|ancho - 5| <= 0.06`):

- Si `largo > 1` y `largo < 1.3` → usar `largo = 1`
- Si `largo >= 1.3` y `largo < 2` → usar `largo = 2`

**Regla altura entre 2 y 2,5 cm:**

- Si `largo > 2` y `largo < 2.5` → usar `largo = 2.5`

Después, redondear ancho y largo a 4 decimales.

### Paso C — Precio por medida fija (máxima prioridad)

```
k = claveMedida(ancho, largo)
si precioFijoPorMedida tiene k → precio fijo (exacto)

si no:
  Lref = línea de referencia del lado corto (misma tabla que E1)
  si precioFijoPorMedida tiene claveMedida(ancho, Lref) → precio fijo
    (ej. usuario 12×5,9 cm → buscar 12×6 en fijas)

si no: entre filas de precios_sello_medida_fija con largo = Lref,
  elegir ancho como en E2 (mayor fila.ancho <= ancho, etc.)

si no: aproximación Manhattan entre todas las fijas (distancia ≤ 0,4)

si hay precio fijo en cualquier subpaso:
  link = redondear(transferencia * 1.15)
  return { transferencia, link, ancho, largo normalizados de la fila }
```

### Paso D — Precio por grupo (match exacto)

```
si medidaAGrupo tiene k:
  grupo = medidaAGrupo[k]
  transferencia = precioPorGrupo[grupo]
  link = redondear(transferencia * 1.15)
  return { transferencia, link, ancho, largo }
```

### Paso E — Inferencia de grupo (medida no listada exactamente)

Si no hubo match en C ni D, inferir el grupo con el **lado corto** (`largo` después de orientar) y todas las filas de `precios_sello_medida_grupo`.

#### E1. Mapear el lado corto a una “línea” de referencia

| Lado corto (cm) | Línea de referencia `Lref` |
|-----------------|----------------------------|
| &lt; 1.35 | 1 |
| 1.35 ≤ x &lt; 2.25 | 2 |
| 2.25 ≤ x &lt; 2.75 | 2.5 |
| 2.75 ≤ x &lt; 3.5 | 3 |
| 3.5 ≤ x &lt; 4.5 | 4 |
| 4.5 ≤ x &lt; 5.5 | 5 |
| 5.5 &lt; x ≤ 6.5 | 6 |
| &gt; 6.5 | no inferible → pasar a E3 o `null` |

#### E2. Buscar en `precios_sello_medida_grupo`

- Filtrar filas donde `|fila.largo - Lref| < 0.001`.
- De esas, preferir filas con `fila.ancho <= ancho` (tolerancia 0.001): elegir la de **mayor** `fila.ancho` → su `grupo_codigo`.
- Si ninguna cumple, entre las mismas filas elegir las con `fila.ancho >= ancho` y tomar la de **menor** `fila.ancho` → su `grupo_codigo`.
- Si hay grupo: `transferencia = precioPorGrupo[grupo]`, `link = redondear(transferencia * 1.15)`, return.

#### E3. Último recurso (aproximación 2D)

- Entre **todas** las filas de `precios_sello_medida_grupo`, minimizar `|fila.ancho - ancho| + |fila.largo - largo|` (Manhattan).
- Si distancia **≤ 0.4**, usar su `grupo_codigo` y precio del grupo como en E2.
- Si no, **sin precio** → `null` o contacto manual.

---

## Parseo de entrada del usuario (UI)

Formatos aceptar:

- `8×1.4`, `8x1.4`, `8 X 1.4`
- `40` (cuadrado: 40×40)
- Coma decimal: `8,5×2`

Si la UI usa **mm**, convertir a cm antes del algoritmo.

---

## Respuesta sugerida (API / UI)

Por cada medida:

```json
{
  "ancho_cm": 8,
  "alto_cm": 1.4,
  "precio_transferencia_ars": 83500,
  "precio_link_ars": 96025,
  "fuente": "grupo_medianos"
}
```

`fuente` (opcional, debug): `medida_fija` | `grupo_exacto` | `grupo_inferido` | `grupo_aproximado`.

Para varias medidas en el carrito, ejecutar el algoritmo por cada par `(ancho, alto)` y sumar si hace falta.

### Ejemplo

Usuario: **8 cm × 1,4 cm**

1. Orientado: 8 × 1,4  
2. Planchuela: sin cambio  
3. Clave `"8:1.4"` → grupo `medianos` en `precios_sello_medida_grupo`  
4. Transferencia = `precio_transferencia` de `medianos` en `precios_sello_grupo` (ej. 83.500)  
5. Link: `redondear(83500 × 1.15) = 96025`

Medida con precio fijo (ej. 11 × 4/3): clave en `precios_sello_medida_fija` → precio directo, sin grupo.

---

## Qué NO hace este cotizador

- No cotiza automáticamente **abecedarios**, **sellos redondos** ni **accesorios** (soldador, base remachadora, mango). Esas categorías usan `precios_abecedario`, `precios_sello_redondo`, `precios_accesorio` con reglas aparte.
- No escribe en `sellos` ni `ordenes`; solo calcula precios para mostrar o cobrar.
- El +15 % del link **no** está en Supabase; siempre se calcula en código.

---

## Checklist de implementación

- [ ] Conectar Supabase (server-side recomendado para cargar catálogo).
- [ ] Resolver `catalog_user_id` y cargar las 3 tablas rectangulares.
- [ ] Implementar `claveMedida`, orientación, reglas planchuela, pasos C → D → E → E3.
- [ ] Exponer `cotizar(anchoCm, altoCm)` → transferencia + link.
- [ ] Cachear catálogo 5–10 minutos.
- [ ] Manejar `null` (medida fuera de rango) con mensaje claro.

---

## Resumen

Leer de Supabase el precio por **grupo** y dos mapas **medida (cm) → grupo** y **medida (cm) → precio fijo**; normalizar la medida (orientación + reglas 5 cm y 2–2,5 cm); buscar precio fijo, si no grupo exacto, si no inferir grupo por el lado corto; el precio link es siempre **transferencia × 1,15** redondeado.
