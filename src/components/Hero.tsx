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
    <section className="md:snap-start md:snap-always min-h-[78svh] md:min-h-[calc(100svh-4.5rem)] md:h-[calc(100vh-7rem)] py-8 md:py-0 flex items-center justify-center relative text-white overflow-hidden" data-snap-section>
      {/* Carrusel de fondo */}
      <div className="absolute inset-0 z-0">
        <AutoImageCarousel
          images={[
            {
              id: 1,
              src: '/images/hero/imagen-hero.jpeg',
              alt: 'Taller artesanal con sello de bronce personalizado Alcohn',
            },
          ]}
          priority
        />
      </div>
      
      {/* Overlay oscuro para legibilidad del texto */}
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(17,16,14,0.78)_0%,rgba(17,16,14,0.66)_55%,rgba(17,16,14,0.5)_100%)] md:bg-[linear-gradient(90deg,rgba(17,16,14,0.82)_0%,rgba(17,16,14,0.58)_45%,rgba(17,16,14,0.34)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 md:h-40 bg-gradient-to-t from-[var(--alcohn-paper)] via-transparent to-transparent z-10" />
      
      {/* Contenido */}
      <div className="container mx-auto px-4 md:px-8 w-full relative z-20">
        <div className="max-w-5xl">
          <h1 className="font-abacaxi text-[1.95rem] sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 md:mb-8 leading-[1.06] md:leading-[1.08] text-white tracking-tight drop-shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
            {title}
          </h1>
          <p className="font-abacaxi mb-6 max-w-2xl text-[15px] font-normal not-italic leading-relaxed text-white/95 sm:text-lg md:mb-10 md:text-xl md:font-thin md:italic md:text-white/90">
            <span className="md:hidden">
              Sellos de bronce para cuero, madera, alimentos y packaging.
            </span>
            <span className="hidden md:inline">{subtitle}</span>
          </p>
          {primaryCta && (
            <div className="flex flex-col sm:flex-row gap-3">
              <ActionButton
                href={primaryCta.href}
                variant="secondary"
                className="w-full sm:w-auto min-h-[52px] md:min-h-[44px] px-6 md:px-8 py-3 text-[13px] md:text-sm border-white bg-white text-neutral-900 hover:bg-[var(--alcohn-paper)] hover:border-[var(--alcohn-bronze)]"
              >
                {primaryCta.text}
              </ActionButton>
              {secondaryCta && (
                <ActionButton
                  href={secondaryCta.href}
                  variant="primary"
                  className="w-full sm:w-auto min-h-[48px] md:min-h-[44px] px-6 md:px-8 py-3 text-[13px] md:text-sm"
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
