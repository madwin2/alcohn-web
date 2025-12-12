import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Alcohn: blanco, negro, dorado, plateado, bronce
        // Refleja exclusividad, distinción y calidad
        primary: {
          DEFAULT: '#000000', // Negro
          light: '#1a1a1a',
        },
        secondary: {
          DEFAULT: '#f5f5f5', // Blanco/gris claro
          dark: '#e0e0e0',
        },
        accent: {
          DEFAULT: '#D4AF37', // Dorado
          light: '#F4D03F', // Dorado claro
          dark: '#B8860B', // Dorado oscuro
        },
        bronze: {
          DEFAULT: '#CD7F32', // Bronce
          light: '#E6A85C',
          dark: '#8B4513',
        },
        silver: {
          DEFAULT: '#C0C0C0', // Plateado
          light: '#E8E8E8',
          dark: '#A8A8A8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        abacaxi: ['Abacaxi Devanagari', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

