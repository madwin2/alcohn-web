import { brands } from '@/data/brands';

export default function LogoCloud() {
  return (
    <div className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Marcas que confían</h2>
          <p className="text-gray-600">
            Empresas reconocidas que confian en nuestro trabajo para su produccion.
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-0 m-0 w-32 h-16 md:w-40 md:h-20"
            >
              {brand.logo ? (
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="w-full h-full object-contain opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 p-0 m-0" 
                  style={{ display: 'block' }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Logo</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

