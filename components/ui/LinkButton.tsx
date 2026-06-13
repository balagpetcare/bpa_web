import Link from 'next/link';

type Variant = 'primary' | 'outline' | 'ghost' | 'white';
type Size = 'sm' | 'md' | 'lg';

interface LinkButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-(--bpa-green) text-white hover:bg-(--bpa-green-dark)',
  outline: 'border-2 border-(--bpa-green) text-(--bpa-green) hover:bg-(--bpa-green)',
  ghost: 'text-(--bpa-green) hover:bg-(--bpa-green)',
  white: 'bg-white text-(--bpa-green) hover:bg-gray-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export default function LinkButton({
  href, variant = 'primary', size = 'md', className = '', children, external,
}: LinkButtonProps) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  if (external) {
    return <a href={href} className={classes} target="_blank" rel="noopener noreferrer">{children}</a>;
  }
  return <Link href={href} className={classes}>{children}</Link>;
}
