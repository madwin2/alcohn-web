'use client';

import { useState } from 'react';
import {
  TEXT_LOGO_MAX_CHARS,
  TEXT_LOGO_PADDING,
  TEXT_LOGO_STYLES,
  applyTextLogoCase,
  computeTextLogoLayout,
  getTextLogoStyle,
  normalizeTextLogoLines,
  textLogoFileName,
  type TextLogoStyle,
  type TextLogoStyleId,
} from '@/lib/textLogo';
import { textLogoFontFamily } from '@/components/buy/textLogoFonts';
import { useMarket } from '@/contexts/MarketContext';
import { localizeTree } from '@/lib/markets/localizeTree';

const FONT_LOAD_TIMEOUT_MS = 3000;

/** Familia para la vista previa en CSS ("Moderna" va por la variable del layout). */
function previewFontFamily(style: TextLogoStyle): string {
  const family = style.id === 'moderna' ? 'var(--font-body)' : textLogoFontFamily(style.id);
  return `${family}, ${style.fallbackStack}`;
}

/**
 * Dibuja la marca en un PNG transparente con texto negro (el generador de muestras y la
 * medición del logo recortan por canal alpha). Espera la fuente antes de dibujar.
 */
async function renderTextLogo(
  lines: string[],
  style: TextLogoStyle
): Promise<{ file: File; dataUrl: string }> {
  const fontStack = `${textLogoFontFamily(style.id)}, ${style.fallbackStack}`;
  const fontAt = (size: number) => `${style.weight} ${size}px ${fontStack}`;
  const cased = lines.map((line) => applyTextLogoCase(line, style));

  if (typeof document !== 'undefined' && document.fonts?.load) {
    try {
      await Promise.race([
        document.fonts.load(fontAt(100), cased.join(' ')),
        new Promise((resolve) => window.setTimeout(resolve, FONT_LOAD_TIMEOUT_MS)),
      ]);
    } catch {
      /* si la fuente no carga, el canvas usa el respaldo del stack */
    }
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Tu navegador no permite generar la imagen. Probá subir un logo.');

  ctx.font = fontAt(100);
  const layout = computeTextLogoLayout(cased, style, (line) => ctx.measureText(line).width);

  canvas.width = layout.canvasWidth;
  canvas.height = layout.canvasHeight;
  // Cambiar el tamaño del canvas resetea el contexto: volver a fijar la fuente.
  ctx.font = fontAt(layout.fontSize);
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  cased.forEach((line, i) => {
    const cy = TEXT_LOGO_PADDING + layout.lineHeightPx * (i + 0.5);
    if (layout.letterSpacingPx > 0) {
      const chars = Array.from(line);
      const widths = chars.map((ch) => ctx.measureText(ch).width);
      const total =
        widths.reduce((sum, w) => sum + w, 0) + layout.letterSpacingPx * (chars.length - 1);
      let x = (canvas.width - total) / 2;
      chars.forEach((ch, j) => {
        ctx.fillText(ch, x, cy);
        x += widths[j] + layout.letterSpacingPx;
      });
    } else {
      const w = ctx.measureText(line).width;
      ctx.fillText(line, (canvas.width - w) / 2, cy);
    }
  });

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  const bytes = blob ?? (await (await fetch(dataUrl)).blob());
  return {
    dataUrl,
    file: new File([bytes], textLogoFileName(lines), { type: 'image/png' }),
  };
}

export type WizardTextLogoResult = {
  file: File;
  dataUrl: string;
  styleId: TextLogoStyleId;
  lines: string[];
};

type WizardTextLogoProps = {
  disabled?: boolean;
  onOpen?: () => void;
  onConfirm: (result: WizardTextLogoResult) => Promise<void> | void;
};

/**
 * "No tengo logo": la persona escribe el nombre de su marca, elige una tipografía y
 * seguimos con ese diseño como si hubiera subido un archivo.
 */
function WizardTextLogoContent({ disabled = false, onOpen, onConfirm }: WizardTextLogoProps) {
  const [open, setOpen] = useState(false);
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [showLine2, setShowLine2] = useState(false);
  const [styleId, setStyleId] = useState<TextLogoStyleId>('clasica');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines = normalizeTextLogoLines(showLine2 ? [line1, line2] : [line1]);
  const used = line1.length + (showLine2 ? line2.length : 0);
  const longest = Math.max(1, ...lines.map((l) => l.length));
  // Vista previa: el cuerpo baja con el largo para que entre en la tarjeta.
  const tileFontPx = Math.max(12, Math.min(26, Math.round(200 / longest)));

  const handleConfirm = async () => {
    if (!lines.length || busy || disabled) return;
    setBusy(true);
    setError(null);
    try {
      const style = getTextLogoStyle(styleId);
      const { file, dataUrl } = await renderTextLogo(lines, style);
      await onConfirm({ file, dataUrl, styleId, lines });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos armar el diseño. Probá de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={open ? 'border border-[var(--alcohn-line-strong)] bg-white p-3' : ''}>
      {/* Opción con el mismo formato que "Subir" / "Foto" / "WhatsApp" (antes era un acordeón con un "+" chico). */}
      <button
        type="button"
        onClick={() => {
          if (!open) onOpen?.();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        className={`flex min-h-[52px] w-full items-center gap-3 text-left ${
          open ? '' : 'border border-[var(--alcohn-line-strong)] bg-white px-3 py-2'
        }`}
      >
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-neutral-300 bg-[var(--alcohn-surface)] font-serif text-[15px] font-semibold text-neutral-900"
        >
          Aa
        </span>
        <span className="min-w-0">
          <span className="block text-[13.5px] font-semibold text-neutral-900 md:text-sm">
            No tengo logo: usar mi nombre
          </span>
          <span className="mt-0.5 block text-[12px] leading-snug text-neutral-600 md:text-sm">
            Escribí tu marca, elegí la letra y mirá cómo queda.
          </span>
        </span>
        <span aria-hidden className="ml-auto shrink-0 text-neutral-400">
          {open ? '−' : '→'}
        </span>
      </button>

      {open && (
        <div className="mt-2 space-y-3">
          <div>
            <label htmlFor="text-logo-line1" className="mb-1 block text-[12.5px] font-medium text-neutral-700">
              Nombre de tu marca
            </label>
            <input
              id="text-logo-line1"
              type="text"
              value={line1}
              onChange={(e) =>
                setLine1(e.target.value.slice(0, TEXT_LOGO_MAX_CHARS - (showLine2 ? line2.length : 0)))
              }
              placeholder="Ej.: Casa Lupe"
              autoComplete="organization"
              enterKeyHint="done"
              className="w-full border border-[var(--alcohn-line-strong)] bg-white px-3 py-2.5 text-[16px] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            {showLine2 ? (
              <input
                type="text"
                aria-label="Segunda línea (opcional)"
                value={line2}
                onChange={(e) => setLine2(e.target.value.slice(0, TEXT_LOGO_MAX_CHARS - line1.length))}
                placeholder="Segunda línea (ej.: Cueros)"
                enterKeyHint="done"
                className="mt-2 w-full border border-[var(--alcohn-line-strong)] bg-white px-3 py-2.5 text-[16px] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            ) : null}
            <div className="mt-1 flex items-center justify-between gap-2 text-[11.5px] text-neutral-500">
              <button
                type="button"
                onClick={() => {
                  if (showLine2) setLine2('');
                  setShowLine2((v) => !v);
                }}
                className="min-h-[32px] font-medium text-neutral-700 underline underline-offset-2"
              >
                {showLine2 ? 'Quitar segunda línea' : '+ Agregar una segunda línea'}
              </button>
              <span className="tabular-nums">
                {used}/{TEXT_LOGO_MAX_CHARS}
              </span>
            </div>
          </div>

          <div role="radiogroup" aria-label="Tipografía" className="grid grid-cols-2 gap-2">
            {TEXT_LOGO_STYLES.map((style) => {
              const selected = style.id === styleId;
              const sample = lines.length ? lines : ['Tu marca'];
              return (
                <button
                  key={style.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setStyleId(style.id)}
                  className={`flex min-h-[88px] flex-col items-stretch justify-between gap-1 border bg-white px-2 py-2 text-left transition-colors ${
                    selected
                      ? 'border-[var(--alcohn-ink)] shadow-[inset_0_0_0_1px_var(--alcohn-ink)]'
                      : 'border-[var(--alcohn-line)] hover:border-neutral-400'
                  }`}
                >
                  <span
                    className={`flex flex-1 flex-col items-center justify-center overflow-hidden text-center leading-tight text-neutral-950 ${
                      lines.length ? '' : 'opacity-40'
                    }`}
                    style={{
                      fontFamily: previewFontFamily(style),
                      fontWeight: style.weight,
                      letterSpacing: `${style.letterSpacingEm}em`,
                      textTransform: style.uppercase ? 'uppercase' : 'none',
                      fontSize: `${tileFontPx}px`,
                    }}
                  >
                    {sample.map((line, i) => (
                      <span key={i} className="block max-w-full break-words">
                        {line}
                      </span>
                    ))}
                  </span>
                  <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    {style.label}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <p role="alert" className="text-[13px] text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!lines.length || busy || disabled}
            className="flex min-h-[48px] w-full items-center justify-center bg-[var(--alcohn-ink)] px-4 text-[13.5px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[var(--alcohn-ink-soft)] disabled:opacity-50"
          >
            {busy ? 'Armando tu diseño…' : 'Usar este diseño →'}
          </button>
          <p className="text-[11.5px] leading-snug text-neutral-500">
            Después ves la muestra en tu material. Si querés un ajuste, lo vemos por WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
}

export default function WizardTextLogo(props: WizardTextLogoProps) {
  const { market } = useMarket();
  return localizeTree(WizardTextLogoContent(props), market);
}
