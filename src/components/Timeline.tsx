import { ProcessStep } from '@/data/process';
import Divider from './Divider';

interface TimelineProps {
  steps: ProcessStep[];
}

export default function Timeline({ steps }: TimelineProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-0">
        {steps.map((step, index) => (
          <div key={step.step}>
            <div className="flex gap-8 pb-12">
              {/* Numeración técnica */}
              <div className="flex-shrink-0 pt-1">
                <div className="w-10 h-10 border border-neutral-900 bg-white text-neutral-900 flex items-center justify-center font-mono text-sm font-medium">
                  {String(step.step).padStart(2, '0')}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-px h-full bg-neutral-200 mx-auto mt-3 min-h-[60px]" />
                )}
              </div>
              
              {/* Contenido */}
              <div className="flex-1 pb-12">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <Divider className="mb-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
