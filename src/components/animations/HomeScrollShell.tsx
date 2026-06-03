'use client';

import { ReactNode, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { initHomeScrollReveals } from '@/lib/homeScrollReveals';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface HomeScrollShellProps {
  children: ReactNode;
}

export default function HomeScrollShell({ children }: HomeScrollShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || prefersReducedMotion()) return;

      const cleanupReveals = initHomeScrollReveals(root);

      const refresh = () => ScrollTrigger.refresh();
      const resizeObserver = new ResizeObserver(refresh);
      resizeObserver.observe(root);
      requestAnimationFrame(() => requestAnimationFrame(refresh));

      return () => {
        resizeObserver.disconnect();
        cleanupReveals();
      };
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-home-scroll
      className="w-full max-w-full"
    >
      {children}
    </div>
  );
}
