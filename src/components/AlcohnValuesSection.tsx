'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import MobileCarousel from '@/components/MobileCarousel';
import { prefersReducedMotion, revealEase } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const values = [
  {
    title: 'Calidad',
    copy: 'Creemos que una herramienta profesional debe sentirse como una. Por eso cuidamos cada detalle de fabricación, desde la precisión del mecanizado hasta la profundidad del grabado, la terminación final y la durabilidad de cada pieza.',
    image: '/images/producto/sello-bronce-galeria-01.webp',
    alt: 'Detalle de sello de bronce con terminación precisa',
  },
  {
    title: 'Diseño',
    copy: 'El diseño atraviesa todo lo que hacemos. Está en la forma del sello, en cómo adaptamos cada marca, en el packaging, en la fotografía, en la página web, en nuestro espacio de trabajo y en cada punto de contacto con el cliente. Para nosotros, diseñar es pensar con criterio, cuidar los detalles y construir una experiencia coherente, estética y profesional.',
    image: '/images/scroll/tote-packaging-marca-producto.png',
    alt: 'Packaging y presentación de producto con marca aplicada',
  },
  {
    title: 'Tecnología',
    copy: 'Usamos tecnología para transformar ideas en herramientas reales, precisas y duraderas. El mecanizado CNC nos permite trabajar con detalle, repetibilidad y control, pero siempre con una mirada humana y profesional sobre cada proyecto.',
    image: '/images/nosotros/mecanizado-cnc-precision.webp',
    alt: 'Mecanizado CNC de precisión en taller Alcohn',
  },
  {
    title: 'Oficio',
    copy: 'Trabajamos para personas que crean con sus manos, su experiencia y su historia. Entendemos el valor que hay detrás de cada producto artesanal, por eso buscamos que cada sello ayude a profesionalizar, distinguir y valorizar el trabajo de quien lo usa.',
    image: '/images/scroll/artesano-taller-identidad.webp',
    alt: 'Artesano trabajando en taller con herramientas de oficio',
  },
  {
    title: 'Cercanía',
    copy: 'Acompañamos a cada cliente con claridad, compromiso y atención personalizada. Sabemos que detrás de cada sello hay una marca, un emprendimiento o un proyecto importante, por eso buscamos que el proceso sea simple, seguro y humano.',
    image: '/images/nosotros/atencion.png',
    alt: 'Atención personalizada en el taller Alcohn',
  },
  {
    title: 'Mejora continua',
    copy: 'Buscamos mejorar constantemente nuestros productos, procesos y formas de comunicar. Desde la fabricación hasta la atención, la aprobación del diseño, el packaging y la experiencia de compra, cada parte puede evolucionar para ser más clara, profesional y memorable.',
    image: '/images/transforma/antes-despues-logo-sello-01.jpeg',
    alt: 'Evolución de un logo transformado en sello de bronce',
  },
] as const;

/** Altura fija para que todas las filas queden alineadas (cubre el valor con más texto). */
const DESKTOP_ROW_HEIGHT = 'md:h-[30rem] lg:h-[32rem]';

