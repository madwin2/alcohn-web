/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/sellos/personalizados',
        destination: '/productos',
        permanent: true,
      },
      {
        source: '/productos/sello-personalizado-cuero',
        destination: '/sellos/para-cuero',
        permanent: true,
      },
      {
        source: '/productos/sello-personalizado-madera',
        destination: '/sellos/para-madera',
        permanent: true,
      },
      {
        source: '/productos/sello-para-alimentos',
        destination: '/sellos/para-pan',
        permanent: true,
      },
      {
        source: '/productos/sello-personalizado-ceramica',
        destination: '/sellos/para-ceramica',
        permanent: true,
      },
      {
        source: '/productos/sello-personalizado-lacre',
        destination: '/sellos/para-lacre',
        permanent: true,
      },
      {
        source: '/productos/sello-personalizado-universal',
        destination: '/productos',
        permanent: true,
      },
      {
        source: '/productos/abecedario-bronce-completo',
        destination: '/abecedarios',
        permanent: true,
      },
      {
        source: '/productos/abecedario-bronce-numeros',
        destination: '/abecedarios',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;


