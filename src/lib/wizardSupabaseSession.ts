/**
 * IDs de Supabase del wizard activo (misma pestaña). No se borran al consumir
 * el prefill de contacto del checkout.
 */

export const WIZARD_SUPABASE_SESSION_KEY = 'alcohn_wizard_supabase';

export type WizardSupabaseSession = {
  cliente_id?: string;
  mockup_solicitud_id?: string;
  web_session_id: string;
};

function parseSession(raw: string | null): WizardSupabaseSession | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<WizardSupabaseSession>;
    if (typeof p.web_session_id !== 'string' || !p.web_session_id) return null;
    return {
      web_session_id: p.web_session_id,
      cliente_id: typeof p.cliente_id === 'string' ? p.cliente_id : undefined,
      mockup_solicitud_id:
        typeof p.mockup_solicitud_id === 'string' ? p.mockup_solicitud_id : undefined,
    };
  } catch {
    return null;
  }
}

export function getOrCreateWebSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  const existing = peekWizardSupabaseSession();
  if (existing?.web_session_id) return existing.web_session_id;
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `ws-${Date.now()}`;
  try {
    sessionStorage.setItem(
      WIZARD_SUPABASE_SESSION_KEY,
      JSON.stringify({ web_session_id: id } satisfies WizardSupabaseSession)
    );
  } catch {
    // ignore
  }
  return id;
}

export function peekWizardSupabaseSession(): WizardSupabaseSession | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseSession(sessionStorage.getItem(WIZARD_SUPABASE_SESSION_KEY));
  } catch {
    return null;
  }
}

export function saveWizardSupabaseSession(
  partial: Partial<Omit<WizardSupabaseSession, 'web_session_id'>> & {
    web_session_id?: string;
  }
): void {
  if (typeof window === 'undefined') return;
  const prev = peekWizardSupabaseSession();
  const payload: WizardSupabaseSession = {
    web_session_id: partial.web_session_id ?? prev?.web_session_id ?? `ws-${Date.now()}`,
    cliente_id: partial.cliente_id ?? prev?.cliente_id,
    mockup_solicitud_id: partial.mockup_solicitud_id ?? prev?.mockup_solicitud_id,
  };
  try {
    sessionStorage.setItem(WIZARD_SUPABASE_SESSION_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function clearWizardSupabaseSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(WIZARD_SUPABASE_SESSION_KEY);
  } catch {
    // ignore
  }
}
