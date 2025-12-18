import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type GlowButtonVariant = 'primary' | 'secondary' | 'ghost';
type GlowButtonSize = 'sm' | 'md' | 'lg';

interface GlowButtonBaseProps {
  variant?: GlowButtonVariant;
  size?: GlowButtonSize;
  glow?: boolean;
  children: React.ReactNode;
}

type GlowButtonAsButton = GlowButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof GlowButtonBaseProps> & {
    as?: 'button';
    to?: never;
  };

type GlowButtonAsLink = GlowButtonBaseProps &
  Omit<LinkProps, keyof GlowButtonBaseProps> & {
    as: 'link';
    to: string;
  };

type GlowButtonProps = GlowButtonAsButton | GlowButtonAsLink;

const sizeClasses: Record<GlowButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const variantClasses: Record<GlowButtonVariant, string> = {
  primary: `
    relative overflow-hidden
    bg-gradient-to-r from-phoenix-600 via-phoenix-500 to-phoenix-600
    text-white font-semibold
    border border-phoenix-400/30
    hover:border-phoenix-400/50
    shadow-glow-md hover:shadow-glow-lg
    before:absolute before:inset-0
    before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
    before:translate-x-[-200%] hover:before:translate-x-[200%]
    before:transition-transform before:duration-700
  `,
  secondary: `
    relative overflow-hidden
    bg-surface-100/80 backdrop-blur-sm
    text-white font-medium
    border border-white/10
    hover:border-white/20 hover:bg-surface-100
    shadow-glass hover:shadow-glass-hover
  `,
  ghost: `
    text-zinc-400 hover:text-white
    font-medium
    hover:bg-white/5
  `,
};

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ variant = 'primary', size = 'md', glow = true, children, className = '', ...props }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center gap-2
      rounded-xl
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-phoenix-500/50 focus:ring-offset-2 focus:ring-offset-surface
      disabled:opacity-50 disabled:cursor-not-allowed
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${glow && variant === 'primary' ? 'animate-pulse-glow' : ''}
      ${className}
    `;

    if (props.as === 'link') {
      const { as: _as, to, ...linkProps } = props as GlowButtonAsLink;
      void _as;
      return (
        <Link to={to} className={baseClasses} {...linkProps}>
          {children}
        </Link>
      );
    }

    const { as: _asBtn, ...buttonProps } = props as GlowButtonAsButton;
    void _asBtn;
    return (
      <button ref={ref} className={baseClasses} {...buttonProps}>
        {children}
      </button>
    );
  }
);

GlowButton.displayName = 'GlowButton';
