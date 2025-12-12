import { ProcessStep } from '@/data/process';

interface TimelineProps {
  steps: ProcessStep[];
}

export default function Timeline({ steps }: TimelineProps) {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.step} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-bronce text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-full bg-secondary-dark mx-auto mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

