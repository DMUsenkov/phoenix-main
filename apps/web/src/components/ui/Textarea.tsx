import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string | undefined;
  error?: string | undefined;
  hint?: string | undefined;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            `w-full px-4 py-3 rounded-xl bg-surface-100 border text-white placeholder-zinc-500
             transition-all duration-200 resize-none
             focus:outline-none focus:ring-2 focus:ring-phoenix-500/50 focus:border-phoenix-500
             disabled:opacity-50 disabled:cursor-not-allowed`,
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
              : 'border-surface-300 hover:border-surface-400',
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

Textarea.displayName = 'Textarea';

export { Textarea };
