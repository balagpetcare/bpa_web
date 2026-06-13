interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionHeader({ eyebrow, title, subtitle, centered = false, light = false }: SectionHeaderProps) {
  return (
    <div className={centered ? 'text-center' : ''}>
      {eyebrow && (
        <p className={`text-sm font-semibold uppercase tracking-widest mb-2 ${light ? 'text-green-300' : 'text-(--bpa-green)'}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-3xl font-bold sm:text-4xl ${light ? 'text-white' : 'text-(--bpa-green)'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-lg leading-relaxed max-w-2xl ${centered ? 'mx-auto' : ''} ${light ? 'text-gray-300' : 'text-gray-500'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
