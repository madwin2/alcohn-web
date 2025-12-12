import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Página no encontrada</p>
        <Link
          href="/"
          className="inline-block bg-accent text-primary px-8 py-4 rounded-md font-semibold hover:bg-accent-light transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

