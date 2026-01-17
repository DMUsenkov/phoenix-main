

import { TreeDeciduous, FileText, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ObjectType } from '@/lib/api';

interface FilterChipProps {
  type: ObjectType;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

function FilterChip({ label, icon, isActive, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-phoenix-500/20 text-phoenix-300 border border-phoenix-500/30'
          : 'bg-surface-100 text-zinc-400 border border-surface-300 hover:bg-surface-200 hover:text-zinc-300'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

interface MapFilterBarProps {
  activeTypes: ObjectType[];
  onToggleType: (type: ObjectType) => void;
  onReset: () => void;
  objectCount: number;
  isLoading?: boolean;
}

const TYPE_CONFIG: { type: ObjectType; label: string; icon: React.ReactNode }[] = [
  { type: 'tree', label: 'Деревья', icon: <TreeDeciduous className="w-4 h-4" /> },
  { type: 'plaque', label: 'Таблички', icon: <FileText className="w-4 h-4" /> },
  { type: 'place', label: 'Места', icon: <MapPin className="w-4 h-4" /> },
];

export function MapFilterBar({
  activeTypes,
  onToggleType,
  onReset,
  objectCount,
  isLoading,
}: MapFilterBarProps) {
  const hasFilters = activeTypes.length > 0 && activeTypes.length < 3;

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center gap-2 md:left-auto md:right-4 md:max-w-md">
      <div className="flex flex-wrap items-center gap-2 bg-surface-50/90 backdrop-blur-sm p-2 rounded-2xl border border-surface-200">
        {TYPE_CONFIG.map(({ type, label, icon }) => (
          <FilterChip
            key={type}
            type={type}
            label={label}
            icon={icon}
            isActive={activeTypes.length === 0 || activeTypes.includes(type)}
            onClick={() => onToggleType(type)}
          />
        ))}

        {hasFilters && (
          <button
            onClick={onReset}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-surface-200 transition-colors"
            title="Сбросить фильтры"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="bg-surface-50/90 backdrop-blur-sm px-3 py-2 rounded-full border border-surface-200">
        <span className="text-sm text-zinc-400">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-phoenix-500 border-t-transparent rounded-full animate-spin" />
              Загрузка...
            </span>
          ) : (
            `${objectCount} объектов`
          )}
        </span>
      </div>
    </div>
  );
}
