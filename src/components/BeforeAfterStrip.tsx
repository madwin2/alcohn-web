export type BeforeAfterImage = {
  src: string;
  alt: string;
};

interface BeforeAfterStripProps {
  images: BeforeAfterImage[];
}

function panelClipClass(index: number, total: number) {
  if (total <= 1) return 'before-after-strip__panel--solo';
  if (index === 0) return 'before-after-strip__panel--first';
  if (index === total - 1) return 'before-after-strip__panel--last';
  return 'before-after-strip__panel--middle';
}

export default function BeforeAfterStrip({ images }: BeforeAfterStripProps) {
  return (
    <div className="before-after-strip" aria-label="Proceso del sello en cuero">
      <div className="before-after-strip__grid md:hidden">
        {images.map((image) => (
          <div key={image.src} data-scroll-card className="before-after-strip__grid-cell">
            <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
          </div>
        ))}
      </div>

      <div className="before-after-strip__row hidden md:flex">
        {images.map((image, index) => (
          <div
            key={image.src}
            data-scroll-card
            className={`before-after-strip__panel ${panelClipClass(index, images.length)}`}
          >
            <img src={image.src} alt={image.alt} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />
          </div>
        ))}
      </div>
    </div>
  );
}
