
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 rounded-xl font-medium
   transition-all duration-200 ease-out
   disabled:opacity-50 disabled:cursor-not-allowed
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phoenix-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface`,
  {
    variants: {
      variant: {
        primary: `bg-gradient-to-r from-phoenix-600 to-phoenix-700 text-white
                  shadow-glow-sm hover:shadow-glow-md
                  hover:from-phoenix-500 hover:to-phoenix-600`,
        secondary: `bg-surface-100 text-white border border-surface-300
                    hover:bg-surface-200 hover:border-surface-400`,
        ghost: `bg-transparent text-zinc-400 hover:text-white hover:bg-surface-100`,
        danger: `bg-gradient-to-r from-red-600 to-red-700 text-white
                 hover:from-red-500 hover:to-red-600`,
        outline: `bg-transparent text-phoenix-400 border border-phoenix-500/50
                  hover:bg-phoenix-500/10 hover:border-phoenix-500`,
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
        icon: 'p-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Загрузка...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
