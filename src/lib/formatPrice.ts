export function formatPriceARS(amount: number): string {
  return `$${amount.toLocaleString('es-AR')}`;
}

export function formatPriceFrom(amount: number): string {
  return `Desde ${formatPriceARS(amount)}`;
}
