import { forwardRef } from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  error?: string;
  as?: 'input' | 'textarea' | 'select';
  rows?: number;
  children?: React.ReactNode;
}

const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, FormFieldProps>(
  ({ label, error, as: Tag = 'input', rows = 4, children, className = '', id, ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const baseClasses = [
      'block w-full rounded-lg border px-4 py-2.5 text-sm text-(--bpa-green-light) bg-white',
      'placeholder:text-gray-400 transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-(--bpa-green) focus:border-transparent',
      error ? 'border-red-400' : 'border-gray-300 hover:border-gray-400',
      className,
    ].join(' ');

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {Tag === 'textarea' ? (
          <textarea
            id={fieldId}
            rows={rows}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={baseClasses}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : Tag === 'select' ? (
          <select
            id={fieldId}
            ref={ref as React.Ref<HTMLSelectElement>}
            className={baseClasses}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {children}
          </select>
        ) : (
          <input
            id={fieldId}
            ref={ref as React.Ref<HTMLInputElement>}
            className={baseClasses}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
FormField.displayName = 'FormField';
export default FormField;
