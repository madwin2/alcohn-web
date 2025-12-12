import SectionTitle from '@/components/SectionTitle';
import ProductsGrid from '@/components/ProductsGrid';
import { products } from '@/data/products';

export const metadata = {
  title: 'Productos - Alcohn',
  description: 'Sellos de bronce estándar, sellos para alimentos y abecedarios. Personalizados con tu logo.',
};

export default function ProductosPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="Nuestros productos"
          subtitle="Sellos de bronce personalizados para diferentes materiales y usos"
        />

        <ProductsGrid products={products} />
      </div>
    </div>
  );
}



