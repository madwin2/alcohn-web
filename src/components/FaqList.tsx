'use client';

import { useState } from 'react';
import { FAQ } from '@/data/faq';

interface FaqListProps {
  faqs: FAQ[];
}

export default function FaqList({ faqs }: FaqListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-secondary-dark rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-secondary transition-colors"
                >
                  <span className="font-semibold">{faq.question}</span>
                  <span className="text-2xl">
                    {openIndex === index ? '−' : '+'}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-secondary text-gray-700">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}





