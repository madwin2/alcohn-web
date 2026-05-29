/** Recorte del dibujo del logo en el navegador (sin márgenes blancos del archivo). */

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

export type TrimmedLogoPreview = {
  dataUrl: string;
  widthPx: number;
  heightPx: number;
};

/**
 * Detecta el bbox del contenido y devuelve un PNG recortado (solo el dibujo).
 */
export function trimLogoImageForPreview(src: string): Promise<TrimmedLogoPreview | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const nw = img.naturalWidth || 1;
      const nh = img.naturalHeight || 1;

      const maxSide = 1200;
      const scale = Math.min(1, maxSide / Math.max(nw, nh));
      const cw = Math.max(1, Math.round(nw * scale));
      const ch = Math.max(1, Math.round(nh * scale));

      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0, cw, ch);

      let imageData: ImageData;
      try {
        imageData = ctx.getImageData(0, 0, cw, ch);
      } catch {
        resolve(null);
        return;
      }
      const data = imageData.data;

      const borderRs: number[] = [];
      const borderGs: number[] = [];
      const borderBs: number[] = [];
      const borderAs: number[] = [];
      const pushBorder = (x: number, y: number) => {
        const i = (y * cw + x) * 4;
        borderRs.push(data[i]);
        borderGs.push(data[i + 1]);
        borderBs.push(data[i + 2]);
        borderAs.push(data[i + 3]);
      };
      for (let x = 0; x < cw; x++) {
        pushBorder(x, 0);
        pushBorder(x, ch - 1);
      }
      for (let y = 0; y < ch; y++) {
        pushBorder(0, y);
        pushBorder(cw - 1, y);
      }

      const bgR = median(borderRs);
      const bgG = median(borderGs);
      const bgB = median(borderBs);
      const meanBorderAlpha = borderAs.reduce((a, b) => a + b, 0) / borderAs.length;
      const useAlphaMask = meanBorderAlpha < 252;

      const colorDist = (i: number) => {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        return Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
      };

      let minX = cw;
      let minY = ch;
      let maxX = -1;
      let maxY = -1;
      let count = 0;

      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const i = (y * cw + x) * 4;
          const a = data[i + 3];
          let isFg = false;
          if (useAlphaMask) {
            isFg = a > 32;
          } else {
            const d = colorDist(i);
            const dr = Math.abs(data[i] - bgR);
            const dg = Math.abs(data[i + 1] - bgG);
            const db = Math.abs(data[i + 2] - bgB);
            const maxRgbDiff = Math.max(dr, dg, db);
            isFg = d > 48 || maxRgbDiff > 28;
          }
          if (isFg) {
            count++;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      const boxW = maxX - minX + 1;
      const boxH = maxY - minY + 1;
      const areaFrac = (boxW * boxH) / (cw * ch);

      if (count < 8 || maxX < minX || boxW < 2 || boxH < 2 || areaFrac < 0.0008) {
        resolve(null);
        return;
      }
      if (areaFrac > 0.985 && !useAlphaMask) {
        resolve(null);
        return;
      }

      const out = document.createElement('canvas');
      out.width = boxW;
      out.height = boxH;
      const outCtx = out.getContext('2d');
      if (!outCtx) {
        resolve(null);
        return;
      }
      outCtx.drawImage(canvas, minX, minY, boxW, boxH, 0, 0, boxW, boxH);

      resolve({
        dataUrl: out.toDataURL('image/png'),
        widthPx: boxW,
        heightPx: boxH,
      });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
