'use client';

import type { ConsentState } from './types';

export const CONSENT_COOKIE_KEY = 'alcohn_cookie_consent_v2';
export const VISITOR_COOKIE_KEY = 'alcohn_visitor_id';
export const SESSION_STORAGE_KEY = 'alcohn_session_id';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const THIRTY_MIN_MS = 1000 * 60 * 30;

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie
    .split('; ')
    .find((chunk) => chunk.startsWith(`${name}=`));
  if (!cookie) return null;
  const value = cookie.slice(name.length + 1);
  return decodeURIComponent(value);
}

function getCookieDomainAttribute(): string {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return '';
  if (host.endsWith('alcohnsellos.com')) return '; domain=.alcohnsellos.com';
  return '';
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax${getCookieDomainAttribute()}`;
}

export function getConsentState(): ConsentState | null {
  const raw = readCookie(CONSENT_COOKIE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (
      typeof parsed?.analytics === 'boolean' &&
      typeof parsed?.marketing === 'boolean' &&
      typeof parsed?.updatedAt === 'string'
    ) {
      return {
        necessary: true,
        analytics: parsed.analytics,
        marketing: parsed.marketing,
        updatedAt: parsed.updatedAt,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function setConsentState(
  state: Omit<ConsentState, 'necessary' | 'updatedAt'>
): ConsentState {
  const withTimestamp: ConsentState = {
    necessary: true,
    analytics: state.analytics,
    marketing: state.marketing,
    updatedAt: new Date().toISOString(),
  };
  writeCookie(CONSENT_COOKIE_KEY, JSON.stringify(withTimestamp), ONE_YEAR_SECONDS);
  return withTimestamp;
}

export function getOrCreateVisitorId(): string {
  const existing = readCookie(VISITOR_COOKIE_KEY);
  if (existing) return existing;
  const next = randomId();
  writeCookie(VISITOR_COOKIE_KEY, next, ONE_YEAR_SECONDS);
  return next;
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return randomId();

  const now = Date.now();
  const currentRaw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (currentRaw) {
    try {
      const parsed = JSON.parse(currentRaw) as { id: string; updatedAt: number };
      if (parsed.id && now - parsed.updatedAt < THIRTY_MIN_MS) {
        window.sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ id: parsed.id, updatedAt: now })
        );
        return parsed.id;
      }
    } catch {
      // Ignorar sesión corrupta y regenerar.
    }
  }

  const next = randomId();
  window.sessionStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({ id: next, updatedAt: now })
  );
  return next;
}
