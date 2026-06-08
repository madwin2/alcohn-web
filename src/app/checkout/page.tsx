'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CartItemRow from '@/components/cart/CartItemRow';
import CartSummary from '@/components/cart/CartSummary';
import ActionButton from '@/components/ActionButton';
import PurchaseInclusions from '@/components/PurchaseInclusions';
import { config } from '@/lib/config';
import { consumeCheckoutPrefill, cartLooksLikeWizardPersonalizado } from '@/lib/checkoutPrefill';
import { peekWizardSupabaseSession, clearWizardSupabaseSession } from '@/lib/wizardSupabaseSession';
import { createCheckoutIntent, uploadComprobante } from '@/lib/supabase/mockupApiClient';
import { sanitizeCartItemsForDb } from '@/lib/supabase/cartItems';
import CheckoutShippingForm, {
  type CheckoutShippingFormHandle,
} from '@/components/checkout/CheckoutShippingForm';
import { fetchShippingCost } from '@/lib/shipping/client';
import {
  peekCheckoutShipping,
  saveCheckoutShipping,
} from '@/lib/shipping/storage';
import type { ShippingFormData, ShippingMetodoUi } from '@/lib/shipping/types';
import { SHIPPING_METODO_LABELS } from '@/lib/shipping/types';
import { trackMetaEvent } from '@/lib/analytics/metaPixel';
import { savePurchaseSnapshot } from '@/lib/analytics/purchaseSnapshot';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isHydrated, getSubtotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    whatsapp: '',
    email: '',
    provincia: '',
    ciudad: '',
    notas: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openpayLoading, setOpenpayLoading] = useState(false);
  const [openpayError, setOpenpayError] = useState<string | null>(null);
  const [checkoutSaving, setCheckoutSaving] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [openpayTestAmount, setOpenpayTestAmount] = useState<number | null>(null);
  const [openpaySimulateSuccess, setOpenpaySimulateSuccess] = useState(false);
  // Guardar datos del pedido antes de limpiar el carrito
  const [orderData, setOrderData] = useState<{
    items: typeof items;
    subtotal: number;
  } | null>(null);

  const [prefillFromWizard, setPrefillFromWizard] = useState(false);
  const appliedCheckoutPrefillRef = useRef(false);
  const shippingFormRef = useRef<CheckoutShippingFormHandle>(null);
  const [shippingSectionError, setShippingSectionError] = useState<string | null>(null);
  const [shippingMetodo, setShippingMetodo] = useState<ShippingMetodoUi>('retiro');
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingForm, setShippingForm] = useState<ShippingFormData | null>(null);
  const [shippingMetodoChosen, setShippingMetodoChosen] = useState(false);
  const initiateCheckoutTrackedRef = useRef(false);

  const subtotal = getSubtotal();
  const totalConEnvio = subtotal + shippingCost;
  const hasCartContent = items.length > 0 || orderData !== null;
  const currentItems = orderData?.items || items;
  const isPersonalizedOrder = cartLooksLikeWizardPersonalizado(currentItems);
  const orderSubtotal = orderData?.subtotal ?? subtotal;
  const orderTotalConEnvio = orderSubtotal + shippingCost;

  useEffect(() => {
    if (!isHydrated || initiateCheckoutTrackedRef.current) return;
    const checkoutItems = orderData?.items ?? items;
    if (checkoutItems.length === 0) return;

    initiateCheckoutTrackedRef.current = true;
    const checkoutSubtotal = orderData?.subtotal ?? subtotal;
    trackMetaEvent('InitiateCheckout', {
      value: checkoutSubtotal + shippingCost,
      currency: 'ARS',
      content_ids: checkoutItems.map((item) => item.id),
      num_items: checkoutItems.reduce((sum, item) => sum + item.qty, 0),
      content_type: 'product',
    });
  }, [isHydrated, items, orderData, subtotal, shippingCost]);

  useEffect(() => {
    fetch('/api/checkout/openpay')
      .then((r) => r.json())
      .then((data: { testAmountArs?: number | null; simulateSuccess?: boolean }) => {
        if (typeof data.testAmountArs === 'number' && data.testAmountArs > 0) {
          setOpenpayTestAmount(data.testAmountArs);
        }
        if (data.simulateSuccess) setOpenpaySimulateSuccess(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const stored = peekCheckoutShipping();
    if (stored) {
      setShippingMetodo(stored.metodo);
      setShippingCost(stored.costo);
      setShippingMetodoChosen(true);
    }
  }, []);

  useEffect(() => {
    if (shippingMetodo === 'retiro') {
      setShippingCost(0);
      return;
    }
    const tipo = shippingMetodo === 'domicilio' ? 'Domicilio' : 'Sucursal';
    let cancelled = false;
    fetchShippingCost(tipo).then((cost) => {
      if (!cancelled) {
        setShippingCost(cost);
        saveCheckoutShipping(shippingMetodo, cost);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [shippingMetodo]);

  useEffect(() => {
    if (appliedCheckoutPrefillRef.current) return;
    if (!hasCartContent) return;
    if (!cartLooksLikeWizardPersonalizado(items)) return;
    const p = consumeCheckoutPrefill();
    if (!p) return;
    appliedCheckoutPrefillRef.current = true;
    setFormData((prev) => ({
      ...prev,
      nombre: p.nombre || prev.nombre,
      whatsapp: p.whatsapp || prev.whatsapp,
      email: p.email || prev.email,
      provincia: p.provincia || prev.provincia,
      ciudad: p.ciudad || prev.ciudad,
      notas: p.notas || prev.notas,
    }));
    setPrefillFromWizard(true);
  }, [hasCartContent, items, orderData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'El WhatsApp es requerido';
    } else {
      const cleaned = formData.whatsapp.replace(/[\s\-\(\)]/g, '');
      if (cleaned.length < 10 || !/^[\+]?[0-9]+$/.test(cleaned)) {
        newErrors.whatsapp = 'Ingresá un número de WhatsApp válido';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = (form: ShippingFormData) => {
    setShippingForm({
      ...form,
      nombreCompleto: form.nombreCompleto || formData.nombre,
      telefono: form.telefono || formData.whatsapp,
      email: form.email || formData.email,
    });
    saveCheckoutShipping(shippingMetodo, shippingCost);
    setShippingSectionError(null);
    setStep(2);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!shippingMetodoChosen) {
      setShippingSectionError('Elegí cómo querés recibir tu pedido antes de continuar.');
      return;
    }

    if (!shippingFormRef.current?.trySubmit()) {
      setShippingSectionError(null);
      return;
    }
    setShippingSectionError(null);
  };

  const buildCheckoutIntentPayload = (metodo: 'Openpay' | 'Transferencia') => {
    const wizardSession = peekWizardSupabaseSession();
    const cartItems = sanitizeCartItemsForDb(orderData?.items ?? items);
    return {
      metodo_pago: metodo,
      cliente: {
        nombre: formData.nombre.trim(),
        telefono: formData.whatsapp.trim(),
        email: formData.email.trim() || undefined,
      },
      cliente_id: wizardSession?.cliente_id,
      mockup_solicitud_id: wizardSession?.mockup_solicitud_id,
      items: cartItems,
      provincia: formData.provincia,
      ciudad: formData.ciudad,
      notas: formData.notas,
      envio: shippingForm
        ? {
            metodo: shippingMetodo,
            form: shippingForm,
          }
        : undefined,
      envio_costo: shippingCost > 0 ? shippingCost : 0,
      envio_metodo: shippingMetodo,
    };
  };

  const openpayItems = () => {
    const base = (orderData?.items ?? items).map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      qty: item.qty,
    }));
    if (shippingCost > 0) {
      base.push({
        id: 'envio-correo',
        title: `Envío (${SHIPPING_METODO_LABELS[shippingMetodo]})`,
        price: shippingCost,
        qty: 1,
      });
    }
    return base;
  };

  const persistPurchaseForTracking = (
    ordenId: string,
    cartItems: typeof items
  ) => {
    savePurchaseSnapshot({
      orderId: ordenId,
      value: cartItems.reduce((sum, item) => sum + item.price * item.qty, 0) + shippingCost,
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        qty: item.qty,
      })),
    });
  };

  const handleOpenpayCheckout = async () => {
    setOpenpayError(null);
    setCheckoutError(null);
    setOpenpayLoading(true);
    try {
      const intent = await createCheckoutIntent(buildCheckoutIntentPayload('Openpay'));
      setOrderData({ items: [...items], subtotal });
      setOrderId(intent.orden_id);

      if (openpaySimulateSuccess) {
        persistPurchaseForTracking(intent.orden_id, [...items]);
        clearCart();
        clearWizardSupabaseSession();
        window.location.href = `/checkout/openpay/success?orden_id=${encodeURIComponent(intent.orden_id)}`;
        return;
      }

      const payloadItems = openpayItems();
      const res = await fetch('/api/checkout/openpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems, orden_id: intent.orden_id }),
      });
      const data = (await res.json().catch(() => ({}))) as { checkoutUrl?: string; error?: string };
      if (!res.ok) {
        setOpenpayError(data.error || 'No se pudo iniciar el pago con tarjeta');
        return;
      }
      if (data.checkoutUrl) {
        persistPurchaseForTracking(intent.orden_id, [...items]);
        clearCart();
        window.location.href = data.checkoutUrl;
        return;
      }
      setOpenpayError('Respuesta inválida del servidor');
    } catch (e) {
      setOpenpayError(e instanceof Error ? e.message : 'Error de red. Intentá de nuevo.');
    } finally {
      setOpenpayLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    setCheckoutError(null);
    setCheckoutSaving(true);
    try {
      const intent = await createCheckoutIntent(buildCheckoutIntentPayload('Transferencia'));
      setOrderId(intent.orden_id);
      setOrderData({
        items: [...items],
        subtotal,
      });
      clearCart();
      setStep(3);
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : 'No se pudo registrar el pedido');
    } finally {
      setCheckoutSaving(false);
    }
  };

  const buildWhatsAppMessage = () => {
    const currentItems = orderData?.items || items;
    const itemsText = currentItems
      .map((item) => `• ${item.title} (${item.variantSize}) x${item.qty} - $${(item.price * item.qty).toLocaleString('es-AR')}`)
      .join('\n');
    const currentSubtotal = orderData?.subtotal || subtotal;

    return `Hola Alcohn 👋, acabo de realizar mi pedido.\n\n` +
      `*Número de pedido:* ${orderId}\n\n` +
      `*Datos:*\n` +
      `Nombre: ${formData.nombre}\n` +
      `WhatsApp: ${formData.whatsapp}\n` +
      (formData.email ? `Email: ${formData.email}\n` : '') +
      (formData.provincia ? `Provincia: ${formData.provincia}\n` : '') +
      (formData.ciudad ? `Ciudad: ${formData.ciudad}\n` : '') +
      `\n*Pedido:*\n${itemsText}\n\n` +
      (shippingCost > 0
        ? `*Envío: $${shippingCost.toLocaleString('es-AR')}*\n`
        : '') +
      `*Total: $${(currentSubtotal + shippingCost).toLocaleString('es-AR')}*\n` +
      `*Seña a transferir: $${config.seña.amount.toLocaleString('es-AR')}*\n\n` +
      (formData.notas ? `*Notas:* ${formData.notas}\n\n` : '') +
      `Adjunto el comprobante de transferencia.`;
  };

  const handleSendWhatsApp = () => {
    const message = buildWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopySummary = async () => {
    const summary = buildWhatsAppMessage();
    try {
      await navigator.clipboard.writeText(summary);
      alert('Resumen copiado al portapapeles');
    } catch {
      alert('No se pudo copiar. Por favor, copiá manualmente.');
    }
  };

  const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orderId) return;

    try {
      await uploadComprobante(orderId, file);
      const currentItems = orderData?.items || items;
      persistPurchaseForTracking(orderId, currentItems);
      clearWizardSupabaseSession();
      router.push(
        `/checkout/transferencia/confirmacion?orden_id=${encodeURIComponent(orderId)}`
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'No se pudo subir el comprobante. Intentá de nuevo o envialo por WhatsApp.'
      );
    } finally {
      e.target.value = '';
    }
  };

  if (!hasCartContent) {
    return (
      <div className="atelier-page min-h-screen py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="max-w-2xl mx-auto text-center py-20">
            <h1 className="text-3xl font-semibold text-neutral-900 mb-4 tracking-tight">
              No hay productos en tu carrito
            </h1>
            <p className="text-neutral-600 mb-8">
              Podés diseñar un sello con tu logo o comprar un diseño estándar listo para personalizar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <ActionButton href="/buy?mode=custom" variant="primary" className="w-full sm:w-auto px-6">
                Subir logo y ver precio
              </ActionButton>
              <ActionButton href="/sellos/estandar" variant="secondary" className="w-full sm:w-auto px-6">
                Comprar estándar
              </ActionButton>
            </div>
            <Link
              href="/carrito"
              className="mt-6 inline-flex min-h-9 items-center text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
            >
              Volver al carrito
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="atelier-page min-h-screen py-6 md:py-16 pb-24 md:pb-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-4 md:mb-12">
          <p className="craft-label mb-2 md:hidden">Paso {step} de 3</p>
          <h1 className="text-[1.85rem] md:text-5xl font-semibold text-neutral-900 mb-1 md:mb-4 tracking-tight">
            {step === 3 ? 'Pedido generado' : step === 2 ? 'Confirmar y pagar' : 'Finalizar pedido'}
          </h1>
        </div>

        {/* Resumen mobile compacto (steps 1 y 2) */}
        {step !== 3 && (
          <details className="lg:hidden mb-4 border border-[var(--alcohn-line)] bg-white open:bg-white">
            <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col min-w-0">
                <span className="craft-label text-[10px]">{currentItems.length} {currentItems.length === 1 ? 'artículo' : 'artículos'}</span>
                <span className="text-base font-semibold text-neutral-900">
                  Total ${orderTotalConEnvio.toLocaleString('es-AR')}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Ver detalle
                <svg className="h-3 w-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="border-t border-[var(--alcohn-line)] px-4 py-4 space-y-3">
              {currentItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{item.title}</p>
                    <p className="text-xs text-neutral-500">{item.variantSize} · x{item.qty}</p>
                  </div>
                  <p className="font-semibold text-neutral-900 whitespace-nowrap">
                    ${(item.price * item.qty).toLocaleString('es-AR')}
                  </p>
                </div>
              ))}
              <div className="border-t border-neutral-200 pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-semibold text-neutral-900">${orderSubtotal.toLocaleString('es-AR')}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Envío ({SHIPPING_METODO_LABELS[shippingMetodo]})</span>
                    <span className="font-semibold text-neutral-900">${shippingCost.toLocaleString('es-AR')}</span>
                  </div>
                )}
              </div>
            </div>
          </details>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 lg:gap-16">
          {/* Formulario / Resumen */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-6 tracking-tight">
                    Datos de contacto
                  </h2>
                  {prefillFromWizard && (
                    <div className="mb-6 border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] px-4 py-3 text-sm text-neutral-700">
                      Completamos estos datos con lo que cargaste al diseñar tu sello. Revisalos y
                      corregí lo que necesites antes de continuar.
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nombre" className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        autoComplete="name"
                        value={formData.nombre}
                        onChange={(e) => {
                          setFormData({ ...formData, nombre: e.target.value });
                          if (errors.nombre) setErrors({ ...errors, nombre: '' });
                        }}
                        className={`w-full px-4 py-3 border text-base md:text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 ${
                          errors.nombre ? 'border-red-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.nombre && (
                        <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="whatsapp" className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                        WhatsApp *
                      </label>
                      <input
                        type="tel"
                        id="whatsapp"
                        autoComplete="tel"
                        inputMode="tel"
                        value={formData.whatsapp}
                        onChange={(e) => {
                          setFormData({ ...formData, whatsapp: e.target.value });
                          if (errors.whatsapp) setErrors({ ...errors, whatsapp: '' });
                        }}
                        className={`w-full px-4 py-3 border text-base md:text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 ${
                          errors.whatsapp ? 'border-red-500' : 'border-neutral-300'
                        }`}
                        placeholder="+54 9 223 123-4567"
                        required
                      />
                      {errors.whatsapp && (
                        <p className="mt-1 text-xs text-red-600">{errors.whatsapp}</p>
                      )}
                      <p className="mt-1 text-xs text-neutral-500">
                        Incluí el código de país
                      </p>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        autoComplete="email"
                        inputMode="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        className={`w-full px-4 py-3 border text-base md:text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 ${
                          errors.email ? 'border-red-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                      )}
                    </div>

                  </div>
                </div>

                <div className="pt-10 mt-10 border-t border-neutral-200 space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900 mb-2 tracking-tight">
                      Datos de envío
                    </h2>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm text-neutral-600">
                        {shippingMetodoChosen
                          ? `Elegiste: ${SHIPPING_METODO_LABELS[shippingMetodo]}`
                          : 'Elegí cómo querés recibir tu pedido.'}
                      </p>
                      {shippingMetodoChosen && (
                        <button
                          type="button"
                          onClick={() => {
                            setShippingMetodoChosen(false);
                            setShippingSectionError(null);
                          }}
                          className="text-xs font-medium uppercase tracking-wider text-neutral-600 underline hover:text-neutral-900 transition-colors"
                        >
                          Cambiar
                        </button>
                      )}
                    </div>
                    {!shippingMetodoChosen && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                        {(
                          [
                            ['domicilio', 'Domicilio'],
                            ['sucursal', 'Sucursal'],
                            ['retiro', SHIPPING_METODO_LABELS.retiro],
                          ] as const
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setShippingMetodo(id);
                              setShippingMetodoChosen(true);
                              setShippingSectionError(null);
                            }}
                            className={`technical-sheet p-4 text-left text-sm font-medium transition-colors hover:border-[var(--alcohn-bronze)] ${
                              shippingMetodo === id
                                ? 'border-[var(--alcohn-bronze)] bg-white'
                                : ''
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                    {shippingSectionError && (
                      <p className="mb-4 text-sm text-red-600" role="alert">
                        {shippingSectionError}
                      </p>
                    )}
                    {shippingMetodoChosen && (
                      <CheckoutShippingForm
                        ref={shippingFormRef}
                        embedded
                        showActions={false}
                        metodo={shippingMetodo}
                        nombreCompleto={formData.nombre}
                        telefono={formData.whatsapp}
                        email={formData.email}
                        onSubmit={handleShippingSubmit}
                      />
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-200">
                  <button
                    type="submit"
                    className="w-full border border-neutral-900 bg-neutral-900 text-white px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                  >
                    Continuar al pago
                  </button>
                </div>
              </form>
            ) : step === 2 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-6 tracking-tight">
                    Resumen del pedido
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    {currentItems.map((item) => (
                      <div key={item.id} className="material-card p-4">
                        <CartItemRow item={item} showImage={true} />
                      </div>
                    ))}
                  </div>

                  <div className="technical-sheet p-6 space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                        Datos de contacto
                      </p>
                      <div className="text-sm text-neutral-900 space-y-1">
                        <p><strong>Nombre:</strong> {formData.nombre}</p>
                        <p><strong>WhatsApp:</strong> {formData.whatsapp}</p>
                        {formData.email && <p><strong>Email:</strong> {formData.email}</p>}
                        {(formData.provincia || formData.ciudad) && (
                          <p><strong>Ubicación:</strong> {[formData.provincia, formData.ciudad].filter(Boolean).join(', ')}</p>
                        )}
                        {formData.notas && (
                          <p className="mt-2"><strong>Notas:</strong> {formData.notas}</p>
                        )}
                        <p className="mt-2">
                          <strong>Envío:</strong> {SHIPPING_METODO_LABELS[shippingMetodo]}
                          {shippingCost > 0 && ` — $${shippingCost.toLocaleString('es-AR')}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-200 space-y-3">
                  {openpaySimulateSuccess && (
                    <p className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-sm text-center">
                      Modo desarrollo: al pagar con tarjeta <strong>no</strong> se abre Openpay. Se
                      simula el pago exitoso y vas directo a la pantalla de confirmación (el pedido
                      en Supabase se registra igual).
                    </p>
                  )}
                  {openpayTestAmount != null && !openpaySimulateSuccess && (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-sm text-center">
                      Modo prueba Openpay: la tarjeta se cobrará{' '}
                      <strong>${openpayTestAmount.toLocaleString('es-AR')}</strong> (el pedido en
                      Supabase sigue con el precio real del carrito).
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenpayCheckout}
                    disabled={openpayLoading || checkoutSaving}
                    className={`w-full border px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${
                      openpaySimulateSuccess
                        ? 'border-emerald-800 bg-emerald-800 text-white hover:bg-emerald-700 focus:ring-emerald-800'
                        : 'border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50 focus:ring-neutral-900'
                    }`}
                  >
                    {openpayLoading
                      ? openpaySimulateSuccess
                        ? 'Simulando pago…'
                        : 'Conectando con Openpay…'
                      : openpaySimulateSuccess
                        ? 'Simular pago exitoso (solo desarrollo)'
                        : openpayTestAmount != null
                          ? `Pagar $${openpayTestAmount.toLocaleString('es-AR')} con tarjeta (prueba Openpay)`
                          : `Pagar $${totalConEnvio.toLocaleString('es-AR')} con tarjeta (Openpay)`}
                  </button>
                  <p className="text-xs text-neutral-500 text-center">
                    {openpaySimulateSuccess
                      ? 'No se cobra en la pasarela. Sirve para probar checkout, envío y confirmación.'
                      : 'Te llevamos al checkout seguro de BBVA Openpay. La intención de pago vence en unos minutos.'}
                  </p>
                  {openpayError && (
                    <p className="text-xs text-red-600 text-center" role="alert">
                      {openpayError}
                    </p>
                  )}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center" aria-hidden>
                      <span className="w-full border-t border-neutral-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider text-neutral-400">
                      <span className="bg-white px-3">o</span>
                    </div>
                  </div>
                  {checkoutError && (
                    <p className="text-xs text-red-600 text-center" role="alert">
                      {checkoutError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleCreateOrder}
                    disabled={checkoutSaving || openpayLoading}
                    className="w-full border border-neutral-900 bg-neutral-900 text-white px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {checkoutSaving ? 'Registrando pedido…' : 'Realizar compra (seña por transferencia)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
                  >
                    ← Volver a datos del pedido
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border border-[var(--alcohn-bronze)] bg-[var(--alcohn-paper)] p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">
                      Pedido generado
                    </h2>
                  </div>
                  <p className="text-sm text-neutral-700 mb-2">
                    Tu número de pedido es:
                  </p>
                  <p className="text-lg font-semibold text-neutral-900 font-mono mb-4">
                    {orderId}
                  </p>
                  <p className="text-xs text-neutral-600">
                    Guardá este número para referencia
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 tracking-tight">
                    Datos de la cuenta a transferir
                  </h3>
                  <div className="technical-sheet p-6 space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Banco:</span>
                        <span className="text-neutral-900 font-medium">{config.bank.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Tipo de cuenta:</span>
                        <span className="text-neutral-900 font-medium">{config.bank.accountType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Número de cuenta:</span>
                        <span className="text-neutral-900 font-medium font-mono">{config.bank.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">CBU:</span>
                        <span className="text-neutral-900 font-medium font-mono">{config.bank.cbu}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Alias:</span>
                        <span className="text-neutral-900 font-medium">{config.bank.alias}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">CUIT:</span>
                        <span className="text-neutral-900 font-medium font-mono">{config.bank.cuit}</span>
                      </div>
                      <div className="pt-4 border-t border-neutral-200">
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-600">Monto a transferir (seña):</span>
                          <span className="text-lg font-semibold text-neutral-900">
                            ${config.seña.amount.toLocaleString('es-AR')}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          El resto se paga cuando el sello está listo
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 tracking-tight">
                    Proceso de pago
                  </h3>
                  <div className="material-card p-6 space-y-4">
                    <div className="space-y-3 text-sm text-neutral-700">
                      <p className="font-medium text-neutral-900">
                        Transferí la seña de <strong>${config.seña.amount.toLocaleString('es-AR')}</strong> a la cuenta indicada arriba.
                      </p>
                      <p>
                        Una vez realizada la transferencia, tenés dos opciones:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li>
                          <strong>Subir el comprobante</strong> con el número de pedido <span className="font-mono font-semibold">{orderId}</span> usando el formulario de abajo.
                        </li>
                        <li>
                          <strong>Enviarlo por WhatsApp</strong> junto con el número de pedido <span className="font-mono font-semibold">{orderId}</span>.
                        </li>
                      </ol>
                      <div className="border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-4 mt-4">
                        <p className="text-xs text-neutral-700">
                          <strong>¿Qué pasa después?</strong> Una vez que recibamos el comprobante, comenzaremos a fabricar tu sello y te contactaremos por WhatsApp con la foto del sello terminado.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 tracking-tight">
                    Subir comprobante de transferencia
                  </h3>
                  <div className="material-card p-6 space-y-4">
                    <div>
                      <label htmlFor="receipt" className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                        Comprobante de transferencia
                      </label>
                      <input
                        type="file"
                        id="receipt"
                        accept="image/*,.pdf"
                        onChange={handleUploadReceipt}
                        className="w-full px-4 py-3 border border-neutral-300 text-base md:text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1"
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        Subí una foto o PDF del comprobante de transferencia
                      </p>
                    </div>
                    <div className="border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] p-4">
                      <p className="text-xs text-neutral-700">
                        <strong>Número de pedido:</strong> <span className="font-mono">{orderId}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 tracking-tight">
                    O enviar por WhatsApp
                  </h3>
                  <div className="material-card p-6">
                    <button
                      onClick={handleSendWhatsApp}
                      className="w-full bg-green-600 text-white px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Enviar comprobante por WhatsApp
                    </button>
                    <p className="mt-3 text-xs text-neutral-600 text-center">
                      Se abrirá WhatsApp con un mensaje pre-armado incluyendo tu número de pedido
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-200">
                  <Link
                    href="/"
                    className="block w-full text-center text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
                  >
                    Volver al inicio
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar resumen */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <div className="technical-sheet p-6 space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
                  Resumen
                </h2>
                
                <CartSummary
                  subtotal={orderSubtotal}
                  shippingCost={shippingCost}
                  shippingLabel={SHIPPING_METODO_LABELS[shippingMetodo]}
                />

                <PurchaseInclusions
                  variant={isPersonalizedOrder ? 'personalizado' : 'estandar'}
                  compact
                  title={isPersonalizedOrder ? 'Incluido con tu sello' : 'Incluido en la compra'}
                />

                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500 mb-2">
                    <strong>Información de pago:</strong>
                  </p>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    <li>• Pago total con tarjeta (Openpay)</li>
                    <li>• Pago total con transferencia</li>
                    <li>• Factura C disponible</li>
                  </ul>
                </div>

                <Link
                  href="/carrito"
                  className="flex min-h-9 items-center justify-center text-center text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
                >
                  ← Volver al carrito
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
