'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { parseSizeMm } from '@/lib/cotizador/fetchCotizacion';
import { trimLogoImageForPreview } from '@/lib/logoTrimClient';
import {
  COIN_DIAMETER_MM,
} from '@/components/buy/StampSizeScalePreview';
import type { WizardSizeTierOption } from '@/components/buy/WizardSizeStepMobile';

const COIN_SVG_SRC = '/images/moneda/moneda-escala-referencia.svg';
/** Escala compartida entre moneda y las 3 medidas (mm → px). */
const PX_PER_MM = 1.55;

type WizardSizeCompareScaleProps = {
  options: WizardSizeTierOption[];
  selectedSize?: string;
  logoUrl?: string | null;
  className?: string;
};

function useTrimmedLogo(url: string | null | undefined) {
  const [trimmed, setTrimmed] = useState<{
    dataUrl: string;
    widthPx: number;
    heightPx: number;
  } | null>(null);

  useEffect(() => {
    if (!url) {
      setTrimmed(null);
      return;
    }
    let cancelled = false;
    void trimLogoImageForPreview(url).then((result) => {
      if (!cancelled) setTrimmed(result);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return trimmed;
}

/**
 * Comparación a escala: moneda $1 + las tres medidas del catálogo.
 * Misma escala visual que el mock del flujo mobile.
 */
export default function WizardSizeCompareScale({
  options,
  selectedSize,
  logoUrl,
  className = '',
}: WizardSizeCompareScaleProps) {
  const trimmed = useTrimmedLogo(logoUrl);

  const layout = useMemo(() => {
    const dims = options.map((o) => {
      const d = parseSizeMm(o.size);
      return {
        key: o.key,
        size: o.size,
        w: d?.width ?? 40,
        h: d?.height ?? 40,
      };
    });
    if (!dims.length) return null;

    const coinPx = Math.round(COIN_DIAMETER_MM * PX_PER_MM);
    const items = dims.map((d) => ({
      ...d,
      stampW: Math.round(d.w * PX_PER_MM),
      stampH: Math.round(d.h * PX_PER_MM),
    }));
    const boxH = Math.max(coinPx, ...items.map((i) => i.stampH), 36);

    return { coinPx, items, boxH };
  }, [options]);

  if (!layout) return null;

  const { coinPx, items, boxH } = layout;

  return (
    <div
      className={`flex flex-col gap-2 border border-dashed border-[var(--alcohn-line-strong)] bg-[var(--alcohn-surface)] px-2.5 py-3 ${className}`}
    >
      <div
        className="flex items-end justify-center gap-2.5 overflow-x-auto"
        style={{ minHeight: boxH }}
      >
        <div className="flex flex-col items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={COIN_SVG_SRC}
            alt=""
            width={coinPx}
            height={coinPx}
            className="block shrink-0"
            draggable={false}
            title="Moneda de $1 (23 mm)"
          />
          <span className="font-mono text-[9px] font-medium uppercase tracking-wide text-neutral-500">
            $1 · 23 mm
          </span>
        </div>

        {items.map((item) => {
          const active = selectedSize === item.size;
          return (
            <div
              key={item.key}
              className="flex flex-col items-center gap-1.5 transition-opacity"
              style={{ opacity: active ? 1 : 0.38 }}
            >
              <div
                className="flex shrink-0 items-center justify-center overflow-hidden border-[1.5px] border-[var(--alcohn-ink)] bg-[var(--alcohn-paper)]"
                style={{ width: item.stampW, height: item.stampH }}
                title={item.size}
              >
                {trimmed ? (
                  <Image
                    src={trimmed.dataUrl}
                    alt=""
                    unoptimized
                    width={item.stampW}
                    height={item.stampH}
                    className="object-contain p-0.5"
                    draggable={false}
                  />
                ) : (
                  <span className="block h-[55%] w-[55%] bg-neutral-300/50" aria-hidden />
                )}
              </div>
              <span className="font-mono text-[9px] font-medium uppercase tracking-wide text-neutral-500">
                {item.size.replace(/mm$/i, ' mm')}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-[10px] leading-snug text-neutral-500">
        Comparación a escala · moneda $1 (23 mm)
      </p>
    </div>
  );
}
