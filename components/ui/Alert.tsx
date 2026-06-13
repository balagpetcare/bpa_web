import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

type AlertVariant = 'success' | 'error' | 'info' | 'warning';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  className?: string;
}

const config: Record<AlertVariant, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
  success: {
    icon: <CheckCircle size={18} />,
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
  },
  error: {
    icon: <XCircle size={18} />,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
  },
  info: {
    icon: <Info size={18} />,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
  },
};

export default function Alert({ variant, title, message, className = '' }: AlertProps) {
  const { icon, bg, border, text } = config[variant];
  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${bg} ${border} ${text} ${className}`} role="alert">
      <span className="shrink-0 mt-0.5">{icon}</span>
      <div>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
