'use client';

import { ReactNode } from 'react';

interface SmoothScrollProps {
  children: ReactNode;
}

/** Wrapper sin scroll propio; el documento hace scroll. */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <div className="w-full max-w-full overflow-x-hidden overflow-y-visible">{children}</div>
  );
}
