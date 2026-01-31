import { brands } from '@/data/brands';
import SectionHeader from './SectionHeader';
import Divider from './Divider';

export default function LogoCloud() {
  return (
    <section className="snap-start snap-always h-[calc(100vh-4rem)] flex items-center justify-center bg-white" data-snap-section>
      <div className="container mx-auto px-4 md:px-8 max-w-7xl w-full">
        <SectionHeader
          title="Marcas que confían"
          subtitle="Empresas reconocidas que confían en nuestro trabajo"
        />
        
        <Divider className="mb-12" />
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="flex items-center justify-center w-32 h-16 md:w-40 md:h-20 opacity-50 hover:opacity-100 transition-opacity duration-200"
            >
              {brand.logo ? (
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-200" 
                />
              ) : (
                <div className="w-full h-full border border-neutral-200 flex items-center justify-center">
                  <span className="text-neutral-400 text-xs uppercase tracking-wider">Logo</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
