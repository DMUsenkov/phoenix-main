import { forwardRef, useState, type InputHTMLAttributes, type DragEvent } from 'react';
import { cn } from '@/lib/utils';

export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  accept?: string;
  maxSize?: number;
  onChange?: (files: FileList | null) => void;
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, label, error, hint, accept, maxSize, onChange, disabled, ...props }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0]) {
        setFileName(files[0].name);
        onChange?.(files);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && files[0]) {
        setFileName(files[0].name);
        onChange?.(files);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            {label}
          </label>
        )}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            `relative flex flex-col items-center justify-center gap-3 p-8
             rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer`,
            isDragging
              ? 'border-phoenix-500 bg-phoenix-500/10'
              : error
              ? 'border-red-500/50 bg-surface-100'
              : 'border-surface-300 bg-surface-100 hover:border-surface-400',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <input
            ref={ref}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            {...props}
          />

          <svg className="w-10 h-10 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>

          {fileName ? (
            <p className="text-sm text-white font-medium">{fileName}</p>
          ) : (
            <>
              <p className="text-sm text-zinc-400">
                <span className="text-phoenix-400 font-medium">Нажмите для загрузки</span> или перетащите файл
              </p>
              {accept && (
                <p className="text-xs text-zinc-500">
                  {accept.split(',').join(', ')}
                </p>
              )}
              {maxSize && (
                <p className="text-xs text-zinc-500">
                  Максимум {Math.round(maxSize / 1024 / 1024)} МБ
                </p>
              )}
            </>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';

export { FileInput };
