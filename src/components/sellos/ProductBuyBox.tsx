'use client';

import { useEffect, useId, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { trackEvent } from '@/lib/analytics/client';
import { formatMarketMoney } from '@/lib/markets/money';
import { installmentAmountArs, INSTALLMENTS_WITHOUT_INTEREST } from '@/lib/installments';
import { FREE_SHIPPING_MIN_STAMPS } from '@/lib/shipping/freeShipping';
import {
  STAMP_SIZE_CATEGORIES,
  formatMeasureCm,
  stampCategoryVariantLabel,
  type StampSizeCategoryKey,
} from '@/lib/stampSizeCategories';
import { createMockupSolicitud, uploadMockupImage } from '@/lib/supabase/mockupApiClient';
import { wizardStampProcess, type WizardMaterial } from '@/data/stampUseCases';
import GuaranteeNote from '@/components/GuaranteeNote';

type Measure = { ancho: number; largo: number };
type CategoryQuote = {
  key: StampSizeCategoryKey;
  price: number;
  transferPrice: number;
  measures: Measure[];
};

/**
 * Respaldo si el cotizador no responde (sin red / Supabase caído). Mismos valores que el
 * catálogo al 10/11/2026; el checkout igual re-cotiza en el servidor antes de cobrar.
 */
const FALLBACK_QUOTES: Record<StampSizeCategoryKey, CategoryQuote> = {
  chico: { key: 'chico', transferPrice: 76000, price: 87400, measures: [{ ancho: 3, largo: 2 }, { ancho: 2.5, largo: 2.5 }, { ancho: 4, largo: 2 }, { ancho: 8, largo: 1 }] },
  mediano: { key: 'mediano', transferPrice: 91500, price: 105225, measures: [{ ancho: 3, largo: 3 }, { ancho: 5, largo: 3 }, { ancho: 4, largo: 4 }, { ancho: 5, largo: 4 }] },
  grande: { key: 'grande', transferPrice: 113000, price: 129950, measures: [{ ancho: 6, largo: 4 }, { ancho: 7, largo: 4 }, { ancho: 8, largo: 3 }, { ancho: 8, largo: 4 }] },
};

const MAX_LOGO_BYTES = 12 * 1024 * 1024;
const MAX_LOGO_SIDE_PX = 1800;

type LogoState =
  | { status: 'none' }
  | { status: 'uploading'; name: string; preview: string }
  | { status: 'ready'; name: string; preview: string; solicitudId: string }
  | { status: 'error'; message: string };

interface ProductBuyBoxProps {
  usoSlug: string;
  buyMaterial: WizardMaterial;
  /** "madera", "cuero y PU"… (para el título de la línea del carrito). */
  materialLabel: string;
  image: string;
  /** Generador con este uso ya elegido. */
  designHref: string;
  /** Especificaciones (material, profundidad): se muestran plegadas. */
  specs?: ReactNode;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Achica fotos grandes del celular antes de subirlas (el logo no necesita 4000 px). */
async function prepareLogoDataUrl(file: File): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  if (file.type === 'image/svg+xml' || !file.type.startsWith('image/')) return dataUrl;
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('No pudimos leer la imagen.'));
    img.src = dataUrl;
  });
  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  if (longest <= MAX_LOGO_SIDE_PX && file.size < 2.5 * 1024 * 1024) return dataUrl;
  const scale = MAX_LOGO_SIDE_PX / longest;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * Math.min(1, scale));
  canvas.height = Math.round(img.naturalHeight * Math.min(1, scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.9);
}

