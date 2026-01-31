'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface EqualHeightContainerProps {
  children: ReactNode;
  className?: string;
}

export default function EqualHeightContainer({ children, className = '' }: EqualHeightContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const equalizeHeights = () => {
      if (!containerRef.current) return;
      
      const children = Array.from(containerRef.current.children) as HTMLElement[];
      if (children.length === 0) return;

      // Reset heights first
      children.forEach((child) => {
        child.style.height = 'auto';
      });

      // Wait a bit for layout to settle
      setTimeout(() => {
        if (!containerRef.current) return;
        
        // Find max height
        const heights = children.map((child) => child.offsetHeight);
        const maxHeight = Math.max(...heights);

        // Apply max height to all children
        children.forEach((child) => {
          child.style.height = `${maxHeight}px`;
        });
      }, 10);
    };

    // Initial equalization
    equalizeHeights();
    
    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(equalizeHeights);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', equalizeHeights);
    
    // Re-equalize after images load
    const images = containerRef.current?.querySelectorAll('img');
    if (images) {
      images.forEach((img) => {
        if (img.complete) {
          equalizeHeights();
        } else {
          img.addEventListener('load', equalizeHeights, { once: true });
        }
      });
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', equalizeHeights);
      if (images) {
        images.forEach((img) => {
          img.removeEventListener('load', equalizeHeights);
        });
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

