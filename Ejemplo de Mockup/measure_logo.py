#!/usr/bin/env python3
"""
Mide el bounding box del logo (solo tinta), ignorando fondo blanco o transparente.
Salida: una línea JSON en stdout para consumo desde Node.
Requiere: pip install Pillow numpy
"""
import json
import sys

try:
    from PIL import Image
    import numpy as np
except ImportError:
    print(json.dumps({"ok": False, "error": "pip install Pillow numpy"}))
    sys.exit(1)


def measure(path: str) -> dict:
    im = Image.open(path).convert("RGBA")
    a = np.array(im)
    rgb = a[:, :, :3].astype(np.float32)
    alpha = a[:, :, 3].astype(np.float32)

    # Fondo por transparencia
    if np.mean(alpha) < 252 or np.min(alpha) < 250:
        mask = alpha > 38
    else:
        # Fondo claro: mediana de esquinas
        h, w = rgb.shape[:2]
        corners = np.array(
            [
                rgb[0, 0],
                rgb[0, w - 1],
                rgb[h - 1, 0],
                rgb[h - 1, w - 1],
            ]
        )
        bg = np.median(corners, axis=0)
        diff = np.abs(rgb - bg).sum(axis=2)
        # Letra oscura o color: distinto del borde
        mask = diff > 52

    if not np.any(mask):
        return {"ok": False, "error": "sin contenido detectado"}

    ys, xs = np.where(mask)
    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    bw = x1 - x0 + 1
    bh = y1 - y0 + 1
    if bw < 2 or bh < 2:
        return {"ok": False, "error": "bbox demasiado pequeño"}

    ar = float(bw) / float(bh)
    return {
        "ok": True,
        "aspectRatio": ar,
        "bbox": [x0, y0, bw, bh],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "uso: measure_logo.py <imagen>"}))
        sys.exit(1)
    try:
        print(json.dumps(measure(sys.argv[1])))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
        sys.exit(1)
