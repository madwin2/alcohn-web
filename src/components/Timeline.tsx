import { ProcessStep } from '@/data/process';

interface TimelineProps {
  steps: ProcessStep[];
}

export default function Timeline({ steps }: TimelineProps) {
  return (
    <div className="technical-sheet">
      <div className="relative z-10">
        {steps.map((step, index) => (
          <div
            key={step.step}
            className="grid grid-cols-[72px_1fr] md:grid-cols-[120px_0.36fr_0.64fr] border-b last:border-b-0 border-[var(--alcohn-line)]"
          >
            <div className="border-r border-[var(--alcohn-line)] p-4 md:p-6">
              <div className="flex h-10 w-10 items-center justify-center border border-[var(--alcohn-line-strong)] bg-white text-sm font-semibold text-neutral-950">
                {String(step.step).padStart(2, '0')}
              </div>
            </div>

            <div className="p-4 md:p-6 md:border-r border-[var(--alcohn-line)]">
              <p className="craft-label mb-3">Etapa {String(index + 1).padStart(2, '0')}</p>
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-950">
                {step.title}
              </h3>
            </div>

            <div className="col-span-2 md:col-span-1 p-4 md:p-6">
              <p className="text-sm md:text-base leading-relaxed text-neutral-700 max-w-2xl">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
