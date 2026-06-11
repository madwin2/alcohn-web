'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { bindTitleKeywordHighlights } from '@/lib/titleKeywordHighlight';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function StoryPhraseStrip() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || prefersReducedMotion()) return;

      const cleanups: Array<() => void> = [];
      bindTitleKeywordHighlights(section, cleanups);

      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Una forma de contar tu historia"
      className="story-phrase-strip w-full"
    >
      <div className="story-phrase-strip__grid" aria-hidden="true" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="story-phrase-strip__text">
          Una forma de contar{' '}
          <span data-title-keyword className="title-keyword title-keyword--on-dark">
            <span className="title-keyword__fill" aria-hidden="true" />
            tu historia.
          </span>
        </h2>
      </div>
    </section>
  );
}
