'use client';

interface MaterialStepProps {
  selected: string | null;
  onSelect: (material: 'cuero' | 'madera' | 'alimentos' | 'otro') => void;
}

export default function MaterialStep({ selected, onSelect }: MaterialStepProps) {
  const materials = [
    { id: 'cuero' as const, label: 'Cuero', icon: '👜' },
    { id: 'madera' as const, label: 'Madera', icon: '🪵' },
    { id: 'alimentos' as const, label: 'Alimentos', icon: '🍞' },
    { id: 'otro' as const, label: 'Otro', icon: '📦' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">2. ¿Qué material querés marcar?</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {materials.map((material) => (
          <button
            key={material.id}
            onClick={() => onSelect(material.id)}
            className={`p-6 border-2 rounded-lg text-center transition-all ${
              selected === material.id
                ? 'border-accent bg-accent/10'
                : 'border-secondary-dark hover:border-accent'
            }`}
          >
            <div className="text-4xl mb-2">{material.icon}</div>
            <div className="font-semibold">{material.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}







