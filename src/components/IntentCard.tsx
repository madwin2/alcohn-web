import Image from 'next/image';
import ActionButton from './ActionButton';

interface IntentCardProps {
  title: string;
  description: string;
  href: string;
  variant?: 'primary' | 'secondary';
  image?: string;
  imageAlt?: string;
  className?: string;
}

export default function IntentCard({
  title,
  description,
  href,
  variant = 'primary',
  image,
  imageAlt,
  className = '',
}: IntentCardProps) {
  return (
    <div className={`border border-neutral-300 bg-white flex flex-col ${className}`}>
      {/* Image Preview */}
      {image && (
        <div className="aspect-[4/3] bg-neutral-50 relative overflow-hidden border-b border-neutral-300">
          <Image
            src={image}
            alt={imageAlt || title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-8 md:p-12 flex flex-col flex-1">
        <div className="mb-6">
          <h3 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-4 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-md">
            {description}
          </p>
        </div>
        
        <div className="mt-auto pt-6 border-t border-neutral-200">
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


