'use client';

import { ReactNode } from 'react';

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth w-full max-w-full">
      {children}
    </div>
  );
}


