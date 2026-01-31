# Integración con OpenAI - Análisis y Optimización de Logos

## Descripción

Esta integración permite analizar logos subidos por los clientes usando OpenAI para determinar si están optimizados para sellos de bronce, y optimizarlos automáticamente si es necesario.

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# OpenAI API Key
# Obtén tu API key en: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here

# URL del servicio Python de mockups
# Por defecto: http://localhost:8000/api/mockups/generate
MOCKUP_SERVICE_URL=http://localhost:8000/api/mockups/generate
```

## Flujo de Funcionamiento

1. **Análisis del Logo** (`/api/logo/analyze`)
   - El cliente sube un logo
   - Se envía a OpenAI Vision (GPT-4o) para analizar
   - OpenAI determina si el logo es óptimo para sello de bronce
   - Retorna: `isOptimal`, `hasPlainBackground`, `isComplex`, `needsOptimization`, `reason`

2. **Optimización del Logo** (`/api/logo/optimize`)
   - Si el logo no está óptimo, se llama a esta API
   - Actualmente retorna el logo original (la optimización real se hará en el servicio Python)
   - TODO: Implementar llamada al servicio Python para optimización real

3. **Generación de Muestra** (`/api/mockups/generate`)
   - Una vez que el logo está óptimo (original o optimizado), se genera la muestra
   - Esta API llama al servicio Python que genera el mockup automático
   - Retorna: `mockupUrl`, `thumbnailUrl`, `metadata`

## Endpoints

### POST `/api/logo/analyze`

Analiza un logo usando OpenAI Vision.

**Request:**
```json
{
  "logo": "data:image/png;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "isOptimal": boolean,
    "hasPlainBackground": boolean,
    "isComplex": boolean,
    "needsOptimization": boolean,
    "reason": "string"
  }
}
```

### POST `/api/logo/optimize`

Optimiza un logo (actualmente placeholder, se implementará con servicio Python).

**Request:**
```json
{
  "logo": "data:image/png;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "optimizedLogo": "data:image/png;base64,...",
  "description": "string"
}
```

### POST `/api/mockups/generate`

Genera un mockup automático llamando al servicio Python.

**Request:**
```json
{
  "logo": "data:image/png;base64,...",
  "size": "40x40mm",
  "material": "cuero",
  "aspectRatio": 1.0,
  "customSize": { "width": 40, "height": 40 }
}
```

**Response:**
```json
{
  "success": true,
  "mockupUrl": "https://...",
  "thumbnailUrl": "https://...",
  "metadata": { ... }
}
```

## Próximos Pasos

1. Implementar optimización real de imágenes en el servicio Python
2. Integrar la llamada al servicio Python desde `/api/logo/optimize`
3. Agregar manejo de errores más robusto
4. Implementar cache para análisis de logos similares
5. Agregar logging y monitoreo
