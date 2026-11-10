/** ID de Merchant Center de Alcohn (programa Reseñas de Clientes en Google). */
export const GOOGLE_MERCHANT_ID = 5532785398;

/** Días corridos estimados hasta la entrega: 72 hs hábiles de fabricación + envío. */
export const ESTIMATED_DELIVERY_DAYS_AR = 10;
export const ESTIMATED_DELIVERY_DAYS_INTERNATIONAL = 14;

/** Fecha estimada de entrega en formato YYYY-MM-DD (el que pide Google). */
export function estimatedDeliveryDate(days: number, from: Date = new Date()): string {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}
