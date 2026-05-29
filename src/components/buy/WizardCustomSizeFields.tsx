'use client';

import {
  fitProportionalStampSize,
  isValidStampSizeMm,
} from '@/lib/cotizador/stampSizeLimits';

export type CustomSizeMm = { width: number; height: number };

type WizardCustomSizeFieldsProps = {
  customSize?: CustomSizeMm;
  aspectRatio?: number;
  onPatch: (patch: {
    customSize?: CustomSizeMm;
    selectedSize?: string;
    selectedPrice?: number;
    selectedTransferPrice?: number;
    approximateSizeKey?: 'pequeño' | 'medio' | 'grande' | undefined;
  }) => void;
  onCotizar: (widthMm: number, heightMm: number) => void;
  className?: string;
};

export default function WizardCustomSizeFields({
  customSize,
  aspectRatio,
  onPatch,
  onCotizar,
  className = '',
}: WizardCustomSizeFieldsProps) {
  const handleWidth = (raw: string) => {
    const value = raw.replace(/\D/g, '');
    if (value === '') {
      onPatch({
        customSize: customSize
          ? { ...customSize, width: 0, height: customSize.height || 0 }
          : undefined,
        selectedSize: undefined,
        selectedPrice: undefined,
      });
      return;
    }
    const num = parseInt(value, 10);
    if (isNaN(num)) return;

    let newHeight = customSize?.height || num;
    if (aspectRatio && customSize?.height && customSize.height > 0) {
      const fitted = fitProportionalStampSize(
        num,
        Math.round(num / aspectRatio)
      );
      newHeight = fitted.height;
    } else if (!customSize?.height || customSize.height === 0) {
      newHeight = num;
    }

    if (isValidStampSizeMm(num, newHeight)) {
      onPatch({
        customSize: { width: num, height: newHeight },
        approximateSizeKey: undefined,
      });
      onCotizar(num, newHeight);
    } else {
      onPatch({
        customSize: { width: num, height: newHeight },
        selectedSize: undefined,
        selectedPrice: undefined,
      });
    }
  };

  const handleHeight = (raw: string) => {
    const value = raw.replace(/\D/g, '');
    if (value === '') {
      onPatch({
        customSize: customSize
          ? { ...customSize, width: customSize.width || 0, height: 0 }
          : undefined,
        selectedSize: undefined,
        selectedPrice: undefined,
      });
      return;
    }
    const num = parseInt(value, 10);
    if (isNaN(num)) return;

    let newWidth = customSize?.width || num;
    if (aspectRatio && customSize?.width && customSize.width > 0) {
      const fitted = fitProportionalStampSize(
        Math.round(num * aspectRatio),
        num
      );
      newWidth = fitted.width;
    } else if (!customSize?.width || customSize.width === 0) {
      newWidth = num;
    }

    if (isValidStampSizeMm(newWidth, num)) {
      onPatch({
        customSize: { width: newWidth, height: num },
        approximateSizeKey: undefined,
      });
      onCotizar(newWidth, num);
    } else {
      onPatch({
        customSize: { width: newWidth, height: num },
        selectedSize: undefined,
        selectedPrice: undefined,
      });
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-xs leading-relaxed text-gray-600">
        Ingresá ancho y alto en milímetros. El precio y la comparación con la moneda se
        actualizan abajo.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Ancho (mm)
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={customSize?.width || ''}
            onChange={(e) => handleWidth(e.target.value)}
            placeholder="30"
            className="w-full border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Alto (mm)
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={customSize?.height || ''}
            onChange={(e) => handleHeight(e.target.value)}
            placeholder="45"
            className="w-full border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          />
        </div>
      </div>
      {aspectRatio ? (
        <p className="text-xs font-semibold leading-relaxed text-red-600">
          Si cambiás el ancho o el alto, el otro se ajusta solo para mantener la forma de tu
          logo.
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          Lado largo hasta 15 cm, lado corto hasta 6 cm.
        </p>
      )}
      {customSize &&
        customSize.width > 0 &&
        customSize.height > 0 &&
        !isValidStampSizeMm(customSize.width, customSize.height) && (
          <p className="text-xs text-amber-700">
            Esa medida está fuera del rango (máx. 15×6 cm). Ajustá ancho o alto.
          </p>
        )}
    </div>
  );
}
