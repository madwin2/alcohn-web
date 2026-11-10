'use client';

import { useEffect, useRef, useState } from 'react';
import ActionButton from '@/components/ActionButton';

interface StickyMobileCtaProps {
  href: string;
  label: string;
  /** Línea chica debajo del botón (opcional). */
  note?: string;
}

/** Botón del hero (PageIntro) y bloque del CTA final de la página. */
const START_SELECTOR = '[data-hero-cta]';
const END_SELECTOR = '[data-sticky-cta-end]';

/**
 * Barra fija inferior, solo en celular: aparece cuando el botón del hero salió de pantalla
 * y se oculta al llegar al CTA final. Publica su estado en <html> (`data-sticky-cta` y
 * `--sticky-cta-height`) para que el botón flotante de WhatsApp suba y no quede tapado.
 * Mientras el aviso de cookies está abierto no se muestra (ver `.sticky-cta-bar` en globals.css).
 */
export default function StickyMobileCta({ href, label, note }: StickyMobileCtaProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const start = document.querySelector(START_SELECTOR);
    const end = document.querySelector(END_SELECTOR);
    if (!start || typeof IntersectionObserver === 'undefined') return;

    let pastStart = false;
    let reachedEnd = false;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === start) {
          // Solo cuenta si quedó por arriba (ya se scrolleó), no si todavía no apareció.
          pastStart = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
        } else if (entry.target === end) {
          reachedEnd = entry.isIntersecting || entry.boundingClientRect.top < 0;
        }
      }
      setVisible(pastStart && !reachedEnd);
    });

    observer.observe(start);
    if (end) observer.observe(end);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (visible) {
      root.dataset.stickyCta = 'visible';
      if (barRef.current) {
        root.style.setProperty('--sticky-cta-height', `${barRef.current.offsetHeight}px`);
      }
    } else {
      delete root.dataset.stickyCta;
    }
  }, [visible]);

  useEffect(
    () => () => {
      delete document.documentElement.dataset.stickyCta;
      document.documentElement.style.removeProperty('--sticky-cta-height');
    },
    []
  );

  return (
    <div
      ref={barRef}
      aria-hidden={!visible}
      className={`sticky-cta-bar fixed inset-x-0 bottom-0 z-40 border-t border-[var(--alcohn-line-strong)] bg-[var(--alcohn-paper)] px-4 pb-[max(env(safe-area-inset-bottom),0.625rem)] pt-2.5 shadow-[0_-10px_30px_rgba(17,16,14,0.12)] transition-[transform,visibility] duration-300 ease-out motion-reduce:transition-none md:hidden ${
        visible ? 'visible translate-y-0' : 'invisible translate-y-full'
      }`}
    >
      <ActionButton href={href} variant="primary" className="w-full">
        {label}
      </ActionButton>
      {note ? (
        <p className="mt-1 text-center text-[11px] leading-tight text-neutral-600">{note}</p>
      ) : null}
    </div>
  );
}
