import SectionHeader from './SectionHeader';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionTitle({ title, subtitle, className = "" }: SectionTitleProps) {
  return (
    <SectionHeader 
      title={title} 
      subtitle={subtitle} 
      className={className}
    />
  );
}
