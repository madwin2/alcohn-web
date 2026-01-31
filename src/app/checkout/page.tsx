'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CartItemRow from '@/components/cart/CartItemRow';
import CartSummary from '@/components/cart/CartSummary';
import { config } from '@/lib/config';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCart();
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
  // Guardar datos del pedido antes de limpiar el carrito
  const [orderData, setOrderData] = useState<{
    items: typeof items;
    subtotal: number;
  } | null>(null);

  const subtotal = getSubtotal();
  const hasItems = items.length > 0 || orderData !== null;

  // Redirigir si no hay items y no hay datos de orden guardados
  if (!hasItems && !orderData) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="max-w-2xl mx-auto text-center py-24">
            <h1 className="text-3xl font-semibold text-neutral-900 mb-4 tracking-tight">
              No hay productos en tu carrito
            </h1>
            <Link
              href="/carrito"
              className="inline-block border border-neutral-900 bg-neutral-900 text-white px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              Volver al carrito
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleCreateOrder = async () => {
    // TODO: Crear orden en base de datos cuando esté disponible
    // Por ahora generamos un ID temporal
    const tempOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setOrderId(tempOrderId);

    // Guardar datos del pedido antes de limpiar el carrito
    setOrderData({
      items: [...items], // Copia de los items
      subtotal: subtotal,
    });

    // TODO: Guardar en BD
    // const order = {
    //   id: tempOrderId,
    //   items: items,
    //   customer: formData,
    //   subtotal: subtotal,
    //   seña: config.seña.amount,
    //   status: 'pendiente_pago',
    //   createdAt: new Date().toISOString(),
    // };
    // await fetch('/api/orders', { method: 'POST', body: JSON.stringify(order) });

    // Limpiar carrito después de guardar los datos
    clearCart();
    
    setStep(3);
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
      `*Subtotal: $${currentSubtotal.toLocaleString('es-AR')}*\n` +
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

    // TODO: Subir comprobante a BD cuando esté disponible
    // const uploadData = new FormData();
    // uploadData.append('receipt', file);
    // uploadData.append('orderId', orderId);
    // uploadData.append('phone', formData.whatsapp);
    // const response = await fetch('/api/orders/upload-receipt', {
    //   method: 'POST',
    //   body: uploadData,
    // });
    // if (response.ok) {
    //   // Actualizar estado de la orden a "señada"
    //   await fetch(`/api/orders/${orderId}/status`, {
    //     method: 'PATCH',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ status: 'señada' }),
    //   });
    // }

    console.log('Comprobante subido:', { orderId, file, phone: formData.whatsapp });
    alert(`Comprobante recibido para el pedido ${orderId}. Te contactaremos por WhatsApp para confirmar el pago y comenzaremos a fabricar tu sello.`);
  };

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-4 tracking-tight">
            Finalizar pedido
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Formulario / Resumen */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-6 tracking-tight">
                    Datos de contacto
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nombre" className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => {
                          setFormData({ ...formData, nombre: e.target.value });
                          if (errors.nombre) setErrors({ ...errors, nombre: '' });
                        }}
                        className={`w-full px-4 py-3 border text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 ${
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
                        value={formData.whatsapp}
                        onChange={(e) => {
                          setFormData({ ...formData, whatsapp: e.target.value });
                          if (errors.whatsapp) setErrors({ ...errors, whatsapp: '' });
                        }}
                        className={`w-full px-4 py-3 border text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 ${
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
                        Email (opcional)
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        className={`w-full px-4 py-3 border text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 ${
                          errors.email ? 'border-red-500' : 'border-neutral-300'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="provincia" className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                          Provincia (opcional)
                        </label>
                        <input
                          type="text"
                          id="provincia"
                          value={formData.provincia}
                          onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                          className="w-full px-4 py-3 border border-neutral-300 text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1"
                        />
                      </div>

                      <div>
                        <label htmlFor="ciudad" className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                          Ciudad (opcional)
                        </label>
                        <input
                          type="text"
                          id="ciudad"
                          value={formData.ciudad}
                          onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                          className="w-full px-4 py-3 border border-neutral-300 text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="notas" className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                        Notas adicionales (opcional)
                      </label>
                      <textarea
                        id="notas"
                        value={formData.notas}
                        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-neutral-300 text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1"
                        placeholder="Alguna indicación especial, fecha de entrega deseada, etc."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-200">
                  <button
                    type="submit"
                    className="w-full border border-neutral-900 bg-neutral-900 text-white px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                  >
                    Continuar
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
                    {(orderData?.items || items).map((item) => (
                      <div key={item.id} className="border border-neutral-200 bg-white p-4">
                        <CartItemRow item={item} showImage={true} />
                      </div>
                    ))}
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 p-6 space-y-3">
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
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-200 space-y-3">
                  <button
                    onClick={handleCreateOrder}
                    className="w-full border border-neutral-900 bg-neutral-900 text-white px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                  >
                    Realizar compra
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
                  >
                    ← Volver a editar datos
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
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
                  <div className="bg-neutral-50 border border-neutral-200 p-6 space-y-3">
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
                  <div className="bg-white border border-neutral-200 p-6 space-y-4">
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
                      <div className="bg-blue-50 border border-blue-200 p-4 mt-4 rounded">
                        <p className="text-xs text-blue-900">
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
                  <div className="border border-neutral-200 bg-white p-6 space-y-4">
                    <div>
                      <label htmlFor="receipt" className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                        Comprobante de transferencia
                      </label>
                      <input
                        type="file"
                        id="receipt"
                        accept="image/*,.pdf"
                        onChange={handleUploadReceipt}
                        className="w-full px-4 py-3 border border-neutral-300 text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1"
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        Subí una foto o PDF del comprobante de transferencia
                      </p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 p-4">
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
                  <div className="border border-neutral-200 bg-white p-6">
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
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <div className="border border-neutral-200 bg-white p-6 space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
                  Resumen
                </h2>
                
                <CartSummary subtotal={orderData?.subtotal || subtotal} />

                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500 mb-2">
                    <strong>Información de pago:</strong>
                  </p>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    <li>• Seña de $10.000 para empezar</li>
                    <li>• Resto cuando está listo</li>
                    <li>• Transferencia bancaria</li>
                    <li>• Factura C disponible</li>
                  </ul>
                </div>

                <Link
                  href="/carrito"
                  className="block text-center text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
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
