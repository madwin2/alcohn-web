'use client';

import PageIntroWithMaterialModal from '@/components/sellos/PageIntroWithMaterialModal';

interface StampUseCasePageIntroProps {
  label: string;
  title: string;
  description: string;
  mobileDescription?: string;
  primaryCta: { label: string; href: string };
  highlights: string[];
  priceFrom: number;
}

export default function StampUseCasePageIntro(props: StampUseCasePageIntroProps) {
  return (
    <PageIntroWithMaterialModal
      {...props}
      hideHighlightsOnMobile
      materialCtaLabel="Ver todos los materiales"
    />
  );
}
