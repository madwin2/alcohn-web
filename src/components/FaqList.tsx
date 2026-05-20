'use client';

import { useState } from 'react';
import { FAQ } from '@/data/faq';

interface FaqListProps {
  faqs: FAQ[];
}

export default function FaqList({ faqs }: FaqListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="technical-sheet">
      <div className="relative z-10 divide-y divide-[var(--alcohn-line)]">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => toggle(index)}
                className="flex w-full items-start justify-between gap-6 p-5 text-left transition-colors hover:bg-white md:p-6"
                aria-expanded={isOpen}
              >
                <span className="grid grid-cols-[42px_1fr] gap-4">
                  <span className="craft-label pt-1">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-base md:text-lg font-semibold tracking-tight text-neutral-950">
                    {faq.question}
                  </span>
                </span>
                <span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] transition-transform ${isOpen ? 'rotate-45' : ''}`}>
                  <svg className="h-4 w-4 text-neutral-900" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div className="grid grid-cols-[42px_1fr] gap-4 px-5 pb-6 md:px-6">
                  <span />
                  <p className="max-w-3xl text-sm leading-relaxed text-neutral-700">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
