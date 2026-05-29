'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  STAMP_SIZE_RANGE_LABEL,
  isValidStampSizeMm,
  STAMP_MM_MAX_LONG,
  STAMP_MM_MIN_LONG,
} from '@/lib/cotizador/stampSizeLimits';

export default function CustomSizeInput() {
  const router = useRouter();
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [errors, setErrors] = useState<{ width?: string; height?: string; pair?: string }>({});

  const parseMm = (value: string): number | null => {
    const num = parseInt(value.replace(/\D/g, ''), 10);
    if (!value || isNaN(num)) return null;
    if (num < STAMP_MM_MIN_LONG || num > STAMP_MM_MAX_LONG) return null;
    return num;
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWidth(value);
    const num = parseMm(value);
    if (value && num === null) {
      setErrors((prev) => ({
        ...prev,
        width: `Entre ${STAMP_MM_MIN_LONG} y ${STAMP_MM_MAX_LONG} mm por campo`,
      }));
    } else {
      setErrors((prev) => {
        const { width: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHeight(value);
    const num = parseMm(value);
    if (value && num === null) {
      setErrors((prev) => ({
        ...prev,
        height: `Entre ${STAMP_MM_MIN_LONG} y ${STAMP_MM_MAX_LONG} mm por campo`,
      }));
    } else {
      setErrors((prev) => {
        const { height: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleContinue = () => {
    const w = parseMm(width);
    const h = parseMm(height);

    if (!w || !h) {
      setErrors({
        width: !w ? 'Ingresá un ancho válido' : undefined,
        height: !h ? 'Ingresá un alto válido' : undefined,
      });
      return;
    }

    if (!isValidStampSizeMm(w, h)) {
      setErrors({
        pair: 'Combinación inválida: lado largo hasta 150 mm y lado corto hasta 60 mm (15×6 cm).',
      });
      return;
    }

    router.push(`/buy?mode=custom&w=${w}&h=${h}`);
  };

  return (
    <div className="border border-neutral-300 bg-white p-6">
      <h3 className="text-xl font-semibold text-neutral-900 mb-4 tracking-tight">
        ¿Ya sabés tu medida?
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
            Ancho (mm)
          </label>
          <input
            type="text"
            value={width}
            onChange={handleWidthChange}
            placeholder="30"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`w-full border border-neutral-300 px-3 py-3 md:py-2 text-base md:text-sm text-neutral-900 bg-white focus:outline-none focus:border-neutral-900 transition-colors ${
              errors.width ? 'border-red-500' : ''
            }`}
          />
          {errors.width && <p className="text-xs text-red-500 mt-1">{errors.width}</p>}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
            Alto (mm)
          </label>
          <input
            type="text"
            value={height}
            onChange={handleHeightChange}
            placeholder="45"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`w-full border border-neutral-300 px-3 py-3 md:py-2 text-base md:text-sm text-neutral-900 bg-white focus:outline-none focus:border-neutral-900 transition-colors ${
              errors.height ? 'border-red-500' : ''
            }`}
          />
          {errors.height && <p className="text-xs text-red-500 mt-1">{errors.height}</p>}
        </div>
      </div>

      <div className="mb-4 space-y-1">
        <p className="text-xs text-neutral-500">Ingresá ancho y alto en mm. Ej: 110×54.</p>
        <p className="text-xs text-neutral-500">{STAMP_SIZE_RANGE_LABEL}</p>
        {errors.pair && <p className="text-xs text-red-500">{errors.pair}</p>}
      </div>

      <button
        onClick={handleContinue}
        className="inline-flex w-full min-h-[48px] items-center justify-center border border-neutral-900 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 uppercase tracking-wider hover:bg-neutral-900 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
      >
        Continuar →
      </button>
    </div>
  );
}
