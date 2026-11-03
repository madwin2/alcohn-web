import { GOOGLE_REVIEWS, formatGoogleRating } from '@/data/googleReviews';

type GoogleReviewsBadgeProps = {
  /** `dark`: sobre fondo oscuro (hero). */
  tone?: 'light' | 'dark';
  className?: string;
};

/** Calificación real de la ficha de Google, con link a las reseñas. */
export default function GoogleReviewsBadge({ tone = 'light', className = '' }: GoogleReviewsBadgeProps) {
  const toneClasses =
    tone === 'dark'
      ? 'text-white/90 hover:text-white'
      : 'text-neutral-700 hover:text-neutral-950';

  return (
    <a
      href={GOOGLE_REVIEWS.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-[32px] items-center gap-1.5 text-[13px] leading-none underline-offset-2 hover:underline md:text-sm ${toneClasses} ${className}`.trim()}
    >
      <span className="font-semibold">{formatGoogleRating()}</span>
      <span aria-hidden className="tracking-[0.08em] text-[#e2a33b]">
        ★★★★★
      </span>
      <span>· {GOOGLE_REVIEWS.countLabel} reseñas en Google</span>
    </a>
  );
}
