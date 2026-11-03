/**
 * Desde dónde navega el visitante. El 82 % del generador entra por el navegador
 * interno de Instagram o Facebook (anuncios), donde subir un logo es más difícil.
 */
export type BrowserKind = 'instagram' | 'facebook' | 'movil' | 'desktop';

export function detectBrowserKind(userAgent: string): BrowserKind {
  if (/Instagram/i.test(userAgent)) return 'instagram';
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(userAgent)) return 'facebook';
  if (/iPhone|iPad|iPod|Android|Mobile/i.test(userAgent)) return 'movil';
  return 'desktop';
}

export function getBrowserKind(): BrowserKind {
  if (typeof navigator === 'undefined') return 'desktop';
  return detectBrowserKind(navigator.userAgent || '');
}

export function isInAppBrowser(kind: BrowserKind = getBrowserKind()): boolean {
  return kind === 'instagram' || kind === 'facebook';
}
