import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <label
        htmlFor={checkboxId}
        className={cn('inline-flex items-center gap-3 cursor-pointer', className)}
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="peer sr-only"
            {...props}
          />
          <div
            className="w-5 h-5 rounded-md bg-surface-100 border border-surface-300
                       peer-checked:bg-phoenix-600 peer-checked:border-phoenix-600
                       peer-focus-visible:ring-2 peer-focus-visible:ring-phoenix-500/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface
                       transition-colors duration-200
                       flex items-center justify-center"
          >
            <svg
              className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        {label && <span className="text-sm text-zinc-300">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
