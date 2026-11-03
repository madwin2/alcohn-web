/**
 * Calificación de la ficha de Google (Business Profile). Se actualiza a mano una vez por mes.
 * Es la única fuente: portada, generador y casos reales leen de acá.
 */
export const GOOGLE_REVIEWS = {
  rating: 5,
  /** Cantidad redondeada hacia abajo, para que no quede desactualizada entre revisiones. */
  countLabel: '+100',
  /** Reemplazar por el link "Compartir" de la ficha cuando esté a mano. */
  url: 'https://www.google.com/maps/search/?api=1&query=Alcohn%20Sellos%20Mar%20del%20Plata',
  updatedAt: '2026-11-03',
} as const;

export function formatGoogleRating(rating: number = GOOGLE_REVIEWS.rating) {
  return rating.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
