import Image from 'next/image';
import Link from 'next/link';
import { stampUseCases } from '@/data/stampUseCases';
import MobileCarousel from '@/components/MobileCarousel';
import MobileOverlayCarousel from '@/components/MobileOverlayCarousel';

interface StampMaterialGridProps {
  className?: string;
  onLinkClick?: () => void;
}

export default function StampMaterialGrid({ className = '', onLinkClick }: StampMaterialGridProps) {
  return (
    <div className={className}>
      <div className="md:hidden">
        <MobileOverlayCarousel
          showDots
          onLinkClick={onLinkClick}
          items={stampUseCases.map((useCase, index) => ({
            key: useCase.slug,
            image: useCase.heroImage,
            alt: useCase.heroAlt,
            href: `/sellos/${useCase.slug}`,
            overlay: (
              <>
                <p className="absolute left-4 top-4 text-[10px] font-semibold uppercase text-white/64">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <div>
                  <h3 className="text-2xl font-semibold leading-tight tracking-tight">{useCase.oficio}</h3>
                  <p className="mt-2 text-xs font-semibold uppercase text-white/72">{useCase.material}</p>
                  <p className="mt-5 text-xs font-semibold uppercase text-white/80">Ver fotos y medidas</p>
                </div>
              </>
            ),
          }))}
        />
      </div>

      <div className="technical-sheet hidden md:block">
        <MobileCarousel rowClassName="relative z-10 sm:grid sm:grid-cols-2 lg:grid-cols-3" hint="Deslizá materiales">
          {stampUseCases.map((useCase, index) => (
            <Link
              key={useCase.slug}
              href={`/sellos/${useCase.slug}`}
              onClick={onLinkClick}
              className="mobile-snap-card group relative min-h-[220px] overflow-hidden border border-[var(--alcohn-line)] p-5 text-white sm:min-w-0 sm:border-b sm:border-r"
            >
              <Image
                src={useCase.heroImage}
                alt={useCase.heroAlt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,16,14,0.12)_0%,rgba(17,16,14,0.58)_62%,rgba(17,16,14,0.86)_100%)]" />
              <div className="relative flex h-full min-h-[180px] flex-col justify-between">
                <p className="text-[10px] font-semibold uppercase text-white/62">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <div>
                  <h3 className="text-2xl font-semibold leading-tight tracking-tight">{useCase.oficio}</h3>
                  <p className="mt-2 text-xs font-semibold uppercase text-white/72">{useCase.material}</p>
                  <p className="mt-5 text-xs font-semibold uppercase text-white/80">Ver fotos y medidas</p>
                </div>
              </div>
            </Link>
          ))}
        </MobileCarousel>
      </div>
    </div>
  );
}
