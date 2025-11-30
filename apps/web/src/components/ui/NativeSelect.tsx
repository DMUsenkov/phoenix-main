

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean | undefined;
}

export interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string | undefined;
  error?: string | undefined;
  hint?: string | undefined;
}

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ options, label, error, hint, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            `w-full px-4 py-3 rounded-xl bg-surface-100 border text-white
             transition-all duration-200 appearance-none cursor-pointer
             focus:outline-none focus:ring-2 focus:ring-phoenix-500/50 focus:border-phoenix-500
             disabled:opacity-50 disabled:cursor-not-allowed`,
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
              : 'border-surface-300 hover:border-surface-400',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          }}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="bg-surface-100 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>}
      </div>
    );
  }
);

NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };
