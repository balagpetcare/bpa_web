type BadgeVariant = 'green' | 'navy' | 'gray' | 'yellow' | 'red' | 'blue';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-(--bpa-green) text-(--bpa-green)',
  navy: 'bg-blue-50 text-(--bpa-green)',
  gray: 'bg-gray-100 text-gray-600',
  yellow: 'bg-yellow-50 text-yellow-700',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-blue-50 text-blue-700',
};

export default function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