/** Dibujo a escala: la medida más grande del tamaño al lado de una tarjeta (8,5 × 5,4 cm). */
function SizeScale({ measure }: { measure: Measure }) {
  const card = { w: 8.56, h: 5.4 };
  const w = Math.max(measure.ancho, measure.largo);
  const h = Math.min(measure.ancho, measure.largo);
  const pad = 0.6;
  const totalW = card.w + pad + w;
  const totalH = Math.max(card.h, h);
  const unit = 100 / totalW;
  return (
    <svg
      viewBox={`0 0 100 ${totalH * unit + 8}`}
      className="h-auto w-full max-w-[260px]"
      role="img"
      aria-label={`Sello de hasta ${formatMeasureCm(w, h)} al lado de una tarjeta de crédito`}
    >
      <rect
        x={0.5}
        y={(totalH - card.h) * unit + 0.5}
        width={card.w * unit - 1}
        height={card.h * unit - 1}
        rx={2}
        fill="none"
        stroke="#a3a3a3"
        strokeDasharray="2 1.5"
        strokeWidth={0.6}
      />
      <text x={(card.w * unit) / 2} y={totalH * unit + 6} textAnchor="middle" fontSize={4} fill="#737373">
        tarjeta
      </text>
      <rect
        x={(card.w + pad) * unit}
        y={(totalH - h) * unit}
        width={w * unit}
        height={h * unit}
        fill="#b8844f"
        fillOpacity={0.25}
        stroke="#8a5f33"
        strokeWidth={0.8}
      />
      <text
        x={(card.w + pad + w / 2) * unit}
        y={totalH * unit + 6}
        textAnchor="middle"
        fontSize={4}
        fill="#404040"
      >
        {formatMeasureCm(w, h)}
      </text>
    </svg>
  );
}

/**
 * Compra directa desde la ficha: tamaño (chico / mediano / grande) → cantidad → logo
 * opcional → "Agregar al carrito". Sin logo, el pedido entra igual y el cliente lo manda
 * por WhatsApp; Alcohn lo sube al pedido. El generador queda como opción secundaria.
 */
