'use client';

import { useEffect, useState } from 'react';
import { setConsentState, getConsentState } from '@/lib/analytics/cookies';
import { trackEvent } from '@/lib/analytics/client';
import { loadGtmContainer, updateGtmConsent } from '@/lib/analytics/gtm';
import { grantMetaPixelConsent, revokeMetaPixelConsent } from '@/lib/analytics/metaPixel';
import { useMarket } from '@/contexts/MarketContext';
import { localizeTree } from '@/lib/markets/localizeTree';

function CookieConsentBannerContent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getConsentState();
    setVisible(!consent);
  }, []);

  // Mientras el aviso está abierto, la barra fija de CTA de las fichas no se muestra.
  useEffect(() => {
    const root = document.documentElement;
    if (visible) root.dataset.cookieBanner = 'open';
    else delete root.dataset.cookieBanner;
    return () => {
      delete root.dataset.cookieBanner;
    };
  }, [visible]);

  const handleChoice = async (accepted: boolean) => {
    setConsentState({
      analytics: accepted,
      marketing: accepted,
    });
    setVisible(false);

    // GTM ya está cargado (sin elección se mide completo); acá solo se actualiza el permiso.
    updateGtmConsent(accepted, accepted);
    loadGtmContainer(accepted, accepted);

    if (accepted) {
      grantMetaPixelConsent();
    } else {
      revokeMetaPixelConsent();
    }
    // Se registra la elección en los dos casos; si rechazó, el evento va anónimo.
    await trackEvent(accepted ? 'cookie_consent_accepted' : 'cookie_consent_rejected', {
      metadata: { analytics: accepted, marketing: accepted },
    });
  };

  if (!visible) return null;

  // Barra inferior que no bloquea: el visitante ve el sitio (y el diseñador) desde el
  // primer segundo. Antes era un modal a pantalla completa.
  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-[var(--alcohn-line-strong)] bg-[var(--alcohn-paper)] px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 shadow-[0_-12px_32px_rgba(0,0,0,0.12)] md:px-8 md:py-4"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
        <p className="text-[13px] leading-snug text-neutral-800 md:text-sm">
          Usamos cookies para medir y mejorar el sitio y nuestras campañas. Si seguís navegando,
          lo aceptás. Si preferís, podés rechazarlas.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="inline-flex min-h-[40px] flex-1 items-center justify-center border border-[var(--alcohn-line)] bg-transparent px-4 py-2 text-xs font-semibold uppercase text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 md:flex-none"
            onClick={() => {
              void handleChoice(false);
            }}
          >
            Rechazar
          </button>
          <button
            type="button"
            className="inline-flex min-h-[40px] flex-1 items-center justify-center border border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] px-4 py-2 text-xs font-semibold uppercase text-white transition-colors hover:border-[var(--alcohn-bronze)] hover:bg-[var(--alcohn-ink-soft)] md:flex-none"
            onClick={() => {
              void handleChoice(true);
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CookieConsentBanner() {
  const { market } = useMarket();
  return localizeTree(CookieConsentBannerContent(), market);
}
