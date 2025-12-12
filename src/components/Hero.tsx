import Link from 'next/link';

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
    <section className="relative bg-white text-primary min-h-screen flex items-center">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-5xl">
          <h1 className="font-abacaxi text-5xl md:text-6xl lg:text-7xl font-semibold mb-8 leading-[1.15] text-primary">
            {title}
          </h1>
          <p className="font-abacaxi text-lg md:text-xl font-thin italic mb-10 text-primary max-w-2xl">
            {subtitle}
          </p>
          {primaryCta && (
            <div>
              <Link
                href={primaryCta.href}
                className="inline-block bg-primary text-white px-10 py-4 font-abacaxi font-semibold hover:bg-primary-light transition-colors"
              >
                {primaryCta.text}
              </Link>
            </div>
          )}
          {secondaryCta && (
            <div className="mt-4">
              <Link
                href={secondaryCta.href}
                className="inline-block bg-transparent border-2 border-primary text-primary px-10 py-4 font-abacaxi font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                {secondaryCta.text}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

