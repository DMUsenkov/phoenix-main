

import { useState, useCallback } from 'react';
import { Loader2, Camera, X, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { uploadFile } from '@/lib/api/media';

interface BurialPhotoUploaderProps {
  pageId: string;
  currentPhotoUrl?: string | null;
  onPhotoChange: (url: string | null) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function BurialPhotoUploader({
  pageId,
  currentPhotoUrl,
  onPhotoChange
}: BurialPhotoUploaderProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast('Поддерживаются только изображения', 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast('Максимальный размер файла — 10 МБ', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const media = await uploadFile(pageId, file);
      const photoUrl = media.original_url || media.preview_url;

      if (photoUrl) {
        setPreviewUrl(photoUrl);
        onPhotoChange(photoUrl);
      }
      toast('Фото загружено!', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      toast('Ошибка при загрузке фото', 'error');
    } finally {
      setIsUploading(false);
    }
  }, [pageId, onPhotoChange, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onPhotoChange(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-phoenix-400" />
          Фото места захоронения
        </div>
      </label>

      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Место захоронения"
            className="w-full h-48 object-cover rounded-lg border border-white/10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-phoenix-500/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-phoenix-500 animate-spin" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-zinc-400 mb-2" />
                <p className="text-sm text-zinc-400">
                  Нажмите для загрузки фото
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  JPG, PNG до 10 МБ
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      )}

      <p className="text-xs text-zinc-400">
        Добавьте фото памятника, надгробия или места захоронения
      </p>
    </div>
  );
}

export default BurialPhotoUploader;
