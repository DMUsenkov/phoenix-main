import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Star, Loader2, Image as ImageIcon } from 'lucide-react';
import { getPageMedia, deleteMedia, setPrimaryMedia } from '@/lib/api/media';
import type { MediaDTO } from '@/lib/api/media';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';

interface MediaGalleryProps {
  pageId: string;
}

const statusLabels: Record<string, string> = {
  pending: 'На модерации',
  approved: 'Одобрено',
  rejected: 'Отклонено',
};

const statusColors: Record<string, 'default' | 'success' | 'danger' | 'warning'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export function MediaGallery({ pageId }: MediaGalleryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  const { data: mediaList, isLoading } = useQuery({
    queryKey: ['media', pageId],
    queryFn: () => getPageMedia(pageId),
  });

  const deleteMutation = useMutation({
    mutationFn: (mediaId: string) => deleteMedia(mediaId),
    onSuccess: () => {
      toast('Медиа удалено', 'success');
      void queryClient.invalidateQueries({ queryKey: ['media', pageId] });
    },
    onError: () => {
      toast('Ошибка удаления', 'error');
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (mediaId: string) => setPrimaryMedia(mediaId),
    onSuccess: () => {
      toast('Главное фото установлено', 'success');
      void queryClient.invalidateQueries({ queryKey: ['media', pageId] });
    },
    onError: () => {
      toast('Ошибка установки главного фото', 'error');
    },
    onSettled: () => {
      setSettingPrimaryId(null);
    },
  });

  const handleDelete = (mediaId: string) => {
    setDeletingId(mediaId);
    deleteMutation.mutate(mediaId);
  };

  const handleSetPrimary = (mediaId: string) => {
    setSettingPrimaryId(mediaId);
    setPrimaryMutation.mutate(mediaId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const items = mediaList?.items ?? [];

  if (!mediaList || items.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400">
        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Нет загруженных медиа</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((media: MediaDTO) => (
        <div
          key={media.id}
          className={`relative group rounded-xl overflow-hidden border-2 ${
            media.is_primary ? 'border-phoenix-500' : 'border-surface-200'
          }`}
        >
          {media.type === 'image' ? (
            <img
              src={
                media.original_url
                  ? media.original_url.replace('http://minio:9000', 'http://localhost:9000')
                  : `http://localhost:9000/phoenix-media/${media.object_key}`
              }
              alt="Медиа"
              className="w-full aspect-square object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23333" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%23666" font-size="12">Нет фото</text></svg>';
              }}
            />
          ) : (
            <div className="w-full aspect-square bg-surface-100 flex items-center justify-center">
              <span className="text-zinc-400">Видео</span>
            </div>
          )}


          <div className="absolute top-2 left-2">
            <Badge variant={statusColors[media.moderation_status]} size="sm">
              {statusLabels[media.moderation_status]}
            </Badge>
          </div>


          {media.is_primary && (
            <div className="absolute top-2 right-2">
              <div className="bg-phoenix-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" />
                Главное
              </div>
            </div>
          )}


          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {!media.is_primary && (
              <button
                onClick={() => handleSetPrimary(media.id)}
                disabled={settingPrimaryId === media.id}
                className="p-2 bg-phoenix-500 rounded-full text-white hover:bg-phoenix-600 disabled:opacity-50"
                title="Сделать главным"
              >
                {settingPrimaryId === media.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Star className="w-4 h-4" />
                )}
              </button>
            )}
            <button
              onClick={() => handleDelete(media.id)}
              disabled={deletingId === media.id}
              className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 disabled:opacity-50"
              title="Удалить"
            >
              {deletingId === media.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
