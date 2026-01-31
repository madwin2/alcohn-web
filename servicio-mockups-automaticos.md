# Servicio de Mockups Automáticos - Alcohn

## Descripción General

Este servicio genera automáticamente mockups visuales de sellos personalizados cuando un cliente sube su logo. El servicio se invoca desde la web de Alcohn (`alcohn-web`) cuando se detecta que el logo es **simple** (fondo blanco/transparente con logo en negro), permitiendo mostrar una vista previa instantánea sin intervención manual.

## Contexto del Negocio

Alcohn fabrica sellos de bronce personalizados para marcar cuero, madera, cerámica y otros materiales. El proceso actual requiere que un diseñador cree manualmente una muestra digital (mockup) del sello antes de fabricarlo. Este servicio automatiza ese proceso para logos simples, mejorando la experiencia del cliente y reduciendo el tiempo de respuesta.

## Cuándo se Invoca el Servicio

El servicio se invoca cuando:

1. **El logo es simple**: El análisis del logo determina que es principalmente blanco/transparente con elementos en negro
2. **Criterios de logo simple**:
   - Más del 50% de píxeles son blancos o transparentes
   - Al menos 10% de píxeles son negros
   - Menos de 50 colores únicos en la imagen
   - Menos del 10% de píxeles son de color (no blanco/negro/gris)

3. **El cliente ha seleccionado**:
   - Material a marcar
   - Tamaño del sello (exacto o aproximado)

## API Endpoint

### POST `/api/mockups/generate`

Genera un mockup automático del sello basado en el logo del cliente.

### Request Body

```typescript
{
  logo: string;              // Base64 data URL o URL pública del logo (formato: "data:image/png;base64,..." o "https://...")
  size: string;              // Tamaño exacto: "30x30mm", "40x40mm", "50x50mm", etc.
                             // O tamaño aproximado: "pequeño", "medio", "grande"
  material: "cuero" | "madera" | "ambos" | "ceramica" | "alimentos" | "otros";
  aspectRatio?: number;      // Opcional: relación de aspecto del logo (width/height)
  customSize?: {             // Opcional: si el tamaño es personalizado
    width: number;          // en mm
    height: number;         // en mm
  };
}
```

### Response (Éxito)

```typescript
{
  success: true;
  mockupUrl: string;         // URL pública del mockup generado (debe ser accesible desde la web)
  thumbnailUrl?: string;     // Opcional: versión miniatura del mockup
  metadata: {
    generatedAt: string;     // ISO 8601 timestamp
    processingTime: number;  // Tiempo de procesamiento en ms
    logoProcessed: {
      originalWidth: number;
      originalHeight: number;
      processedWidth: number;
      processedHeight: number;
    };
    mockupDimensions: {
      width: number;         // Ancho del mockup en píxeles
      height: number;        // Alto del mockup en píxeles
    };
  };
}
```

### Response (Error)

```typescript
{
  success: false;
  error: {
    code: string;            // Código de error (ver sección de códigos)
    message: string;         // Mensaje descriptivo del error
    details?: any;          // Información adicional del error
  };
}
```

### Códigos de Error

- `INVALID_LOGO`: El logo proporcionado no es válido o no se puede procesar
- `INVALID_SIZE`: El tamaño especificado no es válido
- `INVALID_MATERIAL`: El material especificado no es válido
- `PROCESSING_ERROR`: Error durante el procesamiento del mockup
- `STORAGE_ERROR`: Error al guardar el mockup generado
- `TIMEOUT`: El procesamiento excedió el tiempo máximo permitido

## Requisitos Funcionales

### 1. Procesamiento del Logo

- **Entrada**: Logo en formato PNG, JPG o SVG (como base64 o URL)
- **Procesamiento**:
  - Convertir a formato procesable si es necesario (SVG → PNG)
  - Ajustar el logo al tamaño del sello manteniendo proporciones
  - Aplicar efectos de grabado (simular profundidad de 1.7mm)
  - Convertir a escala de grises si es necesario (solo blanco/negro)

### 2. Generación del Mockup

El mockup debe mostrar:

- **Vista del sello físico**: Representación 3D o 2D del sello de bronce con el logo grabado
- **Aplicación en material**: Mostrar cómo quedaría la marca en el material seleccionado (cuero, madera, etc.)
- **Dimensiones correctas**: El mockup debe reflejar el tamaño real del sello

#### Estilos de Mockup por Material

- **Cuero**: Textura de cuero con marca en relieve/impresión
- **Madera**: Textura de madera con marca quemada/grabada
- **Cerámica**: Textura de cerámica cruda con marca
- **Alimentos**: Aplicación en pan, hielo, etc. (según corresponda)
- **Ambos**: Mostrar ambas aplicaciones (cuero y madera)
- **Otros**: Vista genérica del sello

### 3. Formatos de Salida

- **Formato principal**: PNG o JPG de alta calidad (mínimo 1920x1080px recomendado)
- **Formato miniatura**: JPG optimizado para web (máximo 800px en el lado más largo)
- **Almacenamiento**: Los archivos deben guardarse en un servicio de almacenamiento (S3, Cloud Storage, etc.) y devolver URLs públicas

