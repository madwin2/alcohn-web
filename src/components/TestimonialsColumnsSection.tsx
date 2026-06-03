'use client';

import { TestimonialsColumn } from '@/components/ui/testimonials-columns-1';
import { testimonials, toColumnItems, splitTestimonialsIntoColumns } from '@/data/testimonials';

const allColumnItems = toColumnItems(testimonials);
const [firstColumn, secondColumn, thirdColumn] = splitTestimonialsIntoColumns(allColumnItems);

export default function TestimonialsColumnsSection() {
  return (
    <div className="relative">
      <div className="mx-auto flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
        <TestimonialsColumn
          testimonials={allColumnItems}
          className="md:hidden"
          duration={22}
        />
        <TestimonialsColumn testimonials={firstColumn} className="hidden md:block" duration={15} />
        <TestimonialsColumn
          testimonials={secondColumn}
          className="hidden md:block"
          duration={19}
        />
        <TestimonialsColumn
          testimonials={thirdColumn}
          className="hidden lg:block"
          duration={17}
        />
      </div>
    </div>
  );
}
