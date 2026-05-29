'use client';

import { useState, type ReactNode } from 'react';

type WizardCollapsibleProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Menor padding y tipografía — útil en pasos del wizard en mobile. */
  compact?: boolean;
  className?: string;
};

export default function WizardCollapsible({
  title,
  children,
  defaultOpen = false,
  compact = false,
  className = '',
}: WizardCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`border border-gray-200/70 bg-transparent ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 bg-transparent text-left transition-colors hover:bg-black/[0.02] ${
          compact ? 'px-3 py-2' : 'gap-3 px-4 py-3'
        }`}
        aria-expanded={open}
      >
        <span
          className={`font-semibold text-gray-900 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          {title}
        </span>
        <span
          className={`text-gray-500 transition-transform ${compact ? 'text-[10px]' : 'text-xs'} ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ▼
        </span>
      </button>
      {open && (
        <div
          className={`border-t border-gray-200/70 bg-transparent ${compact ? 'px-3 py-3' : 'px-4 py-4'}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
