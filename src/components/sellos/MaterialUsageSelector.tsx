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
      <div className="space-y-4">
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
      <div className="hidden lg:block p-5 xl:p-6">
        <div className="mb-5 flex flex-wrap gap-2">
          {guides.map((section, index) => (
            <Chip
              key={section.material}
              label={section.material}
              isActive={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
        <MaterialSectionBody
          section={activeSection}
          methodIndex={methodIndex}
          onMethodChange={setMethodIndex}
        />
      </div>

      <div className="lg:hidden divide-y divide-[var(--alcohn-line)]">
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
    </>
  );
}
