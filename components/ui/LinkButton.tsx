import Link from 'next/link';
import { buildButtonClassName, type ButtonSize, type ButtonVariant } from '@/lib/ui/button-variants';

interface LinkButtonProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}

export default function LinkButton({
  href, variant = 'primary', size = 'md', className = '', children, external,
}: LinkButtonProps) {
  // Same base/variant/size classes as components/ui/Button.tsx — including
  // the focus-visible ring, which this component previously had none of at
  // all (a real keyboard-focus gap on every link-styled CTA).
  const classes = buildButtonClassName({ variant, size, className });

  if (external) {
    return <a href={href} className={classes} target="_blank" rel="noopener noreferrer">{children}</a>;
  }
  return <Link href={href} className={classes}>{children}</Link>;
}
