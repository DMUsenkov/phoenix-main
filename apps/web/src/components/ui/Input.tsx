
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  `w-full rounded-xl bg-surface-100 border text-white placeholder-zinc-500
   transition-all duration-200
   focus:outline-none focus:ring-2 focus:ring-phoenix-500/50 focus:border-phoenix-500
   disabled:opacity-50 disabled:cursor-not-allowed`,
  {
    variants: {
      variant: {
        default: 'border-surface-300 hover:border-surface-400',
        error: 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50',
      },
      inputSize: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-sm',
        lg: 'px-4 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string | undefined;
  error?: string | undefined;
  hint?: string | undefined;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            inputVariants({ variant: error ? 'error' : variant, inputSize }),
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
