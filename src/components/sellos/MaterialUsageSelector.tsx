'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type {
  MaterialUsageGuide,
  UsageGuideContent,
  UsageGuideMethod,
} from '@/data/materialUsageGuide';
import { materialUsageGuide } from '@/data/materialUsageGuide';

function resolveContent(
  section: MaterialUsageGuide,
  methodIndex: number,
  variantIndex: number,
): UsageGuideContent | null {
  if (section.content) {
    return section.content;
  }

  if (section.variants?.length) {
    return section.variants[variantIndex]?.content ?? section.variants[0]?.content ?? null;
  }

  if (section.methods?.length) {
    const method = section.methods[methodIndex] ?? section.methods[0];
    if (method.variants?.length) {
      return method.variants[variantIndex]?.content ?? method.variants[0]?.content ?? null;
    }
    return method.content ?? null;
  }

  return null;
}

function activeMethod(section: MaterialUsageGuide, methodIndex: number): UsageGuideMethod | null {
  if (!section.methods?.length) {
    return null;
  }
  return section.methods[methodIndex] ?? section.methods[0];
}

function UsageParagraphs({ content }: { content: UsageGuideContent }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-neutral-800">
      {content.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function UsageSteps({ content }: { content: UsageGuideContent }) {
  return (
    <ol className="divide-y divide-[var(--alcohn-line)] border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)]">
      {content.paragraphs.map((paragraph, index) => (
        <li key={paragraph} className="grid grid-cols-[44px_1fr]">
          <span className="flex items-start justify-center border-r border-[var(--alcohn-line)] p-3 pt-3.5 text-xs font-semibold text-neutral-500">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="p-3.5 text-sm leading-relaxed text-neutral-800">{paragraph}</span>
        </li>
      ))}
    </ol>
  );
}

const MEDIA_ASPECT_CLASS = 'aspect-[3/4]';
const DESKTOP_MEDIA_WIDTH_CLASS = 'w-[220px] xl:w-[260px]';

function UsageMediaPanel({
  content,
  fillHeight = false,
  mobile = false,
}: {
  content: UsageGuideContent;
  fillHeight?: boolean;
  mobile?: boolean;
}) {
  const alt = content.posterAlt ?? 'Demostración de técnica de marcado';

  const media = content.videoSrc ? (
    <video
      key={content.videoSrc}
      src={content.videoSrc}
      autoPlay
      loop
      muted
      playsInline
      className={[
        'absolute inset-0 h-full w-full object-center',
        mobile ? 'object-contain' : 'object-cover',
      ].join(' ')}
      aria-label={alt}
    />
  ) : content.posterSrc ? (
    <Image
      src={content.posterSrc}
      alt={alt}
      fill
      className={mobile ? 'object-contain object-center' : 'object-cover object-center'}
      sizes={fillHeight ? '260px' : mobile ? '260px' : '100vw'}
    />
  ) : (
    <div className="flex h-full items-center justify-center p-4 text-center text-xs text-neutral-500">
      Video en preparación.
    </div>
  );

  return (
    <div
      className={[
        'relative overflow-hidden bg-neutral-950',
        fillHeight
          ? 'relative h-full w-full overflow-hidden'
          : mobile
            ? `mx-auto w-full max-w-[260px] shrink-0 border border-[var(--alcohn-line)] ${MEDIA_ASPECT_CLASS}`
            : `w-full shrink-0 border border-[var(--alcohn-line)] sm:max-w-[240px] ${MEDIA_ASPECT_CLASS}`,
      ].join(' ')}
    >
      {media}
    </div>
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
        'min-h-[40px] w-full border px-1.5 py-2 text-center text-[10px] font-semibold uppercase tracking-wider transition-colors xl:text-[11px]',
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
  variantIndex,
  onMethodChange,
  onVariantChange,
  layout = 'stacked',
}: {
  section: MaterialUsageGuide;
  methodIndex: number;
  variantIndex: number;
  onMethodChange?: (index: number) => void;
  onVariantChange?: (index: number) => void;
  layout?: 'stacked' | 'desktop' | 'mobile';
}) {
  const method = activeMethod(section, methodIndex);
  const showMethodTabs = Boolean(section.methods && section.methods.length > 1);
  const variantOptions = method?.variants ?? section.variants;
  const showVariantTabs = Boolean(variantOptions && variantOptions.length > 1);
  const showTechniqueLabel = Boolean(section.methods || section.variants);
  const content = resolveContent(section, methodIndex, variantIndex);

  if (!content) {
    return null;
  }

  const techniqueControls = (
    <>
      {showTechniqueLabel ? <p className="craft-label">Técnica</p> : null}

      {showMethodTabs && onMethodChange ? (
        <div className="flex flex-wrap gap-2 max-lg:-mx-1 max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:pb-1 max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden">
          {section.methods!.map((item, index) => (
            <Chip
              key={item.name}
              label={item.name}
              isActive={index === methodIndex}
              onClick={() => onMethodChange(index)}
            />
          ))}
        </div>
      ) : null}

      {showVariantTabs && onVariantChange ? (
        <div className="flex flex-wrap gap-2 max-lg:-mx-1 max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:pb-1 max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden">
          {variantOptions!.map((item, index) => (
            <Chip
              key={item.name}
              label={item.name}
              isActive={index === variantIndex}
              onClick={() => onVariantChange(index)}
            />
          ))}
        </div>
      ) : null}
    </>
  );

  if (layout === 'mobile') {
    return (
      <div className="space-y-4">
        {techniqueControls}
        <div>
          <p className="craft-label mb-2">Demostración</p>
          <UsageMediaPanel content={content} mobile />
        </div>
        <div>
          <p className="craft-label mb-2">Pasos</p>
          <UsageSteps content={content} />
        </div>
      </div>
    );
  }

  if (layout === 'desktop') {
    return (
      <div className="relative min-h-[400px]">
        <div className="flex flex-col gap-5 p-6 pr-[calc(220px+1.5rem)] xl:p-8 xl:pr-[calc(260px+2rem)]">
          {techniqueControls}
          <UsageParagraphs content={content} />
        </div>
        <div
          className={`absolute inset-y-0 right-0 overflow-hidden border-l border-[var(--alcohn-line)] bg-neutral-950 ${DESKTOP_MEDIA_WIDTH_CLASS}`}
        >
          <UsageMediaPanel content={content} fillHeight />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {techniqueControls}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-stretch sm:gap-6">
        <div className="min-w-0 flex-1">
          <UsageParagraphs content={content} />
        </div>
        <UsageMediaPanel content={content} />
      </div>
    </div>
  );
}

export default function MaterialUsageSelector({
  guides = materialUsageGuide,
}: {
  guides?: MaterialUsageGuide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [methodIndex, setMethodIndex] = useState(0);
  const [variantIndex, setVariantIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);

  const activeSection = guides[activeIndex] ?? guides[0];

  useEffect(() => {
    setMethodIndex(0);
    setVariantIndex(0);
  }, [activeIndex]);

  useEffect(() => {
    setVariantIndex(0);
  }, [methodIndex, activeIndex]);

  return (
    <>
      <div className="relative z-10 hidden lg:grid lg:grid-cols-[minmax(200px,0.23fr)_1fr]">
        <div className="border-r border-[var(--alcohn-line)] p-5 xl:p-6">
          <p className="craft-label mb-3">Selector de método</p>
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-neutral-950 xl:text-[1.75rem]">
            Qué material querés marcar
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-1.5">
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

        <div className="min-h-0">
          <MaterialSectionBody
            layout="desktop"
            section={activeSection}
            methodIndex={methodIndex}
            variantIndex={variantIndex}
            onMethodChange={setMethodIndex}
            onVariantChange={setVariantIndex}
          />
        </div>
      </div>

      <div className="lg:hidden">
        <div className="border-b border-[var(--alcohn-line)] p-4 md:p-6">
          <p className="craft-label mb-4">Selector de método</p>
          <h2 className="text-[1.9rem] font-semibold leading-[1.08] tracking-tight text-neutral-950 md:text-3xl">
            Qué material querés marcar
          </h2>
        </div>
        <div className="divide-y divide-[var(--alcohn-line)]">
          {guides.map((section, sectionIndex) => {
            const isOpen = mobileOpen === section.material;

            return (
              <article key={section.material}>
                <button
                  type="button"
                  onClick={() => {
                    if (isOpen) {
                      setMobileOpen(null);
                      return;
                    }
                    setActiveIndex(sectionIndex);
                    setMethodIndex(0);
                    setVariantIndex(0);
                    setMobileOpen(section.material);
                  }}
                  className={[
                    'flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors',
                    isOpen ? 'bg-[var(--alcohn-surface)]' : 'hover:bg-neutral-50',
                  ].join(' ')}
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-neutral-950">{section.material}</span>
                  <span
                    className={[
                      'flex h-7 w-7 shrink-0 items-center justify-center border text-sm transition-colors',
                      isOpen
                        ? 'border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] text-white'
                        : 'border-[var(--alcohn-line)] text-neutral-400',
                    ].join(' ')}
                    aria-hidden
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen ? (
                  <div className="border-t border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] px-4 pb-5 pt-4">
                    <MaterialSectionBody
                      layout="mobile"
                      section={section}
                      methodIndex={methodIndex}
                      variantIndex={variantIndex}
                      onMethodChange={setMethodIndex}
                      onVariantChange={setVariantIndex}
                    />
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
