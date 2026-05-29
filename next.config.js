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
    ];
  },
};

module.exports = nextConfig;


