/**
 * Avance del generador de muestras guardado en el navegador. Quien entra desde
 * Instagram suele salir a buscar el logo (WhatsApp, mail, Drive) y al volver la
 * página se recarga: con esto sigue donde estaba.
 *
 * Solo se guardan los pasos previos a la muestra (material, logo y contacto). El
 * logo no se guarda como imagen (puede pasar el límite de localStorage): se usa la
 * URL firmada que devuelve la subida a la muestra, que vence a los 7 días.
 */

export const WIZARD_DRAFT_KEY = 'alcohn_wizard_draft_v1';
export const WIZARD_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type WizardDraftStep = 'material' | 'logo' | 'contact';

export type WizardDraft = {
  v: 1;
  savedAt: number;
  /** Ruta + parámetros de entrada (sin UTM): no se mezcla con otro producto o mercado. */
  entryKey: string;
  step: WizardDraftStep;
  material?: string;
  usoSlug?: string;
  mockupSolicitudId?: string;
  clienteId?: string;
  logoUrl?: string;
  logoName?: string;
  nombre?: string;
  whatsapp?: string;
  email?: string;
};

const ENTRY_PARAMS = ['mode', 'product', 'material', 'uso', 'variant'];

/** Identifica desde dónde arrancó el generador, ignorando UTM, fbclid y `retomar`. */
export function buildWizardEntryKey(pathname: string, params: URLSearchParams): string {
  const kept = ENTRY_PARAMS.filter((k) => params.get(k)).map((k) => `${k}=${params.get(k)}`);
  return kept.length ? `${pathname}?${kept.join('&')}` : pathname;
}

export function parseWizardDraft(raw: string | null, now = Date.now()): WizardDraft | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as Partial<WizardDraft>;
    if (d.v !== 1 || typeof d.savedAt !== 'number' || typeof d.entryKey !== 'string') return null;
    if (now - d.savedAt > WIZARD_DRAFT_TTL_MS) return null;
    if (d.step !== 'material' && d.step !== 'logo' && d.step !== 'contact') return null;
    return d as WizardDraft;
  } catch {
    return null;
  }
}

export function loadWizardDraft(entryKey: string): WizardDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const draft = parseWizardDraft(localStorage.getItem(WIZARD_DRAFT_KEY));
    return draft && draft.entryKey === entryKey ? draft : null;
  } catch {
    return null;
  }
}

export function saveWizardDraft(draft: Omit<WizardDraft, 'v' | 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: WizardDraft = { ...draft, v: 1, savedAt: Date.now() };
    localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // Navegación privada o almacenamiento lleno: el generador sigue sin guardar.
  }
}

export function clearWizardDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(WIZARD_DRAFT_KEY);
  } catch {
    // ignore
  }
}

/** Hay algo que valga la pena retomar (más que estar parado en el primer paso). */
export function isWizardDraftWorthResuming(draft: WizardDraft): boolean {
  return Boolean(draft.material) && (draft.step !== 'material' || Boolean(draft.logoUrl));
}
