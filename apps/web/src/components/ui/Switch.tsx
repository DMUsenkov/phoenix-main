import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <label
        htmlFor={switchId}
        className={cn('inline-flex items-center gap-3 cursor-pointer', className)}
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            className="peer sr-only"
            {...props}
          />
          <div
            className="w-11 h-6 bg-surface-200 rounded-full
                       peer-checked:bg-phoenix-600
                       peer-focus-visible:ring-2 peer-focus-visible:ring-phoenix-500/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface
                       transition-colors duration-200"
          />
          <div
            className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md
                       peer-checked:translate-x-5
                       transition-transform duration-200"
          />
        </div>
        {label && <span className="text-sm text-zinc-300">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