export default function ProductBuyBox({
  usoSlug,
  buyMaterial,
  materialLabel,
  image,
  designHref,
  specs,
}: ProductBuyBoxProps) {
  const { addItem } = useCart();
  const [quotes, setQuotes] = useState<Record<StampSizeCategoryKey, CategoryQuote>>(FALLBACK_QUOTES);
  const [category, setCategory] = useState<StampSizeCategoryKey>('chico');
  const [showMeasures, setShowMeasures] = useState(false);
  const [qty, setQty] = useState(1);
  const [logo, setLogo] = useState<LogoState>({ status: 'none' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSeq = useRef(0);
  const measuresId = useId();

  useEffect(() => {
    let cancelled = false;
    fetch('/api/cotizador/categorias')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { categories?: CategoryQuote[] } | null) => {
        if (cancelled || !data?.categories?.length) return;
        const next = { ...FALLBACK_QUOTES };
        for (const c of data.categories) {
          if (c.price > 0 && c.transferPrice > 0 && next[c.key]) next[c.key] = c;
        }
        setQuotes(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = quotes[category];
  const selectedMeta = STAMP_SIZE_CATEGORIES.find((c) => c.key === category)!;
  const largestMeasure = selected.measures.reduce<Measure | null>(
    (best, m) => (!best || m.ancho * m.largo > best.ancho * best.largo ? m : best),
    null
  );

  const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setLogo({ status: 'error', message: 'El archivo es muy pesado (máximo 12 MB).' });
      return;
    }
    const seq = ++uploadSeq.current;
    try {
      const dataUrl = await prepareLogoDataUrl(file);
      const preview = file.type.startsWith('image/') ? dataUrl : '';
      setLogo({ status: 'uploading', name: file.name, preview });
      const { id } = await createMockupSolicitud({
        material: buyMaterial,
        metadata_web: { origen: 'ficha_producto', uso_slug: usoSlug },
      });
      await uploadMockupImage(id, 'logo_original', dataUrl);
      if (seq !== uploadSeq.current) return;
      setLogo({ status: 'ready', name: file.name, preview, solicitudId: id });
      void trackEvent('ficha_logo_subido', { metadata: { uso: usoSlug } });
    } catch (err) {
      console.error('[ficha] subir logo', err);
      if (seq !== uploadSeq.current) return;
      setLogo({
        status: 'error',
        message: 'No pudimos subir el logo. Podés comprar igual y mandarlo por WhatsApp.',
      });
    }
  };

  const clearLogo = () => {
    uploadSeq.current += 1;
    setLogo({ status: 'none' });
  };

  const handleAdd = () => {
    if (logo.status === 'uploading') return;
    const hasLogo = logo.status === 'ready';
    const designSlug = hasLogo
      ? `personalizado-${usoSlug}-${logo.solicitudId.slice(0, 8)}`
      : `personalizado-${usoSlug}`;
    addItem(
      {
        title: `Sello para ${materialLabel} · ${selectedMeta.label.replace('Sello ', '')}`,
        collection: 'Personalizado',
        material: 'Bronce',
        process: wizardStampProcess(usoSlug, buyMaterial),
        variantSize: stampCategoryVariantLabel(category),
        price: selected.price,
        image,
        designSlug,
        sizeCategory: category,
        usoSlug,
        logoStatus: hasLogo ? 'subido' : 'pendiente',
        ...(hasLogo ? { mockupSolicitudId: logo.solicitudId } : {}),
      },
      { qty }
    );
    void trackEvent('add_to_cart', {
      metadata: { origen: 'ficha', uso: usoSlug, categoria: category, qty, con_logo: hasLogo },
    });
    // El próximo sello arranca de cero (puede ser otro logo).
    clearLogo();
    setQty(1);
  };

  const total = selected.transferPrice * qty;

  return (
    <div id="comprar" className="scroll-mt-28">
      {/* 1. Tamaño */}
      <fieldset>
        <legend className="mb-2 text-[13px] font-semibold text-neutral-900">1. Elegí el tamaño</legend>
        <div className="grid grid-cols-3 gap-2">
          {STAMP_SIZE_CATEGORIES.map((cat) => {
            const q = quotes[cat.key];
            const active = cat.key === category;
            return (
              <button
                key={cat.key}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(cat.key)}
                className={`flex min-h-[72px] flex-col items-center justify-center border px-1.5 py-2 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                  active
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-[var(--alcohn-line-strong,#d4d4d4)] bg-white text-neutral-900 hover:border-neutral-900'
                }`}
              >
                <span className="text-[13px] font-semibold leading-tight">{cat.label.replace('Sello ', '').replace(/^./, (c) => c.toUpperCase())}</span>
                <span className={`mt-1 text-[12.5px] font-semibold ${active ? 'text-white/90' : 'text-neutral-700'}`}>
                  {formatMarketMoney(q.transferPrice, 'ar')}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowMeasures((v) => !v)}
          aria-expanded={showMeasures}
          aria-controls={measuresId}
          className="mt-2 inline-flex min-h-[40px] items-center gap-1.5 text-[13px] font-semibold text-neutral-800 underline decoration-[var(--alcohn-bronze)] underline-offset-4"
        >
          <span aria-hidden className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-neutral-500 text-[10px] no-underline">
            i
          </span>
          ¿Qué medidas entran en el {selectedMeta.label.toLowerCase().replace('sello ', '')}?
        </button>
        {showMeasures && (
          <div id={measuresId} className="mt-1 border border-[var(--alcohn-line)] bg-[var(--alcohn-surface,#faf8f5)] p-3">
            <p className="text-[13px] leading-snug text-neutral-800">
              <strong className="font-semibold">{selectedMeta.label}:</strong> {selectedMeta.idealFor}
            </p>
            <p className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-neutral-500">
              Medidas que entran
            </p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {selected.measures.map((m) => (
                <li
                  key={`${m.ancho}x${m.largo}`}
                  className="border border-neutral-300 bg-white px-2 py-0.5 text-[12px] text-neutral-800"
                >
                  {formatMeasureCm(m.ancho, m.largo)}
                </li>
              ))}
            </ul>
            {largestMeasure && (
              <div className="mt-3">
                <SizeScale measure={largestMeasure} />
              </div>
            )}
            <p className="mt-2 text-[12px] leading-snug text-neutral-600">
              La medida exacta la ajustamos a tu logo dentro de este tamaño, sin cambiar el precio.
            </p>
          </div>
        )}
      </fieldset>

      {/* 2. Cantidad */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-neutral-900">2. Cantidad</p>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="flex h-11 w-11 items-center justify-center border border-neutral-300 bg-white text-lg disabled:opacity-40"
            aria-label="Restar uno"
          >
            −
          </button>
          <span className="flex h-11 w-12 items-center justify-center border-y border-neutral-300 bg-white text-[15px] font-semibold" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="flex h-11 w-11 items-center justify-center border border-neutral-300 bg-white text-lg"
            aria-label="Sumar uno"
          >
            +
          </button>
        </div>
      </div>
      <p className="mt-1.5 text-[12.5px] text-neutral-600">
        Llevando {FREE_SHIPPING_MIN_STAMPS} sellos o más, <strong className="font-semibold text-neutral-800">el envío es gratis</strong>.
      </p>

      {/* 3. Logo (opcional) */}
      <div className="mt-4">
        <p className="text-[13px] font-semibold text-neutral-900">
          3. Tu logo <span className="font-normal text-neutral-500">(opcional)</span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.svg,.pdf"
          className="hidden"
          onChange={handleLogoChange}
        />
        {logo.status === 'none' || logo.status === 'error' ? (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 flex min-h-[48px] w-full items-center justify-center gap-2 border border-dashed border-[rgba(184,132,79,0.7)] bg-[rgba(184,132,79,0.06)] px-4 text-[14px] font-semibold text-neutral-900 hover:bg-[rgba(184,132,79,0.12)]"
            >
              <span aria-hidden>↑</span> Subir tu logo
            </button>
            {logo.status === 'error' ? (
              <p role="alert" className="mt-1.5 text-[12.5px] text-red-700">
                {logo.message}
              </p>
            ) : (
              <p className="mt-1.5 text-[12.5px] leading-snug text-neutral-600">
                ¿No lo tenés a mano? Comprá igual y mandalo por WhatsApp después.
              </p>
            )}
          </>
        ) : (
          <div className="mt-2 flex items-center gap-3 border border-[var(--alcohn-line)] bg-white p-2">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden border border-neutral-200 bg-neutral-50">
              {logo.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo.preview} alt="Tu logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-[10px] text-neutral-500">PDF</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-neutral-900">{logo.name}</p>
              <p className={`text-[12px] ${logo.status === 'ready' ? 'text-emerald-700' : 'text-neutral-500'}`}>
                {logo.status === 'ready' ? '✓ Logo listo' : 'Subiendo…'}
              </p>
            </div>
            <button
              type="button"
              onClick={clearLogo}
              className="min-h-[40px] px-2 text-[12.5px] text-neutral-600 underline"
            >
              Quitar
            </button>
          </div>
        )}
      </div>

      {/* Total + agregar */}
      <div className="mt-5 border-t border-[var(--alcohn-line)] pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[13px] text-neutral-600">
            {qty > 1 ? `${qty} sellos` : 'Total'}
          </span>
          <span className="text-2xl font-semibold tracking-tight text-neutral-950">
            {formatMarketMoney(total, 'ar')}
          </span>
        </div>
        <p className="mt-0.5 text-right text-[12px] text-neutral-500">
          Precio por transferencia · o {INSTALLMENTS_WITHOUT_INTEREST} cuotas sin interés de{' '}
          {formatMarketMoney(installmentAmountArs(selected.transferPrice * qty, 'transfer'), 'ar')}
        </p>
        <button
          type="button"
          onClick={handleAdd}
          disabled={logo.status === 'uploading'}
          className="mt-3 flex min-h-[52px] w-full items-center justify-center bg-neutral-900 px-6 text-[14px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60"
        >
          {logo.status === 'uploading' ? 'Subiendo logo…' : 'Agregar al carrito'}
        </button>
        <Link
          href={designHref}
          className="mt-2 flex min-h-[44px] items-center justify-center text-[13.5px] font-semibold text-neutral-800 underline decoration-[var(--alcohn-bronze)] underline-offset-4"
        >
          Ver cómo queda mi logo antes de comprar →
        </Link>
        <p className="mt-2 text-center text-[12px] text-neutral-500">Listo en 72 hs hábiles</p>
        <GuaranteeNote className="mt-2" />
      </div>

      {specs ? (
        <details className="group mt-4 border-t border-[var(--alcohn-line)] pt-3">
          <summary className="flex min-h-[40px] cursor-pointer list-none items-center justify-between text-[13px] font-semibold text-neutral-900">
            Especificaciones
            <span aria-hidden className="text-neutral-500 transition-transform group-open:rotate-45">+</span>
          </summary>
          <div className="pt-2">{specs}</div>
        </details>
      ) : null}
    </div>
  );
}
