import type { BeforeBuyFaq } from '@/data/standardStampBeforeBuyFaqs';

type BeforeBuySectionProps = {
  faqs: BeforeBuyFaq[];
  className?: string;
};

export default function BeforeBuySection({ faqs, className = '' }: BeforeBuySectionProps) {
  return (
    <section className={className}>
      <div className="mb-6 md:mb-8">
        <p className="craft-label mb-3">Antes de comprar</p>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 md:text-3xl">
          Lo que conviene saber.
        </h2>
      </div>

      <div className="technical-sheet divide-y divide-[var(--alcohn-line)]">
        {faqs.map((faq) => (
          <div
            key={faq.question}
            className="grid grid-cols-1 gap-3 p-5 md:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)] md:gap-6 md:p-6"
          >
            <h3 className="text-base font-semibold leading-snug text-neutral-950 md:text-lg">
              {faq.question}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-700">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
