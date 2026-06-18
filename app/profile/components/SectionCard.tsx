interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function SectionCard({ title, subtitle, icon, action, children, className = '' }: SectionCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="w-8 h-8 rounded-lg bg-(--bpa-green-light) text-(--bpa-green) flex items-center justify-center shrink-0">
              {icon}
            </span>
          )}
          <div>
            <h3 className="font-bold text-(--bpa-navy) text-sm leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
