import { whyChooseReasons } from '@/data/aboutAlcohn';

export default function WhyChooseAlcohnSection() {
  return (
    <section className="mb-20" aria-labelledby="por-que-elegirnos-heading">
      <div className="technical-sheet">
        <div className="relative z-10 border-b border-[var(--alcohn-line)] p-6 md:p-10 lg:p-12">
          <p className="craft-label mb-4">Por qué elegirnos</p>
          <h2
            id="por-que-elegirnos-heading"
            className="max-w-3xl text-3xl font-semibold tracking-tight leading-tight text-neutral-950 md:text-5xl"
          >
            Lo que nos diferencia
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-base">
            Cuatro razones concretas para confiar en Alcohn cuando tu marca necesita una herramienta
            profesional, duradera y bien pensada.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
          {whyChooseReasons.map((reason, index) => (
            <article
              key={reason.title}
              className={`border-b border-[var(--alcohn-line)] p-6 md:p-8 lg:p-10 ${
                index % 2 === 0 ? 'md:border-r' : ''
              } ${index >= whyChooseReasons.length - 2 ? 'md:border-b-0' : ''}`}
            >
              <p className="craft-label mb-4 text-[var(--alcohn-bronze-dark)]">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-neutral-950 md:text-2xl">
                {reason.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-neutral-700 md:text-base">
                {reason.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
