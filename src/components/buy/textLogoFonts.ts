import { Dancing_Script, Oswald, Playfair_Display } from 'next/font/google';
import type { TextLogoStyleId } from '@/lib/textLogo';

/**
 * Fuentes del logo de texto. Autohospedadas por next/font y sin `preload`: el archivo
 * solo se baja cuando alguien abre "No tengo logo" (la vista previa las usa y el canvas
 * espera a `document.fonts.load` antes de dibujar).
 */
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
  preload: false,
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
  preload: false,
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['600'],
  display: 'swap',
  preload: false,
});

/** Familia CSS de cada estilo. "Moderna" usa Inter, que ya carga el layout (`--font-body`). */
export function textLogoFontFamily(id: TextLogoStyleId): string {
  switch (id) {
    case 'clasica':
      return playfair.style.fontFamily;
    case 'script':
      return dancingScript.style.fontFamily;
    case 'condensada':
      return oswald.style.fontFamily;
    case 'moderna':
    default: {
      if (typeof document !== 'undefined') {
        const fromVar = getComputedStyle(document.body).getPropertyValue('--font-body').trim();
        if (fromVar) return fromVar;
      }
      return 'Inter';
    }
  }
}
