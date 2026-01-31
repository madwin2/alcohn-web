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
    <section className="snap-start snap-always h-[calc(100vh-4rem)] flex items-center justify-center relative text-white overflow-hidden" data-snap-section>
      {/* Carrusel de fondo */}
      <div className="absolute inset-0 z-0">
        <AutoImageCarousel
          images={[
            { id: 1, src: '/images/background/motquero1.png', alt: 'Motoquero 1' },
            { id: 2, src: '/images/background/motoquero2.png', alt: 'Motoquero 2' },
          ]}
          interval={4000}
        />
      </div>
      
      {/* Overlay oscuro para legibilidad del texto */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      
      {/* Contenido */}
      <div className="container mx-auto px-4 md:px-8 w-full relative z-20">
        <div className="max-w-5xl">
          <h1 className="font-abacaxi text-5xl md:text-6xl lg:text-7xl font-semibold mb-8 leading-[1.15] text-white tracking-tight">
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
