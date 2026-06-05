'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { getSizeLabel } from '@/data/standardStamps';
import { COLLECTION_LABELS, getStandardDesignBySlug } from '@/lib/catalog';
import { cotizarCm } from '@/lib/cotizador/fetchCotizacion';
import ActionButton from '@/components/ActionButton';
import PageIntro from '@/components/PageIntro';
import SpecChips from '@/components/SpecChips';
import SizeSelector from '@/components/SizeSelector';
import PurchaseInclusions, { buildStandardStampInclusions } from '@/components/PurchaseInclusions';
import BeforeBuySection from '@/components/sellos/BeforeBuySection';
import StampSpecificationsCard from '@/components/sellos/StampSpecificationsCard';
import { standardStampBeforeBuyFaqs } from '@/data/standardStampBeforeBuyFaqs';
import { useCart } from '@/contexts/CartContext';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function StandardDesignPage({ params }: PageProps) {
  const { addItem } = useCart();
  const design = useMemo(() => getStandardDesignBySlug(params.slug), [params.slug]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>(undefined);
  const [selectedTransferPrice, setSelectedTransferPrice] = useState<number | undefined>(undefined);
  const [priceLoading, setPriceLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageHover, setImageHover] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number | undefined>(undefined);
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const quoteRequestId = useRef(0);

  const sizeOptions = useMemo(
    () => (design ? design.sizes.map((s) => ({ size: getSizeLabel(s) })) : []),
    [design]
  );

  const inclusionItems = useMemo(
    () => (design ? buildStandardStampInclusions(design.title) : []),
    [design]
  );

  useEffect(() => {
    const node = imagePanelRef.current;
    if (!node) return;

    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    const syncPanelHeight = () => {
      if (!desktopQuery.matches) {
        setPanelHeight(undefined);
        return;
      }
      setPanelHeight(Math.round(node.getBoundingClientRect().height));
    };

    const observer = new ResizeObserver(syncPanelHeight);
    observer.observe(node);
    desktopQuery.addEventListener('change', syncPanelHeight);
    window.addEventListener('resize', syncPanelHeight);
    syncPanelHeight();

    return () => {
      observer.disconnect();
      desktopQuery.removeEventListener('change', syncPanelHeight);
      window.removeEventListener('resize', syncPanelHeight);
    };
  }, [params.slug]);

  if (!design) {
    return (
      <div className="atelier-page min-h-screen py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl text-center">
          <p className="text-neutral-600">Diseño no encontrado</p>
        </div>
      </div>
    );
  }

  const handleSizeSelect = async (sizeLabel: string) => {
    const size = design.sizes.find((s) => getSizeLabel(s) === sizeLabel);
    if (!size) return;

    setSelectedSize(sizeLabel);
    setSelectedPrice(undefined);
    setSelectedTransferPrice(undefined);
    setAddedToCart(false);
    setPriceLoading(true);

    const requestId = ++quoteRequestId.current;
    const quote = await cotizarCm(size.widthCm, size.heightCm);

    if (requestId !== quoteRequestId.current) return;

    setSelectedPrice(quote?.precio_link_ars);
    setSelectedTransferPrice(quote?.precio_transferencia_ars);
    setPriceLoading(false);
  };

  const handleAddToCart = () => {
    if (selectedSize && selectedPrice) {
      addItem({
        title: design.title,
        collection: COLLECTION_LABELS[design.collection] || design.collection,
        material: 'Bronce',
        process: 'CNC',
        variantSize: selectedSize,
        price: selectedPrice,
        image: design.image,
        designSlug: design.slug,
      });

      setAddedToCart(true);
    }
  };

  const canAddToCart = Boolean(selectedSize && selectedPrice && !priceLoading);

  return (
    <div className="atelier-page min-h-screen py-8 md:py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label={COLLECTION_LABELS[design.collection] || design.collection}
          title={design.title}
          description={
            design.description ||
            'Elegí medida, agregá al carrito y completá checkout sin esperar una consulta manual.'
          }
          primaryCta={{
            label: 'Elegir medida',
            href: '#medidas',
          }}
          secondaryCta={{
            label: 'Ver otros diseños',
            href: '/sellos/estandar',
            variant: 'secondary',
          }}
          highlights={[
            'Diseño listo para comprar',
            'Medidas con precio visible',
            'Checkout online y seguimiento',
          ]}
        />

        <div
          className="mb-12 grid w-full grid-cols-1 gap-6 md:mb-20 md:gap-16 lg:grid-cols-2 lg:items-stretch lg:gap-16 xl:gap-24"
          style={panelHeight ? { gridTemplateRows: `${panelHeight}px` } : undefined}
        >
          <div className="min-w-0 w-full lg:h-full">
            <div
              ref={imagePanelRef}
              className="material-frame relative aspect-square w-full max-w-full overflow-hidden"
              onMouseEnter={() => setImageHover(true)}
              onMouseLeave={() => setImageHover(false)}
            >
            {design.image ? (
              <>
                <Image
                  src={design.image}
                  alt={design.title}
                  fill
                  className={`object-cover transition-opacity duration-300 ${imageHover && design.hoverImage ? 'opacity-0' : 'opacity-100'}`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {design.hoverImage && (
                  <Image
                    src={design.hoverImage}
                    alt={`${design.title} marcado en cuero`}
                    fill
                    className={`object-cover transition-opacity duration-300 ${imageHover ? 'opacity-100' : 'opacity-0'}`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            </div>
          </div>

          <div className="flex h-full min-h-0 w-full min-w-0 flex-col justify-between">
            <div className="flex min-h-0 flex-1 flex-col gap-5 lg:gap-3 lg:overflow-y-auto lg:pr-1">
              <SpecChips
                specs={[
                  {
                    label: 'Colección',
                    value: COLLECTION_LABELS[design.collection] || design.collection,
                  },
                  { label: 'Material', value: 'Bronce' },
                  { label: 'Proceso', value: 'CNC' },
                ]}
              />

              <StampSpecificationsCard className="lg:p-3 [&>div:first-child]:lg:pb-2 [&>div:last-child]:lg:mt-2" />

              <div id="medidas" className="scroll-mt-24">
                <SizeSelector
                  sizes={sizeOptions}
                  selectedSize={selectedSize}
                  onSelect={handleSizeSelect}
                />
              </div>
            </div>

            <div className="mt-6 shrink-0 space-y-4 border-t border-[var(--alcohn-line)] pt-5 lg:mt-0 lg:space-y-3 lg:pt-4">
              <div className="space-y-2">
                <p className="craft-label">{selectedSize ? 'Precio' : 'Desde'}</p>

                <div className="space-y-1.5">
                  <p className="min-h-[2.25rem] text-2xl font-bold leading-tight tracking-tight text-neutral-900 md:min-h-[2.75rem] md:text-3xl">
                    {priceLoading ? (
                      <span className="text-lg font-semibold text-neutral-400">Cotizando...</span>
                    ) : (
                      <>
                        ${(selectedPrice ?? design.startingPrice).toLocaleString('es-AR')}
                        <span
                          className={[
                            'text-sm font-bold text-neutral-700 md:text-base',
                            selectedSize && selectedPrice != null ? '' : 'invisible',
                          ].join(' ')}
                          aria-hidden={!(selectedSize && selectedPrice != null)}
                        >
                          {' '}
                          (3 cuotas sin interés)
                        </span>
                      </>
                    )}
                  </p>

                  <p
                    className={[
                      'min-h-[1.25rem] text-sm font-semibold leading-snug',
                      selectedTransferPrice != null ? 'text-green-600' : 'invisible',
                    ].join(' ')}
                    aria-hidden={selectedTransferPrice == null}
                  >
                    Transferencia: $
                    {(selectedTransferPrice ?? design.startingPrice).toLocaleString('es-AR')}
                  </p>
                </div>

                <p className="min-h-[1.25rem] text-sm leading-snug text-neutral-500">
                  {selectedSize && !priceLoading && selectedPrice == null
                    ? 'No pudimos cotizar esta medida. Escribinos por WhatsApp.'
                    : '\u00A0'}
                </p>
              </div>

              <div className="min-h-[44px]">
                {canAddToCart ? (
                  <button
                    onClick={handleAddToCart}
                    className="min-h-[44px] w-full border border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:border-[var(--alcohn-bronze)] hover:bg-[var(--alcohn-ink-soft)] focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 sm:w-auto"
                  >
                    Agregar al carrito
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="min-h-[44px] w-full cursor-not-allowed border border-neutral-300 bg-neutral-100 px-6 py-3 text-sm font-medium uppercase tracking-wider text-neutral-500 sm:w-auto"
                  >
                    {priceLoading ? 'Cotizando medida...' : 'Eleg\u00ed una medida para comprar'}
                  </button>
                )}
                {addedToCart && (
                  <div className="mt-4 border border-[var(--alcohn-bronze)] bg-[var(--alcohn-paper)] p-4">
                    <p className="text-sm font-medium text-neutral-900">
                      Agregado al carrito. Pod&eacute;s finalizar la compra ahora o seguir mirando dise&ntilde;os.
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <ActionButton href="/checkout" variant="primary" className="flex-1">
                        Finalizar compra
                      </ActionButton>
                      <ActionButton href="/sellos/estandar" variant="secondary" className="flex-1">
                        Seguir comprando
                      </ActionButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12 space-y-12 md:mb-20 md:space-y-16">
          <PurchaseInclusions
            inclusionItems={inclusionItems}
            showKitIllustration
            title="Qué incluye tu compra"
          />
          <BeforeBuySection faqs={standardStampBeforeBuyFaqs} />
        </div>

        <div className="border-t border-[var(--alcohn-line)] pt-12">
          <ActionButton href="/sellos/estandar" variant="ghost">
            ← Ver todos los diseños estándar
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
