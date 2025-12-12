import SectionTitle from '@/components/SectionTitle';
import Link from 'next/link';

export const metadata = {
  title: 'Checkout - Alcohn',
  description: 'Finalizá tu compra de sello de bronce personalizado.',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <SectionTitle
            title="Finalizar compra"
            subtitle="Completá tus datos para procesar el pedido"
          />

          <div className="bg-secondary rounded-lg p-8 space-y-6">
            <p className="text-center text-gray-600">
              {/* TODO: Implementar formulario de checkout completo */}
              Esta página está en desarrollo. Por ahora, podés completar tu pedido hablando con
              nosotros por WhatsApp.
            </p>
            
            <div className="text-center">
              <Link
                href="/contacto"
                className="inline-block bg-accent text-primary px-8 py-4 rounded-md font-semibold hover:bg-accent-light transition-colors"
              >
                Ir a contacto
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Información de pago</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Seña de $10.000 para empezar la fabricación</li>
              <li>• Resto cuando el sello está listo</li>
              <li>• Transferencia bancaria</li>
              <li>• Factura C disponible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

