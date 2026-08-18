'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useMarket } from '@/contexts/MarketContext';
import { abecedarios } from '@/lib/catalog';
import {
  ABECEDARIO_COMPLETO_PRECIO_DESDE,
  ABECEDARIO_FONTS,
  ABECEDARIO_PRECIOS_DESDE,
  ABECEDARIO_QTY_LIMITS,
  ABECEDARIO_TAMANOS_MM,
  AbecedarioFontKey,
  AbecedarioPersonalizadoState,
  AbecedarioTamanoMm,
  AbecedarioTipo,
  DEFAULT_PERSONALIZADO_STATE,
  buildAbecedarioCompletoSampleText,
  buildAbecedarioSampleText,
  calcularPresupuestoPersonalizado,
  clampQty,
  getAbecedarioCompletoPrecio,
  getAbecedarioPrecios,
  getFontOption,
  precioTransferencia,
} from '@/lib/abecedarioConfigurator';
import { getMarketConfig } from '@/lib/markets/config';
import { marketPath } from '@/lib/markets/paths';
import { formatCatalogPriceFromLinkArs } from '@/lib/markets/pricing';
import { generateLeatherTextMockup, sizeScaleFromMm } from '@/lib/textStampMockup';

const abecedarioCompleto = abecedarios[0];
const PERSONALIZADO_MIN_PRECIO = ABECEDARIO_PRECIOS_DESDE.numero;

interface QtyStepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  label: string;
}

