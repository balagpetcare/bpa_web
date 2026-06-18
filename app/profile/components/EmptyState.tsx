interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
      {icon && (
        <div className="w-14 h-14 rounded-full bg-(--bpa-green-light) flex items-center justify-center text-(--bpa-green) mb-4">
          {icon}
        </div>
      )}
      <p className="font-semibold text-gray-700 text-sm">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
