import { forwardRef, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ options, value, onChange, placeholder = 'Выберите...', label, error, hint, disabled, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <button
            ref={ref}
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              `w-full px-4 py-3 rounded-xl bg-surface-100 border text-left
               transition-all duration-200
               focus:outline-none focus:ring-2 focus:ring-phoenix-500/50 focus:border-phoenix-500
               disabled:opacity-50 disabled:cursor-not-allowed
               flex items-center justify-between`,
              error
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
                : 'border-surface-300 hover:border-surface-400',
              isOpen && 'ring-2 ring-phoenix-500/50 border-phoenix-500',
              className
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className={selectedOption ? 'text-white' : 'text-zinc-500'}>
              {selectedOption?.label || placeholder}
            </span>
            <svg
              className={cn(
                'w-5 h-5 text-zinc-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div
              className="absolute z-50 w-full mt-2 py-1 bg-surface-50 border border-surface-200 rounded-xl shadow-lg animate-fade-in overflow-hidden"
              role="listbox"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (!option.disabled) {
                      onChange?.(option.value);
                      setIsOpen(false);
                    }
                  }}
                  disabled={option.disabled}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm transition-colors',
                    option.value === value
                      ? 'bg-phoenix-500/20 text-phoenix-300'
                      : 'text-zinc-300 hover:bg-surface-100',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  role="option"
                  aria-selected={option.value === value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
