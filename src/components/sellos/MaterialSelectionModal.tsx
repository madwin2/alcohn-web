'use client';

import { useEffect, useRef } from 'react';
import StampMaterialGrid from '@/components/sellos/StampMaterialGrid';

interface MaterialSelectionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MaterialSelectionModal({ open, onClose }: MaterialSelectionModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 p-0 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="material-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="relative my-auto w-full max-w-6xl bg-[var(--alcohn-paper)] shadow-2xl md:mx-4"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-[var(--alcohn-line)] bg-white text-lg font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="border-b border-[var(--alcohn-line)] p-5 md:p-10">
          <p className="craft-label mb-4">Sello personalizado</p>
          <h2 id="material-modal-title" className="max-w-3xl text-2xl font-semibold tracking-tight text-neutral-950 md:text-4xl">
            El sello funciona para todos los materiales
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-700 md:text-base">
            <span className="md:hidden">
              Elegí el material principal y te llevamos directo a la guía y al diseñador con ese contexto.
            </span>
            <span className="hidden md:inline">
              Elegí el material principal para el que vas a usar el sello. Te llevamos a la guía con fotos,
              medidas recomendadas y el diseñador online con ese contexto.
            </span>
          </p>
        </div>

        <StampMaterialGrid onLinkClick={onClose} />
      </div>
    </div>
  );
}
