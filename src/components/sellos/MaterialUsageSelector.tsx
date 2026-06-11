'use client';

import { useEffect, useState } from 'react';
import type { MaterialUsageGuide, UsageGuideItem } from '@/data/materialUsageGuide';
import { materialUsageGuide } from '@/data/materialUsageGuide';

function UsageGuideList({ items }: { items: UsageGuideItem[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-800 marker:text-neutral-300">
      {items.map((item) => (
        <li key={item.text}>
          <span>{item.text}</span>
          {item.subItems ? (
            <ul className="mt-2 list-[circle] space-y-1.5 pl-4 text-neutral-600">
              {item.subItems.map((subItem) => (
                <li key={subItem}>{subItem}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function Chip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'min-h-[40px] whitespace-nowrap border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
        isActive
          ? 'border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] text-white'
          : 'border-[var(--alcohn-line)] bg-white text-neutral-700 hover:border-neutral-950',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function MaterialGridButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'min-h-[44px] w-full border px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wider transition-colors',
        isActive
          ? 'border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] text-white'
          : 'border-[var(--alcohn-line)] bg-white text-neutral-700 hover:border-neutral-950',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function MaterialSectionBody({
  section,
  methodIndex,
  onMethodChange,
  stackedMethods = false,
}: {
  section: MaterialUsageGuide;
  methodIndex: number;
  onMethodChange?: (index: number) => void;
  stackedMethods?: boolean;
}) {
  if (section.methods?.length) {
    if (stackedMethods) {
      return (
        <div className="space-y-6">
          {section.methods.map((method) => (
            <div key={`${section.material}-${method.name}`}>
              <p className="mb-2 text-sm font-semibold text-neutral-950">{method.name}</p>
              <UsageGuideList items={method.items} />
            </div>
          ))}
        </div>
      );
    }

    const method = section.methods[methodIndex] ?? section.methods[0];
    const showMethodTabs = section.methods.length > 1;

    return (
      <div className="space-y-5">
        {showMethodTabs && onMethodChange ? (
          <div className="flex flex-wrap gap-2">
            {section.methods.map((item, index) => (
              <Chip
                key={item.name}
                label={item.name}
                isActive={index === methodIndex}
                onClick={() => onMethodChange(index)}
              />
            ))}
          </div>
        ) : null}
        <UsageGuideList items={method.items} />
      </div>
    );
  }

  if (section.items) {
    return <UsageGuideList items={section.items} />;
  }

  return null;
}

export default function MaterialUsageSelector({
  guides = materialUsageGuide,
}: {
  guides?: MaterialUsageGuide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [methodIndex, setMethodIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);

  const activeSection = guides[activeIndex] ?? guides[0];

  useEffect(() => {
    setMethodIndex(0);
  }, [activeIndex]);

  return (
    <>
      <div className="relative z-10 hidden lg:grid lg:grid-cols-[0.34fr_0.66fr]">
        <div className="border-r border-[var(--alcohn-line)] p-6 xl:p-8">
          <p className="craft-label mb-4">Selector de método</p>
          <h2 className="text-3xl xl:text-4xl font-semibold leading-tight tracking-tight text-neutral-950">
            Qué material querés marcar
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {guides.map((section, index) => (
              <MaterialGridButton
                key={section.material}
                label={section.material}
                isActive={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>

        <div className="p-6 xl:p-8">
          {activeSection.methods && activeSection.methods.length > 1 ? (
            <p className="craft-label mb-4">Técnica</p>
          ) : null}
          <MaterialSectionBody
            section={activeSection}
            methodIndex={methodIndex}
            onMethodChange={setMethodIndex}
          />
        </div>
      </div>

      <div className="lg:hidden">
        <div className="border-b border-[var(--alcohn-line)] p-4 md:p-6">
          <p className="craft-label mb-4">Selector de método</p>
          <h2 className="text-[1.9rem] md:text-3xl font-semibold leading-[1.08] tracking-tight text-neutral-950">
            Qué material querés marcar
          </h2>
        </div>
        <div className="divide-y divide-[var(--alcohn-line)]">
        {guides.map((section) => {
          const isOpen = mobileOpen === section.material;

          return (
            <article key={section.material}>
              <button
                type="button"
                onClick={() => setMobileOpen(isOpen ? null : section.material)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-base font-semibold text-neutral-950">{section.material}</span>
                <span className="text-neutral-400">{isOpen ? '−' : '+'}</span>
              </button>

              {isOpen ? (
                <div className="border-t border-[var(--alcohn-line)] px-4 pb-4 pt-3">
                  <MaterialSectionBody section={section} methodIndex={0} stackedMethods />
                </div>
              ) : null}
            </article>
          );
        })}
        </div>
      </div>
    </>
  );
}
