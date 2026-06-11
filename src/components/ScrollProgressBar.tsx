'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const isHome = pathname === '/';

  useEffect(() => {
    if (!isHome) {
      setProgress(0);
      return;
    }

    let frame = 0;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const next = scrollable > 0 ? window.scrollY / scrollable : 0;
      setProgress(Math.min(1, Math.max(0, next)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isHome]);

  if (!isHome) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[2px] overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="h-full w-full origin-left bg-[var(--alcohn-bronze)]"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
