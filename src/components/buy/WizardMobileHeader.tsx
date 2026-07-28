'use client';

import Image from 'next/image';
import Link from 'next/link';

const MOBILE_STEP_TITLES: Record<string, string> = {
  material: 'Diseñá tu sello',
  logo: 'Tu logo',
  contact: 'Muestra gratis',
  preview: 'Tu muestra',
  size: 'Medida y precio',
  payment: 'Forma de pago',
};

type WizardMobileHeaderProps = {
  steps: { label: string; key: string }[];
  currentStep: number;
  onBack?: () => void;
};

export default function WizardMobileHeader({
  steps,
  currentStep,
  onBack,
}: WizardMobileHeaderProps) {
  const total = steps.length;
  const step = steps[currentStep - 1];
  const progress = Math.max(
    0,
    Math.min(100, ((currentStep - 1) / Math.max(1, total - 1)) * 100)
  );
  const title = step
    ? MOBILE_STEP_TITLES[step.key] ?? step.label
    : 'Diseñá tu sello';
  const showBack = currentStep > 1 && Boolean(onBack);

  return (
    <header className="wizard-mobile-header shrink-0 md:hidden">
      <div className="flex min-h-[52px] items-center gap-1 px-1 pr-2">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="flex h-11 w-11 shrink-0 items-center justify-center text-[22px] leading-none text-white active:bg-white/10"
          >
            ‹
          </button>
        ) : (
          <span className="w-3 shrink-0" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-[var(--alcohn-bronze)]">
            Paso {currentStep} de {total}
          </p>
          <p className="truncate text-[15px] font-semibold tracking-tight text-white">
            {title}
          </p>
        </div>
        <Link href="/" className="shrink-0 pr-1.5 opacity-95" aria-label="Alcohn inicio">
          <Image
            src="/images/brand/alcohn-logo.png"
            alt="Alcohn"
            width={88}
            height={20}
            className="h-5 w-auto invert"
            priority
          />
        </Link>
      </div>
      <div className="h-[3px] bg-white/12" aria-hidden>
        <div
          className="h-full bg-gradient-to-r from-[var(--alcohn-bronze)] to-[var(--alcohn-bronze-dark)] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
