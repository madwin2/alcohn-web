'use client';

import { ReactNode } from 'react';

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <div className="w-full max-w-full overflow-x-hidden md:h-[calc(100vh-4rem)] md:overflow-y-scroll md:snap-y md:snap-proximity md:scroll-smooth">
      {children}
    </div>
  );
}


