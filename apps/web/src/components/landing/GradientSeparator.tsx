interface GradientSeparatorProps {
  variant?: 'default' | 'glow' | 'fade';
  className?: string;
}

export function GradientSeparator({ variant = 'default', className = '' }: GradientSeparatorProps) {
  const variants = {
    default: 'h-px bg-gradient-to-r from-transparent via-white/10 to-transparent',
    glow: `
      h-px bg-gradient-to-r from-transparent via-phoenix-500/30 to-transparent
      shadow-[0_0_20px_rgba(124,58,237,0.3)]
    `,
    fade: 'h-24 bg-gradient-to-b from-transparent via-phoenix-500/5 to-transparent',
  };

  return <div className={`w-full ${variants[variant]} ${className}`} />;
}
