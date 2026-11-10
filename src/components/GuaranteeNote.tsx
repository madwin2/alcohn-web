'use client';

import Link from 'next/link';
import { useMarket } from '@/contexts/MarketContext';
import { localizeText } from '@/lib/markets/localizeText';
import { marketPath } from '@/lib/markets/paths';

type GuaranteeNoteProps = {
  className?: string;
  /** Texto claro sobre fondo oscuro. */
  inverted?: boolean;
};

/** Garantía Alcohn de por vida (definida el 07/11/2026). Igual en Argentina y afuera. */
export default function GuaranteeNote({ className = '', inverted = false }: GuaranteeNoteProps) {
  const { market } = useMarket();
  const tone = inverted ? 'text-white/85' : 'text-neutral-700';
  const linkTone = inverted ? 'text-white' : 'text-neutral-950';

  return (
    <p className={`text-xs leading-snug md:text-sm ${tone} ${className}`.trim()}>
      <span className="font-semibold">Garantía de por vida:</span>{' '}
      {localizeText('si tu sello tiene un problema, lo rehacemos y te lo enviamos sin costo.', market)}{' '}
      <Link
        href={marketPath(market, '/politica-devoluciones')}
        className={`underline underline-offset-2 ${linkTone}`}
      >
        Ver garantía
      </Link>
    </p>
  );
}
