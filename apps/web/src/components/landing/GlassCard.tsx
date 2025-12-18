import { type HTMLAttributes, forwardRef } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'premium' | 'subtle';
  hover?: boolean;
  glow?: boolean;
}

const variantClasses = {
  default: `
    bg-white/[0.03] backdrop-blur-xl
    border border-white/[0.08]
    shadow-glass
  `,
  premium: `
    bg-gradient-to-br from-white/[0.05] to-white/[0.02]
    backdrop-blur-xl
    border border-white/[0.1]
    shadow-premium
    before:absolute before:inset-0 before:rounded-2xl
    before:bg-card-shine before:opacity-0
    hover:before:opacity-100 before:transition-opacity
  `,
  subtle: `
    bg-white/[0.02] backdrop-blur-sm
    border border-white/[0.05]
  `,
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = 'default', hover = true, glow = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          relative rounded-2xl overflow-hidden
          ${variantClasses[variant]}
          ${hover ? 'transition-all duration-300 hover:border-white/[0.15] hover:shadow-glass-hover hover:-translate-y-1' : ''}
          ${glow ? 'hover:shadow-glow-md' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
