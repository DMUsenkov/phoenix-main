import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'ghost';
}

function CopyButton({ text, className, size = 'md', variant = 'default' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
  };

  const variantClasses = {
    default: 'bg-surface-100 border border-surface-300 hover:bg-surface-200',
    ghost: 'hover:bg-surface-100',
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'rounded-lg text-zinc-400 hover:text-white transition-all duration-200',
        sizeClasses[size],
        variantClasses[variant],
        copied && 'text-emerald-400 hover:text-emerald-400',
        className
      )}
      title={copied ? 'Скопировано!' : 'Копировать'}
    >
      {copied ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

interface CopyFieldProps {
  value: string;
  label?: string;
  className?: string;
}

function CopyField({ value, label, className }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-300 text-sm text-zinc-300 truncate">
          {value}
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            copied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-surface-100 text-zinc-300 border border-surface-300 hover:bg-surface-200 hover:text-white'
          )}
        >
          {copied ? 'Скопировано!' : 'Копировать'}
        </button>
      </div>
    </div>
  );
}

export { CopyButton, CopyField };
