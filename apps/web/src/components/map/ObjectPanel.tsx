

import { X, ExternalLink, Copy, TreeDeciduous, FileText, MapPin, Check } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { MapObject, ObjectType } from '@/lib/api';

const TYPE_LABELS: Record<ObjectType, { label: string; icon: React.ReactNode; color: string }> = {
  tree: {
    label: 'Дерево',
    icon: <TreeDeciduous className="w-4 h-4" />,
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  plaque: {
    label: 'Табличка',
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  place: {
    label: 'Место',
    icon: <MapPin className="w-4 h-4" />,
    color: 'bg-phoenix-500/20 text-phoenix-300 border-phoenix-500/30',
  },
};

interface ObjectPanelProps {
  object: MapObject;
  onClose: () => void;
}

export function ObjectPanel({ object, onClose }: ObjectPanelProps) {
  const [copied, setCopied] = useState(false);
  const typeConfig = TYPE_LABELS[object.type];
  const pageUrl = `/p/${object.page_slug}`;
  const fullUrl = `${window.location.origin}${pageUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <>

      <div className="hidden md:block absolute top-4 right-4 bottom-4 w-80 z-20">
        <div className="bg-surface-50/95 backdrop-blur-xl border border-surface-200 rounded-2xl h-full flex flex-col overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-surface-200">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                typeConfig.color
              )}
            >
              {typeConfig.icon}
              {typeConfig.label}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-2">
              {object.title || 'Без названия'}
            </h3>

            <div className="text-sm text-zinc-400 mb-4">
              <span className="font-mono">
                {object.lat.toFixed(6)}, {object.lng.toFixed(6)}
              </span>
            </div>

            {object.life_status && (
              <div className="mb-4">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                    object.life_status === 'deceased'
                      ? 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  )}
                >
                  {object.life_status === 'deceased' ? ' Ушедший' : '- Живой'}
                </span>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-surface-200 space-y-2">
            <Link
              to={pageUrl}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-phoenix-600 to-phoenix-700 text-white hover:from-phoenix-500 hover:to-phoenix-600 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Открыть страницу
            </Link>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl font-medium bg-surface-100 text-white border border-surface-300 hover:bg-surface-200 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Скопировано!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Скопировать ссылку
                </>
              )}
            </button>
          </div>
        </div>
      </div>


      <div className="md:hidden fixed inset-x-0 bottom-0 z-20 safe-area-bottom">
        <div className="bg-surface-50/95 backdrop-blur-xl border-t border-surface-200 rounded-t-3xl shadow-2xl">
          <div className="w-12 h-1.5 bg-surface-300 rounded-full mx-auto mt-3 mb-2" />

          <div className="px-4 pb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mb-2',
                    typeConfig.color
                  )}
                >
                  {typeConfig.icon}
                  {typeConfig.label}
                </span>
                <h3 className="text-lg font-semibold text-white">
                  {object.title || 'Без названия'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              <Link
                to={pageUrl}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-phoenix-600 to-phoenix-700 text-white"
              >
                <ExternalLink className="w-4 h-4" />
                Открыть
              </Link>

              <button
                onClick={handleCopy}
                className="px-4 py-3 rounded-xl font-medium bg-surface-100 text-white border border-surface-300"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
