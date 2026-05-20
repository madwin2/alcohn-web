import Image from 'next/image';
import ActionButton from './ActionButton';

interface IntentCardProps {
  title: string;
  description: string;
  href: string;
  variant?: 'primary' | 'secondary';
  image?: string;
  imageAlt?: string;
  priority?: boolean;
  className?: string;
}

export default function IntentCard({
  title,
  description,
  href,
  variant = 'primary',
  image,
  imageAlt,
  priority = false,
  className = '',
}: IntentCardProps) {
  return (
    <div className={`material-card flex flex-col p-3 ${className}`}>
      {/* Image Preview */}
      {image && (
        <div className="material-frame aspect-[4/3] relative overflow-hidden">
          <Image
            src={image}
            alt={imageAlt || title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5 md:p-9 flex flex-col flex-1">
        <div className="mb-6">
          <h3 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-4 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-md">
            {description}
          </p>
        </div>
        
        <div className="mt-auto pt-6 border-t border-[var(--alcohn-line)]">
          <ActionButton
            href={href}
            variant={variant}
            className="w-full sm:w-auto"
          >
            {variant === 'primary' ? 'Diseñar mi sello' : 'Ver diseños disponibles'}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}


