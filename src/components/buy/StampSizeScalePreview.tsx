'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { parseSizeMm } from '@/lib/cotizador/fetchCotizacion';
import { trimLogoImageForPreview } from '@/lib/logoTrimClient';

/** Diámetro de la moneda de $1 (referencia visual). */
export const COIN_DIAMETER_MM = 23;

/** Escala base mm→px (moneda y sello comparten la misma escala). */
const PX_PER_MM = 2;

/** SVG en public/images/moneda/ (next/image no sirve SVG locales sin config extra). */
const COIN_SVG_SRC = '/images/moneda/moneda-escala-referencia.svg';

type StampSizeScalePreviewProps = {
  sizeLabel: string;
  logoUrl?: string | null;
  compact?: boolean;
  dense?: boolean;
  /** summary: escala real; achica moneda+sello si no entra a lo ancho; alto crece si el sello es alto */
  viewport?: 'default' | 'summary';
  className?: string;
};

function useTrimmedLogo(url: string | null | undefined) {
  const [trimmed, setTrimmed] = useState<{
    dataUrl: string;
    widthPx: number;
    heightPx: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) {
      setTrimmed(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void trimLogoImageForPreview(url).then((result) => {
      if (cancelled) return;
      setTrimmed(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { trimmed, loading };
}

function fitSummaryScale(
  widthMm: number,
  heightMm: number,
  maxTotalWidth: number
) {
  const gapPx = 10;
  let pxPerMm = PX_PER_MM;

  let stampW = widthMm * pxPerMm;
  let stampH = heightMm * pxPerMm;
  let coinSize = COIN_DIAMETER_MM * pxPerMm;

  const naturalW = coinSize + gapPx + stampW;
  if (naturalW > maxTotalWidth) {
    pxPerMm *= maxTotalWidth / naturalW;
    stampW = widthMm * pxPerMm;
    stampH = heightMm * pxPerMm;
    coinSize = COIN_DIAMETER_MM * pxPerMm;
  }

  const boxH = Math.max(coinSize, stampH, 36);
  return { gapPx, coinSize, stampW, stampH, boxH };
}

export default function StampSizeScalePreview({
  sizeLabel,
  logoUrl,
  compact = false,
  dense = false,
  viewport = 'default',
  className = '',
}: StampSizeScalePreviewProps) {
  const dim = parseSizeMm(sizeLabel);
  const { trimmed, loading } = useTrimmedLogo(logoUrl);

  const layout = useMemo(() => {
    if (!dim) return null;

    if (viewport === 'summary') {
      return fitSummaryScale(dim.width, dim.height, 136);
    }

    const gapPx = dense ? 8 : 12;
    const coinSize = Math.round(COIN_DIAMETER_MM * (dense ? 1.5 : PX_PER_MM));

    let stampW = Math.round(dim.width * PX_PER_MM);
    let stampH = Math.round(dim.height * PX_PER_MM);

    const maxStampW = dense ? 88 : compact ? 140 : 240;
    if (stampW > maxStampW) {
      const ratio = maxStampW / stampW;
      stampW = Math.round(stampW * ratio);
      stampH = Math.round(stampH * ratio);
    }

    const boxH = Math.max(coinSize, stampH);
    return { gapPx, coinSize, stampW, stampH, boxH };
  }, [dim, compact, dense, viewport]);

  if (!layout) return null;

  const { gapPx, coinSize, stampW, stampH, boxH } = layout;

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        className="flex items-end justify-center overflow-visible"
        style={{ gap: gapPx, height: boxH, minWidth: 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={COIN_SVG_SRC}
          alt=""
          width={coinSize}
          height={coinSize}
          className="block shrink-0"
          draggable={false}
          title="Moneda de $1 (23 mm)"
        />

        {trimmed ? (
          <Image
            src={trimmed.dataUrl}
            alt=""
            unoptimized
            width={stampW}
            height={stampH}
            className="block shrink-0 object-contain object-bottom"
            draggable={false}
            title={`Tu sello ${dim!.width}×${dim!.height} mm`}
          />
        ) : logoUrl && loading ? (
          <div
            className="shrink-0 animate-pulse rounded-sm bg-neutral-200/50"
            style={{ width: stampW, height: stampH }}
            aria-hidden
          />
        ) : (
          <div
            className="shrink-0 rounded-sm bg-neutral-300/40"
            style={{ width: stampW, height: stampH }}
            title={`Sello ${dim!.width}×${dim!.height} mm`}
          />
        )}
      </div>
      {!dense && viewport !== 'summary' && (
        <p
          className={`mt-2 w-full shrink-0 text-center leading-snug text-neutral-500 ${
            compact ? 'text-[9px]' : 'text-[10px]'
          }`}
        >
          Comparación a escala · moneda $1 (23 mm)
        </p>
      )}
      {viewport === 'summary' && (
        <p className="mt-1.5 text-center text-[9px] leading-snug text-neutral-500">
          Escala · moneda $1 (23 mm)
        </p>
      )}
    </div>
  );
}
