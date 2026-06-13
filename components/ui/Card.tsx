interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-2xl border border-gray-100 shadow-sm',
        hover ? 'transition-shadow hover:shadow-md' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
