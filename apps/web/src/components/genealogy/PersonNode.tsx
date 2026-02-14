

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { clsx } from 'clsx';
import type { GraphNode } from '@/lib/api/genealogy';

export interface PersonNodeData extends GraphNode {
  isRoot?: boolean;
  isSelected?: boolean;
  onClick?: (node: GraphNode) => void;
}

const lifeStatusConfig: Record<string, { label: string; color: string; textColor: string }> = {
  alive: { label: 'Жив', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
  deceased: { label: 'Умер', color: 'bg-zinc-500', textColor: 'text-zinc-400' },
  unknown: { label: '?', color: 'bg-zinc-600', textColor: 'text-zinc-500' },
};

const genderIcons: Record<string, string> = {
  male: 'Person',
  female: 'Person',
  other: 'Person',
  unknown: 'Person',
};

interface PersonNodeProps {
  data: PersonNodeData;
}

function PersonNodeComponent({ data }: PersonNodeProps) {
  const status = lifeStatusConfig[data.life_status] ?? lifeStatusConfig['unknown'];
  const genderIcon = genderIcons[data.gender] ?? genderIcons['unknown'];

  const handleClick = () => {
    data.onClick?.(data);
  };

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-phoenix-500 !w-3 !h-3 !border-2 !border-surface-200" />

      <div
        onClick={handleClick}
        className={clsx(
          'relative px-4 py-3 rounded-xl cursor-pointer transition-all duration-200',
          'bg-gradient-to-br from-surface-100 to-surface-200',
          'border-2 shadow-lg hover:shadow-xl',
          'min-w-[160px] max-w-[200px]',
          data.isSelected
            ? 'border-phoenix-500 shadow-phoenix-500/20 scale-105'
            : 'border-surface-300 hover:border-phoenix-400',
          data.isRoot && 'ring-2 ring-phoenix-500/50 ring-offset-2 ring-offset-surface-200'
        )}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">{genderIcon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm leading-tight truncate">
              {data.full_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={clsx('w-2 h-2 rounded-full', status?.color ?? 'bg-zinc-600')} />
              <span className={clsx('text-xs', status?.textColor ?? 'text-zinc-500')}>
                {status?.label ?? '?'}
              </span>
            </div>
          </div>
        </div>

        {data.page_slug && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-phoenix-500 rounded-full flex items-center justify-center text-xs shadow-md" title="Есть страница">
            Page
          </div>
        )}

        {data.linked_user_id && (
          <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs shadow-md" title="Связан с аккаунтом">
            OK
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-phoenix-500 !w-3 !h-3 !border-2 !border-surface-200" />
    </>
  );
}

export const PersonNode = memo(PersonNodeComponent);
