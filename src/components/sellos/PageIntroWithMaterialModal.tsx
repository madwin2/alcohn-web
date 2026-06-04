'use client';

import { useState } from 'react';
import PageIntro from '@/components/PageIntro';
import MaterialSelectionModal from '@/components/sellos/MaterialSelectionModal';

interface PageIntroWithMaterialModalProps {
  label: string;
  title: string;
  description: string;
  mobileDescription?: string;
  primaryCta?: { label: string; href: string; variant?: 'primary' | 'secondary' | 'ghost' };
  highlights?: string[];
  hideHighlightsOnMobile?: boolean;
  priceFrom?: number;
  className?: string;
  materialCtaLabel?: string;
}

export default function PageIntroWithMaterialModal({
  materialCtaLabel = 'Ver Sellos por Material',
  ...pageIntroProps
}: PageIntroWithMaterialModalProps) {
  const [materialModalOpen, setMaterialModalOpen] = useState(false);

  return (
    <>
      <PageIntro
        {...pageIntroProps}
        secondaryCta={{
          label: materialCtaLabel,
          onClick: () => setMaterialModalOpen(true),
          variant: 'secondary',
        }}
      />
      <MaterialSelectionModal open={materialModalOpen} onClose={() => setMaterialModalOpen(false)} />
    </>
  );
}
