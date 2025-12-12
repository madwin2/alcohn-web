# Alcohn Web

Sitio web de Alcohn - Sellos de bronce personalizados fabricados en CNC.

## Stack

- **Framework**: Next.js 14 (app router)
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS
- **Diseño**: Industrial minimal / high-tech

## Estructura del proyecto

```
/src
  /app          # Páginas (Next.js app router)
  /components   # Componentes reutilizables
  /data         # Datos mock (FAQs, productos, etc.)
  /types        # Tipos TypeScript compartidos
/docs           # Documentación del proyecto
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Build

```bash
npm run build
npm start
```

## Páginas principales

- `/` - Home/Landing
- `/productos` - Listado de productos
- `/productos/[slug]` - Detalle de producto
- `/cotizar` - Calculadora y cotización
- `/proceso` - Cómo funciona
- `/sobre-alcohn` - Sobre la empresa
- `/faq` - Preguntas frecuentes
- `/contacto` - Formulario de contacto
- `/casos-reales` - Galería y testimonios
- `/checkout` - Checkout (en desarrollo)

## Documentación

Toda la documentación del proyecto está en `/docs`. Los archivos principales son:

- `01-arquitectura-de-paginas.md` - Estructura de páginas
- `13-architecture-guardrails.md` - Reglas de arquitectura
- `build-log.md` - Log de construcción y pendientes

## TODOs

Ver `docs/build-log.md` para la lista completa de pendientes y mejoras futuras.





