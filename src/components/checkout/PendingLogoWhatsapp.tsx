'use client';

import { useEffect, useState } from 'react';
import { pushGtmEvent } from '@/lib/analytics/gtm';
import { trackEvent } from '@/lib/analytics/client';
import {
  pendingLogoWhatsappUrl,
  readPendingLogoSnapshot,
  type PendingLogoSnapshot,
} from '@/lib/pendingLogo';

/**
 * Bloque de la confirmación de compra: si algún sello se compró sin logo, botón directo
 * a WhatsApp con el número de pedido para mandarlo. No se muestra si todos traían logo.
 */
export default function PendingLogoWhatsapp({ orderId }: { orderId: string | null }) {
  const [snapshot, setSnapshot] = useState<PendingLogoSnapshot | null>(null);

  useEffect(() => {
    setSnapshot(readPendingLogoSnapshot(orderId));
  }, [orderId]);

  if (!orderId || !snapshot) return null;

  const href = pendingLogoWhatsappUrl(orderId, snapshot.stamps);

  return (
    <div className="mx-auto mb-6 max-w-md border-2 border-[var(--alcohn-bronze,#a87a4a)] bg-[rgba(184,132,79,0.06)] p-4 text-left">
      <p className="text-[15px] font-semibold text-neutral-900">Último paso: mandanos tu logo</p>
      <p className="mt-1 text-[13.5px] leading-snug text-neutral-700">
        {snapshot.stamps.length === 1 && !/^\d+×/.test(snapshot.stamps[0])
          ? 'Compraste un sello sin logo.'
          : 'Compraste sellos sin logo.'}{' '}
        Mandalo por WhatsApp y lo sumamos a tu pedido. Te enviamos la muestra antes de fabricar.
      </p>
      <ul className="mt-2 list-disc pl-5 text-[13px] text-neutral-700">
        {snapshot.stamps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          pushGtmEvent('click_whatsapp', { ubicacion: 'confirmacion_logo_pendiente', market: 'ar' });
          void trackEvent('whatsapp_click', {
            metadata: { ubicacion: 'confirmacion_logo_pendiente', orden_id: orderId },
          });
        }}
        className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 bg-[#1f8f4e] px-4 text-[14px] font-semibold text-white hover:bg-[#1a7a43]"
      >
        Mandar mi logo por WhatsApp
      </a>
    </div>
  );
}