### 4. Rendimiento

- **Tiempo máximo de procesamiento**: 30 segundos
- **Tiempo objetivo**: Menos de 10 segundos para logos simples
- **Cache**: Implementar cache de mockups para evitar regenerar el mismo logo/tamaño/material

## Requisitos Técnicos

### Stack Tecnológico (Sugerencias)

- **Lenguaje**: Python (con Pillow, OpenCV) o Node.js (con Sharp, Canvas)
- **Procesamiento de imágenes**: 
  - Python: Pillow, OpenCV, numpy
  - Node.js: Sharp, node-canvas, fabric.js
- **Generación 3D** (opcional): Three.js, Blender Python API
- **Almacenamiento**: AWS S3, Google Cloud Storage, o similar
- **API Framework**: 
  - Python: FastAPI, Flask
  - Node.js: Express, Next.js API Routes

### Infraestructura

- **Deployment**: Servicio independiente (no debe correr en el mismo servidor que la web)
- **Escalabilidad**: Debe poder manejar múltiples requests concurrentes
- **Monitoreo**: Logs de requests, tiempos de procesamiento, errores

## Ejemplos de Uso

### Ejemplo 1: Logo simple, tamaño exacto

**Request:**
```json
{
  "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "size": "40x40mm",
  "material": "cuero",
  "aspectRatio": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "mockupUrl": "https://storage.alcohn.com/mockups/abc123-def456.png",
  "thumbnailUrl": "https://storage.alcohn.com/mockups/thumbnails/abc123-def456.jpg",
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00Z",
    "processingTime": 3500,
    "logoProcessed": {
      "originalWidth": 500,
      "originalHeight": 500,
      "processedWidth": 400,
      "processedHeight": 400
    },
    "mockupDimensions": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

### Ejemplo 2: Logo simple, tamaño aproximado

**Request:**
```json
{
  "logo": "https://example.com/logo.png",
  "size": "medio",
  "material": "madera",
  "aspectRatio": 1.5
}
```

**Response:**
```json
{
  "success": true,
  "mockupUrl": "https://storage.alcohn.com/mockups/xyz789-abc123.png",
  "metadata": {
    "generatedAt": "2024-01-15T10:35:00Z",
    "processingTime": 4200,
    "logoProcessed": {
      "originalWidth": 600,
      "originalHeight": 400,
      "processedWidth": 450,
      "processedHeight": 300
    },
    "mockupDimensions": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

### Ejemplo 3: Error de procesamiento

**Request:**
```json
{
  "logo": "data:image/png;base64,invalid...",
  "size": "40x40mm",
  "material": "cuero"
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_LOGO",
    "message": "No se pudo procesar el logo proporcionado. Verifique que sea una imagen válida en formato PNG, JPG o SVG."
  }
}
```

## Integración con la Web de Alcohn

### Flujo de Integración

1. Cliente sube logo en `/buy` o `/cotizar`
2. La web analiza el logo con `analyzeLogo()` (ya implementado)
3. Si `isSimple === true`:
   - Cliente selecciona material y tamaño
   - La web hace POST a este servicio
   - Se muestra el mockup generado al cliente
4. Si `isSimple === false`:
   - Se solicita muestra manual vía WhatsApp (flujo actual)

### Código de Integración (Referencia)

La web llamará al servicio así:

```typescript
const generateMockup = async (logo: string, size: string, material: string) => {
  const response = await fetch('https://mockup-service.alcohn.com/api/mockups/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      logo,
      size,
      material,
    }),
  });
  
  const data = await response.json();
  return data;
};
```

## Consideraciones Adicionales

### Seguridad

- Validar que el logo sea realmente una imagen válida
- Limitar el tamaño máximo del logo (ej: 10MB)
- Implementar rate limiting para evitar abuso
- Autenticación: Considerar API key o JWT si el servicio será público

### Calidad

- Los mockups deben verse profesionales y realistas
- Deben inspirar confianza en el cliente
- Deben ser consistentes con el estilo visual de Alcohn

### Mantenibilidad

- Código modular y bien documentado
- Tests unitarios para funciones críticas
- Logs detallados para debugging
- Documentación de API (OpenAPI/Swagger recomendado)

## Próximos Pasos

1. Implementar el servicio según esta especificación
2. Crear mockups de prueba con diferentes logos y materiales
3. Integrar con la web de Alcohn
4. Monitorear rendimiento y ajustar según necesidad
5. Considerar mejoras futuras:
   - Soporte para logos más complejos
   - Variaciones de estilo de mockup
   - Preview en tiempo real mientras el usuario ajusta parámetros

## Contacto y Soporte

Para dudas sobre la integración o cambios en los requisitos, contactar al equipo de desarrollo de Alcohn.

---

**Versión**: 1.0  
**Fecha**: 2024-01-15  
**Autor**: Especificación para servicio de mockups automáticos






