import ActionButton from './ActionButton';
import AutoImageCarousel from './AutoImageCarousel';

interface HeroProps {
  title: string;
  subtitle: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
}

export default function Hero({ title, subtitle, primaryCta, secondaryCta }: HeroProps) {
  return (
    <section className="md:snap-start md:snap-always min-h-[calc(100svh-6rem)] md:h-[calc(100vh-7rem)] py-16 md:py-0 flex items-center justify-center relative text-white overflow-hidden" data-snap-section>
      {/* Carrusel de fondo */}
      <div className="absolute inset-0 z-0">
        <AutoImageCarousel
          images={[
            { id: 1, src: '/images/background/motquero1.webp', alt: 'Motoquero 1' },
            { id: 2, src: '/images/background/motoquero2.webp', alt: 'Motoquero 2' },
          ]}
          interval={4000}
          priority
        />
      </div>
      
      {/* Overlay oscuro para legibilidad del texto */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,16,14,0.82)_0%,rgba(17,16,14,0.58)_45%,rgba(17,16,14,0.34)_100%)] z-10" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--alcohn-paper)] via-transparent to-transparent z-10" />
      
      {/* Contenido */}
      <div className="container mx-auto px-4 md:px-8 w-full relative z-20">
        <div className="max-w-5xl">
          <h1 className="font-abacaxi text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-8 leading-[1.08] text-white tracking-tight drop-shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
            {title}
          </h1>
          <p className="font-abacaxi text-lg md:text-xl font-thin italic mb-10 text-white/90 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
          {primaryCta && (
            <div className="flex flex-col sm:flex-row gap-3">
              <ActionButton
                href={primaryCta.href}
                variant="primary"
                className="px-8 py-3 text-sm"
              >
                {primaryCta.text}
              </ActionButton>
              {secondaryCta && (
                <ActionButton
                  href={secondaryCta.href}
                  variant="secondary"
                  className="px-8 py-3 text-sm"
                >
                  {secondaryCta.text}
                </ActionButton>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
