import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  density?: 'compact' | 'comfortable';
  stickyHeader?: boolean;
  emptyMessage?: string;
  className?: string;
  mobileCardRender?: (item: T) => ReactNode;
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  density = 'comfortable',
  stickyHeader = true,
  emptyMessage = 'Нет данных',
  className,
  mobileCardRender,
}: DataTableProps<T>) {
  const paddingClass = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className={cn('hidden md:block overflow-x-auto', className)}>
        <table className="w-full">
          <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
            <tr className="bg-surface-100 border-b border-surface-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'text-left text-sm font-medium text-zinc-400',
                    paddingClass,
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'border-b border-surface-200 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-surface-100/50'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'text-sm text-zinc-300',
                      paddingClass,
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(item)
                      : (item as Record<string, unknown>)[column.key] as ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            className={cn(
              'bg-surface-50 border border-surface-200 rounded-xl p-4',
              onRowClick && 'cursor-pointer hover:bg-surface-100/50 transition-colors'
            )}
          >
            {mobileCardRender ? (
              mobileCardRender(item)
            ) : (
              <div className="space-y-2">
                {columns.map((column) => (
                  <div key={column.key} className="flex justify-between items-start gap-2">
                    <span className="text-xs text-zinc-500">{column.header}</span>
                    <span className="text-sm text-zinc-300 text-right">
                      {column.render
                        ? column.render(item)
                        : (item as Record<string, unknown>)[column.key] as ReactNode}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export { DataTable };
