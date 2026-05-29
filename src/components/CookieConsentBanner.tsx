'use client';

import { useEffect, useState } from 'react';
import { setConsentState, getConsentState } from '@/lib/analytics/cookies';
import { trackEvent } from '@/lib/analytics/client';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getConsentState();
    setVisible(!consent);
  }, []);

  const handleChoice = async (analytics: boolean) => {
    setConsentState({
      analytics,
      marketing: false,
    });
    setVisible(false);

    if (analytics) {
      await trackEvent('cookie_consent_accepted', {
        metadata: { analytics: true },
      });
      await trackEvent('page_view');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg border border-[var(--alcohn-line-strong)] bg-[var(--alcohn-paper)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.35)] md:p-7">
        <div className="mb-5">
          <p className="craft-label mb-2">Cookies</p>
          <h3 className="mb-3 text-xl font-semibold tracking-tight text-neutral-950 md:text-2xl">
            Ayudanos a mejorar tu experiencia
          </h3>
          <p className="text-sm leading-relaxed text-neutral-800">
            Usamos cookies necesarias para el sitio y, con tu permiso, cookies de
            analitica para entender la navegacion de los usuarios y mejorar su experiencia de uso.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex min-h-[42px] items-center justify-center border border-transparent bg-transparent px-4 py-2 text-xs font-semibold uppercase text-neutral-700 transition-colors hover:border-[var(--alcohn-line)] hover:text-neutral-900"
            onClick={() => {
              void handleChoice(false);
            }}
          >
            Solo necesarias
          </button>
          <button
            type="button"
            className="inline-flex min-h-[42px] items-center justify-center border border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] px-4 py-2 text-xs font-semibold uppercase text-white transition-colors hover:border-[var(--alcohn-bronze)] hover:bg-[var(--alcohn-ink-soft)]"
            onClick={() => {
              void handleChoice(true);
            }}
          >
            Aceptar analitica
          </button>
        </div>
      </div>
    </div>
  );
}
