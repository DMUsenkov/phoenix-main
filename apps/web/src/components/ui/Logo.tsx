interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-phoenix-400 to-phoenix-600 flex items-center justify-center shadow-glow-sm">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5 text-white"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="absolute -inset-1 bg-phoenix-500/20 rounded-xl blur-lg -z-10" />
      </div>
      {showText && (
        <span className="text-xl font-bold tracking-tight">
          <span className="text-white">Phoenix</span>
        </span>
      )}
    </div>
  );
}
