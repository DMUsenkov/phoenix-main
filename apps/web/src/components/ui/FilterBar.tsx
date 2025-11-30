import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';

interface FilterChip {
  id: string;
  label: string;
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterChip[];
  onRemoveFilter?: (id: string) => void;
  onClearFilters?: () => void;
  actions?: ReactNode;
  className?: string;
}

function FilterBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Поиск...',
  filters = [],
  onRemoveFilter,
  onClearFilters,
  actions,
  className,
}: FilterBarProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-100 border border-surface-300
                       text-white placeholder-zinc-500 text-sm
                       focus:outline-none focus:ring-2 focus:ring-phoenix-500/50 focus:border-phoenix-500
                       transition-all duration-200"
          />
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">Фильтры:</span>
          {filters.map((filter) => (
            <Badge
              key={filter.id}
              variant="primary"
              className="flex items-center gap-1.5 cursor-pointer"
              onClick={() => onRemoveFilter?.(filter.id)}
            >
              {filter.label}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Badge>
          ))}
          {onClearFilters && filters.length > 1 && (
            <button
              onClick={onClearFilters}
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              Очистить все
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

function SortSelect({ value, onChange, options, className }: SortSelectProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-zinc-500 whitespace-nowrap">Сортировка:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-lg bg-surface-100 border border-surface-300
                   text-sm text-white
                   focus:outline-none focus:ring-2 focus:ring-phoenix-500/50 focus:border-phoenix-500
                   transition-all duration-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export { FilterBar, SortSelect };