function SelectableCard({
  selected,
  onSelect,
  className = '',
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`material-card cursor-pointer p-4 transition-all md:p-8 ${
        selected
          ? 'border-2 border-[var(--alcohn-ink)] bg-[var(--alcohn-paper)]'
          : 'border border-[var(--alcohn-line)] hover:border-[var(--alcohn-bronze)]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function TipoOptionMobile({
  selected,
  onSelect,
  eyebrow,
  title,
  bullets,
  priceFrom,
  footer,
  recommended,
}: {
  selected: boolean;
  onSelect: () => void;
  eyebrow: string;
  title: string;
  bullets: string[];
  priceFrom: number;
  footer?: string;
  recommended?: boolean;
}) {
  const { market } = useMarket();

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`w-full border p-4 text-left transition-all ${
        selected
          ? 'border-2 border-[var(--alcohn-ink)] bg-[var(--alcohn-paper)]'
          : 'border-[var(--alcohn-line)] bg-white hover:border-[var(--alcohn-bronze)]'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span className="craft-label text-[9px] leading-tight">{eyebrow}</span>
            {recommended && (
              <span className="border border-[var(--alcohn-bronze)] bg-white px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-[var(--alcohn-bronze)]">
                Más elegido
              </span>
            )}
          </div>
          <span className="text-base font-semibold uppercase tracking-tight text-neutral-950">{title}</span>
        </div>
        <div className="shrink-0 text-right">
          <span className="craft-label block text-[9px]">Desde</span>
          <span className="text-sm font-bold leading-tight text-neutral-900">
            {formatCatalogPriceFromLinkArs(priceFrom, market)}
          </span>
        </div>
      </div>
      <ul className="space-y-1.5">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-1.5 text-[11px] leading-snug text-neutral-700">
            <span className="mt-px shrink-0 text-[var(--alcohn-bronze)]">·</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      {footer && (
        <p className="mt-3 border-t border-[var(--alcohn-line)] pt-2.5 text-[10px] leading-snug text-neutral-500">
          {footer}
        </p>
      )}
    </button>
  );
}

function IncludesList({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 border-t border-[var(--alcohn-line)] pt-3 md:mb-6 md:pt-5">
      <div className="craft-label mb-2 md:mb-3">Incluye</div>
      {children}
    </div>
  );
}

function QtyStepper({ value, onChange, min, max, label }: QtyStepperProps) {
  return (
    <div className="inline-flex items-center border border-[var(--alcohn-line-strong)] bg-white">
      <button
        type="button"
        aria-label={`Quitar ${label}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-8 w-8 items-center justify-center text-base font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 md:h-9 md:w-9"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-semibold text-neutral-900 md:w-9">{value}</span>
      <button
        type="button"
        aria-label={`Agregar ${label}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-8 w-8 items-center justify-center text-base font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 md:h-9 md:w-9"
      >
        +
      </button>
    </div>
  );
}

export default function AbecedarioConfigurator() {
  const router = useRouter();
  const { addItem } = useCart();
  const { market } = useMarket();
  const formatPrice = (linkArs: number) => formatCatalogPriceFromLinkArs(linkArs, market);
  const [tipo, setTipo] = useState<AbecedarioTipo>('completo');
  const [personalizado, setPersonalizado] = useState<AbecedarioPersonalizadoState>(DEFAULT_PERSONALIZADO_STATE);
  const [completoTamanoMm, setCompletoTamanoMm] = useState<AbecedarioTamanoMm>(5);
  const [completoFuente, setCompletoFuente] = useState<AbecedarioFontKey>('arial');
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [mockupLoading, setMockupLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const requestIdRef = useRef(0);

  const presupuesto = useMemo(() => calcularPresupuestoPersonalizado(personalizado), [personalizado]);
  const preciosActuales = useMemo(() => getAbecedarioPrecios(personalizado.tamanoMm), [personalizado.tamanoMm]);
  const fontOption = useMemo(() => getFontOption(personalizado.fuente), [personalizado.fuente]);
  const completoFontOption = useMemo(() => getFontOption(completoFuente), [completoFuente]);
  const completoPrecio = getAbecedarioCompletoPrecio(completoTamanoMm);

  const precio = tipo === 'completo' ? completoPrecio : presupuesto.total;
  const precioValido = tipo === 'completo' || precio > 0;

  useEffect(() => {
    setAddedToCart(false);
  }, [tipo, personalizado, completoTamanoMm, completoFuente]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setMockupLoading(true);

    const text =
      tipo === 'completo' ? buildAbecedarioCompletoSampleText() : buildAbecedarioSampleText(personalizado);
    const family = tipo === 'completo' ? completoFontOption.family : fontOption.family;
    const scale = sizeScaleFromMm(tipo === 'completo' ? completoTamanoMm : personalizado.tamanoMm);

    const timeout = setTimeout(() => {
      generateLeatherTextMockup(text, family, scale)
        .then((url) => {
          if (requestId !== requestIdRef.current) return;
          setMockupUrl(url);
          setMockupLoading(false);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setMockupLoading(false);
        });
    }, 350);

    return () => clearTimeout(timeout);
  }, [tipo, personalizado, fontOption, completoFontOption, completoTamanoMm]);

  const updatePersonalizado = <K extends keyof AbecedarioPersonalizadoState>(
    key: K,
    value: AbecedarioPersonalizadoState[K],
  ) => {
    setPersonalizado((prev) => ({ ...prev, [key]: value }));
  };

  const handleAgregarAlCarrito = () => {
    if (!precioValido) return;

    if (tipo === 'completo') {
      addItem({
        title: abecedarioCompleto.title,
        collection: 'Abecedarios',
        material: 'Bronce',
        process: 'CNC',
        variantSize: `Completo (A-Z, a-z, 0-9) · ${completoFontOption.label} · ${completoTamanoMm}mm`,
        price: completoPrecio,
        image: abecedarioCompleto.images[0],
        designSlug: abecedarioCompleto.slug,
      });
    } else {
      const detalle = presupuesto.lineas
        .filter((l) => l.qty > 0)
        .map((l) => `${l.qty}x ${l.label}`)
        .join(', ');
      addItem({
        title: 'Abecedario Personalizado',
        collection: 'Abecedarios',
        material: 'Bronce',
        process: 'CNC',
        variantSize: `${detalle || 'Sin piezas'} · ${fontOption.label} · ${personalizado.tamanoMm}mm`,
        price: presupuesto.total,
        image: abecedarioCompleto.images[0],
        designSlug: 'abecedario-personalizado',
      });
    }

    setAddedToCart(true);
  };

  const handleComprar = () => {
    handleAgregarAlCarrito();
    router.push(marketPath(market, '/checkout'));
  };

  return (
    <section id="configurador" className="mb-10 md:mb-20 border-t border-[var(--alcohn-line)] pt-6 md:pt-16">
      <p className="craft-label mb-2 md:mb-3">Configurador</p>
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-neutral-950 md:mb-10 md:text-4xl">
        Elegí tu tipo de Abecedario
      </h2>
      <p className="mb-4 text-[13px] leading-snug text-neutral-600 md:hidden">
        Compará las dos opciones. Las dos quedan visibles: tocá la que mejor se adapte a tu taller.
      </p>

      <div className="mb-4 flex flex-col gap-2 md:hidden">
        <TipoOptionMobile
          selected={tipo === 'completo'}
          onSelect={() => setTipo('completo')}
          eyebrow="Todo incluido"
          title="Completo"
          recommended
          bullets={[
            'Mayúsculas, minúsculas y números (A-Z, a-z, 0-9)',
            'Caja organizadora, soporte de bronce y mango de uso manual',
            'Cada letra es un sello independiente de bronce CNC',
            'Ideal para nombres, fechas, códigos o series en cuero y madera',
          ]}
          footer="Un solo pedido con todo lo necesario para empezar a marcar desde el día uno."
          priceFrom={ABECEDARIO_COMPLETO_PRECIO_DESDE}
        />
        <TipoOptionMobile
          selected={tipo === 'personalizado'}
          onSelect={() => setTipo('personalizado')}
          eyebrow="Armá tu set"
          title="Personalizado"
          bullets={[
            'Elegís mayúsculas, minúsculas, números o caracteres extra (Ñ, @, etc.)',
            'Pagás solo las piezas que sumás — el presupuesto se arma en vivo',
            'Podés empezar solo con números o un juego puntual',
            'Caja y mango incluidos sin cargo en cualquier combinación',
          ]}
          footer="Ideal si ya sabés qué juegos necesitás y querés optimizar el gasto."
          priceFrom={PERSONALIZADO_MIN_PRECIO}
        />
      </div>

      <div className="mb-6 hidden gap-4 md:mb-10 md:grid md:grid-cols-2">
        <SelectableCard selected={tipo === 'completo'} onSelect={() => setTipo('completo')} className="text-left">
          <p className="craft-label mb-2 md:mb-3">Abecedario de bronce estandarizados</p>
          <h3 className="mb-2 text-xl font-semibold tracking-tight text-neutral-950 md:mb-4 md:text-2xl">COMPLETO</h3>
          <p className="mb-3 text-[13px] leading-snug text-neutral-600 md:mb-6 md:text-sm md:leading-relaxed">
            {abecedarioCompleto.description}
          </p>
          <IncludesList>
            <ul className="space-y-1 md:space-y-1.5">
              {abecedarioCompleto.includes.map((item) => (
                <li key={item} className="flex items-start text-[13px] text-neutral-700 md:text-sm">
                  <span className="mr-2 text-[var(--alcohn-bronze)]">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </IncludesList>
          <p className="text-base text-neutral-900 md:text-lg">
            <span className="craft-label mr-2">Desde</span>
            {formatPrice(ABECEDARIO_COMPLETO_PRECIO_DESDE)}
          </p>
        </SelectableCard>

        <SelectableCard selected={tipo === 'personalizado'} onSelect={() => setTipo('personalizado')} className="text-left">
          <p className="craft-label mb-2 md:mb-3">Abecedario de bronce personalizados</p>
          <h3 className="mb-2 text-xl font-semibold tracking-tight text-neutral-950 md:mb-4 md:text-2xl">PERSONALIZADO</h3>
          <p className="mb-3 text-[13px] leading-snug text-neutral-600 md:mb-6 md:text-sm md:leading-relaxed">
            Elegí y personalizá tu Abecedario en base a lo que necesitás. Sumá los juegos de mayúscula,
            minúscula, números o caracteres extra que necesites.
          </p>
          <IncludesList>
            <ul className="space-y-1 md:space-y-1.5">
              <li className="flex items-center justify-between gap-2 text-[13px] text-neutral-700 md:text-sm">
                <span>Abecedario en Mayúscula</span>
                <span className="text-neutral-500">desde {formatPrice(ABECEDARIO_PRECIOS_DESDE.mayuscula)}</span>
              </li>
              <li className="flex items-center justify-between gap-2 text-[13px] text-neutral-700 md:text-sm">
                <span>Abecedario en Minúscula</span>
                <span className="text-neutral-500">desde {formatPrice(ABECEDARIO_PRECIOS_DESDE.minuscula)}</span>
              </li>
              <li className="flex items-center justify-between gap-2 text-[13px] text-neutral-700 md:text-sm">
                <span>Números (0 al 9)</span>
                <span className="text-neutral-500">{formatPrice(ABECEDARIO_PRECIOS_DESDE.numero)}</span>
              </li>
              <li className="flex items-center justify-between gap-2 text-[13px] text-neutral-700 md:text-sm">
                <span>Caracteres extra</span>
                <span className="text-neutral-500">desde {formatPrice(ABECEDARIO_PRECIOS_DESDE.extra)}</span>
              </li>
              <li className="flex items-center justify-between gap-2 text-[13px] text-neutral-700 md:text-sm">
                <span>Soporte de Bronce</span>
                <span className="text-neutral-500">{formatPrice(ABECEDARIO_PRECIOS_DESDE.soporte)}</span>
              </li>
              <li className="flex items-center justify-between gap-2 text-[13px] text-neutral-700 md:gap-3 md:text-sm">
                <span>Caja contenedora</span>
                <span className="shrink-0 border border-[var(--alcohn-bronze)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--alcohn-bronze)]">
                  Incluida sin cargo
                </span>
              </li>
              <li className="flex items-center justify-between gap-2 text-[13px] text-neutral-700 md:gap-3 md:text-sm">
                <span>Mango de madera</span>
                <span className="shrink-0 border border-[var(--alcohn-bronze)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--alcohn-bronze)]">
                  Incluido sin cargo
                </span>
              </li>
            </ul>
          </IncludesList>
          <p className="text-base text-neutral-900 md:text-lg">
            <span className="craft-label mr-2">Desde</span>
            {formatPrice(PERSONALIZADO_MIN_PRECIO)}
          </p>
        </SelectableCard>
      </div>

      <div className="technical-sheet overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.46fr_0.54fr]">
          <div className="border-b lg:border-b-0 lg:border-r border-[var(--alcohn-line)] p-4 md:p-8">
            <p className="craft-label mb-4">Muestra en cuero</p>
            <div className="material-frame relative aspect-[3/2] overflow-hidden bg-neutral-900 md:aspect-[7/5]">
              {mockupUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mockupUrl}
                  alt="Muestra del abecedario grabado en cuero"
                  className={`h-full w-full object-cover transition-opacity duration-300 ${
                    mockupLoading ? 'opacity-60' : 'opacity-100'
                  }`}
                />
              )}
              {mockupLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <span className="flex items-center gap-2 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-700">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--alcohn-bronze)]" />
                    Generando muestra…
                  </span>
                </div>
              )}
            </div>
            <p className="mt-3 hidden text-xs leading-relaxed text-neutral-500 md:block">
              Vista previa generada según tu selección de caracteres, tamaño y fuente. El resultado final en
              bronce puede variar levemente.
            </p>
          </div>

          <div className="p-4 md:p-8">
            {tipo === 'completo' ? (
              <div className="flex h-full flex-col">
                <div>
                  <p className="craft-label mb-4">Abecedario Completo</p>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    Incluye un juego completo de mayúsculas, minúsculas y números, junto con caja
                    organizadora, soporte de bronce y mango de uso manual. Listo para componer cualquier
                    texto.
                  </p>
                </div>

                <div className="mt-6 border-t border-[var(--alcohn-line)] pt-4">
                  <TamanoFuenteSelects
                    tamanoMm={completoTamanoMm}
                    fuente={completoFuente}
                    onTamanoChange={setCompletoTamanoMm}
                    onFuenteChange={setCompletoFuente}
                  />
                </div>

                <div className="mt-auto pt-6">
                  <PrecioYAcciones
                    precio={completoPrecio}
                    onAgregar={handleAgregarAlCarrito}
                    onComprar={handleComprar}
                    addedToCart={addedToCart}
                    habilitado
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <p className="craft-label mb-5">Elegí</p>

                <div className="space-y-4">
                  <ConfigRow label="Abecedario en Mayúscula" price={preciosActuales.mayuscula}>
                    <QtyStepper
                      label="Mayúscula"
                      value={personalizado.mayusculas}
                      min={ABECEDARIO_QTY_LIMITS.mayuscula.min}
                      max={ABECEDARIO_QTY_LIMITS.mayuscula.max}
                      onChange={(v) => updatePersonalizado('mayusculas', clampQty(v, 'mayuscula'))}
                    />
                  </ConfigRow>
                  <ConfigRow label="Abecedario en Minúscula" price={preciosActuales.minuscula}>
                    <QtyStepper
                      label="Minúscula"
                      value={personalizado.minusculas}
                      min={ABECEDARIO_QTY_LIMITS.minuscula.min}
                      max={ABECEDARIO_QTY_LIMITS.minuscula.max}
                      onChange={(v) => updatePersonalizado('minusculas', clampQty(v, 'minuscula'))}
                    />
                  </ConfigRow>
                  <ConfigRow label="Números (0 al 9)" price={preciosActuales.numero}>
                    <QtyStepper
                      label="Números"
                      value={personalizado.numeros}
                      min={ABECEDARIO_QTY_LIMITS.numero.min}
                      max={ABECEDARIO_QTY_LIMITS.numero.max}
                      onChange={(v) => updatePersonalizado('numeros', clampQty(v, 'numero'))}
                    />
                  </ConfigRow>
                  <ConfigRow label="Caracteres extra" price={preciosActuales.extra}>
                    <QtyStepper
                      label="Caracteres extra"
                      value={personalizado.extrasQty}
                      min={ABECEDARIO_QTY_LIMITS.extra.min}
                      max={ABECEDARIO_QTY_LIMITS.extra.max}
                      onChange={(v) => updatePersonalizado('extrasQty', clampQty(v, 'extra'))}
                    />
                  </ConfigRow>

                  {personalizado.extrasQty > 0 && (
                    <textarea
                      value={personalizado.extrasChars}
                      onChange={(e) => updatePersonalizado('extrasChars', e.target.value)}
                      placeholder="Indicar caracteres extra (ej: Ñ @ . -)"
                      rows={2}
                      className="w-full border border-[var(--alcohn-line-strong)] bg-white p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--alcohn-ink)] focus:outline-none"
                    />
                  )}

                  <ConfigRow label="Soporte de Bronce" price={preciosActuales.soporte}>
                    <QtyStepper
                      label="Soporte de Bronce"
                      value={personalizado.soportes}
                      min={ABECEDARIO_QTY_LIMITS.soporte.min}
                      max={ABECEDARIO_QTY_LIMITS.soporte.max}
                      onChange={(v) => updatePersonalizado('soportes', clampQty(v, 'soporte'))}
                    />
                  </ConfigRow>

                  <div className="border-t border-[var(--alcohn-line)] pt-4">
                    <TamanoFuenteSelects
                      tamanoMm={personalizado.tamanoMm}
                      fuente={personalizado.fuente}
                      onTamanoChange={(mm) => updatePersonalizado('tamanoMm', mm)}
                      onFuenteChange={(f) => updatePersonalizado('fuente', f)}
                    />
                  </div>
                </div>

                <div className="mt-5 hidden border-t border-[var(--alcohn-line)] pt-4 md:block md:mt-6 md:pt-5">
                  <p className="craft-label mb-3">Presupuesto</p>
                  <dl className="space-y-1.5">
                    {presupuesto.lineas
                      .filter((l) => l.qty > 0)
                      .map((l) => (
                        <div key={l.label} className="flex items-center justify-between text-sm">
                          <dt className="text-neutral-600">
                            {l.qty}x {l.label}
                          </dt>
                          <dd className="font-medium text-neutral-900">{formatPrice(l.subtotal)}</dd>
                        </div>
                      ))}
                    {presupuesto.lineas.every((l) => l.qty === 0) && (
                      <p className="text-sm text-neutral-500">Elegí al menos una pieza para continuar.</p>
                    )}
                  </dl>
                </div>

                <div className="mt-auto pt-6">
                  <PrecioYAcciones
                    precio={presupuesto.total}
                    onAgregar={handleAgregarAlCarrito}
                    onComprar={handleComprar}
                    addedToCart={addedToCart}
                    habilitado={presupuesto.total > 0}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FontSelect({
  value,
  onChange,
}: {
  value: AbecedarioFontKey;
  onChange: (fuente: AbecedarioFontKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selected = getFontOption(value);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 border border-[var(--alcohn-line-strong)] bg-white px-3 py-2 text-left text-sm text-neutral-900 focus:border-[var(--alcohn-ink)] focus:outline-none"
        style={{ fontFamily: selected.family }}
      >
        <span className="truncate">{selected.label}</span>
        <svg
          viewBox="0 0 20 20"
          aria-hidden
          className={`h-4 w-4 shrink-0 fill-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M5.5 7.5L10 12l4.5-4.5H5.5z" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Fuente"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto border border-[var(--alcohn-line-strong)] bg-white shadow-lg"
        >
          {ABECEDARIO_FONTS.map((f) => (
            <li key={f.key} role="option" aria-selected={f.key === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(f.key);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-neutral-100 ${
                  f.key === value ? 'bg-[var(--alcohn-paper)] font-semibold text-neutral-950' : 'text-neutral-800'
                }`}
                style={{ fontFamily: f.family }}
              >
                {f.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TamanoFuenteSelects({
  tamanoMm,
  fuente,
  onTamanoChange,
  onFuenteChange,
}: {
  tamanoMm: AbecedarioTamanoMm;
  fuente: AbecedarioFontKey;
  onTamanoChange: (mm: AbecedarioTamanoMm) => void;
  onFuenteChange: (fuente: AbecedarioFontKey) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="block">
        <span className="craft-label mb-2 block">Tamaño</span>
        <select
          value={tamanoMm}
          onChange={(e) => onTamanoChange(Number(e.target.value) as AbecedarioTamanoMm)}
          className="w-full border border-[var(--alcohn-line-strong)] bg-white px-3 py-2 text-sm text-neutral-900 focus:border-[var(--alcohn-ink)] focus:outline-none"
        >
          {ABECEDARIO_TAMANOS_MM.map((mm) => (
            <option key={mm} value={mm}>
              {mm}mm
            </option>
          ))}
        </select>
      </label>
      <div>
        <span className="craft-label mb-2 block">Fuente</span>
        <FontSelect value={fuente} onChange={onFuenteChange} />
      </div>
    </div>
  );
}

function ConfigRow({ label, price, children }: { label: string; price: number; children: React.ReactNode }) {
  const { market } = useMarket();

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        <p className="text-xs text-neutral-500">{formatCatalogPriceFromLinkArs(price, market)}</p>
      </div>
      {children}
    </div>
  );
}

function PrecioYAcciones({
  precio,
  onAgregar,
  onComprar,
  addedToCart,
  habilitado,
}: {
  precio: number;
  onAgregar: () => void;
  onComprar: () => void;
  addedToCart: boolean;
  habilitado: boolean;
}) {
  const { market } = useMarket();
  const isArgentina = market === 'ar';
  const currency = getMarketConfig(market).currency;

  return (
    <div>
      <p className="text-2xl font-bold leading-tight tracking-tight text-neutral-900 md:text-3xl">
        {formatCatalogPriceFromLinkArs(precio, market)}{' '}
        {isArgentina && (
          <span className="text-sm font-semibold text-neutral-700 md:text-base">(3 cuotas sin interés)</span>
        )}
      </p>
      {isArgentina ? (
        <p className="mt-1 text-sm font-semibold text-green-600">
          Transferencia: {formatCatalogPriceFromLinkArs(precioTransferencia(precio), market)}
        </p>
      ) : (
        <p className="mt-1 text-sm text-neutral-600">
          Precio en {currency}. El envío DHL se suma en el checkout.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onComprar}
          disabled={!habilitado}
          className="min-h-[44px] flex-1 border border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:border-[var(--alcohn-bronze)] hover:bg-[var(--alcohn-ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Comprar
        </button>
        <button
          type="button"
          onClick={onAgregar}
          disabled={!habilitado}
          className="min-h-[44px] flex-1 border border-neutral-300 bg-[var(--alcohn-surface)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-neutral-900 transition-colors hover:border-[var(--alcohn-bronze)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Agregar al carrito
        </button>
      </div>

      {addedToCart && (
        <div className="mt-4 border border-[var(--alcohn-bronze)] bg-[var(--alcohn-paper)] p-4">
          <p className="text-sm font-medium text-neutral-900">
            Agregado al carrito. Podés finalizar la compra ahora o seguir configurando.
          </p>
        </div>
      )}
    </div>
  );
}
