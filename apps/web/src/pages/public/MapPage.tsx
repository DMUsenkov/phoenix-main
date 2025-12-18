import { useBurialPoints } from '@/lib/hooks';
import { AlertTriangle, RefreshCw, MapPin, Users } from 'lucide-react';
import { BurialMapView } from '@/components/map/BurialMapView';

export function MapPage() {
  const { burialPoints, total, isLoading, error, refetch } = useBurialPoints(2000);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-obsidian via-surface to-obsidian-deep">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Ошибка загрузки</h2>
          <p className="text-zinc-400 mb-6">
            Не удалось загрузить данные карты. Попробуйте ещё раз.
          </p>
          <button
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-phoenix-600 to-phoenix-700 text-white hover:from-phoenix-500 hover:to-phoenix-600 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <BurialMapView burialPoints={burialPoints} isLoading={isLoading} />


      <div className="absolute top-4 left-4 z-10">
        <div className="bg-surface-50/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-surface-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-phoenix-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-phoenix-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Страниц памяти</p>
            <p className="text-sm font-semibold text-white">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-phoenix-500 border-t-transparent rounded-full animate-spin" />
                </span>
              ) : (
                total.toLocaleString('ru-RU')
              )}
            </p>
          </div>
        </div>
      </div>


      {!isLoading && burialPoints.length === 0 && (
        <div className="absolute bottom-20 md:bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-sm z-10">
          <div className="bg-surface-50/95 backdrop-blur-sm p-4 rounded-2xl border border-surface-200 text-center">
            <MapPin className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <p className="text-zinc-400 text-sm">Пока нет страниц памяти с указанным местом захоронения</p>
          </div>
        </div>
      )}
    </div>
  );
}
