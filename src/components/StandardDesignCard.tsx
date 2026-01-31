import Image from 'next/image';
import Link from 'next/link';
import { StandardDesign } from '@/lib/catalog';

interface StandardDesignCardProps {
  design: StandardDesign;
}

const collectionLabels: Record<string, string> = {
  futbol: 'Fútbol',
  argentina: 'Argentina',
  cuero: 'Cuero',
  madera: 'Madera',
  oficios: 'Oficios',
};

export default function StandardDesignCard({ design }: StandardDesignCardProps) {
  const priceDisplay = `Desde $${design.startingPrice.toLocaleString('es-AR')}`;

  return (
    <Link href={`/sellos/estandar/${design.slug}`} className="group block">
      <div className="border border-neutral-300 bg-white transition-all duration-150 hover:border-neutral-900">
        {/* Image */}
        <div className="aspect-square bg-neutral-50 relative overflow-hidden border-b border-neutral-300">
          {design.image ? (
            <Image
              src={design.image}
              alt={design.title}
              width={400}
              height={400}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Collection label */}
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
            {collectionLabels[design.collection] || design.collection}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">
            {design.title}
          </h3>

          {/* Description */}
          {design.description && (
            <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2">
              {design.description}
            </p>
          )}

          {/* Price */}
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-2">
                Desde
              </span>
              {priceDisplay}
            </p>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-medium bg-white text-neutral-900 border border-neutral-300 hover:border-neutral-900 transition-all duration-150">
              Elegir este diseño
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