function ValueImage({ src, alt, variant }: { src: string; alt: string; variant: 'desktop' | 'mobile' }) {
  return (
    <div
      data-value-image
      className={`relative overflow-hidden ${
        variant === 'desktop' ? 'absolute inset-0 h-full w-full' : 'w-full'
      }`}
    >
      <div
        className={`material-frame relative overflow-hidden ${
          variant === 'desktop' ? 'h-full w-full' : 'aspect-[4/3] w-full'
        }`}
      >
        <img
          src={src}
          alt={alt}
          className="value-panel__img h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div
          data-value-image-veil
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function ValueCopy({
  index,
  title,
  copy,
  className = '',
}: {
  index: number;
  title: string;
  copy: string;
  className?: string;
}) {
  return (
    <div
      data-value-content
      className={`flex h-full flex-col justify-center p-6 md:p-10 lg:p-12 ${className}`}
    >
      <p data-value-index className="craft-label mb-4 text-[var(--alcohn-bronze-dark)]">
        {String(index + 1).padStart(2, '0')}
      </p>
      <div
        data-value-line
        className="mb-5 h-px w-12 origin-left bg-[var(--alcohn-bronze)] md:mb-6"
        aria-hidden="true"
      />
      <h3 className="text-2xl font-semibold tracking-tight text-neutral-950 transition-colors duration-300 group-hover:text-[var(--alcohn-bronze-dark)] md:text-3xl">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-relaxed text-neutral-700 md:mt-5 md:text-base md:leading-relaxed">
        {copy}
      </p>
    </div>
  );
}

function ValueCard({
  value,
  index,
  variant,
}: {
  value: (typeof values)[number];
  index: number;
  variant: 'desktop' | 'mobile';
}) {
  const reversed = index % 2 === 1;

  if (variant === 'mobile') {
    return (
      <article
        data-value-panel
        className="mobile-snap-card group flex w-[min(88vw,22rem)] flex-col overflow-hidden border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] md:min-w-0"
      >
        <ValueImage src={value.image} alt={value.alt} variant="mobile" />
        <ValueCopy index={index} title={value.title} copy={value.copy} className="!p-5" />
      </article>
    );
  }

  const imageColumn = (
    <div
      className={`relative min-h-[16rem] border-b border-[var(--alcohn-line)] md:min-h-0 md:border-b-0 md:border-r md:border-[var(--alcohn-line)] ${
        reversed ? 'md:order-2 md:border-r-0 md:border-l' : ''
      }`}
    >
      <ValueImage src={value.image} alt={value.alt} variant="desktop" />
    </div>
  );

  const copyColumn = (
    <ValueCopy
      index={index}
      title={value.title}
      copy={value.copy}
      className={reversed ? 'md:order-1' : ''}
    />
  );

  return (
    <article
      data-value-panel
      className={`group grid grid-cols-1 overflow-hidden border-b border-[var(--alcohn-line)] last:border-b-0 md:grid-cols-2 md:items-stretch ${DESKTOP_ROW_HEIGHT}`}
    >
      {imageColumn}
      {copyColumn}
    </article>
  );
}

export default function AlcohnValuesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || prefersReducedMotion()) return;

      const intro = section.querySelector<HTMLElement>('[data-values-intro]');
      const panels = gsap.utils.toArray<HTMLElement>('[data-value-panel]', section);

      if (intro) {
        gsap.set(intro, { y: 28, opacity: 0 });
        gsap.to(intro, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: revealEase,
          scrollTrigger: {
            trigger: intro,
            start: 'top 88%',
            toggleActions: 'play reverse play reverse',
          },
        });
      }

      panels.forEach((panel) => {
        const imageWrap = panel.querySelector<HTMLElement>('[data-value-image]');
        const image = panel.querySelector<HTMLElement>('.value-panel__img');
        const content = panel.querySelector<HTMLElement>('[data-value-content]');
        const line = panel.querySelector<HTMLElement>('[data-value-line]');
        const indexEl = panel.querySelector<HTMLElement>('[data-value-index]');

        if (imageWrap) gsap.set(imageWrap, { clipPath: 'inset(0 100% 0 0)' });
        if (image) gsap.set(image, { scale: 1.12 });
        if (content) gsap.set(content, { y: 32, opacity: 0 });
        if (line) gsap.set(line, { scaleX: 0 });
        if (indexEl) gsap.set(indexEl, { opacity: 0 });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: 'top 82%',
            end: 'bottom 18%',
            toggleActions: 'play reverse play reverse',
          },
        });

        timeline
          .to(imageWrap, { clipPath: 'inset(0 0% 0 0)', duration: 0.95, ease: 'power3.out' }, 0)
          .to(image, { scale: 1, duration: 1.15, ease: 'power3.out' }, 0)
          .to(indexEl, { opacity: 1, duration: 0.55, ease: revealEase }, 0.12)
          .to(line, { scaleX: 1, duration: 0.65, ease: revealEase }, 0.2)
          .to(content, { y: 0, opacity: 1, duration: 0.72, ease: revealEase }, 0.22);

        if (image && window.matchMedia('(min-width: 768px)').matches) {
          gsap.to(image, {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          });
        }
      });

      return () => ScrollTrigger.refresh();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="mb-20" aria-labelledby="valores-alcohn-heading">
      <div className="technical-sheet">
        <div
          data-values-intro
          className="relative z-10 border-b border-[var(--alcohn-line)] p-6 md:p-10 lg:p-12"
        >
          <p className="craft-label mb-3">Nuestros pilares</p>
          <h2
            id="valores-alcohn-heading"
            className="max-w-3xl text-3xl font-semibold tracking-tight text-neutral-950 md:text-5xl"
          >
            Valores de Alcohn
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-base">
            Seis principios que guían cada sello, cada proceso y cada conversación con quien confía en nosotros.
          </p>
        </div>

        <div className="relative z-10 hidden md:block">
          {values.map((value, index) => (
            <ValueCard key={value.title} value={value} index={index} variant="desktop" />
          ))}
        </div>

        <MobileCarousel
          className="relative z-10 md:hidden"
          rowClassName="gap-4 px-4 py-5"
          hint="Deslizá para conocer cada valor"
        >
          {values.map((value, index) => (
            <ValueCard key={value.title} value={value} index={index} variant="mobile" />
          ))}
        </MobileCarousel>
      </div>
    </section>
  );
}
