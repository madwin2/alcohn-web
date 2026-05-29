interface StepperProps {
  steps: { label: string; key: string }[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  const progress = Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100));

  return (
    <nav className="technical-sheet mb-3 p-2 md:mb-8 md:p-5" aria-label="Progreso de compra">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="craft-label mb-1 hidden md:block">Orden de fabricación</p>
          <p className="text-sm font-semibold text-neutral-900">
            Paso {currentStep} de {steps.length}
          </p>
        </div>
        <div className="hidden text-right md:block">
          <p className="text-[10px] font-semibold uppercase text-neutral-500">ALC-CUSTOM</p>
          <p className="text-[11px] text-neutral-500 md:text-xs">Compra online</p>
        </div>
      </div>
      <div className="mt-2 h-1 border border-[var(--alcohn-line)] bg-white md:mt-4">
        <div
          className="h-full bg-[var(--alcohn-ink)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="mt-2 flex gap-1 overflow-x-auto pb-1 md:hidden">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          return (
            <li
              key={step.key}
              aria-current={isActive ? 'step' : undefined}
              className={`shrink-0 border px-2 py-1 ${
                isActive
                  ? 'stepper-active bg-[var(--alcohn-paper)] text-neutral-950'
                  : isCompleted
                  ? 'bg-neutral-950 text-white'
                  : 'bg-white/75 text-neutral-500'
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-normal">
                {String(stepNumber).padStart(2, '0')} {step.label}
              </p>
            </li>
          );
        })}
      </ol>

      <ol className="mt-4 hidden grid-cols-2 sm:grid sm:grid-cols-3 lg:grid-cols-6 border border-[var(--alcohn-line)] bg-white/50">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <li
              key={step.key}
              aria-current={isActive ? 'step' : undefined}
              className={`min-h-[72px] border-b border-r border-[var(--alcohn-line)] p-3 last:border-r-0 sm:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r lg:[&:nth-child(6n)]:border-r-0 ${
                isActive
                  ? 'stepper-active bg-[var(--alcohn-paper)] text-neutral-950'
                  : isCompleted
                  ? 'bg-neutral-950 text-white'
                  : 'bg-white/62 text-neutral-500'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-semibold uppercase ${isCompleted ? 'text-white/58' : 'text-neutral-500'}`}>
                  {String(stepNumber).padStart(2, '0')}
                </span>
                {isCompleted && (
                  <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <p className="mt-5 text-xs font-semibold uppercase leading-tight tracking-normal">
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
