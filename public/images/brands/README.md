# Logos de marcas que confían

Coloca aquí las imágenes de los logos de las marcas que confían en Alcohn.

## Estructura

Coloca los logos con nombres descriptivos:
- `kosiuko.png` (o .jpg)
- `tucci.png`
- `herencia.png`
- `ossira.png`

## Formato recomendado
- **Formato**: PNG con fondo transparente (preferido) o JPG
- **Tamaño**: Ancho recomendado 200-300px, altura proporcional
- **Fondo**: Transparente (PNG) o blanco
- **Estilo**: Logos en escala de grises que se colorean al pasar el cursor

## Cómo actualizar el código

Una vez que subas los logos, actualiza `src/data/brands.ts`:

```typescript
export const brands: Brand[] = [
  {
    name: "Kosiuko",
    logo: "/images/brands/kosiuko.png"
  },
  {
    name: "Tucci",
    logo: "/images/brands/tucci.png"
  },
  {
    name: "Herencia",
    logo: "/images/brands/herencia.png"
  },
  {
    name: "Ossira",
    logo: "/images/brands/ossira.png"
  },
];
```

Los logos se mostrarán automáticamente en la sección "Marcas que confían".





