'use client';

import { useState } from 'react';
import Image from 'next/image';

interface VideoShowcasePanelProps {
  posterSrc: string;
  posterAlt: string;
  /** Video 16:9 (se recorta con object-cover al alto del panel). Si no se pasa, el botón queda decorativo. */
  videoSrc?: string;
  className?: string;
}

export default function VideoShowcasePanel({
  posterSrc,
  posterAlt,
  videoSrc,
  className = '',
}: VideoShowcasePanelProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`material-frame relative overflow-hidden bg-neutral-950 ${className}`}>
      {playing && videoSrc ? (
        <video
          src={videoSrc}
          className="absolute inset-0 h-full w-full object-cover"
          controls
          autoPlay
          playsInline
        />
      ) : (
        <>
          <Image
            src={posterSrc}
            alt={posterAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/15" />
          <button
            type="button"
            onClick={() => videoSrc && setPlaying(true)}
            aria-label="Reproducir video"
            className={`absolute inset-0 flex items-center justify-center transition-colors hover:bg-black/10 ${
              videoSrc ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/90 bg-white/10 backdrop-blur-sm transition-transform hover:scale-105 md:h-20 md:w-20">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-white md:h-8 md:w-8" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
          <span className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white" aria-hidden>
              <path d="M4 9v6h4l5 5V4L8 9H4z" />
              <path d="M2 2l20 20" stroke="white" strokeWidth="1.6" fill="none" />
            </svg>
          </span>
        </>
      )}
    </div>
  );
}
