import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Skeleton } from './Skeleton';

interface LoadingStateProps {
  rows?: number;
  className?: string;
}

function LoadingState({ rows = 3, className }: LoadingStateProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

function ErrorState({
  title = 'Произошла ошибка',
  message = 'Не удалось загрузить данные. Попробуйте ещё раз.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Попробовать снова
        </Button>
      )}
    </div>
  );
}

interface SuccessStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

function SuccessState({
  title = 'Успешно!',
  message,
  action,
  className,
}: SuccessStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {message && <p className="text-sm text-zinc-400 max-w-sm mb-4">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export { LoadingState, ErrorState, SuccessState };
