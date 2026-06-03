'use client';

import React, { useCallback, useEffect, useRef } from 'react';

export type TestimonialColumnItem = {
  text: string;
  image: string;
  name: string;
};

const HOVER_PLAYBACK_RATE = 0.5;

function GoogleReviewBadge() {
  return (
    <div className="mt-1.5 flex flex-col gap-1">
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, star) => (
          <svg
            key={star}
            className="h-3 w-3 text-neutral-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-[11px] font-medium text-neutral-500">Reseña de Google</span>
    </div>
  );
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: TestimonialColumnItem[];
  duration?: number;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const hoverCountRef = useRef(0);
  const duration = props.duration ?? 10;
  const durationMs = duration * 1000;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    const anim = track.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-50%)' }],
      {
        duration: durationMs,
        iterations: Infinity,
        easing: 'linear',
      }
    );

    animationRef.current = anim;
    anim.playbackRate = hoverCountRef.current > 0 ? HOVER_PLAYBACK_RATE : 1;

    const onMotionChange = () => {
      if (reducedMotion.matches) {
        anim.cancel();
        animationRef.current = null;
      }
    };

    reducedMotion.addEventListener('change', onMotionChange);

    return () => {
      reducedMotion.removeEventListener('change', onMotionChange);
      anim.cancel();
      animationRef.current = null;
    };
  }, [durationMs]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (animationRef.current) {
      animationRef.current.playbackRate = rate;
    }
  }, []);

  const handleCardEnter = () => {
    hoverCountRef.current += 1;
    if (hoverCountRef.current === 1) {
      setPlaybackRate(HOVER_PLAYBACK_RATE);
    }
  };

  const handleCardLeave = () => {
    hoverCountRef.current = Math.max(0, hoverCountRef.current - 1);
    if (hoverCountRef.current === 0) {
      setPlaybackRate(1);
    }
  };

  return (
    <div className={`testimonials-column ${props.className ?? ''}`.trim()}>
      <div ref={trackRef} className="testimonials-column__track flex flex-col gap-6 pb-6">
        {[...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name }, i) => (
              <article
                className="testimonial-card material-card w-full max-w-xs border-l-4 border-l-[var(--alcohn-bronze)] p-6 md:p-8"
                key={`${index}-${i}`}
                onMouseEnter={handleCardEnter}
                onMouseLeave={handleCardLeave}
              >
                <p className="text-sm italic leading-relaxed text-neutral-700 md:text-[15px]">{text}</p>
                <div className="mt-5 flex items-center gap-3 border-t border-[var(--alcohn-line)] pt-4">
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt=""
                    className="h-10 w-10 shrink-0 border border-[var(--alcohn-line)] object-cover"
                  />
                  <div className="flex min-w-0 flex-col">
                    <div className="text-sm font-semibold leading-5 tracking-tight text-neutral-900">
                      {name}
                    </div>
                    <GoogleReviewBadge />
                  </div>
                </div>
              </article>
            ))}
          </React.Fragment>
        ))]}
      </div>
    </div>
  );
};
