'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ActionButton from '@/components/ActionButton';
import PageIntro from '@/components/PageIntro';
import SpecChips from '@/components/SpecChips';
import PurchaseInclusions from '@/components/PurchaseInclusions';
import AccessoryImageGallery from '@/components/accesorios/AccessoryImageGallery';
import AccessorySpecificationsCard from '@/components/accesorios/AccessorySpecificationsCard';
import AccessoryVariantSelector from '@/components/accesorios/AccessoryVariantSelector';
import { useCart } from '@/contexts/CartContext';
import type { Accessory } from '@/data/accessories';
import {
  getAccessoryLinkPrice,
  getAccessoryTransferPrice,
  getDefaultAccessoryVariant,
} from '@/data/accessories';

interface AccessoryProductPageProps {
  accessory: Accessory;
}

export default function AccessoryProductPage({ accessory }: AccessoryProductPageProps) {
  const { addItem } = useCart();
  const defaultVariant = getDefaultAccessoryVariant(accessory) ?? accessory.variants?.[0];
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    defaultVariant?.id
  );
  const [addedToCart, setAddedToCart] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number | undefined>(undefined);
  const imagePanelRef = useRef<HTMLDivElement>(null);

  const selectedVariant = useMemo(
    () => accessory.variants?.find((variant) => variant.id === selectedVariantId),
    [accessory.variants, selectedVariantId]
  );

  const linkPrice = selectedVariant?.outOfStock
    ? 0
    : selectedVariant?.linkPrice ?? getAccessoryLinkPrice(accessory);
  const transferPrice = selectedVariant?.outOfStock
    ? 0
    : selectedVariant?.transferPrice ?? getAccessoryTransferPrice(accessory);
  const variantLabel = selectedVariant?.label ?? 'Único';
  const canPurchase = !selectedVariant?.outOfStock && linkPrice > 0;

  const inclusionItems = accessory.inclusionItems ?? accessory.includes.map((item) => ({
    title: item,
    copy: 'Incluido para que el pedido llegue listo para usar.',
  }));

  const galleryImages = accessory.galleryImages ?? [accessory.image];

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
  }, [accessory.slug]);

  const handleAddToCart = () => {
    if (!canPurchase) return;

    addItem({
      title: accessory.title,
      collection: 'Accesorios',
      material: 'Accesorio',
      process: '—',
      variantSize: variantLabel,
      price: linkPrice,
      image: accessory.image,
      designSlug: accessory.slug,
    });
    setAddedToCart(true);
  };

  const purchaseCtaLabel = accessory.purchaseCtaLabel ?? `Encargá tu ${accessory.title.toLowerCase()}`;

  return (
    <div className="atelier-page min-h-screen py-8 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <PageIntro
          label="Accesorios"
          title={accessory.title}
          titleOnlyOnMobile
          description={
            accessory.heroDescription ??
            accessory.description
          }
          primaryCta={{
            label: 'Encargá el tuyo',
            href: '#comprar',
          }}
          secondaryCta={{
            label: 'Ver otros accesorios',
            href: '/accesorios',
            variant: 'secondary',
          }}
          highlights={
            accessory.highlights ?? [
              'Complemento listo para comprar',
              'Precio visible al elegir variante',
              'Checkout online y seguimiento',
            ]
          }
        />

        <div
          id="comprar"
          className="mb-12 grid w-full scroll-mt-24 grid-cols-1 gap-4 md:mb-20 md:gap-16 lg:grid-cols-2 lg:items-stretch lg:gap-16 xl:gap-24"
          style={panelHeight ? { gridTemplateRows: `${panelHeight}px` } : undefined}
        >
          <div className="min-w-0 w-full lg:h-full">
            <div ref={imagePanelRef} className="material-frame w-full max-w-full overflow-hidden">
              <AccessoryImageGallery images={galleryImages} alt={accessory.title} />
            </div>
          </div>

          <div className="flex h-full min-h-0 w-full min-w-0 flex-col justify-between">
            <div className="flex min-h-0 flex-1 flex-col gap-5 lg:gap-3 lg:overflow-y-auto lg:pr-1">
              {accessory.specChips && <SpecChips specs={accessory.specChips} />}

              {accessory.specs && <AccessorySpecificationsCard specs={accessory.specs} />}

              {accessory.variants && accessory.variants.length > 0 && (
                <AccessoryVariantSelector
                  label={accessory.variantSelectorLabel ?? 'Elegí tu opción'}
                  variants={accessory.variants}
                  selectedVariantId={selectedVariantId}
                  onSelect={(variantId) => {
                    setSelectedVariantId(variantId);
                    setAddedToCart(false);
                  }}
                />
              )}

              {(accessory.notes ?? (accessory.note ? [accessory.note] : [])).map((note) => (
                <p
                  key={note}
                  className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
                >
                  Nota: {note}
                </p>
              ))}
            </div>

            <div className="mt-6 shrink-0 space-y-4 border-t border-[var(--alcohn-line)] pt-5 lg:mt-0 lg:space-y-3 lg:pt-4">
              <div className="space-y-2">
                <p className="craft-label">Precio</p>

                <div className="space-y-1.5">
                  <p className="min-h-[2.25rem] text-2xl font-bold leading-tight tracking-tight text-neutral-900 md:min-h-[2.75rem] md:text-3xl">
                    {canPurchase ? `$${linkPrice.toLocaleString('es-AR')}` : 'Sin stock'}
                  </p>

                  {canPurchase ? (
                    <p className="min-h-[1.25rem] text-sm font-semibold leading-snug text-green-600">
                      ${transferPrice.toLocaleString('es-AR')} c/ transferencia
                    </p>
                  ) : (
                    <p className="min-h-[1.25rem] text-sm font-semibold leading-snug text-neutral-500">
                      Sin stock por el momento
                    </p>
                  )}
                </div>
              </div>

              <div className="min-h-[44px]">
                {canPurchase ? (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="min-h-[44px] w-full border border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:border-[var(--alcohn-bronze)] hover:bg-[var(--alcohn-ink-soft)] focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 sm:w-auto"
                  >
                    {purchaseCtaLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="min-h-[44px] w-full cursor-not-allowed border border-neutral-300 bg-neutral-100 px-6 py-3 text-sm font-medium uppercase tracking-wider text-neutral-500 sm:w-auto"
                  >
                    Sin stock por el momento
                  </button>
                )}

                {addedToCart && (
                  <div className="mt-4 border border-[var(--alcohn-bronze)] bg-[var(--alcohn-paper)] p-4">
                    <p className="text-sm font-medium text-neutral-900">
                      Agregado al carrito. Podés finalizar la compra ahora o seguir mirando accesorios.
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <ActionButton href="/checkout" variant="primary" className="flex-1">
                        Finalizar compra
                      </ActionButton>
                      <ActionButton href="/accesorios" variant="secondary" className="flex-1">
                        Seguir comprando
                      </ActionButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12 md:mb-20">
          <PurchaseInclusions
            inclusionItems={inclusionItems}
            title="Qué incluye tu compra"
            copy={accessory.inclusionCopy}
            mobileCopy={
              accessory.inclusionItems
                ? `${accessory.inclusionItems.map((item) => item.title).join(', ')}.`
                : undefined
            }
            showKitIllustration={Boolean(accessory.inclusionIllustration)}
            kitIllustration={accessory.inclusionIllustration}
            videoPanel={
              accessory.videoPoster
                ? {
                    posterSrc: accessory.videoPoster,
                    posterAlt: `${accessory.title} en uso`,
                    videoSrc: accessory.videoSrc,
                  }
                : undefined
            }
          />
        </div>

        <div className="border-t border-[var(--alcohn-line)] pt-12">
          <ActionButton href="/accesorios" variant="ghost">
            ← Ver todos los accesorios
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
