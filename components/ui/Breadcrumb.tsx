import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <li>
          <Link href="/" className="hover:text-(--bpa-green) transition-colors">Home</Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-gray-300" />
            {item.href ? (
              <Link href={item.href} className="hover:text-(--bpa-green) transition-colors">{item.label}</Link>
            ) : (
              <span className="text-(--bpa-navy) font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
