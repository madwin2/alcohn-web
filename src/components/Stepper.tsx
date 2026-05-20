interface StepperProps {
  steps: { label: string; key: string }[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  const progress = Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100));

  return (
    <nav className="technical-sheet blueprint-sheet mb-8 p-4 md:p-5" aria-label="Progreso de compra">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="craft-label mb-1">Orden de fabricación</p>
          <p className="text-sm font-semibold text-neutral-900">
            Paso {currentStep} de {steps.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase text-neutral-500">ALC-CUSTOM</p>
          <p className="text-xs text-neutral-500">Compra online</p>
        </div>
      </div>
      <div className="mt-4 h-1 border border-[var(--alcohn-line)] bg-white">
        <div
          className="h-full bg-[var(--alcohn-ink)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-[var(--alcohn-line)] bg-white/50">
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
