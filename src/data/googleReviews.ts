/**
 * Calificación de la ficha de Google (Business Profile). Se actualiza a mano una vez por mes.
 * Es la única fuente: portada, generador y casos reales leen de acá.
 */
export const GOOGLE_REVIEWS = {
  rating: 5,
  /** Cantidad redondeada hacia abajo, para que no quede desactualizada entre revisiones. */
  countLabel: '+100',
  /** Link "Compartir" de la ficha de Google. */
  url: 'https://share.google/Zd0wLzEHF42vomsjv',
  updatedAt: '2026-11-03',
} as const;

export function formatGoogleRating(rating: number = GOOGLE_REVIEWS.rating) {
  return rating.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
